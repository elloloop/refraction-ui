import type {
  AnalyticsEvent,
  AnalyticsSink,
  SinkDeliverContext,
} from '@refraction-ui/analytics'
import { toPostHogBatch } from './mapping.js'

/**
 * PostHog `http` sink — the DEFAULT mode.
 *
 * Talks to PostHog's ingestion API directly over `fetch`; it never loads
 * `posthog-js` or any browser library, so it is server-relay friendly and
 * ad-blocker-proof when fronted by your own endpoint.
 *
 *   single event  → POST {host}/capture/   { api_key, event, ... }
 *   batch         → POST {host}/batch/     { api_key, batch: [...] }
 *
 * PostHog accept-and-queue semantics mirror the canonical wire contract:
 *   2xx        accepted (queued, not processed) → done
 *   400        malformed       → DROP, never retry
 *   401 / 403  bad project key → DROP, never retry
 *   413        payload too big → DROP (we also pre-split under the size caps)
 *   429 / 5xx  transient       → exponential backoff retry
 *   network    —               → treated as transient → retry
 *
 * No `Authorization` header is used: PostHog authenticates with the public
 * project API key carried in the JSON body, so the `sendBeacon` unload path
 * works without any header juggling.
 */

const NO_RETRY = new Set([400, 401, 403, 413])

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function byteLength(s: string): number {
  const g = globalThis as unknown as {
    TextEncoder?: new () => { encode(s: string): { length: number } }
  }
  if (g.TextEncoder) return new g.TextEncoder().encode(s).length
  return unescape(encodeURIComponent(s)).length
}

export interface PostHogHttpSinkOptions {
  /** PostHog project API key (the public, write-only key). */
  apiKey: string
  /**
   * Ingestion host. Default `https://us.i.posthog.com`. Use
   * `https://eu.i.posthog.com`, a self-hosted host, or — recommended for
   * production — your own reverse-proxy/relay path.
   */
  host?: string
  /** Sink name. Default `posthog`. */
  name?: string
  /** Consent categories this sink requires. Default `['analytics']`. */
  consentCategories?: string[]
  /** Max retries for 429/5xx (exponential backoff). Default 3. */
  maxRetries?: number
  /** Base backoff delay in ms. Default 500. */
  backoffBaseMs?: number
  /** Injected fetch (defaults to global fetch). */
  fetchImpl?: typeof fetch
  /** Injected sendBeacon (defaults to navigator.sendBeacon). */
  beaconImpl?: (url: string, body: string) => boolean
  /** Soft per-batch byte cap. PostHog limit ≈ 20MB; default 1MB. */
  maxBatchBytes?: number
  /** Soft per-event byte cap. Default 32KB. */
  maxEventBytes?: number
}

type PostHogBatchItem = ReturnType<typeof toPostHogBatch>[number]

/** Split so neither per-event nor per-batch byte caps are exceeded. */
function splitBatch(
  items: PostHogBatchItem[],
  maxBatchBytes: number,
  maxEventBytes: number,
): PostHogBatchItem[][] {
  const batches: PostHogBatchItem[][] = []
  let current: PostHogBatchItem[] = []
  let currentBytes = 2

  for (const item of items) {
    const itemBytes = byteLength(JSON.stringify(item))
    // Oversized single events can never be sent — drop them.
    if (itemBytes > maxEventBytes) continue
    if (current.length && currentBytes + itemBytes + 1 > maxBatchBytes) {
      batches.push(current)
      current = []
      currentBytes = 2
    }
    current.push(item)
    currentBytes += itemBytes + 1
  }
  if (current.length) batches.push(current)
  return batches
}

/**
 * Create the PostHog `http`-mode sink (default). Pure protocol adapter —
 * no `posthog-js`, safe in Node and the browser.
 */
export function createPostHogHttpSink(
  options: PostHogHttpSinkOptions,
): AnalyticsSink {
  const {
    apiKey,
    host = 'https://us.i.posthog.com',
    name = 'posthog',
    consentCategories = ['analytics'],
    maxRetries = 3,
    backoffBaseMs = 500,
    maxBatchBytes = 1_000_000,
    maxEventBytes = 32_000,
  } = options

  const base = host.replace(/\/+$/, '')
  const captureUrl = `${base}/capture/`
  const batchUrl = `${base}/batch/`

  const resolveFetch = (): typeof fetch => {
    if (options.fetchImpl) return options.fetchImpl
    const f = (globalThis as unknown as { fetch?: typeof fetch }).fetch
    if (!f) throw new Error('No fetch implementation available')
    return f
  }

  const resolveBeacon = ():
    | ((u: string, body: string) => boolean)
    | undefined => {
    if (options.beaconImpl) return options.beaconImpl
    const nav = (
      globalThis as unknown as {
        navigator?: { sendBeacon?: (u: string, data: BodyInit) => boolean }
      }
    ).navigator
    if (nav && typeof nav.sendBeacon === 'function') {
      return (u, body) => nav.sendBeacon!(u, body)
    }
    return undefined
  }

  function payload(part: PostHogBatchItem[]): {
    url: string
    body: string
  } {
    if (part.length === 1) {
      return {
        url: captureUrl,
        body: JSON.stringify({ api_key: apiKey, ...part[0] }),
      }
    }
    return {
      url: batchUrl,
      body: JSON.stringify({ api_key: apiKey, batch: part }),
    }
  }

  async function sendViaFetch(part: PostHogBatchItem[]): Promise<void> {
    const doFetch = resolveFetch()
    const { url, body } = payload(part)

    for (let attempt = 0; ; attempt++) {
      let status: number
      try {
        const res = await doFetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        })
        status = res.status
      } catch {
        status = 0 // network error → transient
      }

      if (status >= 200 && status < 300) return
      if (NO_RETRY.has(status)) return

      if (attempt >= maxRetries) return
      await sleep(backoffBaseMs * 2 ** attempt)
    }
  }

  function sendViaBeacon(part: PostHogBatchItem[]): boolean {
    const beacon = resolveBeacon()
    if (!beacon) return false
    const { url, body } = payload(part)
    return beacon(url, body)
  }

  return {
    name,
    consentCategories,

    async deliver(
      batch: AnalyticsEvent[],
      ctx: SinkDeliverContext,
    ): Promise<void> {
      if (batch.length === 0) return
      const items = toPostHogBatch(batch)
      const parts = splitBatch(items, maxBatchBytes, maxEventBytes)

      for (const part of parts) {
        if (part.length === 0) continue
        if (ctx.unload) {
          if (sendViaBeacon(part)) continue
          void sendViaFetch(part)
        } else {
          await sendViaFetch(part)
        }
      }
    },
  }
}
