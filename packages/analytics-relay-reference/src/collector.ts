/**
 * Reference server-relay collector — the wire-contract brain.
 *
 * Implements the @refraction-ui/analytics Segment HTTP Tracking API batch
 * contract (adopt, do not invent — RudderStack/Jitsu/Segment conform):
 *
 *   POST {endpoint}/v{schemaVersion}/batch
 *   Content-Type: application/json   (or text/plain on the beacon path)
 *   Authorization: Basic base64("{writeKey}:")    (note trailing colon)
 *     — OR — ?writeKey={writeKey}  (sendBeacon unload path: no auth header)
 *   Body: { batch: AnalyticsEvent[], sentAt, batchId }
 *
 * Response semantics (accept-and-queue):
 *   200  accepted + queued (NOT processed)
 *   400  malformed            → client drops, never retries
 *   401  bad write key        → client drops, never retries
 *   413  payload too large    → client drops (also pre-splits)
 *   429/5xx  transient        → client backs off + retries
 *
 * - Idempotency: dedupe on event `messageId`.
 * - Clock skew: corrected = timestamp + (receivedAt − sentAt).
 * - Size limits: ≈500KB/batch, ≈32KB/event (Segment parity).
 * - Versioning: path carries /v{schemaVersion}/; events carry schemaVersion.
 *
 * This module is transport-agnostic: `handleRequest` takes a parsed request
 * and returns a status + JSON body, so it is unit-testable with no socket.
 * `createNodeRelayServer` (server.ts) is the thin Node `http` binding.
 */

import type { AnalyticsEvent } from '@refraction-ui/analytics'
import { SCHEMA_VERSION } from '@refraction-ui/analytics'
import type { Forwarder } from './forwarders.js'

/** Soft Segment-parity caps. */
export const MAX_BATCH_BYTES = 500_000
export const MAX_EVENT_BYTES = 32_000

/** A request as seen by the transport-agnostic collector. */
export interface RelayRequest {
  method: string
  /** Full request path incl. query string, e.g. `/v1/batch?writeKey=k`. */
  url: string
  headers: Record<string, string | undefined>
  /** Raw request body (already read to a string). */
  rawBody: string
  /** Server receive time in ms (injectable for deterministic skew tests). */
  receivedAt: number
}

export interface RelayResponse {
  status: number
  body: { success: boolean; error?: string; deduped?: number; accepted?: number }
}

export interface RelayOptions {
  /** Accepted write keys. A request must present exactly one of these. */
  writeKeys: string[]
  /** Downstream destinations every accepted event is fanned out to. */
  forwarders?: Forwarder[]
  /**
   * Reject events whose corrected timestamp is more than this far from
   * `receivedAt` (ms). Default 24h. Set 0 to disable.
   */
  maxClockSkewMs?: number
  /** Per-batch byte cap. Default 500KB. */
  maxBatchBytes?: number
  /** Per-event byte cap. Default 32KB. */
  maxEventBytes?: number
  /**
   * Idempotency window: how many recently-seen messageIds to remember.
   * Default 100_000. A bounded LRU keeps the reference server memory-safe.
   */
  dedupeWindow?: number
}

export interface RelayBatchEnvelope {
  batch: unknown
  sentAt?: unknown
  batchId?: unknown
}

/** What the relay has durably "queued" — exposed for the conformance suite. */
export interface QueuedEvent {
  event: AnalyticsEvent
  /** corrected = timestamp + (receivedAt − sentAt). */
  correctedTimestamp: string
}

export interface AnalyticsRelay {
  handleRequest(req: RelayRequest): Promise<RelayResponse>
  /** Events accepted-and-queued, in order, post-dedupe. */
  readonly queued: ReadonlyArray<QueuedEvent>
  /** Per-forwarder server-side fan-out results. */
  readonly forwarded: ReadonlyArray<{
    name: string
    messageId: string
    ok: boolean
    status: number
  }>
  /** Reset queue/dedupe/fan-out (test convenience). */
  reset(): void
}

const ok = (accepted: number, deduped: number): RelayResponse => ({
  status: 200,
  body: { success: true, accepted, deduped },
})
const bad = (error: string): RelayResponse => ({
  status: 400,
  body: { success: false, error },
})
const unauthorized = (): RelayResponse => ({
  status: 401,
  body: { success: false, error: 'invalid write key' },
})
const tooLarge = (error: string): RelayResponse => ({
  status: 413,
  body: { success: false, error },
})

function byteLength(s: string): number {
  return Buffer.byteLength(s, 'utf8')
}

/**
 * Extract the write key from either:
 *   - `Authorization: Basic base64("writeKey:")`  (standard path), or
 *   - `?writeKey=...`                              (sendBeacon unload path).
 * The standard path wins if both are present.
 */
function extractWriteKey(req: RelayRequest): string | undefined {
  const auth = req.headers['authorization'] ?? req.headers['Authorization']
  if (auth && /^Basic\s+/i.test(auth)) {
    const b64 = auth.replace(/^Basic\s+/i, '')
    let decoded = ''
    try {
      decoded = Buffer.from(b64, 'base64').toString('utf8')
    } catch {
      return undefined
    }
    // Format is "writeKey:" — strip the trailing colon (password is empty).
    const colon = decoded.indexOf(':')
    return colon >= 0 ? decoded.slice(0, colon) : decoded
  }
  const qIndex = req.url.indexOf('?')
  if (qIndex >= 0) {
    const params = new URLSearchParams(req.url.slice(qIndex + 1))
    const wk = params.get('writeKey')
    if (wk != null) return wk
  }
  return undefined
}

