import { describe, it, expect, vi } from 'vitest'
import { createGA4ClientSdkSink } from '../src/client-sdk-sink.js'
import { createGA4Sink } from '../src/ga4-sink.js'
import type { AnalyticsEvent } from '@refraction-ui/analytics'
import type { GtagFn } from '../src/types.js'

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'Signup Clicked',
    messageId: 'mid-1',
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

/** A mock gtag function that records every invocation (no network). */
function mockGtag() {
  const calls: unknown[][] = []
  const fn: GtagFn = (...args: unknown[]) => {
    calls.push(args)
  }
  return { calls, fn }
}

describe('GA4 client-sdk sink — gtag mapping', () => {
  it('configures gtag and maps anonymousId→client_id via config + event', async () => {
    const g = mockGtag()
    const sink = createGA4ClientSdkSink({
      mode: 'client-sdk',
      measurementId: 'G-ABC',
      gtag: g.fn,
    })
    await sink.deliver([makeEvent()], { unload: false })

    // js + config bootstrap happens once
    expect(g.calls.some((c) => c[0] === 'js')).toBe(true)
    const config = g.calls.find((c) => c[0] === 'config')
    expect(config?.[1]).toBe('G-ABC')
    // the track event is mapped + sent
    const evCall = g.calls.find((c) => c[0] === 'event')
    expect(evCall?.[1]).toBe('signup_clicked')
    expect((evCall?.[2] as Record<string, unknown>).plan).toBe('pro')
    expect((evCall?.[2] as Record<string, unknown>).session_id).toBe(
      'sess-1',
    )
  })

  it('userId → gtag set user_id (GA4 User-ID)', async () => {
    const g = mockGtag()
    const sink = createGA4ClientSdkSink({
      mode: 'client-sdk',
      measurementId: 'G-X',
      gtag: g.fn,
    })
    await sink.deliver([makeEvent({ userId: 'user_42' })], {
      unload: false,
    })
    const setUser = g.calls.find(
      (c) =>
        c[0] === 'set' &&
        typeof c[1] === 'object' &&
        (c[1] as Record<string, unknown>).user_id === 'user_42',
    )
    expect(setUser).toBeDefined()
  })

  it('identify traits → gtag set user_properties (unwrapped)', async () => {
    const g = mockGtag()
    const sink = createGA4ClientSdkSink({
      mode: 'client-sdk',
      measurementId: 'G-X',
      gtag: g.fn,
    })
    await sink.deliver(
      [
        makeEvent({
          type: 'identify',
          event: undefined,
          traits: { plan: 'enterprise' },
        }),
      ],
      { unload: false },
    )
    const setUP = g.calls.find(
      (c) => c[0] === 'set' && c[1] === 'user_properties',
    )
    expect(setUP?.[2]).toEqual({ plan: 'enterprise' })
    // identify emits no GA4 event
    expect(g.calls.some((c) => c[0] === 'event')).toBe(false)
  })

  it('page → page_view event', async () => {
    const g = mockGtag()
    const sink = createGA4ClientSdkSink({
      mode: 'client-sdk',
      measurementId: 'G-X',
      gtag: g.fn,
    })
    await sink.deliver(
      [makeEvent({ type: 'page', event: 'Pricing' })],
      { unload: false },
    )
    expect(g.calls.some((c) => c[0] === 'event' && c[1] === 'page_view')).toBe(
      true,
    )
  })
})

