/**
 * Focused unit tests for the transport-agnostic collector — the wire
 * contract decision points, exercised without a socket.
 */

import { describe, expect, it } from 'vitest'
import { createRelay, type RelayRequest } from '../src/collector.js'
import { SCHEMA_VERSION } from '@refraction-ui/analytics'
import type { AnalyticsEvent } from '@refraction-ui/analytics'

const WK = 'k1'

function event(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'E',
    messageId: 'm-' + Math.random().toString(36).slice(2),
    anonymousId: 'a',
    sessionId: 's',
    context: { app: 'x', env: 'test', library: { name: 'n', version: '1' } },
    timestamp: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    ...overrides,
  }
}

function req(
  body: unknown,
  opts: Partial<RelayRequest> & { basic?: string; query?: string } = {},
): RelayRequest {
  const headers: Record<string, string | undefined> = {}
  if (opts.basic !== undefined) {
    headers.authorization =
      'Basic ' + Buffer.from(`${opts.basic}:`).toString('base64')
  }
  return {
    method: opts.method ?? 'POST',
    url:
      opts.url ?? `/v${SCHEMA_VERSION}/batch${opts.query ? '?' + opts.query : ''}`,
    headers: { ...headers, ...(opts.headers ?? {}) },
    rawBody:
      typeof body === 'string' ? body : JSON.stringify(body),
    receivedAt: opts.receivedAt ?? Date.now(),
  }
}

describe('collector — auth', () => {
  it('accepts Basic base64("writeKey:") (trailing colon)', async () => {
    const r = createRelay({ writeKeys: [WK] })
    const res = await r.handleRequest(
      req({ batch: [event()] }, { basic: WK }),
    )
    expect(res.status).toBe(200)
  })

  it('accepts ?writeKey= beacon fallback (no Authorization header)', async () => {
    const r = createRelay({ writeKeys: [WK] })
    const res = await r.handleRequest(
      req({ batch: [event()] }, { query: `writeKey=${WK}` }),
    )
    expect(res.status).toBe(200)
    expect(r.queued).toHaveLength(1)
  })

  it('401 for an unknown / missing write key', async () => {
    const r = createRelay({ writeKeys: [WK] })
    expect((await r.handleRequest(req({ batch: [event()] }))).status).toBe(401)
    expect(
      (await r.handleRequest(req({ batch: [event()] }, { basic: 'nope' })))
        .status,
    ).toBe(401)
  })
})

describe('collector — routing & validation', () => {
  it('400 for the wrong path', async () => {
    const r = createRelay({ writeKeys: [WK] })
    const res = await r.handleRequest(
      req({ batch: [event()] }, { basic: WK, url: '/v9/batch' }),
    )
    expect(res.status).toBe(400)
  })

  it('400 for non-POST', async () => {
    const r = createRelay({ writeKeys: [WK] })
    const res = await r.handleRequest(
      req({ batch: [event()] }, { basic: WK, method: 'GET' }),
    )
    expect(res.status).toBe(400)
  })

  it('400 for invalid JSON and missing batch array', async () => {
    const r = createRelay({ writeKeys: [WK] })
    expect(
      (await r.handleRequest(req('{bad', { basic: WK }))).status,
    ).toBe(400)
    expect(
      (await r.handleRequest(req({ nope: true }, { basic: WK }))).status,
    ).toBe(400)
  })

  it('400 for an unsupported schemaVersion', async () => {
    const r = createRelay({ writeKeys: [WK] })
    const res = await r.handleRequest(
      req({ batch: [event({ schemaVersion: 999 })] }, { basic: WK }),
    )
    expect(res.status).toBe(400)
  })
})

describe('collector — size limits', () => {
  it('413 when the batch exceeds the per-batch cap', async () => {
    const r = createRelay({ writeKeys: [WK], maxBatchBytes: 200 })
    const res = await r.handleRequest(
      req({ batch: [event(), event(), event()] }, { basic: WK }),
    )
    expect(res.status).toBe(413)
  })

  it('413 when a single event exceeds the per-event cap', async () => {
    const r = createRelay({ writeKeys: [WK], maxEventBytes: 120 })
    const res = await r.handleRequest(
      req(
        { batch: [event({ properties: { big: 'x'.repeat(500) } })] },
        { basic: WK },
      ),
    )
    expect(res.status).toBe(413)
  })
})

describe('collector — idempotency', () => {
  it('dedupes a repeated messageId, reporting the dedupe count', async () => {
    const r = createRelay({ writeKeys: [WK] })
    const e = event({ messageId: 'dup' })
    await r.handleRequest(req({ batch: [e] }, { basic: WK }))
    const res = await r.handleRequest(req({ batch: [e] }, { basic: WK }))
    expect(res.status).toBe(200)
    expect(res.body.deduped).toBe(1)
    expect(res.body.accepted).toBe(0)
    expect(r.queued).toHaveLength(1)
  })

  it('evicts old ids once past the dedupe window (bounded memory)', async () => {
    const r = createRelay({ writeKeys: [WK], dedupeWindow: 2 })
    const e = event({ messageId: 'first' })
    await r.handleRequest(req({ batch: [e] }, { basic: WK }))
    await r.handleRequest(req({ batch: [event()] }, { basic: WK }))
    await r.handleRequest(req({ batch: [event()] }, { basic: WK }))
    // "first" has been evicted → it is accepted again.
    const res = await r.handleRequest(req({ batch: [e] }, { basic: WK }))
    expect(res.body.accepted).toBe(1)
  })
})

describe('collector — clock skew', () => {
  it('corrected = timestamp + (receivedAt − sentAt)', async () => {
    const r = createRelay({ writeKeys: [WK] })
    const eventTs = '2026-05-01T00:00:00.000Z'
    const sentAt = '2026-05-01T00:00:05.000Z' // client sent 5s after stamping
    const receivedAt = new Date('2026-05-01T00:00:30.000Z').getTime()
    await r.handleRequest({
      ...req(
        { batch: [event({ timestamp: eventTs })], sentAt },
        { basic: WK },
      ),
      receivedAt,
    })
    // offset = received − sent = 25s; corrected = eventTs + 25s.
    expect(r.queued[0].correctedTimestamp).toBe('2026-05-01T00:00:25.000Z')
  })

  it('rejects an event outside the clock-skew window', async () => {
    const r = createRelay({ writeKeys: [WK], maxClockSkewMs: 60_000 })
    const res = await r.handleRequest(
      req(
        { batch: [event({ timestamp: new Date(Date.now() - 3_600_000).toISOString() })] },
        { basic: WK },
      ),
    )
    expect(res.status).toBe(400)
  })
})
