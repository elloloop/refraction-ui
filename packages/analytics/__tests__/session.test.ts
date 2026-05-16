import { describe, it, expect } from 'vitest'
import {
  createSession,
  campaignFingerprint,
  DEFAULT_SESSION_TIMEOUT_MS,
} from '../src/session.js'
import { createMemoryStorage } from '../src/storage.js'
import { isUuidV4 } from '../src/uuid.js'

describe('campaignFingerprint', () => {
  it('returns undefined when no campaign params are present', () => {
    expect(campaignFingerprint(undefined)).toBeUndefined()
    expect(campaignFingerprint('?foo=bar')).toBeUndefined()
    expect(campaignFingerprint('')).toBeUndefined()
  })

  it('builds a stable fingerprint from utm params and click ids', () => {
    const fp = campaignFingerprint('?utm_source=google&utm_medium=cpc&x=1')
    expect(fp).toBe('utm_source=google&utm_medium=cpc')
    expect(campaignFingerprint('?gclid=abc')).toBe('gclid=abc')
  })

  it('accepts a full query string with leading path', () => {
    expect(campaignFingerprint('/p?utm_campaign=launch')).toBe(
      'utm_campaign=launch',
    )
  })
})

describe('createSession — lifecycle', () => {
  it('mints a UUIDv4 session id at first access', () => {
    const s = createSession({ storage: createMemoryStorage() })
    const id = s.id()
    expect(isUuidV4(id)).toBe(true)
  })

  it('returns a stable id within an active session', () => {
    const s = createSession({ storage: createMemoryStorage() })
    expect(s.id()).toBe(s.id())
  })

  it('start() forces a brand-new session id', () => {
    const s = createSession({ storage: createMemoryStorage() })
    const a = s.id()
    const b = s.start()
    expect(b).not.toBe(a)
    expect(isUuidV4(b)).toBe(true)
  })

  it('end() drops the session; next id() mints a fresh one', () => {
    const s = createSession({ storage: createMemoryStorage() })
    const a = s.id()
    s.end()
    const b = s.id()
    expect(b).not.toBe(a)
  })

  it('exposes the GA4-parity default timeout (30 minutes)', () => {
    expect(DEFAULT_SESSION_TIMEOUT_MS).toBe(30 * 60 * 1000)
  })
})

describe('createSession — inactivity timeout (GA4 parity)', () => {
  it('rotates the id after the inactivity window elapses', () => {
    let now = 1_000_000
    const s = createSession(
      { storage: createMemoryStorage(), timeoutMs: 1000 },
      () => now,
    )
    const a = s.touch()
    now += 500 // within window
    expect(s.touch()).toBe(a)
    now += 5000 // beyond window since last activity
    const b = s.touch()
    expect(b).not.toBe(a)
  })

  it('touch() slides the window forward (no premature rotation)', () => {
    let now = 0
    const s = createSession(
      { storage: createMemoryStorage(), timeoutMs: 1000 },
      () => now,
    )
    const a = s.touch()
    for (let i = 0; i < 10; i++) {
      now += 900 // always within window of the previous touch
      expect(s.touch()).toBe(a)
    }
  })
})

describe('createSession — campaign reset', () => {
  it('rotates the id when a new campaign appears', () => {
    let now = 0
    const s = createSession(
      { storage: createMemoryStorage(), timeoutMs: 60_000 },
      () => now,
    )
    const organic = s.touch(undefined)
    now += 100
    const campaignA = s.touch('utm_source=google')
    expect(campaignA).not.toBe(organic)
    now += 100
    const campaignB = s.touch('utm_source=bing')
    expect(campaignB).not.toBe(campaignA)
  })

  it('does NOT rotate when the same campaign repeats', () => {
    let now = 0
    const s = createSession(
      { storage: createMemoryStorage(), timeoutMs: 60_000 },
      () => now,
    )
    const a = s.touch('utm_source=google')
    now += 100
    expect(s.touch('utm_source=google')).toBe(a)
  })

  it('honours resetOnCampaign:false', () => {
    let now = 0
    const s = createSession(
      {
        storage: createMemoryStorage(),
        timeoutMs: 60_000,
        resetOnCampaign: false,
      },
      () => now,
    )
    const a = s.touch('utm_source=google')
    now += 100
    expect(s.touch('utm_source=bing')).toBe(a)
  })
})

describe('createSession — cross-tab persistence', () => {
  it('shares one session across instances backed by the same storage', () => {
    const storage = createMemoryStorage()
    const tabA = createSession({ storage })
    const tabB = createSession({ storage })
    expect(tabB.id()).toBe(tabA.id())
  })
})

describe('createSession — session-scoped properties', () => {
  it('merges and reads session.set props', () => {
    const s = createSession({ storage: createMemoryStorage() })
    s.set({ plan: 'pro' })
    s.set({ region: 'eu' })
    expect(s.props()).toEqual({ plan: 'pro', region: 'eu' })
  })
})