describe('GA4 client-sdk sink — lazy gtag.js loading (no hard dep)', () => {
  it('injects the gtag.js script lazily on first delivery only', async () => {
    const loaded: string[] = []
    const scriptLoader = vi.fn(async (src: string) => {
      loaded.push(src)
    })
    const g = mockGtag()
    const sink = createGA4ClientSdkSink({
      mode: 'client-sdk',
      measurementId: 'G-LAZY',
      // no gtag injected → loader path is used
      scriptLoader,
      gtagSrcBase: 'https://gtm.test/gtag/js',
    })
    // Provide a gtag stub via globalThis so post-load calls work.
    ;(globalThis as Record<string, unknown>).gtag = g.fn

    expect(scriptLoader).not.toHaveBeenCalled() // not loaded at construction
    await sink.deliver([makeEvent()], { unload: false })
    expect(scriptLoader).toHaveBeenCalledTimes(1)
    expect(loaded[0]).toBe('https://gtm.test/gtag/js?id=G-LAZY')

    // second delivery does NOT re-load the script
    await sink.deliver([makeEvent()], { unload: false })
    expect(scriptLoader).toHaveBeenCalledTimes(1)

    delete (globalThis as Record<string, unknown>).gtag
  })

  it('does not inject any script when an app-supplied gtag is given', async () => {
    const scriptLoader = vi.fn(async () => {})
    const g = mockGtag()
    const sink = createGA4ClientSdkSink({
      mode: 'client-sdk',
      measurementId: 'G-X',
      gtag: g.fn,
      scriptLoader,
    })
    await sink.deliver([makeEvent()], { unload: false })
    expect(scriptLoader).not.toHaveBeenCalled()
  })
})

describe('GA4 client-sdk sink — Consent Mode bridge', () => {
  it('pushes consent default on init (before the tag loads)', async () => {
    const g = mockGtag()
    const sink = createGA4ClientSdkSink({
      mode: 'client-sdk',
      measurementId: 'G-X',
      gtag: g.fn,
      consentMode: {
        default: { analytics_storage: 'denied', ad_storage: 'denied' },
        map: { analytics: ['analytics_storage'] },
      },
    })
    await sink.init?.({ app: 'a', env: 'test' })
    const def = g.calls.find(
      (c) => c[0] === 'consent' && c[1] === 'default',
    )
    expect(def?.[2]).toEqual({
      analytics_storage: 'denied',
      ad_storage: 'denied',
    })
  })

  it('pushes consent update for granted categories on deliver', async () => {
    const g = mockGtag()
    const sink = createGA4ClientSdkSink({
      mode: 'client-sdk',
      measurementId: 'G-X',
      gtag: g.fn,
      consentCategories: ['analytics'],
      consentMode: {
        default: { analytics_storage: 'denied' },
        map: { analytics: ['analytics_storage'] },
      },
    })
    // deliver is only called by the router once consent is granted; the
    // bridge reflects that to GA4.
    await sink.deliver([makeEvent()], { unload: false })
    const upd = g.calls.find(
      (c) => c[0] === 'consent' && c[1] === 'update',
    )
    expect(upd?.[2]).toEqual({ analytics_storage: 'granted' })
  })

  it('no consent commands when no bridge configured', async () => {
    const g = mockGtag()
    const sink = createGA4ClientSdkSink({
      mode: 'client-sdk',
      measurementId: 'G-X',
      gtag: g.fn,
    })
    await sink.init?.({ app: 'a', env: 'test' })
    await sink.deliver([makeEvent()], { unload: false })
    expect(g.calls.some((c) => c[0] === 'consent')).toBe(false)
  })
})

describe('createGA4Sink — mode dispatch + consent', () => {
  it('mode:client-sdk builds the gtag adapter', async () => {
    const g = mockGtag()
    const sink = createGA4Sink({
      mode: 'client-sdk',
      measurementId: 'G-X',
      gtag: g.fn,
    })
    expect(sink.name).toBe('ga4')
    await sink.deliver([makeEvent()], { unload: false })
    expect(g.calls.some((c) => c[0] === 'event')).toBe(true)
  })

  it('defaults consentCategories to [analytics] in client-sdk mode', () => {
    const g = mockGtag()
    const sink = createGA4Sink({
      mode: 'client-sdk',
      measurementId: 'G-X',
      gtag: g.fn,
    })
    expect(sink.consentCategories).toEqual(['analytics'])
  })
})
