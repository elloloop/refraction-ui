import { describe, it, expect } from 'vitest'
import type { AnalyticsEvent } from '@refraction-ui/analytics'
import { SCHEMA_VERSION } from '@refraction-ui/analytics'
import { mapEvent, eventName } from '../src/mapping.js'

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'Signup Clicked',
    messageId: 'mid-1',
    anonymousId: 'anon-1',
    sessionId: 'sess-1',
    properties: {},
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

describe('mapEvent — properties / measurements split', () => {
  it('routes finite numbers to measurements and the rest to properties', () => {
    const m = mapEvent(
      makeEvent({
        properties: { plan: 'pro', revenue: 42, count: 0, active: true },
      }),
    )
    expect(m.measurements.revenue).toBe(42)
    expect(m.measurements.count).toBe(0)
    expect(m.properties.plan).toBe('pro')
    expect(m.properties.active).toBe('true')
    // a numeric value must never also appear as a string property
    expect(m.properties.revenue).toBeUndefined()
  })

  it('non-finite numbers (NaN/Infinity) do not become measurements', () => {
    const m = mapEvent(
      makeEvent({ properties: { bad: NaN, worse: Infinity } }),
    )
    expect(m.measurements.bad).toBeUndefined()
    expect(m.measurements.worse).toBeUndefined()
    expect(m.properties.bad).toBe('NaN')
    expect(m.properties.worse).toBe('Infinity')
  })

  it('dot-flattens nested objects and keeps numeric leaves as measurements', () => {
    const m = mapEvent(
      makeEvent({
        properties: { cart: { items: 3, currency: 'USD' } },
      }),
    )
    expect(m.measurements['cart.items']).toBe(3)
    expect(m.properties['cart.currency']).toBe('USD')
  })

  it('JSON-encodes arrays into a single string property', () => {
    const m = mapEvent(makeEvent({ properties: { tags: ['a', 'b'] } }))
    expect(m.properties.tags).toBe('["a","b"]')
  })

  it('skips null/undefined property values', () => {
    const m = mapEvent(
      makeEvent({ properties: { a: null, b: undefined, c: 'x' } }),
    )
    expect('a' in m.properties).toBe(false)
    expect('b' in m.properties).toBe(false)
    expect(m.properties.c).toBe('x')
  })

  it('carries canonical context + envelope metadata as dimensions', () => {
    const m = mapEvent(makeEvent())
    expect(m.properties.app).toBe('my-app')
    expect(m.properties.env).toBe('production')
    expect(m.properties.libraryName).toBe('@refraction-ui/analytics')
    expect(m.properties.libraryVersion).toBe('0.1.0')
    expect(m.properties.messageId).toBe('mid-1')
    expect(m.properties.anonymousId).toBe('anon-1')
    expect(m.properties.sessionId).toBe('sess-1')
    expect(m.properties.eventType).toBe('track')
    expect(m.properties.timestamp).toBe('2026-05-16T12:00:00.000Z')
    expect(m.measurements.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('flattens context.page into page.* dimensions', () => {
    const m = mapEvent(
      makeEvent({
        type: 'page',
        event: 'Pricing',
        context: {
          app: 'a',
          env: 'e',
          library: { name: 'n', version: '0.1.0' },
          page: { path: '/pricing', title: 'Pricing', url: 'https://x/pricing' },
        },
      }),
    )
    expect(m.properties['page.path']).toBe('/pricing')
    expect(m.properties['page.title']).toBe('Pricing')
  })
})

describe('mapEvent — identity → authenticatedUserId / anonymous', () => {
  it('anonymous event: anonymous="true", no authenticatedUserId', () => {
    const m = mapEvent(makeEvent({ userId: undefined }))
    expect(m.properties.anonymous).toBe('true')
    expect('authenticatedUserId' in m.properties).toBe(false)
  })

  it('identified event: authenticatedUserId set, anonymous="false"', () => {
    const m = mapEvent(makeEvent({ userId: 'user_42' }))
    expect(m.properties.authenticatedUserId).toBe('user_42')
    expect(m.properties.anonymous).toBe('false')
  })
})

describe('eventName', () => {
  it('uses the track event name, falling back to "track"', () => {
    expect(eventName(makeEvent({ event: 'Card Added' }))).toBe('Card Added')
    expect(eventName(makeEvent({ event: undefined }))).toBe('track')
  })

  it('derives names for page/screen/identify/group/alias', () => {
    expect(eventName(makeEvent({ type: 'page', event: 'Pricing' }))).toBe(
      'Page View: Pricing',
    )
    expect(eventName(makeEvent({ type: 'screen', event: 'Dashboard' }))).toBe(
      'Screen: Dashboard',
    )
    expect(eventName(makeEvent({ type: 'identify' }))).toBe('Identify')
    expect(eventName(makeEvent({ type: 'group' }))).toBe('Group')
    expect(eventName(makeEvent({ type: 'alias' }))).toBe('Alias')
  })

  it('page falls back to context.page.path when event is absent', () => {
    expect(
      eventName(
        makeEvent({
          type: 'page',
          event: undefined,
          context: {
            app: 'a',
            env: 'e',
            library: { name: 'n', version: '0.1.0' },
            page: { path: '/home' },
          },
        }),
      ),
    ).toBe('Page View: /home')
  })
})
