import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createGA4HttpSink } from '../src/http-sink.js'
import { createGA4Sink } from '../src/ga4-sink.js'
import type { AnalyticsEvent } from '@refraction-ui/analytics'

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'Signup Clicked',
    messageId: 'mid-' + Math.random().toString(36).slice(2),
    anonymousId: 'anon-1',
    sessionId: 'sess-1',
    properties: { plan: 'pro' },
    context: {
      app: 'app',
      env: 'test',
      library: { name: '@refraction-ui/analytics', version: '0.1.0' },
    },
    timestamp: '2026-05-17T00:00:00.000Z',
    schemaVersion: 1,
    ...overrides,
  }
}

/** A mock GA4 Measurement Protocol backend (no network). */
function mockMP() {
  const calls: Array<{ url: string; method: string; body: unknown }> = []
  const fetchImpl = vi.fn(
    async (url: string, init?: RequestInit): Promise<Response> => {
      calls.push({
        url,
        method: init?.method ?? 'GET',
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      })
      return { status: 204, ok: true } as Response
    },
  )
  return { calls, fetchImpl: fetchImpl as unknown as typeof fetch }
}

describe('GA4 http sink — Measurement Protocol wire format', () => {
  it('POSTs to /mp/collect with measurement_id + api_secret query', async () => {
    const mp = mockMP()
    const sink = createGA4HttpSink({
      mode: 'http',
      measurementId: 'G-ABC123',
      apiSecret: 'secret/with+special',
      fetchImpl: mp.fetchImpl,
    })
    await sink.deliver([makeEvent()], { unload: false })

    expect(mp.calls).toHaveLength(1)
    const call = mp.calls[0]
    expect(call.method).toBe('POST')
    expect(call.url).toBe(
      'https://www.google-analytics.com/mp/collect' +
        '?measurement_id=G-ABC123' +
        '&api_secret=' +
        encodeURIComponent('secret/with+special'),
    )
  })

  it('maps anonymousId→client_id, userId→user_id, properties→event params', async () => {
    const mp = mockMP()
    const sink = createGA4HttpSink({
      mode: 'http',
      measurementId: 'G-X',
      apiSecret: 's',
      fetchImpl: mp.fetchImpl,
    })
    await sink.deliver(
      [
        makeEvent({
          anonymousId: 'anon-99',
          userId: 'user_7',
          event: 'Add To Cart',
          properties: { value: 42 },
        }),
      ],
      { unload: false },
    )
    const body = mp.calls[0].body as {
      client_id: string
      user_id: string
      events: Array<{ name: string; params: Record<string, unknown> }>
    }
    expect(body.client_id).toBe('anon-99')
    expect(body.user_id).toBe('user_7')
    expect(body.events[0].name).toBe('add_to_cart')
    expect(body.events[0].params.value).toBe(42)
    expect(body.events[0].params.session_id).toBe('sess-1')
  })

  it('identify maps traits → user_properties with no event', async () => {
    const mp = mockMP()
    const sink = createGA4HttpSink({
      mode: 'http',
      measurementId: 'G-X',
      apiSecret: 's',
      fetchImpl: mp.fetchImpl,
    })
    await sink.deliver(
      [
        makeEvent({
          type: 'identify',
          event: undefined,
          userId: 'user_1',
          traits: { plan: 'pro' },
        }),
      ],
      { unload: false },
    )
    const body = mp.calls[0].body as {
      user_id: string
      user_properties: Record<string, { value: unknown }>
      events: unknown[]
    }
    expect(body.user_id).toBe('user_1')
    expect(body.user_properties).toEqual({ plan: { value: 'pro' } })
    expect(body.events).toHaveLength(0)
  })

  it('chunks to GA4 25-events-per-request limit', async () => {
    const mp = mockMP()
    const sink = createGA4HttpSink({
      mode: 'http',
      measurementId: 'G-X',
      apiSecret: 's',
      fetchImpl: mp.fetchImpl,
    })
    const batch = Array.from({ length: 60 }, (_, i) =>
      makeEvent({ event: `e${i}` }),
    )
    await sink.deliver(batch, { unload: false })
    // 60 events → 3 requests (25 + 25 + 10)
    expect(mp.calls).toHaveLength(3)
    const total = mp.calls.reduce(
      (n, c) => n + (c.body as { events: unknown[] }).events.length,
      0,
    )
    expect(total).toBe(60)
  })

  it('does nothing for an empty batch', async () => {
    const mp = mockMP()
    const sink = createGA4HttpSink({
      mode: 'http',
      measurementId: 'G-X',
      apiSecret: 's',
      fetchImpl: mp.fetchImpl,
    })
    await sink.deliver([], { unload: false })
    expect(mp.calls).toHaveLength(0)
  })

  it('uses the debug validation endpoint when debug:true', async () => {
    const mp = mockMP()
    const sink = createGA4HttpSink({
      mode: 'http',
      measurementId: 'G-X',
      apiSecret: 's',
      debug: true,
      fetchImpl: mp.fetchImpl,
    })
    await sink.deliver([makeEvent()], { unload: false })
    expect(mp.calls[0].url).toContain('/debug/mp/collect')
  })

  it('honours a custom endpoint (e.g. EU region / proxy)', async () => {
    const mp = mockMP()
    const sink = createGA4HttpSink({
      mode: 'http',
      measurementId: 'G-X',
      apiSecret: 's',
      endpoint: 'https://relay.example.com/',
      fetchImpl: mp.fetchImpl,
    })
    await sink.deliver([makeEvent()], { unload: false })
    expect(mp.calls[0].url).toBe(
      'https://relay.example.com/mp/collect?measurement_id=G-X&api_secret=s',
    )
  })

  it('swallows network failures (fire-and-forget MP)', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('network down')
    }) as unknown as typeof fetch
    const sink = createGA4HttpSink({
      mode: 'http',
      measurementId: 'G-X',
      apiSecret: 's',
      fetchImpl,
    })
    await expect(
      sink.deliver([makeEvent()], { unload: false }),
    ).resolves.toBeUndefined()
  })
})

