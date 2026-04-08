import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  LOCALE_DISPLAY_NAMES,
  getLocaleDisplayName,
  getStoredLocale,
  setStoredLocale,
  getLocalizedValue,
} from '../src/locale-utils.js'

describe('LOCALE_DISPLAY_NAMES', () => {
  it('is a record of locale codes to display names', () => {
    expect(typeof LOCALE_DISPLAY_NAMES).toBe('object')
    expect(Object.keys(LOCALE_DISPLAY_NAMES).length).toBeGreaterThan(10)
  })

  it('maps en to English', () => {
    expect(LOCALE_DISPLAY_NAMES['en']).toBe('English')
  })

  it('maps es to Español', () => {
    expect(LOCALE_DISPLAY_NAMES['es']).toBe('Español')
  })

  it('maps fr to Français', () => {
    expect(LOCALE_DISPLAY_NAMES['fr']).toBe('Français')
  })

  it('maps de to Deutsch', () => {
    expect(LOCALE_DISPLAY_NAMES['de']).toBe('Deutsch')
  })

  it('maps ja to 日本語', () => {
    expect(LOCALE_DISPLAY_NAMES['ja']).toBe('日本語')
  })

  it('maps hi to हिन्दी', () => {
    expect(LOCALE_DISPLAY_NAMES['hi']).toBe('हिन्दी')
  })

  it('maps zh to 中文', () => {
    expect(LOCALE_DISPLAY_NAMES['zh']).toBe('中文')
  })

  it('maps ar to العربية', () => {
    expect(LOCALE_DISPLAY_NAMES['ar']).toBe('العربية')
  })

  it('maps ko to 한국어', () => {
    expect(LOCALE_DISPLAY_NAMES['ko']).toBe('한국어')
  })

  it('maps pt to Português', () => {
    expect(LOCALE_DISPLAY_NAMES['pt']).toBe('Português')
  })

  it('maps ru to Русский', () => {
    expect(LOCALE_DISPLAY_NAMES['ru']).toBe('Русский')
  })
})

describe('getLocaleDisplayName', () => {
  it('returns display name for known locale', () => {
    expect(getLocaleDisplayName('en')).toBe('English')
    expect(getLocaleDisplayName('es')).toBe('Español')
  })

  it('returns the code itself for unknown locale', () => {
    expect(getLocaleDisplayName('xx')).toBe('xx')
  })

  it('returns code for empty string', () => {
    expect(getLocaleDisplayName('')).toBe('')
  })
})

describe('getStoredLocale and setStoredLocale', () => {
  let storage: Record<string, string>

  beforeEach(() => {
    storage = {}
    // Mock localStorage
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => storage[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { storage[key] = value }),
        removeItem: vi.fn((key: string) => { delete storage[key] }),
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    // @ts-ignore
    delete (globalThis as any).localStorage
  })

  it('returns null when no locale is stored', () => {
    expect(getStoredLocale()).toBeNull()
  })

  it('stores and retrieves a locale', () => {
    setStoredLocale('fr')
    expect(getStoredLocale()).toBe('fr')
  })

  it('uses default storage key', () => {
    setStoredLocale('de')
    expect(localStorage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      'de'
    )
  })

  it('uses custom storage key', () => {
    setStoredLocale('ja', 'my-locale-key')
    expect(localStorage.setItem).toHaveBeenCalledWith('my-locale-key', 'ja')
    expect(getStoredLocale('my-locale-key')).toBe('ja')
  })

  it('returns null when localStorage is not available', () => {
    // @ts-ignore
    delete (globalThis as any).localStorage
    expect(getStoredLocale()).toBeNull()
  })

  it('does not throw when localStorage is not available on set', () => {
    // @ts-ignore
    delete (globalThis as any).localStorage
    expect(() => setStoredLocale('en')).not.toThrow()
  })
})

describe('getLocalizedValue', () => {
  it('returns value for exact locale match', () => {
    const localized = { en: 'Hello', fr: 'Bonjour', es: 'Hola' }
    expect(getLocalizedValue(localized, 'en')).toBe('Hello')
    expect(getLocalizedValue(localized, 'fr')).toBe('Bonjour')
  })

  it('falls back to fallback locale when primary not found', () => {
    const localized = { en: 'Hello', fr: 'Bonjour' }
    expect(getLocalizedValue(localized, 'de', 'en')).toBe('Hello')
  })

  it('returns undefined when neither locale nor fallback found', () => {
    const localized = { en: 'Hello' }
    expect(getLocalizedValue(localized, 'de', 'fr')).toBeUndefined()
  })

  it('returns undefined when no fallback specified and locale not found', () => {
    const localized = { en: 'Hello' }
    expect(getLocalizedValue(localized, 'de')).toBeUndefined()
  })

  it('works with complex value types', () => {
    const localized = {
      en: { greeting: 'Hello', farewell: 'Goodbye' },
      fr: { greeting: 'Bonjour', farewell: 'Au revoir' },
    }
    expect(getLocalizedValue(localized, 'fr')).toEqual({
      greeting: 'Bonjour',
      farewell: 'Au revoir',
    })
  })

  it('works with array values', () => {
    const localized = {
      en: ['one', 'two'],
      fr: ['un', 'deux'],
    }
    expect(getLocalizedValue(localized, 'en')).toEqual(['one', 'two'])
  })

  it('prefers exact match over fallback', () => {
    const localized = { en: 'English', fr: 'French' }
    expect(getLocalizedValue(localized, 'fr', 'en')).toBe('French')
  })

  it('handles empty localized object', () => {
    expect(getLocalizedValue({}, 'en')).toBeUndefined()
  })

  it('tries base language code before fallback', () => {
    // If locale is 'en-US' and we have 'en', it should try 'en' before fallback
    const localized = { en: 'Hello', fr: 'Bonjour' }
    expect(getLocalizedValue(localized, 'en-US', 'fr')).toBe('Hello')
  })
})
