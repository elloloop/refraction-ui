import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  createAnalytics,
  createMockSink,
  createConsoleSink,
  createHttpSink,
  uuidv4,
  isUuidV4,
  SCHEMA_VERSION,
  type Analytics,
} from '@refraction-ui/analytics'

function makeAnalytics() {
  const sink = createMockSink()
  const analytics = createAnalytics({
    app: 'astro-test-app',
    env: 'development',
    preset: 'dev',
    sinks: [sink],
    consent: { granted: ['analytics'] },
  })
  return { analytics, sink }
}

describe('@refraction-ui/astro-analytics adapter over the real core', () => {
  it('the index barrel re-exports the core surface it wires', () => {
    const barrelPath = fileURLToPath(
      new URL('../src/index.ts', import.meta.url),
    )
    const barrel = readFileSync(barrelPath, 'utf8')
    expect(barrel).toContain("from '@refraction-ui/analytics'")
    expect(barrel).toContain("export { default as AnalyticsScript }")
    for (const name of [
      'createAnalytics',
      'createHttpSink',
      'createConsoleSink',
      'createMockSink',
      'SCHEMA_VERSION',
    ]) {
      expect(barrel).toContain(name)
    }
  })

  it('re-exports createAnalytics producing a live router', () => {
    const { analytics } = makeAnalytics()
    expect(typeof analytics.track).toBe('function')
    expect(typeof analytics.identify).toBe('function')
    expect(typeof analytics.page).toBe('function')
    expect(typeof analytics.screen).toBe('function')
    expect(typeof analytics.group).toBe('function')
    expect(typeof analytics.alias).toBe('function')
    expect(analytics.enabled).toBe(true)
  })

  it('fans the canonical envelope out to a real sink', () => {
    const { analytics, sink } = makeAnalytics()
    analytics.track('Signup Clicked', { plan: 'pro' })
    expect(sink.events).toHaveLength(1)
    expect(sink.events[0]).toMatchObject({
      type: 'track',
      event: 'Signup Clicked',
      properties: { plan: 'pro' },
      schemaVersion: SCHEMA_VERSION,
    })
    expect(isUuidV4(sink.events[0].messageId)).toBe(true)
    expect(isUuidV4(sink.events[0].sessionId)).toBe(true)
  })

  it('honors with(context) child scoping through the re-exported core', () => {
    const { analytics, sink } = makeAnalytics()
    analytics.with({ feature: 'checkout' }).track('Card Added')
    expect(sink.events).toHaveLength(1)
    expect(sink.events[0]).toMatchObject({
      type: 'track',
      event: 'Card Added',
      context: { feature: 'checkout' },
    })
  })

  it('re-exports the built-in sink factories and uuid utilities', () => {
    expect(typeof createConsoleSink).toBe('function')
    expect(typeof createHttpSink).toBe('function')
    expect(typeof createMockSink).toBe('function')
    expect(isUuidV4(uuidv4())).toBe(true)
    expect(SCHEMA_VERSION).toBe(1)
  })

  it('exposes a kill switch noop when disabled', () => {
    const sink = createMockSink()
    const analytics: Analytics = createAnalytics({
      app: 'astro-test-app',
      env: 'development',
      enabled: false,
      sinks: [sink],
    })
    analytics.track('Should Not Fire')
    expect(analytics.enabled).toBe(false)
    expect(sink.events).toHaveLength(0)
  })

  it('routes a server-relay HTTP sink against the real core', async () => {
    const calls: Array<{ url: string; body: unknown }> = []
    const fetchImpl = (async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) })
      return { ok: true, status: 200 } as Response
    }) as unknown as typeof fetch

    const analytics = createAnalytics({
      app: 'astro-test-app',
      env: 'development',
      preset: 'dev',
      consent: { granted: ['analytics'] },
      sinks: [
        createHttpSink({
          endpoint: 'https://relay.example.com',
          writeKey: 'wk_test',
          fetchImpl,
        }),
      ],
    })
    analytics.track('Relayed Event', { ok: true })
    await analytics.flush()

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toContain('/v1/batch')
    expect(calls[0].body).toMatchObject({
      batch: [{ type: 'track', event: 'Relayed Event' }],
    })
  })
})

