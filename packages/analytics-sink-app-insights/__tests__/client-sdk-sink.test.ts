import { describe, it, expect, vi } from 'vitest'
import type { AnalyticsEvent } from '@refraction-ui/analytics'
import { SCHEMA_VERSION } from '@refraction-ui/analytics'
import {
  createAppInsightsSink,
  type AppInsightsLike,
} from '../src/app-insights-sink.js'

const CTX = { unload: false }

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'Signup Clicked',
    messageId: 'mid-' + Math.random().toString(36).slice(2),
    anonymousId: 'anon-1',
    sessionId: 'sess-1',
    properties: { plan: 'pro', revenue: 42 },
    context: {
      app: 'my-app',
      env: 'production',
      library: { name: '@refraction-ui/analytics', version: '0.1.0' },
    },
    timestamp: '2026-05-16T12:00:00.000Z',
    schemaVersion: SCHEMA_VERSION,
    ...overrides,
  }
}

/** A mock App Insights instance — captures every call, no network. */
function mockAppInsights() {
  const trackEvent =
    vi.fn<
      (
        e: { name: string },
        props?: Record<string, unknown>,
      ) => void
    >()
  const trackPageView =
    vi.fn<
      (pv?: {
        name?: string
        uri?: string
        properties?: Record<string, unknown>
        measurements?: Record<string, number>
      }) => void
    >()
  const setAuthenticatedUserContext = vi.fn<(id: string) => void>()
  const clearAuthenticatedUserContext = vi.fn<() => void>()
  const flush = vi.fn<(async?: boolean) => void>()
  const loadAppInsights = vi.fn<() => void>()
  const ai: AppInsightsLike = {
    loadAppInsights,
    trackEvent,
    trackPageView,
    setAuthenticatedUserContext,
    clearAuthenticatedUserContext,
    flush,
  }
  return {
    ai,
    trackEvent,
    trackPageView,
    setAuthenticatedUserContext,
    clearAuthenticatedUserContext,
    flush,
  }
}

describe('client-sdk sink — trackEvent mapping', () => {
  it('maps a track event to trackEvent with merged props/measurements', async () => {
    const m = mockAppInsights()
    const sink = createAppInsightsSink({
      mode: 'client-sdk',
      appInsights: m.ai,
    })
    await sink.deliver([makeEvent()], CTX)

    expect(m.trackEvent).toHaveBeenCalledTimes(1)
    const [evt, custom] = m.trackEvent.mock.calls[0]
    expect(evt.name).toBe('Signup Clicked')
    expect(custom!.plan).toBe('pro')
    expect(custom!.revenue).toBe(42) // numeric measurement preserved
    expect(custom!.anonymous).toBe('true')
    expect(m.trackPageView).not.toHaveBeenCalled()
  })

  it('routes page events to trackPageView with name + uri', async () => {
    const m = mockAppInsights()
    const sink = createAppInsightsSink({
      mode: 'client-sdk',
      appInsights: m.ai,
    })
    await sink.deliver(
      [
        makeEvent({
          type: 'page',
          event: 'Pricing',
          context: {
            app: 'a',
            env: 'e',
            library: { name: 'n', version: '0.1.0' },
            page: { path: '/pricing', url: 'https://x/pricing' },
          },
        }),
      ],
      CTX,
    )
    expect(m.trackPageView).toHaveBeenCalledTimes(1)
    const [pv] = m.trackPageView.mock.calls[0]
    expect(pv!.name).toBe('Pricing')
    expect(pv!.uri).toBe('https://x/pricing')
    expect(m.trackEvent).not.toHaveBeenCalled()
  })

  it('sets authenticated user context on identified events', async () => {
    const m = mockAppInsights()
    const sink = createAppInsightsSink({
      mode: 'client-sdk',
      appInsights: m.ai,
    })
    await sink.deliver([makeEvent({ userId: 'user_42' })], CTX)
    expect(m.setAuthenticatedUserContext).toHaveBeenCalledWith('user_42')
  })

  it('does not re-set the same authenticated user across events', async () => {
    const m = mockAppInsights()
    const sink = createAppInsightsSink({
      mode: 'client-sdk',
      appInsights: m.ai,
    })
    await sink.deliver(
      [makeEvent({ userId: 'u1' }), makeEvent({ userId: 'u1' })],
      CTX,
    )
    expect(m.setAuthenticatedUserContext).toHaveBeenCalledTimes(1)
  })

  it('clears authenticated user on an anonymous identify after login', async () => {
    const m = mockAppInsights()
    const sink = createAppInsightsSink({
      mode: 'client-sdk',
      appInsights: m.ai,
    })
    await sink.deliver([makeEvent({ userId: 'u1', type: 'identify' })], CTX)
    await sink.deliver([makeEvent({ type: 'identify' })], CTX)
    expect(m.clearAuthenticatedUserContext).toHaveBeenCalledTimes(1)
  })

  it('flush() delegates to the SDK flush', async () => {
    const m = mockAppInsights()
    const sink = createAppInsightsSink({
      mode: 'client-sdk',
      appInsights: m.ai,
    })
    await sink.deliver([makeEvent()], CTX)
    await sink.flush?.()
    expect(m.flush).toHaveBeenCalledWith(false)
  })

  it('does nothing for an empty batch', async () => {
    const m = mockAppInsights()
    const sink = createAppInsightsSink({
      mode: 'client-sdk',
      appInsights: m.ai,
    })
    await sink.deliver([], CTX)
    expect(m.trackEvent).not.toHaveBeenCalled()
  })

  it('default consent category is analytics; overridable', () => {
    const a = createAppInsightsSink({
      mode: 'client-sdk',
      appInsights: mockAppInsights().ai,
    })
    expect(a.consentCategories).toEqual(['analytics'])
    const b = createAppInsightsSink({
      mode: 'client-sdk',
      appInsights: mockAppInsights().ai,
      consentCategories: ['marketing'],
    })
    expect(b.consentCategories).toEqual(['marketing'])
  })
})

describe('client-sdk sink — lazy SDK loading (no hard dependency)', () => {
  it('uses an injected loadSdk factory exactly once (no network)', async () => {
    const m = mockAppInsights()
    const loadSdk = vi.fn(async () => m.ai)
    const sink = createAppInsightsSink({
      mode: 'client-sdk',
      connectionString: 'InstrumentationKey=abc',
      loadSdk,
    })
    await sink.deliver([makeEvent()], CTX)
    await sink.deliver([makeEvent()], CTX)
    expect(loadSdk).toHaveBeenCalledTimes(1) // cached after first load
    expect(loadSdk).toHaveBeenCalledWith({
      connectionString: 'InstrumentationKey=abc',
      instrumentationKey: undefined,
    })
    expect(m.trackEvent).toHaveBeenCalledTimes(2)
  })

  it('shutdown() drops the cached instance so it reloads next time', async () => {
    const m = mockAppInsights()
    const loadSdk = vi.fn(async () => m.ai)
    const sink = createAppInsightsSink({
      mode: 'client-sdk',
      loadSdk,
    })
    await sink.deliver([makeEvent()], CTX)
    sink.shutdown?.()
    await sink.deliver([makeEvent()], CTX)
    expect(loadSdk).toHaveBeenCalledTimes(2)
  })
})