/** Path must be exactly `/v{SCHEMA_VERSION}/batch` (ignoring the query). */
function isBatchPath(url: string): boolean {
  const path = url.split('?', 1)[0].replace(/\/+$/, '') || '/'
  return path === `/v${SCHEMA_VERSION}/batch`
}

function isAnalyticsEvent(v: unknown): v is AnalyticsEvent {
  if (typeof v !== 'object' || v === null) return false
  const e = v as Record<string, unknown>
  return (
    typeof e.type === 'string' &&
    typeof e.messageId === 'string' &&
    e.messageId.length > 0 &&
    typeof e.anonymousId === 'string' &&
    typeof e.sessionId === 'string' &&
    typeof e.timestamp === 'string' &&
    typeof e.schemaVersion === 'number' &&
    typeof e.context === 'object' &&
    e.context !== null
  )
}

/** Bounded FIFO "set" for messageId idempotency without unbounded growth. */
class DedupeWindow {
  private set = new Set<string>()
  private order: string[] = []
  constructor(private readonly max: number) {}
  has(id: string): boolean {
    return this.set.has(id)
  }
  add(id: string): void {
    this.set.add(id)
    this.order.push(id)
    if (this.order.length > this.max) {
      const evicted = this.order.shift()
      if (evicted !== undefined) this.set.delete(evicted)
    }
  }
  clear(): void {
    this.set.clear()
    this.order = []
  }
}

export function createRelay(options: RelayOptions): AnalyticsRelay {
  const writeKeys = new Set(options.writeKeys)
  const forwarders = options.forwarders ?? []
  const maxSkew = options.maxClockSkewMs ?? 24 * 60 * 60 * 1000
  const maxBatchBytes = options.maxBatchBytes ?? MAX_BATCH_BYTES
  const maxEventBytes = options.maxEventBytes ?? MAX_EVENT_BYTES
  const dedupe = new DedupeWindow(options.dedupeWindow ?? 100_000)

  const queued: QueuedEvent[] = []
  const forwarded: AnalyticsRelay['forwarded'] extends ReadonlyArray<infer T>
    ? T[]
    : never = []

  async function handleRequest(req: RelayRequest): Promise<RelayResponse> {
    if (req.method.toUpperCase() !== 'POST') {
      return bad('method not allowed (POST only)')
    }
    if (!isBatchPath(req.url)) {
      return bad(`not found — expected POST /v${SCHEMA_VERSION}/batch`)
    }

    // Auth (Basic header OR ?writeKey= beacon fallback).
    const key = extractWriteKey(req)
    if (!key || !writeKeys.has(key)) {
      return unauthorized()
    }

    // Per-batch size cap (413 → client drops, never retries).
    if (byteLength(req.rawBody) > maxBatchBytes) {
      return tooLarge('batch exceeds size limit')
    }

    // Parse (400 → client drops, never retries).
    let envelope: RelayBatchEnvelope
    try {
      envelope = JSON.parse(req.rawBody) as RelayBatchEnvelope
    } catch {
      return bad('invalid JSON')
    }
    if (
      typeof envelope !== 'object' ||
      envelope === null ||
      !Array.isArray(envelope.batch)
    ) {
      return bad('missing or invalid `batch` array')
    }

    // Clock skew: corrected = timestamp + (receivedAt − sentAt).
    const sentAtMs =
      typeof envelope.sentAt === 'string'
        ? new Date(envelope.sentAt).getTime()
        : NaN
    const skewOffset = Number.isFinite(sentAtMs)
      ? req.receivedAt - sentAtMs
      : 0

    const toForward: AnalyticsEvent[] = []
    let accepted = 0
    let deduped = 0

    for (const raw of envelope.batch) {
      if (!isAnalyticsEvent(raw)) {
        return bad('batch contains a malformed event')
      }
      if (raw.schemaVersion !== SCHEMA_VERSION) {
        return bad(
          `unsupported schemaVersion ${raw.schemaVersion} ` +
            `(this relay speaks v${SCHEMA_VERSION})`,
        )
      }
      // Per-event size cap.
      if (byteLength(JSON.stringify(raw)) > maxEventBytes) {
        return tooLarge('event exceeds per-event size limit')
      }

      // Idempotency — silently drop a messageId we already queued.
      if (dedupe.has(raw.messageId)) {
        deduped++
        continue
      }

      const correctedMs = new Date(raw.timestamp).getTime() + skewOffset
      if (
        maxSkew > 0 &&
        Number.isFinite(correctedMs) &&
        Math.abs(correctedMs - req.receivedAt) > maxSkew
      ) {
        return bad('event timestamp outside the accepted clock-skew window')
      }

      dedupe.add(raw.messageId)
      queued.push({
        event: raw,
        correctedTimestamp: new Date(correctedMs).toISOString(),
      })
      toForward.push(raw)
      accepted++
    }

    // Accept-and-queue: respond 200 immediately; fan-out is "best effort"
    // and does not change the response (the client only knows it's queued).
    await Promise.all(
      forwarders.flatMap((fwd) =>
        toForward.map(async (ev) => {
          const r = await fwd.forward(ev)
          forwarded.push({
            name: fwd.name,
            messageId: ev.messageId,
            ok: r.ok,
            status: r.status,
          })
        }),
      ),
    )

    return ok(accepted, deduped)
  }

  return {
    handleRequest,
    get queued() {
      return queued
    },
    get forwarded() {
      return forwarded
    },
    reset() {
      queued.length = 0
      forwarded.length = 0
      dedupe.clear()
    },
  }
}
