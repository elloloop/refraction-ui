import { describe, it, expect } from 'vitest'
import { createConsent } from '../src/consent.js'

describe('createConsent', () => {
  it('starts with nothing granted by default', () => {
    const c = createConsent()
    expect(c.granted()).toEqual([])
    expect(c.isGranted('analytics')).toBe(false)
  })

  it('seeds granted categories from config', () => {
    const c = createConsent({ granted: ['analytics', 'marketing'] })
    expect(c.isGranted('analytics')).toBe(true)
    expect(c.isGranted('marketing')).toBe(true)
  })

  it('grant/revoke mutate the granted set', () => {
    const c = createConsent()
    c.grant('analytics', 'marketing')
    expect(c.granted().sort()).toEqual(['analytics', 'marketing'])
    c.revoke('marketing')
    expect(c.isGranted('marketing')).toBe(false)
    expect(c.isGranted('analytics')).toBe(true)
  })

  it('allows() requires ALL categories of a sink (per-sink gating)', () => {
    const c = createConsent({ granted: ['analytics'] })
    // sink with no declared categories → always allowed
    expect(c.allows(undefined)).toBe(true)
    expect(c.allows([])).toBe(true)
    // sink requiring only 'analytics' → allowed
    expect(c.allows(['analytics'])).toBe(true)
    // sink also requiring 'marketing' → blocked until granted
    expect(c.allows(['analytics', 'marketing'])).toBe(false)
    c.grant('marketing')
    expect(c.allows(['analytics', 'marketing'])).toBe(true)
  })

  it('exposes the strict flag from config', () => {
    expect(createConsent().strict).toBe(false)
    expect(createConsent({ strict: true }).strict).toBe(true)
  })
})
