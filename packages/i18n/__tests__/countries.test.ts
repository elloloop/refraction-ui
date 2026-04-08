import { describe, it, expect } from 'vitest'
import {
  COUNTRIES,
  getCountry,
  getCountryFlag,
  getCountryName,
  getDefaultLanguagesForCountry,
} from '../src/countries.js'
import type { Country } from '../src/countries.js'

describe('Country type structure', () => {
  it('each country has required fields: code, name, flag, defaultLanguages', () => {
    for (const [code, country] of Object.entries(COUNTRIES)) {
      expect(country.code).toBe(code)
      expect(typeof country.name).toBe('string')
      expect(country.name.length).toBeGreaterThan(0)
      expect(typeof country.flag).toBe('string')
      expect(country.flag.length).toBeGreaterThan(0)
      expect(Array.isArray(country.defaultLanguages)).toBe(true)
      expect(country.defaultLanguages.length).toBeGreaterThan(0)
    }
  })

  it('timezone field is optional but always a string when present', () => {
    for (const country of Object.values(COUNTRIES)) {
      if (country.timezone !== undefined) {
        expect(typeof country.timezone).toBe('string')
        expect(country.timezone.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('COUNTRIES registry', () => {
  it('contains 55+ countries', () => {
    expect(Object.keys(COUNTRIES).length).toBeGreaterThanOrEqual(55)
  })

  const expectedCodes = [
    'US', 'GB', 'CA', 'AU', 'NZ', 'IE',
    'IN', 'PK', 'BD', 'LK', 'NP',
    'FR', 'DE', 'ES', 'IT', 'PT', 'NL', 'BE', 'CH', 'AT',
    'SE', 'NO', 'DK', 'FI',
    'PL', 'CZ', 'RO', 'HU', 'BG', 'HR', 'SK', 'SI', 'RS', 'UA',
    'RU', 'TR', 'GR',
    'JP', 'KR', 'CN', 'TW',
    'TH', 'VN', 'ID', 'MY', 'PH', 'SG',
    'BR', 'MX', 'AR', 'CO', 'CL',
    'SA', 'AE', 'IL', 'EG',
  ]

  it.each(expectedCodes)('contains country code "%s"', (code) => {
    expect(COUNTRIES[code]).toBeDefined()
    expect(COUNTRIES[code].code).toBe(code)
  })

  it('United States has correct metadata', () => {
    expect(COUNTRIES['US']).toMatchObject({
      code: 'US',
      name: 'United States',
      flag: '🇺🇸',
    })
    expect(COUNTRIES['US'].defaultLanguages).toContain('en')
  })

  it('India has correct metadata with multiple default languages', () => {
    expect(COUNTRIES['IN']).toMatchObject({
      code: 'IN',
      name: 'India',
      flag: '🇮🇳',
    })
    expect(COUNTRIES['IN'].defaultLanguages).toContain('hi')
    expect(COUNTRIES['IN'].defaultLanguages).toContain('en')
  })

  it('Japan has correct metadata', () => {
    expect(COUNTRIES['JP']).toMatchObject({
      code: 'JP',
      name: 'Japan',
      flag: '🇯🇵',
    })
    expect(COUNTRIES['JP'].defaultLanguages).toContain('ja')
  })

  it('Saudi Arabia has correct metadata', () => {
    expect(COUNTRIES['SA']).toMatchObject({
      code: 'SA',
      name: 'Saudi Arabia',
      flag: '🇸🇦',
    })
    expect(COUNTRIES['SA'].defaultLanguages).toContain('ar')
  })

  it('Brazil has Portuguese as default language', () => {
    expect(COUNTRIES['BR'].defaultLanguages).toContain('pt')
  })

  it('flags are emoji characters', () => {
    for (const country of Object.values(COUNTRIES)) {
      // Flag emojis are regional indicator symbols (2 chars, each 2 code units = 4 total or surrogate pairs)
      expect(country.flag.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('getCountry', () => {
  it('returns a Country for a valid code', () => {
    const country = getCountry('US')
    expect(country).toBeDefined()
    expect(country!.code).toBe('US')
    expect(country!.name).toBe('United States')
  })

  it('returns undefined for an unknown code', () => {
    expect(getCountry('XX')).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(getCountry('')).toBeUndefined()
  })

  it('works for various countries', () => {
    expect(getCountry('IN')!.name).toBe('India')
    expect(getCountry('DE')!.name).toBe('Germany')
    expect(getCountry('JP')!.name).toBe('Japan')
  })
})

describe('getCountryFlag', () => {
  it('returns flag emoji for valid country', () => {
    expect(getCountryFlag('US')).toBe('🇺🇸')
    expect(getCountryFlag('IN')).toBe('🇮🇳')
    expect(getCountryFlag('JP')).toBe('🇯🇵')
  })

  it('returns empty string for unknown country', () => {
    expect(getCountryFlag('XX')).toBe('')
  })

  it('returns correct flags for European countries', () => {
    expect(getCountryFlag('FR')).toBe('🇫🇷')
    expect(getCountryFlag('DE')).toBe('🇩🇪')
    expect(getCountryFlag('GB')).toBe('🇬🇧')
  })
})

describe('getCountryName', () => {
  it('returns name for valid country', () => {
    expect(getCountryName('US')).toBe('United States')
    expect(getCountryName('GB')).toBe('United Kingdom')
    expect(getCountryName('IN')).toBe('India')
  })

  it('returns empty string for unknown country', () => {
    expect(getCountryName('XX')).toBe('')
  })
})

describe('getDefaultLanguagesForCountry', () => {
  it('returns language codes for valid country', () => {
    const langs = getDefaultLanguagesForCountry('US')
    expect(Array.isArray(langs)).toBe(true)
    expect(langs).toContain('en')
  })

  it('returns multiple languages for multilingual countries', () => {
    const langs = getDefaultLanguagesForCountry('IN')
    expect(langs.length).toBeGreaterThanOrEqual(2)
    expect(langs).toContain('hi')
    expect(langs).toContain('en')
  })

  it('returns empty array for unknown country', () => {
    expect(getDefaultLanguagesForCountry('XX')).toEqual([])
  })

  it('returns correct languages for Switzerland', () => {
    const langs = getDefaultLanguagesForCountry('CH')
    expect(langs).toContain('de')
    expect(langs).toContain('fr')
  })

  it('returns correct languages for Belgium', () => {
    const langs = getDefaultLanguagesForCountry('BE')
    expect(langs).toContain('nl')
    expect(langs).toContain('fr')
  })

  it('returns correct languages for Canada', () => {
    const langs = getDefaultLanguagesForCountry('CA')
    expect(langs).toContain('en')
    expect(langs).toContain('fr')
  })
})