describe('AnalyticsScript island deferred-init contract', () => {
  // Evaluate the IIFE embedded in the .astro island in a simulated window
  // so we exercise the real deferred-init wiring without an Astro renderer.
  function loadIsland(): string {
    const astroPath = fileURLToPath(
      new URL('../src/AnalyticsScript.astro', import.meta.url),
    )
    const src = readFileSync(astroPath, 'utf8')
    const open = src.indexOf('is:inline')
    const scriptStart = src.indexOf('>', open) + 1
    const scriptEnd = src.indexOf('</script>', scriptStart)
    return src.slice(scriptStart, scriptEnd)
  }

  function setupWindow(configJSON: string) {
    const attr = configJSON
    const doc = {
      querySelector(sel: string) {
        if (sel !== '[data-rfr-analytics-config]') return null
        return {
          getAttribute(name: string) {
            return name === 'data-rfr-analytics-config' ? attr : null
          },
        }
      },
    }
    const win: Record<string, unknown> = { document: doc }
    return { win, doc }
  }

  /** Run the island IIFE with the browser globals (window, document) it uses. */
  function runIsland(code: string, configJSON: string) {
    const { win, doc } = setupWindow(configJSON)
    new Function('window', 'document', code)(win, doc)
    return win
  }

  it('installs window.__rfr_analytics with a deferred init and not-ready guards', () => {
    const code = loadIsland()
    const win = runIsland(
      code,
      JSON.stringify({ app: 'island-app', env: 'development' }),
    )

    const ns = win.__rfr_analytics as Record<string, unknown>
    expect(ns).toBeTruthy()
    expect(ns._ready).toBe(false)
    expect((ns._config as { app: string }).app).toBe('island-app')
    expect(typeof ns.init).toBe('function')
    expect(() => (ns.track as () => void)()).toThrow(/not initialized/i)
    expect(() => (ns.identify as () => void)()).toThrow(/not initialized/i)
  })

  it('init() wires the real core onto the namespace and tracks to a sink', () => {
    const code = loadIsland()
    const win = runIsland(
      code,
      JSON.stringify({
        app: 'island-app',
        env: 'development',
        preset: 'dev',
      }),
    )

    const ns = win.__rfr_analytics as {
      init: (
        f: typeof createAnalytics,
        sinks?: ReturnType<typeof createMockSink>[],
      ) => Analytics
      track: (e: string, p?: Record<string, unknown>) => void
      _ready: boolean
      session: unknown
      consent: unknown
    }
    const sink = createMockSink()
    const api = ns.init(
      (cfg) =>
        createAnalytics({ ...cfg, consent: { granted: ['analytics'] } }),
      [sink],
    )

    expect(ns._ready).toBe(true)
    expect(typeof api.track).toBe('function')
    expect(ns.session).toBeTruthy()
    expect(ns.consent).toBeTruthy()

    ns.track('Island Tracked', { via: 'astro' })
    expect(sink.events).toHaveLength(1)
    expect(sink.events[0]).toMatchObject({
      type: 'track',
      event: 'Island Tracked',
      properties: { via: 'astro' },
    })
  })

  it('initializes only once (idempotent island)', () => {
    const code = loadIsland()
    const cfg = JSON.stringify({ app: 'first', env: 'development' })
    const win = runIsland(code, cfg)
    const first = win.__rfr_analytics
    // Re-run the IIFE against the same window (simulates a duplicate island).
    new Function('window', 'document', code)(
      win,
      (win as { document: unknown }).document,
    )
    expect(win.__rfr_analytics).toBe(first)
  })
})
