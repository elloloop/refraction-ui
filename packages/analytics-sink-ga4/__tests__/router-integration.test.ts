import { describe, it, expect, vi } from 'vitest'
import { createAnalytics } from '@refraction-ui/analytics'
import { createGA4Sink } from '../src/ga4-sink.js'

/**
 * End-to-end: the GA4 sink is "just a sink" registered on the neutral router.
 * The app instruments once (never naming GA4); the router fans the canonical
 * envelope into the GA4 adapter, with the consent gate honoured.
 */
function mockMP() {
  const calls: Array<{ url: string; body: unknown }> = []
  const fetchImpl = vi.fn(
    async (url: string, init?: RequestInit): Promise<Response> => {
      calls.push({
        url,
        body: init?.body ? JSON.parse(init.body as string) : undefined,
      })
      return { status: 204, ok: true } as Response
    },
  )
  return { calls, fetchImpl: fetchImpl as unknown as typeof fetch }
}

describe('GA4 sink via the neutral router', () => {
  it('http sink receives mapped envelopes when consent granted', async () => {
    const mp = mockMP()
    const analytics = createAnalytics({
      app: 'demo',
      env: 'production',
      consent: { granted: ['analytics'] },
      sinks: [
        createGA4Sink({
          mode: 'http',
          measurementId: 'G-DEMO',
          apiSecret: 'sec',
          fetchImpl: mp.fetchImpl,
        }),
      ],
    })

    analytics.identify('user_9', { plan: 'pro' })
    analytics.track('Signup Clicked', { ref: 'hero' })
    await analytics.flush()

    expect(mp.calls.length).toBeGreaterThan(0)
    const bodies = mp.calls.map((c) => c.body as Record<string, unknown>)
    // client_id always carries the anonymousId
    expect(typeof bodies[0].client_id).toBe('string')
    // user_id propagates after identify
    const withUser = bodies.find((b) => b.user_id === 'user_9')
    expect(withUser).toBeDefined()
  })

  it('consent gate blocks delivery until the category is granted', async () => {
    const mp = mockMP()
    const analytics = createAnalytics({
      app: 'demo',
      env: 'production',
      // analytics NOT granted
      consent: { granted: [] },
      sinks: [
        createGA4Sink({
          mode: 'http',
          measurementId: 'G-DEMO',
          apiSecret: 'sec',
          consentCategories: ['analytics'],
          fetchImpl: mp.fetchImpl,
        }),
      ],
    })

    analytics.track('Blocked Event')
    await analytics.flush()
    expect(mp.calls).toHaveLength(0) // gated out

    analytics.consent.grant('analytics')
    analytics.track('Allowed Event')
    await analytics.flush()
    expect(mp.calls.length).toBeGreaterThan(0) // now delivered
  })
})
