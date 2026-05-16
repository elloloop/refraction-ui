import { describe, it, expect } from 'vitest'
import {
  Injector,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
} from '@angular/core'
import {
  AnalyticsService,
  ANALYTICS_INSTANCE,
  provideAnalytics,
} from '../src/analytics.service.js'
import { createAnalytics, createMockSink } from '@refraction-ui/analytics'

function makeAnalytics() {
  const sink = createMockSink()
  const analytics = createAnalytics({
    app: 'test-app',
    env: 'development',
    preset: 'dev',
    sinks: [sink],
    consent: { granted: ['analytics'] },
  })
  return { analytics, sink }
}

/**
 * Build a real Angular environment injector wired exactly as an app would be:
 * `provideAnalytics(...)` + an `AnalyticsService` factory. The service is
 * registered via a functional `inject()` factory so it resolves under real
 * Angular DI without relying on decorator metadata emission in the test
 * transform — the production `@Injectable()` decorator is still applied.
 */
function makeInjector(config: Parameters<typeof provideAnalytics>[0]) {
  const root = Injector.create({ providers: [] }) as EnvironmentInjector
  return createEnvironmentInjector(
    [
      provideAnalytics(config),
      {
        provide: AnalyticsService,
        useFactory: () => new AnalyticsService(inject(ANALYTICS_INSTANCE)),
      },
    ],
    root,
  )
}

describe('provideAnalytics', () => {
  it('provides the ANALYTICS_INSTANCE token from a config', () => {
    const injector = makeInjector({
      app: 'cfg-app',
      env: 'development',
      preset: 'dev',
    })
    const analytics = injector.get(ANALYTICS_INSTANCE)
    expect(typeof analytics.track).toBe('function')
    expect(analytics.enabled).toBe(true)
  })

  it('provides an existing Analytics instance verbatim', () => {
    const { analytics } = makeAnalytics()
    const injector = makeInjector(analytics)
    expect(injector.get(ANALYTICS_INSTANCE)).toBe(analytics)
  })
})

describe('AnalyticsService', () => {
  it('resolves from the injector and exposes the full surface', () => {
    const { analytics } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    expect(service).toBeInstanceOf(AnalyticsService)
    expect(service.instance).toBe(analytics)
    expect(service.enabled).toBe(true)
    expect(Array.isArray(service.sinks)).toBe(true)
    expect(typeof service.track).toBe('function')
    expect(typeof service.identify).toBe('function')
    expect(typeof service.page).toBe('function')
    expect(typeof service.screen).toBe('function')
    expect(typeof service.group).toBe('function')
    expect(typeof service.alias).toBe('function')
    expect(service.session).toBe(analytics.session)
    expect(service.consent).toBe(analytics.consent)
  })

  it('throws when no analytics instance is provided', () => {
    expect(() => new AnalyticsService(null)).toThrow(/provideAnalytics/)
  })

  it('forwards track() to the underlying sink', () => {
    const { analytics, sink } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    service.track('Signup Clicked', { plan: 'pro' })
    expect(sink.events).toHaveLength(1)
    expect(sink.events[0]).toMatchObject({
      type: 'track',
      event: 'Signup Clicked',
      properties: { plan: 'pro' },
    })
  })

  it('forwards identify() with traits', () => {
    const { analytics, sink } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    service.identify('user-42', { email: 'a@example.com' })
    expect(sink.events).toHaveLength(1)
    expect(sink.events[0]).toMatchObject({
      type: 'identify',
      userId: 'user-42',
    })
    expect(service.userId()).toBe('user-42')
  })

  it('forwards page() and screen() calls', () => {
    const { analytics, sink } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    service.page('Home', { path: '/' })
    service.screen('Settings')
    expect(sink.events.map((e) => e.type)).toEqual(['page', 'screen'])
  })

  it('forwards group() and alias() calls', () => {
    const { analytics, sink } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    service.identify('user-1')
    service.group('org-9', { plan: 'enterprise' })
    service.alias('user-1-new', 'user-1')
    const types = sink.events.map((e) => e.type)
    expect(types).toContain('group')
    expect(types).toContain('alias')
  })

  it('exposes a stable, non-PII anonymousId', () => {
    const { analytics } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    const id = service.anonymousId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
    expect(service.anonymousId()).toBe(id)
  })

  it('derives a with() child that stamps scoped context', () => {
    const { analytics, sink } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    const scoped = service.with({ feature: 'checkout' })
    expect(scoped).not.toBe(analytics)
    scoped.track('Card Added')
    expect(sink.events).toHaveLength(1)
    expect(sink.events[0]).toMatchObject({
      type: 'track',
      event: 'Card Added',
      context: { feature: 'checkout' },
    })
  })

  it('exposes the session API and mints a session id', () => {
    const { analytics } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    const sid = service.session.id()
    expect(typeof sid).toBe('string')
    expect(sid.length).toBeGreaterThan(0)
  })

  it('grants and revokes consent through the consent API', () => {
    const { analytics } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    service.consent.grant('marketing')
    expect(service.consent.isGranted('marketing')).toBe(true)
    service.consent.revoke('marketing')
    expect(service.consent.isGranted('marketing')).toBe(false)
  })

  it('reset() clears identity and rotates the anonymousId', () => {
    const { analytics } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    service.identify('user-99')
    const before = service.anonymousId()
    service.reset()
    expect(service.userId()).toBeUndefined()
    expect(service.anonymousId()).not.toBe(before)
  })

  it('flush() resolves', async () => {
    const { analytics } = makeAnalytics()
    const service = makeInjector(analytics).get(AnalyticsService)
    service.track('Buffered Event')
    await expect(service.flush()).resolves.toBeUndefined()
  })
})
