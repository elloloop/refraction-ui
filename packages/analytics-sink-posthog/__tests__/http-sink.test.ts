import { describe, it, expect, vi } from 'vitest'
import { SCHEMA_VERSION } from '@refraction-ui/analytics'
import type {
  AnalyticsEvent,
  SinkDeliverContext,
} from '@refraction-ui/analytics'
import { createPostHogHttpSink } from '../src/http-sink.js'
import { createPostHogSink } from '../src/sink.js'

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

/** A mock transport conforming to PostHog's ingestion API. */
function mockTransport(
  responder: (call: number) => { status: number } = () => ({ status: 200 }),
) {
  const calls: Array<{ url: string; method: string; body: any }> = []
  let n = 0
  const fetchImpl = vi.fn(
    async (url: string, init?: RequestInit): Promise<Response> => {
      calls.push({
        url,
        method: init?.method ?? 'GET',
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      })
      const { status } = responder(n++)
      return { status, ok: status >= 200 && status < 300 } as Response
    },
  )
  return { calls, fetchImpl: fetchImpl as unknown as typeof fetch }
}

describe('posthog http sink — PostHog ingestion API', () => {
  it('POSTs a single event to /capture/ with api_key in the body', async () => {
    const t = mockTransport()
    const sink = createPostHogHttpSink({
      apiKey: 'phc_KEY',
      host: 'https://us.i.posthog.com/',
      fetchImpl: t.fetchImpl,
    })
    await sink.deliver([makeEvent({ event: 'Signup' })], CTX_ONLINE)

    expect(t.calls).toHaveLength(1)
    expect(t.calls[0].method).toBe('POST')
    expect(t.calls[0].url).toBe('https://us.i.posthog.com/capture/')
    expect(t.calls[0].body.api_key).toBe('phc_KEY')
    expect(t.calls[0].body.event).toBe('Signup')
    expect(t.calls[0].body.distinct_id).toBe('anon-1')
    expect(t.calls[0].body.uuid).toBeTruthy()
  })

  it('POSTs multiple events to /batch/ with api_key + batch[]', async () => {
    const t = mockTransport()
    const sink = createPostHogHttpSink({
      apiKey: 'phc_KEY',
      fetchImpl: t.fetchImpl,
    })
    await sink.deliver(
      [makeEvent({ event: 'A' }), makeEvent({ event: 'B' })],
      CTX_ONLINE,
    )
    expect(t.calls).toHaveLength(1)
    expect(t.calls[0].url).toBe('https://us.i.posthog.com/batch/')
    expect(t.calls[0].body.api_key).toBe('phc_KEY')
    expect(t.calls[0].body.batch).toHaveLength(2)
    expect(t.calls[0].body.batch.map((e: any) => e.event)).toEqual([
      'A',
      'B',
    ])
  })

  it('maps anonymousId/userId → distinct_id and identify → $identify', async () => {
    const t = mockTransport()
    const sink = createPostHogHttpSink({
      apiKey: 'k',
      fetchImpl: t.fetchImpl,
    })
    await sink.deliver(
      [
        makeEvent({
          type: 'identify',
          event: undefined,
          userId: 'user_42',
          traits: { plan: 'pro' },
        }),
      ],
      CTX_ONLINE,
    )
    const body = t.calls[0].body
    expect(body.event).toBe('$identify')
    expect(body.distinct_id).toBe('user_42')
    expect(body.properties.$set).toEqual({ plan: 'pro' })
    expect(body.properties.$anon_distinct_id).toBe('anon-1')
  })

  it('uses no Authorization header (PostHog auths via body api_key)', async () => {
    let seenHeaders: Record<string, string> = {}
    const fetchImpl = vi.fn(async (_u: string, init?: RequestInit) => {
      seenHeaders = (init?.headers ?? {}) as Record<string, string>
      return { status: 200, ok: true } as Response
    }) as unknown as typeof fetch
    const sink = createPostHogHttpSink({ apiKey: 'k', fetchImpl })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(seenHeaders['Authorization']).toBeUndefined()
    expect(seenHeaders['Content-Type']).toBe('application/json')
  })

  it('does nothing for an empty batch', async () => {
    const t = mockTransport()
    const sink = createPostHogHttpSink({ apiKey: 'k', fetchImpl: t.fetchImpl })
    await sink.deliver([], CTX_ONLINE)
    expect(t.calls).toHaveLength(0)
  })

  it('createPostHogSink defaults to http mode (no posthog-js)', async () => {
    const t = mockTransport()
    const sink = createPostHogSink({ apiKey: 'k', fetchImpl: t.fetchImpl })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(t.calls).toHaveLength(1)
    expect(t.calls[0].url).toContain('/capture/')
  })
})

