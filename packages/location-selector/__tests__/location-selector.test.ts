import { describe, it, expect, vi } from 'vitest'
import { createLocationSelector } from '../src/index.js'

describe('createLocationSelector — initial state', () => {
  it('defaults to US / en', () => {
    const api = createLocationSelector()
    expect(api.state.country).toBe('US')
    expect(api.state.language).toBe('en')
  })

  it('honors custom defaults', () => {
    const api = createLocationSelector({ defaultCountry: 'GB', defaultLanguage: 'hi' })
    expect(api.state.country).toBe('GB')
    expect(api.state.language).toBe('hi')
  })

  it('exposes named select props with unique, prefixed ids', () => {
    const api = createLocationSelector()
    expect(api.countryProps.name).toBe('country')
    expect(api.languageProps.name).toBe('language')
    expect(api.countryProps.id).toMatch(/^location-sel-country-\d+$/)
    expect(api.languageProps.id).toMatch(/^location-sel-language-\d+$/)
    expect(api.countryProps.id).not.toBe(api.languageProps.id)
  })
})

describe('createLocationSelector — state updates', () => {
  it('setCountry updates state and fires onCountryChange', () => {
    const onCountryChange = vi.fn()
    const api = createLocationSelector({ onCountryChange })
    api.setCountry('IN')
    expect(api.state.country).toBe('IN')
    expect(onCountryChange).toHaveBeenCalledWith('IN')
  })

  it('setLanguage updates state and fires onLanguageChange', () => {
    const onLanguageChange = vi.fn()
    const api = createLocationSelector({ onLanguageChange })
    api.setLanguage('ta')
    expect(api.state.language).toBe('ta')
    expect(onLanguageChange).toHaveBeenCalledWith('ta')
  })

  it('works without callbacks', () => {
    const api = createLocationSelector()
    expect(() => {
      api.setCountry('FR')
      api.setLanguage('fr')
    }).not.toThrow()
    expect(api.state.country).toBe('FR')
    expect(api.state.language).toBe('fr')
  })
})

describe('createLocationSelector — option data', () => {
  it('exposes the i18n country list as code/name objects', () => {
    const api = createLocationSelector()
    expect(Array.isArray(api.countries)).toBe(true)
    expect(api.countries.length).toBeGreaterThan(0)
    const us = api.countries.find((c: any) => c.code === 'US')
    expect(us).toMatchObject({ code: 'US', name: 'United States' })
  })

  it('exposes the i18n language list as code/name objects', () => {
    const api = createLocationSelector()
    expect(Array.isArray(api.languages)).toBe(true)
    expect(api.languages.length).toBeGreaterThan(0)
    const en = api.languages.find((l: any) => l.code === 'en')
    const hi = api.languages.find((l: any) => l.code === 'hi')
    expect(en).toMatchObject({ code: 'en', name: 'English' })
    expect(hi).toMatchObject({ code: 'hi', name: 'Hindi' })
  })
})
