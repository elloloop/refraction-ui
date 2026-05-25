import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createCookieConsent } from '../src/cookie-consent.js'
import type { CookieStorage } from '../src/types.js'

function memStorage(seed: Record<string, string> = {}): CookieStorage {
  const m = new Map(Object.entries(seed))
  return {
    get: (k) => m.get(k) ?? null,
    set: (k, v) => void m.set(k, v),
    remove: (k) => void m.delete(k),
  }
}

describe('initial state', () => {
  it('shows the banner and grants only required when no consent stored', () => {
    const c = createCookieConsent()
    const s = c.getState()
    expect(s.consented).toBe(false)
    expect(s.open).toBe(true)
    expect(s.preferences.necessary).toBe(true)
    expect(s.preferences.analytics).toBe(false)
  })

  it('hydrates from storage and hides the banner when version matches', () => {
    const storage = memStorage({
      'rfr-cookie-consent': JSON.stringify({ version: '1', preferences: { necessary: true, analytics: true } }),
    })
    const c = createCookieConsent({ storage, version: '1' })
    expect(c.getState().consented).toBe(true)
    expect(c.getState().open).toBe(false)
    expect(c.getState().preferences.analytics).toBe(true)
  })

  it('re-prompts when the stored version differs', () => {
    const storage = memStorage({
      'rfr-cookie-consent': JSON.stringify({ version: '1', preferences: { analytics: true } }),
    })
    const c = createCookieConsent({ storage, version: '2' })
    expect(c.getState().consented).toBe(false)
    expect(c.getState().open).toBe(true)
  })
})

describe('actions', () => {
  it('acceptAll grants everything, persists, closes', () => {
    const storage = memStorage()
    const onChange = vi.fn()
    const c = createCookieConsent({ storage, version: '1', onChange })
    c.acceptAll()
    const s = c.getState()
    expect(s.consented).toBe(true)
    expect(s.open).toBe(false)
    expect(s.preferences.analytics).toBe(true)
    expect(s.preferences.marketing).toBe(true)
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ analytics: true }))
    expect(JSON.parse(storage.get('rfr-cookie-consent')!).preferences.analytics).toBe(true)
  })

  it('rejectAll keeps required on, others off', () => {
    const c = createCookieConsent({ storage: memStorage() })
    c.rejectAll()
    const s = c.getState()
    expect(s.consented).toBe(true)
    expect(s.preferences.necessary).toBe(true)
    expect(s.preferences.analytics).toBe(false)
  })

  it('setPreference toggles non-required and ignores required', () => {
    const c = createCookieConsent()
    c.setPreference('analytics', true)
    expect(c.getState().preferences.analytics).toBe(true)
    c.setPreference('necessary', false) // required — ignored
    expect(c.getState().preferences.necessary).toBe(true)
  })

  it('savePreferences forces required on and persists', () => {
    const storage = memStorage()
    const c = createCookieConsent({ storage })
    c.savePreferences({ analytics: true, marketing: false, necessary: false })
    const s = c.getState()
    expect(s.preferences.necessary).toBe(true) // forced
    expect(s.preferences.analytics).toBe(true)
    expect(s.preferences.marketing).toBe(false)
    expect(s.consented).toBe(true)
  })

  it('reset clears storage and re-opens', () => {
    const storage = memStorage()
    const c = createCookieConsent({ storage })
    c.acceptAll()
    expect(c.getState().open).toBe(false)
    c.reset()
    expect(c.getState().consented).toBe(false)
    expect(c.getState().open).toBe(true)
    expect(storage.get('rfr-cookie-consent')).toBeNull()
  })

  it('openSettings/close toggle banner without losing consent', () => {
    const c = createCookieConsent({ storage: memStorage() })
    c.acceptAll()
    c.openSettings()
    expect(c.getState().open).toBe(true)
    expect(c.getState().consented).toBe(true)
    c.close()
    expect(c.getState().open).toBe(false)
  })
})

describe('subscribe', () => {
  it('notifies and unsubscribes', () => {
    const c = createCookieConsent()
    const fn = vi.fn()
    const off = c.subscribe(fn)
    c.acceptAll()
    expect(fn).toHaveBeenCalled()
    off()
    const n = fn.mock.calls.length
    c.openSettings()
    expect(fn.mock.calls.length).toBe(n)
  })
})
