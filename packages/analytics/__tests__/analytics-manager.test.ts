import { describe, it, expect, vi } from 'vitest'
import { createAnalytics } from '../src/analytics-manager.js'
import { createMockSink } from '../src/mock-sink.js'
import { createMemoryStorage } from '../src/storage.js'
import { SCHEMA_VERSION } from '../src/types.js'
import { isUuidV4 } from '../src/uuid.js'
import type { AnalyticsConfig } from '../src/types.js'

function devConfig(
  sink = createMockSink(),
  extra: Partial<AnalyticsConfig> = {},
): { a: ReturnType<typeof createAnalytics>; sink: typeof sink } {
  const a = createAnalytics({
    app: 'test-app',
    env: 'development',
    sinks: [sink],
    session: { storage: createMemoryStorage() },
    identity: { storage: createMemoryStorage() },
    consent: { granted: ['analytics'] },
    ...extra,
  })
  return { a, sink }
}

describe('createAnalytics — envelope shape', () => {
  it('emits a canonical Segment track envelope', () => {
    const { a, sink } = devConfig()
    a.track('Signup Clicked', { plan: 'pro' })
    expect(sink.events).toHaveLength(1)
    const ev = sink.events[0]
    expect(ev.type).toBe('track')
    expect(ev.event).toBe('Signup Clicked')
    expect(ev.properties).toMatchObject({ plan: 'pro' })
    expect(isUuidV4(ev.messageId)).toBe(true)
    expect(isUuidV4(ev.anonymousId)).toBe(true)
    expect(isUuidV4(ev.sessionId)).toBe(true)
    expect(ev.schemaVersion).toBe(SCHEMA_VERSION)
    expect(typeof ev.timestamp).toBe('string')
    expect(new Date(ev.timestamp).toString()).not.toBe('Invalid Date')
    expect(ev.context.app).toBe('test-app')
    expect(ev.context.env).toBe('development')
    expect(ev.context.library.name).toBe('@refraction-ui/analytics')
  })

  it('every call type produces the right envelope', () => {
    const { a, sink } = devConfig()
    a.identify('user_1', { plan: 'pro', email: 'a@b.com' })
    a.page('Home', { path: '/' })
    a.screen('Dashboard')
    a.group('org_1', { name: 'Acme' })
    a.alias('user_2', 'user_1')

    const byType = Object.fromEntries(sink.events.map((e) => [e.type, e]))
    expect(byType.identify.traits).toMatchObject({ plan: 'pro' })
    // PII redaction applied to identify traits
    expect(byType.identify.traits!.email).toBe('[REDACTED]')
    expect(byType.identify.userId).toBe('user_1')
    expect(byType.page.event).toBe('Home')
    expect(byType.screen.event).toBe('Dashboard')
    expect(byType.group.groupId).toBe('org_1')
    expect(byType.alias.previousId).toBe('user_1')
    expect(byType.alias.userId).toBe('user_2')
  })

  it('redacts PII in track properties via the deny-list', () => {
    const { a, sink } = devConfig()
    a.track('Form Submitted', { email: 'a@b.com', value: 42 })
    expect(sink.events[0].properties).toEqual({
      email: '[REDACTED]',
      value: 42,
    })
  })

  it('redacts caller-supplied redactKeys', () => {
    const { a, sink } = devConfig(createMockSink(), {
      redactKeys: ['internalScore'],
    })
    a.track('X', { internalScore: 99, ok: 1 })
    expect(sink.events[0].properties).toEqual({
      internalScore: '[REDACTED]',
      ok: 1,
    })
  })
})

describe('createAnalytics — identity & session', () => {
  it('binds userId after identify and clears it on reset', () => {
    const { a } = devConfig()
    expect(a.userId()).toBeUndefined()
    a.identify('user_9')
    expect(a.userId()).toBe('user_9')
    const anonBefore = a.anonymousId()
    a.reset()
    expect(a.userId()).toBeUndefined()
    expect(a.anonymousId()).not.toBe(anonBefore)
  })

  it('exposes a working session API', () => {
    const { a } = devConfig()
    const id1 = a.session.id()
    expect(isUuidV4(id1)).toBe(true)
    const id2 = a.session.start()
    expect(id2).not.toBe(id1)
    a.session.end()
  })

  it('shares one sessionId across events in a session', () => {
    const { a, sink } = devConfig()
    a.track('A')
    a.track('B')
    expect(sink.events[0].sessionId).toBe(sink.events[1].sessionId)
  })
})

describe('createAnalytics — with(context) child', () => {
  it('merges child context into every event without affecting the parent', () => {
    const { a, sink } = devConfig()
    const child = a.with({ feature: 'checkout' } as never)
    child.track('Child Event')
    a.track('Parent Event')
    const childEv = sink.events.find((e) => e.event === 'Child Event')!
    const parentEv = sink.events.find((e) => e.event === 'Parent Event')!
    expect((childEv.context as Record<string, unknown>).feature).toBe(
      'checkout',
    )
    expect((parentEv.context as Record<string, unknown>).feature).toBeUndefined()
  })

  it('child shares identity/session/sinks with the parent', () => {
    const { a, sink } = devConfig()
    const child = a.with({})
    expect(child.anonymousId()).toBe(a.anonymousId())
    child.addSink(createMockSink({ name: 'extra' }))
    expect(a.sinks).toContain('extra')
    expect(sink).toBeDefined()
  })
})

