import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  AnalyticsProvider,
  useAnalytics,
  useTrackEvent,
} from '../src/analytics-provider.js'
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

describe('AnalyticsProvider (SSR)', () => {
  it('renders children', () => {
    const { analytics } = makeAnalytics()
    const html = renderToString(
      React.createElement(AnalyticsProvider, { value: analytics },
        React.createElement('div', null, 'Analytics App'),
      ),
    )
    expect(html).toContain('Analytics App')
  })

  it('renders with a real analytics instance', () => {
    const { analytics } = makeAnalytics()
    const html = renderToString(
      React.createElement(AnalyticsProvider, { value: analytics },
        React.createElement('span', null, 'Hello Analytics'),
      ),
    )
    expect(html).toContain('Hello Analytics')
  })
})

describe('useAnalytics (SSR)', () => {
  it('returns the provided Analytics instance', () => {
    const { analytics } = makeAnalytics()
    let received: unknown
    function TestConsumer() {
      received = useAnalytics()
      return React.createElement('span', null, 'ok')
    }
    const html = renderToString(
      React.createElement(AnalyticsProvider, { value: analytics },
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('ok')
    expect(received).toBe(analytics)
  })

  it('exposes the full Analytics surface', () => {
    const { analytics } = makeAnalytics()
    function TestConsumer() {
      const a = useAnalytics()
      return React.createElement('div', null,
        React.createElement('span', null, typeof a.track === 'function' ? 'has-track' : 'missing'),
        React.createElement('span', null, typeof a.identify === 'function' ? 'has-identify' : 'missing'),
        React.createElement('span', null, typeof a.with === 'function' ? 'has-with' : 'missing'),
        React.createElement('span', { 'data-enabled': String(a.enabled) }),
      )
    }
    const html = renderToString(
      React.createElement(AnalyticsProvider, { value: analytics },
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('has-track')
    expect(html).toContain('has-identify')
    expect(html).toContain('has-with')
    expect(html).toContain('data-enabled="true"')
  })

  it('returns a with() child when given a scope', () => {
    const { analytics } = makeAnalytics()
    let scoped: unknown
    function TestConsumer() {
      scoped = useAnalytics({ scope: { feature: 'checkout' } })
      return React.createElement('span', null, 'scoped')
    }
    const html = renderToString(
      React.createElement(AnalyticsProvider, { value: analytics },
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('scoped')
    expect(scoped).not.toBe(analytics)
    expect(typeof (scoped as { track: unknown }).track).toBe('function')
  })

  it('no-ops (no throw) when used outside AnalyticsProvider', () => {
    function TestConsumer() {
      useAnalytics()
      return React.createElement('span', null, 'ok')
    }
    expect(() => {
      renderToString(React.createElement(TestConsumer))
    }).not.toThrow()
  })
})

describe('useTrackEvent (SSR)', () => {
  it('emits a track event to the underlying sink', () => {
    const { analytics, sink } = makeAnalytics()
    function TestConsumer() {
      const track = useTrackEvent()
      track('Signup Clicked', { plan: 'pro' })
      return React.createElement('span', null, 'tracked')
    }
    const html = renderToString(
      React.createElement(AnalyticsProvider, { value: analytics },
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('tracked')
    expect(sink.events).toHaveLength(1)
    expect(sink.events[0]).toMatchObject({
      type: 'track',
      event: 'Signup Clicked',
      properties: { plan: 'pro' },
    })
  })

  it('emits scoped context when given a scope', () => {
    const { analytics, sink } = makeAnalytics()
    function TestConsumer() {
      const track = useTrackEvent({ scope: { feature: 'checkout' } })
      track('Card Added')
      return React.createElement('span', null, 'tracked-scoped')
    }
    const html = renderToString(
      React.createElement(AnalyticsProvider, { value: analytics },
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('tracked-scoped')
    expect(sink.events).toHaveLength(1)
    expect(sink.events[0]).toMatchObject({
      type: 'track',
      event: 'Card Added',
      context: { feature: 'checkout' },
    })
  })

  it('provides a bound track function', () => {
    const { analytics } = makeAnalytics()
    let bound: unknown
    function TestConsumer() {
      bound = useTrackEvent()
      return React.createElement('span', null, 'bound')
    }
    const html = renderToString(
      React.createElement(AnalyticsProvider, { value: analytics },
        React.createElement(TestConsumer),
      ),
    )
    expect(html).toContain('bound')
    expect(typeof bound).toBe('function')
  })
})
