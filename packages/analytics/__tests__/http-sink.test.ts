import { describe, it, expect, vi } from 'vitest'
import { createHttpSink } from '../src/http-sink.js'
import { SCHEMA_VERSION } from '../src/types.js'
import { isUuidV4 } from '../src/uuid.js'
import type { AnalyticsEvent, SinkDeliverContext } from '../src/types.js'

const CTX_ONLINE: SinkDeliverContext = { unload: false }
const CTX_UNLOAD: SinkDeliverContext = { unload: true }

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'Test',
    messageId: 'mid-' + Math.random().toString(36).slice(2),
    anonymousId: 'anon-1',
    sessionId: 'sess-1',
    properties: { a: 1 },
    context: {
      app: 'app',
      env: 'test',
      library: { name: '@refraction-ui/analytics', version: '0.1.0' },
    },
    timestamp: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    ...overrides,
  }
}

/** A mock backend conforming to the Segment HTTP Tracking API wire contract. */
function mockBackend(
  responder: (call: number) => { status: number } = () => ({ status: 200 }),
) {
  const calls: Array<{
    url: string
    method: string
    headers: Record<string, string>
    body: unknown
  }> = []
  let n = 0
  const fetchImpl = vi.fn(
    async (url: string, init?: RequestInit): Promise<Response> => {
      const headers = (init?.headers ?? {}) as Record<string, string>
      calls.push({
        url,
        method: init?.method ?? 'GET',
        headers,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      })
      const { status } = responder(n++)
      return { status, ok: status >= 200 && status < 300 } as Response
    },
  )
  return { calls, fetchImpl: fetchImpl as unknown as typeof fetch }
}

describe('http sink — Segment wire contract: batch format', () => {
  it('POSTs to {endpoint}/v{schemaVersion}/batch with the batch envelope', async () => {
    const be = mockBackend()
    const sink = createHttpSink({
      endpoint: 'https://collector.example.com/',
      writeKey: 'WK123',
      fetchImpl: be.fetchImpl,
    })
    const events = [makeEvent({ event: 'A' }), makeEvent({ event: 'B' })]
    await sink.deliver(events, CTX_ONLINE)

    expect(be.calls).toHaveLength(1)
    const call = be.calls[0]
    expect(call.method).toBe('POST')
    expect(call.url).toBe(
      `https://collector.example.com/v${SCHEMA_VERSION}/batch`,
    )
    expect(call.headers['Content-Type']).toBe('application/json')

    const body = call.body as {
      batch: AnalyticsEvent[]
      sentAt: string
      batchId: string
    }
    expect(body.batch).toHaveLength(2)
    expect(body.batch[0].event).toBe('A')
    expect(typeof body.sentAt).toBe('string')
    expect(new Date(body.sentAt).toString()).not.toBe('Invalid Date')
    expect(isUuidV4(body.batchId)).toBe(true)
  })

  it('sends Authorization: Basic base64(writeKey:) — note trailing colon', async () => {
    const be = mockBackend()
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'WK123',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    const auth = be.calls[0].headers['Authorization']
    expect(auth).toBe(
      'Basic ' + Buffer.from('WK123:', 'utf-8').toString('base64'),
    )
  })

  it('every event carries a messageId idempotency key', async () => {
    const be = mockBackend()
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent(), makeEvent()], CTX_ONLINE)
    const body = be.calls[0].body as { batch: AnalyticsEvent[] }
    for (const ev of body.batch) {
      expect(typeof ev.messageId).toBe('string')
      expect(ev.messageId.length).toBeGreaterThan(0)
    }
    // distinct per event
    expect(body.batch[0].messageId).not.toBe(body.batch[1].messageId)
  })

  it('does nothing for an empty batch', async () => {
    const be = mockBackend()
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([], CTX_ONLINE)
    expect(be.calls).toHaveLength(0)
  })
})