describe('GA4 http sink — consent gating', () => {
  it('defaults to requiring the analytics category', () => {
    const sink = createGA4HttpSink({
      mode: 'http',
      measurementId: 'G-X',
      apiSecret: 's',
    })
    expect(sink.consentCategories).toEqual(['analytics'])
  })

  it('honours a custom consentCategories list', () => {
    const sink = createGA4HttpSink({
      mode: 'http',
      measurementId: 'G-X',
      apiSecret: 's',
      consentCategories: ['marketing', 'analytics'],
    })
    expect(sink.consentCategories).toEqual(['marketing', 'analytics'])
  })

  it('exposes a stable sink name (default ga4, overridable)', () => {
    expect(
      createGA4HttpSink({ mode: 'http', measurementId: 'G', apiSecret: 's' })
        .name,
    ).toBe('ga4')
    expect(
      createGA4HttpSink({
        mode: 'http',
        measurementId: 'G',
        apiSecret: 's',
        name: 'ga4-eu',
      }).name,
    ).toBe('ga4-eu')
  })
})

describe('GA4 http sink — no vendor library loaded', () => {
  const realDoc = (globalThis as Record<string, unknown>).document
  const realDL = (globalThis as Record<string, unknown>).dataLayer

  beforeEach(() => {
    // Spy on document.createElement to prove no <script> is injected.
    ;(globalThis as Record<string, unknown>).document = {
      createElement: vi.fn(() => {
        throw new Error('http mode must not create DOM script elements')
      }),
    }
    delete (globalThis as Record<string, unknown>).dataLayer
  })
  afterEach(() => {
    ;(globalThis as Record<string, unknown>).document = realDoc
    ;(globalThis as Record<string, unknown>).dataLayer = realDL
  })

  it('never creates a gtag.js <script> and never installs window.gtag/dataLayer', async () => {
    const mp = mockMP()
    const sink = createGA4Sink({
      mode: 'http',
      measurementId: 'G-X',
      apiSecret: 's',
      fetchImpl: mp.fetchImpl,
    })
    await sink.init?.({ app: 'a', env: 'test' })
    await sink.deliver([makeEvent(), makeEvent()], { unload: false })

    const doc = (globalThis as Record<string, unknown>).document as {
      createElement: ReturnType<typeof vi.fn>
    }
    expect(doc.createElement).not.toHaveBeenCalled()
    expect(
      (globalThis as Record<string, unknown>).dataLayer,
    ).toBeUndefined()
    expect(
      (globalThis as Record<string, unknown>).gtag,
    ).toBeUndefined()
    expect(mp.calls.length).toBeGreaterThan(0)
  })
})