describe('createAnalytics — sink registry', () => {
  it('lists, adds, and removes sinks', () => {
    const { a } = devConfig()
    expect(a.sinks).toContain('mock')
    const extra = createMockSink({ name: 'extra' })
    a.addSink(extra)
    expect(a.sinks).toContain('extra')
    a.removeSink('extra')
    expect(a.sinks).not.toContain('extra')
  })

  it('calls sink.init exactly once before the first deliver', () => {
    const { a, sink } = devConfig()
    a.track('A')
    a.track('B')
    expect(sink.initCalls).toHaveLength(1)
    expect(sink.initCalls[0]).toMatchObject({
      app: 'test-app',
      env: 'development',
    })
  })

  it('auto-registers a built-in http sink when endpoint is set', () => {
    const a = createAnalytics({
      app: 'x',
      env: 'development',
      endpoint: 'https://t.example.com',
      writeKey: 'wk',
      session: { storage: createMemoryStorage() },
      identity: { storage: createMemoryStorage() },
    })
    expect(a.sinks).toContain('http')
  })

  it('dev preset auto-adds a console sink', () => {
    const a = createAnalytics({
      app: 'x',
      env: 'development',
      session: { storage: createMemoryStorage() },
      identity: { storage: createMemoryStorage() },
    })
    expect(a.sinks).toContain('console')
  })
})

describe('createAnalytics — consent gating', () => {
  it('does not deliver to a sink whose categories are not granted', () => {
    const open = createMockSink({ name: 'open' }) // no categories
    const gated = createMockSink({
      name: 'gated',
      consentCategories: ['marketing'],
    })
    const a = createAnalytics({
      app: 'x',
      env: 'development',
      sinks: [open, gated],
      session: { storage: createMemoryStorage() },
      identity: { storage: createMemoryStorage() },
      consent: { granted: [] },
    })
    a.track('A')
    expect(open.events).toHaveLength(1) // no categories → allowed
    expect(gated.events).toHaveLength(0) // marketing not granted → blocked

    a.consent.grant('marketing')
    a.track('B')
    expect(gated.events).toHaveLength(1) // now flowing
  })

  it('per-sink categories are independent', () => {
    const analyticsSink = createMockSink({
      name: 's-analytics',
      consentCategories: ['analytics'],
    })
    const marketingSink = createMockSink({
      name: 's-marketing',
      consentCategories: ['marketing'],
    })
    const a = createAnalytics({
      app: 'x',
      env: 'development',
      sinks: [analyticsSink, marketingSink],
      session: { storage: createMemoryStorage() },
      identity: { storage: createMemoryStorage() },
      consent: { granted: ['analytics'] },
    })
    a.track('A')
    expect(analyticsSink.events).toHaveLength(1)
    expect(marketingSink.events).toHaveLength(0)
  })
})

describe('createAnalytics — batching (prod preset)', () => {
  function prodAnalytics(sink = createMockSink(), batchSize = 3) {
    const a = createAnalytics({
      app: 'x',
      env: 'production',
      preset: 'prod',
      batchSize,
      sinks: [sink],
      session: { storage: createMemoryStorage() },
      identity: { storage: createMemoryStorage() },
      consent: { granted: ['analytics'] },
    })
    return { a, sink }
  }

  it('buffers events and flushes when batchSize is reached', async () => {
    const { a, sink } = prodAnalytics(createMockSink(), 3)
    a.track('1')
    a.track('2')
    expect(sink.events).toHaveLength(0) // still buffered
    a.track('3') // hits batchSize → auto-flush
    await Promise.resolve()
    expect(sink.events).toHaveLength(3)
    expect(sink.deliveries[0].batch).toHaveLength(3)
  })

  it('flush() drains the buffer on demand', async () => {
    const { a, sink } = prodAnalytics(createMockSink(), 100)
    a.track('1')
    a.track('2')
    expect(sink.events).toHaveLength(0)
    await a.flush()
    expect(sink.events).toHaveLength(2)
  })

  it('dev preset delivers synchronously (no batching)', () => {
    const { a, sink } = devConfig()
    a.track('immediate')
    expect(sink.events).toHaveLength(1)
  })
})

describe('createAnalytics — sampling', () => {
  it('drops events below the sample rate', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.9)
    const { a, sink } = devConfig(createMockSink(), { sampleRate: 0.5 })
    a.track('dropped')
    expect(sink.events).toHaveLength(0)
    spy.mockReturnValue(0.1)
    a.track('kept')
    expect(sink.events).toHaveLength(1)
    spy.mockRestore()
  })

  it('sampleRate >= 1 keeps everything', () => {
    const { a, sink } = devConfig(createMockSink(), { sampleRate: 1 })
    a.track('a')
    a.track('b')
    expect(sink.events).toHaveLength(2)
  })
})

describe('createAnalytics — noop kill switch', () => {
  it('returns a tree-shakeable noop when enabled:false', () => {
    const sink = createMockSink()
    const a = createAnalytics({
      app: 'x',
      env: 'production',
      enabled: false,
      sinks: [sink],
    })
    expect(a.enabled).toBe(false)
    a.track('nope')
    a.identify('user')
    a.page()
    expect(sink.events).toHaveLength(0)
    expect(a.sinks).toEqual([])
    expect(a.userId()).toBeUndefined()
    // Noop API is fully callable and never throws.
    expect(() => {
      a.session.start()
      a.consent.grant('analytics')
      a.with({}).track('still nothing')
      a.reset()
    }).not.toThrow()
  })

  it('a live collector reports enabled:true', () => {
    const { a } = devConfig()
    expect(a.enabled).toBe(true)
  })
})
