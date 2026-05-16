import { describe, it, expect } from 'vitest'
import { mapEvent, ga4EventName, toGa4Name } from '../src/mapping.js'
import type { AnalyticsEvent } from '@refraction-ui/analytics'

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'Signup Clicked',
    messageId: 'mid-1',
    anonymousId: 'anon-abc',
    sessionId: 'sess-xyz',
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

describe('toGa4Name', () => {
  it('lower_snake_cases names and strips spaces/punctuation', () => {
    expect(toGa4Name('Signup Clicked')).toBe('signup_clicked')
    expect(toGa4Name('Add to Cart!')).toBe('add_to_cart')
    expect(toGa4Name('camelCaseEvent')).toBe('camel_case_event')
    expect(toGa4Name('  trailing  ')).toBe('trailing')
  })

  it('prefixes names that do not start with a letter', () => {
    expect(toGa4Name('123abc')).toBe('e_123abc')
  })

  it('escapes GA4 reserved prefixes', () => {
    expect(toGa4Name('google_thing')).toBe('x_google_thing')
    expect(toGa4Name('firebase_x')).toBe('x_firebase_x')
  })
})

describe('ga4EventName', () => {
  it('maps page → page_view and screen → screen_view', () => {
    expect(ga4EventName(makeEvent({ type: 'page' }))).toBe('page_view')
    expect(ga4EventName(makeEvent({ type: 'screen' }))).toBe('screen_view')
  })

  it('returns undefined for identify (no event emitted)', () => {
    expect(ga4EventName(makeEvent({ type: 'identify' }))).toBeUndefined()
  })

  it('snake_cases track event names', () => {
    expect(ga4EventName(makeEvent({ event: 'Signup Clicked' }))).toBe(
      'signup_clicked',
    )
  })
})

describe('mapEvent — identity mapping (epic #213)', () => {
  it('anonymousId → client_id', () => {
    const m = mapEvent(makeEvent({ anonymousId: 'anon-123' }))
    expect(m.clientId).toBe('anon-123')
  })

  it('userId → user_id (GA4 User-ID)', () => {
    const m = mapEvent(makeEvent({ userId: 'user_42' }))
    expect(m.userId).toBe('user_42')
  })

  it('omits user_id when not identified', () => {
    const m = mapEvent(makeEvent())
    expect(m.userId).toBeUndefined()
  })

  it('properties → event params', () => {
    const m = mapEvent(makeEvent({ properties: { plan: 'pro', seats: 5 } }))
    expect(m.event?.params.plan).toBe('pro')
    expect(m.event?.params.seats).toBe(5)
    expect(m.event?.params.session_id).toBe('sess-xyz')
  })

  it('identify traits → user_properties (wrapped in { value })', () => {
    const m = mapEvent(
      makeEvent({
        type: 'identify',
        event: undefined,
        traits: { plan: 'enterprise', tier: 3 },
      }),
    )
    expect(m.userProperties).toEqual({
      plan: { value: 'enterprise' },
      tier: { value: 3 },
    })
    // identify emits no GA4 event
    expect(m.event).toBeUndefined()
  })

  it('group traits → user_properties + group_id param', () => {
    const m = mapEvent(
      makeEvent({
        type: 'group',
        event: undefined,
        groupId: 'org_7',
        traits: { name: 'Acme' },
      }),
    )
    expect(m.userProperties).toEqual({ name: { value: 'Acme' } })
    expect(m.event?.name).toBe('group')
    expect(m.event?.params.group_id).toBe('org_7')
  })

  it('page/screen carry GA4 page_* / screen_name params', () => {
    const page = mapEvent(
      makeEvent({
        type: 'page',
        event: 'Pricing',
        properties: {},
        context: {
          app: 'app',
          env: 'test',
          page: {
            url: 'https://x.com/pricing',
            path: '/pricing',
            referrer: 'https://x.com',
            title: 'Pricing',
          },
          library: { name: '@refraction-ui/analytics', version: '0.1.0' },
        },
      }),
    )
    expect(page.event?.name).toBe('page_view')
    expect(page.event?.params.page_location).toBe('https://x.com/pricing')
    expect(page.event?.params.page_path).toBe('/pricing')
    expect(page.event?.params.page_referrer).toBe('https://x.com')

    const screen = mapEvent(makeEvent({ type: 'screen', event: 'Dashboard' }))
    expect(screen.event?.name).toBe('screen_view')
    expect(screen.event?.params.screen_name).toBe('Dashboard')
  })

  it('alias maps user_id + previous_id params', () => {
    const m = mapEvent(
      makeEvent({
        type: 'alias',
        event: undefined,
        userId: 'user_42',
        previousId: 'anon-old',
      }),
    )
    expect(m.event?.name).toBe('alias')
    expect(m.event?.params.user_id).toBe('user_42')
    expect(m.event?.params.previous_id).toBe('anon-old')
  })
})
