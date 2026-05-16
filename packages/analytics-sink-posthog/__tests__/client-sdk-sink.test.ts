import { describe, it, expect, vi } from 'vitest'
import { SCHEMA_VERSION } from '@refraction-ui/analytics'
import type { AnalyticsEvent } from '@refraction-ui/analytics'
import { createPostHogClientSdkSink } from '../src/client-sdk-sink.js'
import { createPostHogSink } from '../src/sink.js'

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'Clicked',
    messageId: 'm1',
    anonymousId: 'anon-1',
    sessionId: 's1',
    properties: { x: 1 },
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

function fakePostHog() {
  return {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    alias: vi.fn(),
    group: vi.fn(),
    reset: vi.fn(),
  }
}

describe('posthog client-sdk sink — lazy posthog-js', () => {
  it('does NOT load posthog-js at construction time', () => {
    const loadPostHog = vi.fn()
    createPostHogClientSdkSink({ apiKey: 'k', loadPostHog })
    expect(loadPostHog).not.toHaveBeenCalled()
  })

  it('loads + inits posthog-js on init(), with autocapture/replay OFF', async () => {
    const ph = fakePostHog()
    const loadPostHog = vi.fn(async () => ph)
    const sink = createPostHogClientSdkSink({
      apiKey: 'phc_k',
      host: 'https://eu.i.posthog.com',
      loadPostHog,
    })
    await sink.init?.({ app: 'app', env: 'test' })
    expect(loadPostHog).toHaveBeenCalledTimes(1)
    const opts = ph.init.mock.calls[0][1] as Record<string, unknown>
    expect(opts.api_host).toBe('https://eu.i.posthog.com')
    expect(opts.autocapture).toBe(false)
    expect(opts.capture_pageview).toBe(false)
    expect(opts.disable_session_recording).toBe(true)
  })

  it('maps envelope calls to posthog-js methods', async () => {
    const ph = fakePostHog()
    const sink = createPostHogClientSdkSink({
      apiKey: 'k',
      loadPostHog: async () => ph,
    })
    await sink.deliver(
      [
        makeEvent({ type: 'track', event: 'Signup', properties: { p: 1 } }),
        makeEvent({
          type: 'identify',
          event: undefined,
          userId: 'u1',
          traits: { plan: 'pro' },
        }),
        makeEvent({
          type: 'alias',
          event: undefined,
          userId: 'u1',
          previousId: 'anon-old',
        }),
        makeEvent({
          type: 'group',
          event: undefined,
          groupId: 'org_7',
          properties: { groupType: 'organization' },
          traits: { name: 'Acme' },
        }),
      ],
      { unload: false },
    )
    expect(ph.capture).toHaveBeenCalledWith('Signup', { p: 1 })
    expect(ph.identify).toHaveBeenCalledWith('u1', { plan: 'pro' })
    expect(ph.alias).toHaveBeenCalledWith('anon-old', 'u1')
    expect(ph.group).toHaveBeenCalledWith('organization', 'org_7', {
      name: 'Acme',
    })
  })

  it('only selecting client-sdk mode reaches the lazy loader', async () => {
    const ph = fakePostHog()
    const loadPostHog = vi.fn(async () => ph)
    const sink = createPostHogSink({
      mode: 'client-sdk',
      apiKey: 'k',
      loadPostHog,
    })
    await sink.deliver([makeEvent()], { unload: false })
    expect(loadPostHog).toHaveBeenCalled()
  })
})
