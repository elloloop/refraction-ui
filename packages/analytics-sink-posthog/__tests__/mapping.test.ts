import { describe, it, expect } from 'vitest'
import { SCHEMA_VERSION } from '@refraction-ui/analytics'
import type { AnalyticsEvent } from '@refraction-ui/analytics'
import {
  toPostHogEvent,
  toPostHogBatch,
  distinctId,
} from '../src/mapping.js'

function makeEvent(overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    type: 'track',
    event: 'Signup Clicked',
    messageId: 'msg-1',
    anonymousId: 'anon-1',
    sessionId: 'sess-1',
    properties: { plan: 'pro' },
    context: {
      app: 'my-app',
      env: 'production',
      page: {
        path: '/pricing',
        url: 'https://x.test/pricing',
        referrer: 'https://x.test/',
        title: 'Pricing',
        search: '?ref=hn',
      },
      library: { name: '@refraction-ui/analytics', version: '0.1.0' },
    },
    timestamp: '2026-05-16T12:00:00.000Z',
    schemaVersion: SCHEMA_VERSION,
    ...overrides,
  }
}

describe('distinctId — anonymousId/userId → distinct_id', () => {
  it('uses anonymousId before identify', () => {
    expect(distinctId(makeEvent())).toBe('anon-1')
  })

  it('prefers userId once identified', () => {
    expect(distinctId(makeEvent({ userId: 'user_42' }))).toBe('user_42')
  })
})

describe('toPostHogEvent — envelope → PostHog mapping', () => {
  it('maps track verbatim with merged context + properties', () => {
    const ph = toPostHogEvent(makeEvent())
    expect(ph.event).toBe('Signup Clicked')
    expect(ph.distinct_id).toBe('anon-1')
    expect(ph.uuid).toBe('msg-1') // messageId → uuid (idempotency)
    expect(ph.timestamp).toBe('2026-05-16T12:00:00.000Z')
    expect(ph.properties.plan).toBe('pro')
    expect(ph.properties.$lib).toBe('@refraction-ui/analytics')
    expect(ph.properties.$lib_version).toBe('0.1.0')
    expect(ph.properties.app).toBe('my-app')
    expect(ph.properties.env).toBe('production')
    expect(ph.properties.$session_id).toBe('sess-1')
    expect(ph.properties.anonymousId).toBe('anon-1')
    expect(ph.properties.$current_url).toBe('https://x.test/pricing')
    expect(ph.properties.$pathname).toBe('/pricing')
    expect(ph.properties.$referrer).toBe('https://x.test/')
  })

  it('maps identify → $identify with $set traits + $anon_distinct_id stitch', () => {
    const ph = toPostHogEvent(
      makeEvent({
        type: 'identify',
        event: undefined,
        userId: 'user_42',
        properties: undefined,
        traits: { plan: 'pro', team: 'growth' },
      }),
    )
    expect(ph.event).toBe('$identify')
    expect(ph.distinct_id).toBe('user_42') // userId → distinct_id
    expect(ph.properties.$set).toEqual({ plan: 'pro', team: 'growth' })
    // Anonymous history stitched onto the identified person.
    expect(ph.properties.$anon_distinct_id).toBe('anon-1')
  })

  it('maps alias → $create_alias linking previousId', () => {
    const ph = toPostHogEvent(
      makeEvent({
        type: 'alias',
        event: undefined,
        userId: 'user_42',
        previousId: 'anon-old',
        properties: undefined,
      }),
    )
    expect(ph.event).toBe('$create_alias')
    expect(ph.distinct_id).toBe('user_42')
    expect(ph.properties.alias).toBe('anon-old')
  })

  it('maps group → $groupidentify with $group_set traits', () => {
    const ph = toPostHogEvent(
      makeEvent({
        type: 'group',
        event: undefined,
        groupId: 'org_7',
        properties: { groupType: 'organization' },
        traits: { name: 'Acme' },
      }),
    )
    expect(ph.event).toBe('$groupidentify')
    expect(ph.properties.$group_type).toBe('organization')
    expect(ph.properties.$group_key).toBe('org_7')
    expect(ph.properties.$group_set).toEqual({ name: 'Acme' })
  })

  it('maps page → $pageview', () => {
    const ph = toPostHogEvent(
      makeEvent({ type: 'page', event: 'Pricing' }),
    )
    expect(ph.event).toBe('$pageview')
    expect(ph.properties.$pathname).toBe('/pricing')
  })

  it('maps screen → $screen with $screen_name', () => {
    const ph = toPostHogEvent(
      makeEvent({ type: 'screen', event: 'Dashboard' }),
    )
    expect(ph.event).toBe('$screen')
    expect(ph.properties.$screen_name).toBe('Dashboard')
  })

  it('toPostHogBatch maps a whole batch', () => {
    const out = toPostHogBatch([
      makeEvent({ event: 'A' }),
      makeEvent({ event: 'B' }),
    ])
    expect(out.map((e) => e.event)).toEqual(['A', 'B'])
  })
})