describe('http sink — response codes', () => {
  it('200 accept-and-queue → no retry', async () => {
    const be = mockBackend(() => ({ status: 200 }))
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(be.calls).toHaveLength(1)
  })

  it('400 malformed → DROP, never retry', async () => {
    const be = mockBackend(() => ({ status: 400 }))
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      maxRetries: 5,
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(be.calls).toHaveLength(1) // exactly one attempt
  })

  it('401 bad key → DROP, never retry', async () => {
    const be = mockBackend(() => ({ status: 401 }))
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      maxRetries: 5,
      fetchImpl: be.fetchImpl,
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(be.calls).toHaveLength(1)
  })

  it('429 → exponential backoff retry then give up after maxRetries', async () => {
    vi.useFakeTimers()
    const be = mockBackend(() => ({ status: 429 }))
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      maxRetries: 3,
      backoffBaseMs: 10,
      fetchImpl: be.fetchImpl,
    })
    const p = sink.deliver([makeEvent()], CTX_ONLINE)
    await vi.runAllTimersAsync()
    await p
    // initial + 3 retries = 4 attempts
    expect(be.calls).toHaveLength(4)
    vi.useRealTimers()
  })

  it('5xx → retried, then succeeds when the backend recovers', async () => {
    vi.useFakeTimers()
    const be = mockBackend((n) => ({ status: n < 2 ? 503 : 200 }))
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      maxRetries: 5,
      backoffBaseMs: 10,
      fetchImpl: be.fetchImpl,
    })
    const p = sink.deliver([makeEvent()], CTX_ONLINE)
    await vi.runAllTimersAsync()
    await p
    expect(be.calls).toHaveLength(3) // 503, 503, 200
    vi.useRealTimers()
  })

  it('uses increasing backoff delays between retries', async () => {
    vi.useFakeTimers()
    const be = mockBackend(() => ({ status: 500 }))
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      maxRetries: 2,
      backoffBaseMs: 100,
      fetchImpl: be.fetchImpl,
    })
    const p = sink.deliver([makeEvent()], CTX_ONLINE)
    // attempt 0 immediately
    await Promise.resolve()
    expect(be.calls).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(100) // backoff 100ms → attempt 1
    expect(be.calls).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(200) // backoff 200ms → attempt 2
    expect(be.calls).toHaveLength(3)
    await p
    vi.useRealTimers()
  })

  it('network error is treated as transient and retried', async () => {
    vi.useFakeTimers()
    let n = 0
    const fetchImpl = vi.fn(async () => {
      if (n++ < 1) throw new Error('network down')
      return { status: 200, ok: true } as Response
    }) as unknown as typeof fetch
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      maxRetries: 3,
      backoffBaseMs: 10,
      fetchImpl,
    })
    const p = sink.deliver([makeEvent()], CTX_ONLINE)
    await vi.runAllTimersAsync()
    await p
    expect((fetchImpl as unknown as { mock: { calls: unknown[] } }).mock.calls)
      .toHaveLength(2)
    vi.useRealTimers()
  })
})

describe('http sink — sendBeacon fallback (unload path)', () => {
  it('uses beacon with ?writeKey= query (no Authorization header)', async () => {
    const beaconCalls: Array<{ url: string; body: string }> = []
    const be = mockBackend()
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'WK secret/with+special',
      fetchImpl: be.fetchImpl,
      beaconImpl: (url, body) => {
        beaconCalls.push({ url, body })
        return true
      },
    })
    await sink.deliver([makeEvent()], CTX_UNLOAD)

    expect(beaconCalls).toHaveLength(1)
    expect(be.calls).toHaveLength(0) // beacon used, not fetch
    const { url, body } = beaconCalls[0]
    expect(url).toContain(`/v${SCHEMA_VERSION}/batch`)
    expect(url).toContain(
      'writeKey=' + encodeURIComponent('WK secret/with+special'),
    )
    const parsed = JSON.parse(body) as { batch: unknown[]; batchId: string }
    expect(parsed.batch).toHaveLength(1)
    expect(isUuidV4(parsed.batchId)).toBe(true)
  })

  it('falls back to keepalive fetch when beacon is unavailable on unload', async () => {
    const be = mockBackend()
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      fetchImpl: be.fetchImpl,
      // no beaconImpl, and no navigator in node → falls back to fetch
    })
    await sink.deliver([makeEvent()], CTX_UNLOAD)
    expect(be.calls).toHaveLength(1)
  })

  it('online path never uses beacon', async () => {
    const beaconCalls: string[] = []
    const be = mockBackend()
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      fetchImpl: be.fetchImpl,
      beaconImpl: (url) => {
        beaconCalls.push(url)
        return true
      },
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(beaconCalls).toHaveLength(0)
    expect(be.calls).toHaveLength(1)
  })
})

describe('http sink — size limits', () => {
  it('splits a batch that exceeds the per-batch byte cap', async () => {
    const be = mockBackend()
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      fetchImpl: be.fetchImpl,
      maxBatchBytes: 400, // tiny → forces splitting
      maxEventBytes: 32_000,
    })
    const events = [makeEvent(), makeEvent(), makeEvent(), makeEvent()]
    await sink.deliver(events, CTX_ONLINE)
    expect(be.calls.length).toBeGreaterThan(1)
    const total = be.calls.reduce(
      (sum, c) => sum + (c.body as { batch: unknown[] }).batch.length,
      0,
    )
    expect(total).toBe(4) // no events lost during splitting
  })

  it('drops a single event larger than the per-event byte cap', async () => {
    const be = mockBackend()
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      fetchImpl: be.fetchImpl,
      maxEventBytes: 100, // smaller than any real event
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(be.calls).toHaveLength(0) // oversized → unsendable, dropped
  })
})

describe('http sink — consent categories', () => {
  it('defaults to requiring the analytics category', () => {
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
    })
    expect(sink.consentCategories).toEqual(['analytics'])
  })

  it('honours a custom consentCategories list', () => {
    const sink = createHttpSink({
      endpoint: 'https://c.example.com',
      writeKey: 'k',
      consentCategories: ['marketing', 'analytics'],
    })
    expect(sink.consentCategories).toEqual(['marketing', 'analytics'])
  })
})
