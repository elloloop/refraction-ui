import type {
  AnalyticsEvent,
  AnalyticsSink,
  HttpSinkOptions,
  SinkDeliverContext,
} from './types.js'
import { SCHEMA_VERSION } from './types.js'
import { uuidv4 } from './uuid.js'

/**
 * Built-in `http` sink — Segment HTTP Tracking API wire contract.
 *
 * Wire contract (adopt, do not invent — RudderStack/Jitsu/Segment conform):
 *
 *   POST {endpoint}/v{schemaVersion}/batch
 *   Content-Type: application/json
 *   Authorization: Basic base64(writeKey:)         (note the trailing colon)
 *   Body: { batch: AnalyticsEvent[], sentAt, batchId }
 *
 * Each event carries `messageId` (idempotency — backends MUST dedupe),
 * `anonymousId`, `userId?`, `sessionId`, `type`, `event?`,
 * `properties`/`traits`, `context`, `timestamp`, `schemaVersion`.
 *
 * Response handling (accept-and-queue semantics):
 *   200       accepted (the backend has only queued it, not processed it)
 *   400       malformed       → DROP, never retry
 *   401       bad write key   → DROP, never retry
 *   413       payload too big → DROP (we also pre-split under the size caps)
 *   429 / 5xx transient       → exponential backoff retry
 *
 * Clock skew: the backend corrects with
 *   corrected = timestamp + (receivedAt − sentAt)
 * so we always stamp an honest client `sentAt`.
 *
 * sendBeacon caveat: the unload path (`pagehide`/`visibilitychange`) uses
 * `navigator.sendBeacon`, which cannot set an `Authorization` header. On that
 * path we fall back to `?writeKey=` in the query string with a
 * `text/plain` body (the wire contract requires the backend to accept this).
 */

const NO_RETRY = new Set([400, 401, 413])

function base64(input: string): string {
  const g = globalThis as unknown as {
    btoa?: (s: string) => string
    Buffer?: { from(s: string, enc: string): { toString(enc: string): string } }
  }
  if (typeof g.btoa === 'function') {
    return g.btoa(input)
  }
  if (g.Buffer) {
    return g.Buffer.from(input, 'utf-8').toString('base64')
  }
  throw new Error('No base64 implementation available (btoa/Buffer)')
}

function byteLength(s: string): number {
  const g = globalThis as unknown as {
    TextEncoder?: new () => { encode(s: string): { length: number } }
  }
  if (g.TextEncoder) return new g.TextEncoder().encode(s).length
  // Conservative fallback (UTF-8 worst case is 4 bytes/char; use 3 as typical).
  return unescape(encodeURIComponent(s)).length
}

const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms))

/**
 * Split a batch so neither the per-event nor per-batch byte caps are
 * exceeded. Over-sized single events are dropped (they can never be sent).
 */
function splitBatch(
  batch: AnalyticsEvent[],
  maxBatchBytes: number,
  maxEventBytes: number,
): { batches: AnalyticsEvent[][]; dropped: AnalyticsEvent[] } {
  const batches: AnalyticsEvent[][] = []
  const dropped: AnalyticsEvent[] = []
  let current: AnalyticsEvent[] = []
  let currentBytes = 2 // "[]"

  for (const ev of batch) {
    const evBytes = byteLength(JSON.stringify(ev))
    if (evBytes > maxEventBytes) {
      dropped.push(ev)
      continue
    }
    if (current.length && currentBytes + evBytes + 1 > maxBatchBytes) {
      batches.push(current)
      current = []
      currentBytes = 2
    }
    current.push(ev)
    currentBytes += evBytes + 1
  }
  if (current.length) batches.push(current)
  return { batches, dropped }
}

/** Create the built-in Segment-spec HTTP sink. */
export function createHttpSink(options: HttpSinkOptions): AnalyticsSink {
  const {
    endpoint,
    writeKey,
    maxRetries = 3,
    backoffBaseMs = 500,
    consentCategories = ['analytics'],
    maxBatchBytes = 500_000,
    maxEventBytes = 32_000,
  } = options

  const base = endpoint.replace(/\/+$/, '')
  const url = `${base}/v${SCHEMA_VERSION}/batch`
  const authHeader = `Basic ${base64(`${writeKey}:`)}`

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
    const nav = (globalThis as unknown as {
      navigator?: { sendBeacon?: (u: string, data: BodyInit) => boolean }
    }).navigator
    if (nav && typeof nav.sendBeacon === 'function') {
      return (u, body) => nav.sendBeacon!(u, body)
    }
    return undefined
  }

  function envelope(batch: AnalyticsEvent[]) {
    return {
      batch,
      sentAt: new Date().toISOString(),
      batchId: uuidv4(),
    }
  }

  /** Beacon path: writeKey via query string, text/plain body. */
  function sendViaBeacon(batch: AnalyticsEvent[]): boolean {
    const beacon = resolveBeacon()
    if (!beacon) return false
    const beaconUrl = `${url}?writeKey=${encodeURIComponent(writeKey)}`
    return beacon(beaconUrl, JSON.stringify(envelope(batch)))
  }

  /** Standard path: fetch + Authorization header, with backoff retries. */
  async function sendViaFetch(batch: AnalyticsEvent[]): Promise<void> {
    const doFetch = resolveFetch()
    const body = JSON.stringify(envelope(batch))

    for (let attempt = 0; ; attempt++) {
      let status: number
      try {
        const res = await doFetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body,
          keepalive: true,
        })
        status = res.status
      } catch {
        // Network error — treat as transient.
        status = 0
      }

      if (status >= 200 && status < 300) return // accepted-and-queued
      if (NO_RETRY.has(status)) return // 400/401/413 — drop, never retry

      // 429 / 5xx / network (0) → backoff retry.
      if (attempt >= maxRetries) return
      const delay = backoffBaseMs * 2 ** attempt
      await sleep(delay)
    }
  }

  return {
    name: 'http',
    consentCategories,

    async deliver(
      batch: AnalyticsEvent[],
      ctx: SinkDeliverContext,
    ): Promise<void> {
      if (batch.length === 0) return
      const { batches, dropped } = splitBatch(
        batch,
        maxBatchBytes,
        maxEventBytes,
      )
      void dropped // oversized events are unsendable by contract — silently dropped

      for (const part of batches) {
        if (ctx.unload) {
          // Unload path: try beacon first; fall back to keepalive fetch.
          if (sendViaBeacon(part)) continue
          void sendViaFetch(part)
        } else {
          await sendViaFetch(part)
        }
      }
    },
  }
}