describe('posthog http sink — response codes', () => {
  it('2xx accept-and-queue → no retry', async () => {
    const t = mockTransport(() => ({ status: 200 }))
    const sink = createPostHogHttpSink({ apiKey: 'k', fetchImpl: t.fetchImpl })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(t.calls).toHaveLength(1)
  })

  it('400 malformed → DROP, never retry', async () => {
    const t = mockTransport(() => ({ status: 400 }))
    const sink = createPostHogHttpSink({
      apiKey: 'k',
      maxRetries: 5,
      fetchImpl: t.fetchImpl,
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(t.calls).toHaveLength(1)
  })

  it('401/403 bad key → DROP, never retry', async () => {
    const t = mockTransport(() => ({ status: 401 }))
    const sink = createPostHogHttpSink({
      apiKey: 'k',
      maxRetries: 5,
      fetchImpl: t.fetchImpl,
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(t.calls).toHaveLength(1)
  })

  it('429 → exponential backoff retry then give up after maxRetries', async () => {
    vi.useFakeTimers()
    const t = mockTransport(() => ({ status: 429 }))
    const sink = createPostHogHttpSink({
      apiKey: 'k',
      maxRetries: 3,
      backoffBaseMs: 10,
      fetchImpl: t.fetchImpl,
    })
    const p = sink.deliver([makeEvent()], CTX_ONLINE)
    await vi.runAllTimersAsync()
    await p
    expect(t.calls).toHaveLength(4) // initial + 3 retries
    vi.useRealTimers()
  })

  it('5xx → retried, then succeeds when transport recovers', async () => {
    vi.useFakeTimers()
    const t = mockTransport((n) => ({ status: n < 2 ? 503 : 200 }))
    const sink = createPostHogHttpSink({
      apiKey: 'k',
      maxRetries: 5,
      backoffBaseMs: 10,
      fetchImpl: t.fetchImpl,
    })
    const p = sink.deliver([makeEvent()], CTX_ONLINE)
    await vi.runAllTimersAsync()
    await p
    expect(t.calls).toHaveLength(3)
    vi.useRealTimers()
  })

  it('network error is treated as transient and retried', async () => {
    vi.useFakeTimers()
    let n = 0
    const fetchImpl = vi.fn(async () => {
      if (n++ < 1) throw new Error('network down')
      return { status: 200, ok: true } as Response
    }) as unknown as typeof fetch
    const sink = createPostHogHttpSink({
      apiKey: 'k',
      maxRetries: 3,
      backoffBaseMs: 10,
      fetchImpl,
    })
    const p = sink.deliver([makeEvent()], CTX_ONLINE)
    await vi.runAllTimersAsync()
    await p
    expect(
      (fetchImpl as unknown as { mock: { calls: unknown[] } }).mock.calls,
    ).toHaveLength(2)
    vi.useRealTimers()
  })
})

describe('posthog http sink — sendBeacon (unload path)', () => {
  it('uses beacon (api_key in body, no header) on unload', async () => {
    const beaconCalls: Array<{ url: string; body: string }> = []
    const t = mockTransport()
    const sink = createPostHogHttpSink({
      apiKey: 'phc_KEY',
      fetchImpl: t.fetchImpl,
      beaconImpl: (url, body) => {
        beaconCalls.push({ url, body })
        return true
      },
    })
    await sink.deliver([makeEvent()], CTX_UNLOAD)
    expect(beaconCalls).toHaveLength(1)
    expect(t.calls).toHaveLength(0) // beacon used, not fetch
    expect(beaconCalls[0].url).toContain('/capture/')
    expect(JSON.parse(beaconCalls[0].body).api_key).toBe('phc_KEY')
  })

  it('falls back to keepalive fetch when beacon unavailable on unload', async () => {
    const t = mockTransport()
    const sink = createPostHogHttpSink({ apiKey: 'k', fetchImpl: t.fetchImpl })
    await sink.deliver([makeEvent()], CTX_UNLOAD)
    expect(t.calls).toHaveLength(1)
  })

  it('online path never uses beacon', async () => {
    const beaconCalls: string[] = []
    const t = mockTransport()
    const sink = createPostHogHttpSink({
      apiKey: 'k',
      fetchImpl: t.fetchImpl,
      beaconImpl: (u) => {
        beaconCalls.push(u)
        return true
      },
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(beaconCalls).toHaveLength(0)
    expect(t.calls).toHaveLength(1)
  })
})

describe('posthog http sink — size limits', () => {
  it('splits a batch that exceeds the per-batch byte cap', async () => {
    const t = mockTransport()
    const sink = createPostHogHttpSink({
      apiKey: 'k',
      fetchImpl: t.fetchImpl,
      maxBatchBytes: 600,
      maxEventBytes: 32_000,
    })
    await sink.deliver(
      [makeEvent(), makeEvent(), makeEvent(), makeEvent()],
      CTX_ONLINE,
    )
    expect(t.calls.length).toBeGreaterThan(1)
    const total = t.calls.reduce((sum, c) => {
      const b = c.body
      return sum + (b.batch ? b.batch.length : 1)
    }, 0)
    expect(total).toBe(4) // no events lost during splitting
  })

  it('drops a single event larger than the per-event byte cap', async () => {
    const t = mockTransport()
    const sink = createPostHogHttpSink({
      apiKey: 'k',
      fetchImpl: t.fetchImpl,
      maxEventBytes: 50,
    })
    await sink.deliver([makeEvent()], CTX_ONLINE)
    expect(t.calls).toHaveLength(0)
  })
})

describe('posthog http sink — consent categories', () => {
  it('defaults to requiring the analytics category', () => {
    const sink = createPostHogHttpSink({ apiKey: 'k' })
    expect(sink.consentCategories).toEqual(['analytics'])
  })

  it('honours a custom consentCategories list', () => {
    const sink = createPostHogHttpSink({
      apiKey: 'k',
      consentCategories: ['marketing', 'analytics'],
    })
    expect(sink.consentCategories).toEqual(['marketing', 'analytics'])
  })
})
