import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  detectCountry,
  detectLanguage,
  TIMEZONE_TO_COUNTRY,
  LOCALE_TO_COUNTRY,
} from '../src/detect-region.js'

describe('TIMEZONE_TO_COUNTRY mapping', () => {
  it('contains 60+ timezone mappings', () => {
    expect(Object.keys(TIMEZONE_TO_COUNTRY).length).toBeGreaterThanOrEqual(60)
  })

  it('maps America/New_York to US', () => {
    expect(TIMEZONE_TO_COUNTRY['America/New_York']).toBe('US')
  })

  it('maps Europe/London to GB', () => {
    expect(TIMEZONE_TO_COUNTRY['Europe/London']).toBe('GB')
  })

  it('maps Asia/Kolkata to IN', () => {
    expect(TIMEZONE_TO_COUNTRY['Asia/Kolkata']).toBe('IN')
  })

  it('maps Asia/Tokyo to JP', () => {
    expect(TIMEZONE_TO_COUNTRY['Asia/Tokyo']).toBe('JP')
  })

  it('maps Europe/Paris to FR', () => {
    expect(TIMEZONE_TO_COUNTRY['Europe/Paris']).toBe('FR')
  })

  it('maps Europe/Berlin to DE', () => {
    expect(TIMEZONE_TO_COUNTRY['Europe/Berlin']).toBe('DE')
  })

  it('maps Asia/Shanghai to CN', () => {
    expect(TIMEZONE_TO_COUNTRY['Asia/Shanghai']).toBe('CN')
  })

  it('maps Asia/Seoul to KR', () => {
    expect(TIMEZONE_TO_COUNTRY['Asia/Seoul']).toBe('KR')
  })

  it('maps America/Sao_Paulo to BR', () => {
    expect(TIMEZONE_TO_COUNTRY['America/Sao_Paulo']).toBe('BR')
  })

  it('maps Australia/Sydney to AU', () => {
    expect(TIMEZONE_TO_COUNTRY['Australia/Sydney']).toBe('AU')
  })
})

describe('LOCALE_TO_COUNTRY mapping', () => {
  it('contains 50+ locale mappings', () => {
    expect(Object.keys(LOCALE_TO_COUNTRY).length).toBeGreaterThanOrEqual(50)
  })

  it('maps en-US to US', () => {
    expect(LOCALE_TO_COUNTRY['en-US']).toBe('US')
  })

  it('maps en-GB to GB', () => {
    expect(LOCALE_TO_COUNTRY['en-GB']).toBe('GB')
  })

  it('maps hi-IN to IN', () => {
    expect(LOCALE_TO_COUNTRY['hi-IN']).toBe('IN')
  })

  it('maps ja-JP to JP', () => {
    expect(LOCALE_TO_COUNTRY['ja-JP']).toBe('JP')
  })

  it('maps fr-FR to FR', () => {
    expect(LOCALE_TO_COUNTRY['fr-FR']).toBe('FR')
  })
})

describe('detectCountry', () => {
  let originalDateTimeFormat: typeof Intl.DateTimeFormat

  beforeEach(() => {
    originalDateTimeFormat = Intl.DateTimeFormat
  })

  afterEach(() => {
    // @ts-ignore
    Intl.DateTimeFormat = originalDateTimeFormat
    // @ts-ignore
    delete (globalThis as any).navigator
  })

  it('detects country from timezone', () => {
    // @ts-ignore
    Intl.DateTimeFormat = vi.fn().mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Asia/Kolkata' }),
    })) as any
    // Ensure no navigator
    // @ts-ignore
    delete (globalThis as any).navigator
    expect(detectCountry()).toBe('IN')
  })

  it('detects country from timezone for US Eastern', () => {
    // @ts-ignore
    Intl.DateTimeFormat = vi.fn().mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'America/New_York' }),
    })) as any
    // @ts-ignore
    delete (globalThis as any).navigator
    expect(detectCountry()).toBe('US')
  })

  it('falls back to navigator.languages locale mapping when timezone not matched', () => {
    // @ts-ignore
    Intl.DateTimeFormat = vi.fn().mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Unknown/Zone' }),
    })) as any
    Object.defineProperty(globalThis, 'navigator', {
      value: { languages: ['fr-FR', 'en-US'] },
      writable: true,
      configurable: true,
    })
    expect(detectCountry()).toBe('FR')
  })

  it('falls back to US when nothing matches', () => {
    // @ts-ignore
    Intl.DateTimeFormat = vi.fn().mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Unknown/Zone' }),
    })) as any
    Object.defineProperty(globalThis, 'navigator', {
      value: { languages: ['xx'] },
      writable: true,
      configurable: true,
    })
    expect(detectCountry()).toBe('US')
  })

  it('falls back to US when no navigator exists', () => {
    // @ts-ignore
    Intl.DateTimeFormat = vi.fn().mockImplementation(() => ({
      resolvedOptions: () => ({ timeZone: 'Unknown/Zone' }),
    })) as any
    // @ts-ignore
    delete (globalThis as any).navigator
    expect(detectCountry()).toBe('US')
  })
})

describe('detectLanguage', () => {
  afterEach(() => {
    // @ts-ignore
    delete (globalThis as any).navigator
  })

  it('returns first language from navigator.languages', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { languages: ['fr-FR', 'en-US'] },
      writable: true,
      configurable: true,
    })
    expect(detectLanguage()).toBe('fr-FR')
  })

  it('returns navigator.language when languages is not available', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { language: 'de-DE' },
      writable: true,
      configurable: true,
    })
    expect(detectLanguage()).toBe('de-DE')
  })

  it('returns en when navigator is not available', () => {
    // @ts-ignore
    delete (globalThis as any).navigator
    expect(detectLanguage()).toBe('en')
  })

  it('returns en when navigator.languages is empty', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { languages: [] },
      writable: true,
      configurable: true,
    })
    expect(detectLanguage()).toBe('en')
  })
})
