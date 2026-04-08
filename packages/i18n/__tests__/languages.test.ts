import { describe, it, expect } from 'vitest'
import {
  LANGUAGES,
  getLanguage,
  getSupportedLanguages,
  getLanguagesByGroup,
  getLanguageName,
  isRTL,
  getTtsLang,
} from '../src/languages.js'
import type { Language } from '../src/languages.js'

describe('Language type structure', () => {
  it('each language has required fields: code, name, nativeName, direction', () => {
    for (const [code, lang] of Object.entries(LANGUAGES)) {
      expect(lang.code).toBe(code)
      expect(typeof lang.name).toBe('string')
      expect(lang.name.length).toBeGreaterThan(0)
      expect(typeof lang.nativeName).toBe('string')
      expect(lang.nativeName.length).toBeGreaterThan(0)
      expect(['ltr', 'rtl']).toContain(lang.direction)
    }
  })

  it('group field is optional but always a string when present', () => {
    for (const lang of Object.values(LANGUAGES)) {
      if (lang.group !== undefined) {
        expect(typeof lang.group).toBe('string')
        expect(lang.group.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('LANGUAGES registry', () => {
  it('contains 40+ languages', () => {
    expect(Object.keys(LANGUAGES).length).toBeGreaterThanOrEqual(40)
  })

  const expectedCodes = [
    'en', 'en-US', 'en-GB', 'en-IN',
    'hi', 'te', 'ta', 'ur', 'pa', 'bn', 'gu', 'mr', 'kn', 'ml',
    'fr', 'es', 'de', 'it', 'pt', 'pt-BR',
    'ja', 'ko', 'zh', 'zh-TW',
    'ar', 'he', 'ru', 'pl', 'nl', 'sv', 'da', 'no', 'fi',
    'tr', 'th', 'vi', 'id', 'ms',
    'uk', 'cs', 'ro', 'el', 'hu', 'bg', 'hr', 'sk', 'sl', 'sr',
  ]

  it.each(expectedCodes)('contains language code "%s"', (code) => {
    expect(LANGUAGES[code]).toBeDefined()
    expect(LANGUAGES[code].code).toBe(code)
  })

  it('English has correct metadata', () => {
    expect(LANGUAGES['en']).toMatchObject({
      code: 'en',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
    })
  })

  it('Hindi has correct metadata', () => {
    expect(LANGUAGES['hi']).toMatchObject({
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिन्दी',
      direction: 'ltr',
    })
  })

  it('Arabic has correct metadata and is RTL', () => {
    expect(LANGUAGES['ar']).toMatchObject({
      code: 'ar',
      name: 'Arabic',
      direction: 'rtl',
    })
  })

  it('Telugu has correct metadata', () => {
    expect(LANGUAGES['te']).toMatchObject({
      code: 'te',
      name: 'Telugu',
      nativeName: 'తెలుగు',
      direction: 'ltr',
    })
  })

  it('Japanese has correct metadata', () => {
    expect(LANGUAGES['ja']).toMatchObject({
      code: 'ja',
      name: 'Japanese',
      direction: 'ltr',
    })
  })

  it('Portuguese (Brazil) variant exists', () => {
    expect(LANGUAGES['pt-BR']).toMatchObject({
      code: 'pt-BR',
      name: 'Portuguese (Brazil)',
      direction: 'ltr',
    })
  })

  it('Chinese Traditional variant exists', () => {
    expect(LANGUAGES['zh-TW']).toMatchObject({
      code: 'zh-TW',
      direction: 'ltr',
    })
  })
})

describe('getLanguage', () => {
  it('returns a Language for a valid code', () => {
    const lang = getLanguage('en')
    expect(lang).toBeDefined()
    expect(lang!.code).toBe('en')
    expect(lang!.name).toBe('English')
  })

  it('returns undefined for an unknown code', () => {
    expect(getLanguage('xx')).toBeUndefined()
  })

  it('returns undefined for empty string', () => {
    expect(getLanguage('')).toBeUndefined()
  })

  it('works for regional variants', () => {
    const lang = getLanguage('en-US')
    expect(lang).toBeDefined()
    expect(lang!.code).toBe('en-US')
  })
})

describe('getSupportedLanguages', () => {
  it('returns an array of Language objects', () => {
    const languages = getSupportedLanguages()
    expect(Array.isArray(languages)).toBe(true)
    expect(languages.length).toBeGreaterThanOrEqual(40)
  })

  it('each item has code, name, nativeName, direction', () => {
    for (const lang of getSupportedLanguages()) {
      expect(lang.code).toBeTruthy()
      expect(lang.name).toBeTruthy()
      expect(lang.nativeName).toBeTruthy()
      expect(['ltr', 'rtl']).toContain(lang.direction)
    }
  })

  it('returns the same languages as LANGUAGES values', () => {
    const languages = getSupportedLanguages()
    expect(languages.length).toBe(Object.keys(LANGUAGES).length)
  })
})

describe('getLanguagesByGroup', () => {
  it('returns a record of group → Language[]', () => {
    const groups = getLanguagesByGroup()
    expect(typeof groups).toBe('object')
    for (const [groupName, langs] of Object.entries(groups)) {
      expect(typeof groupName).toBe('string')
      expect(Array.isArray(langs)).toBe(true)
      expect(langs.length).toBeGreaterThan(0)
    }
  })

  it('has an English group containing en, en-US, en-GB, en-IN', () => {
    const groups = getLanguagesByGroup()
    const englishGroup = Object.entries(groups).find(([key]) =>
      key.toLowerCase().includes('english')
    )
    expect(englishGroup).toBeDefined()
    const codes = englishGroup![1].map((l: Language) => l.code)
    expect(codes).toContain('en')
    expect(codes).toContain('en-US')
    expect(codes).toContain('en-GB')
    expect(codes).toContain('en-IN')
  })

  it('has an Indian group containing hi, te, ta, etc.', () => {
    const groups = getLanguagesByGroup()
    const indianGroup = Object.entries(groups).find(([key]) =>
      key.toLowerCase().includes('indian')
    )
    expect(indianGroup).toBeDefined()
    const codes = indianGroup![1].map((l: Language) => l.code)
    expect(codes).toContain('hi')
    expect(codes).toContain('te')
    expect(codes).toContain('ta')
  })

  it('has an East Asian group containing ja, ko, zh', () => {
    const groups = getLanguagesByGroup()
    const eastAsianGroup = Object.entries(groups).find(([key]) =>
      key.toLowerCase().includes('east asian')
    )
    expect(eastAsianGroup).toBeDefined()
    const codes = eastAsianGroup![1].map((l: Language) => l.code)
    expect(codes).toContain('ja')
    expect(codes).toContain('ko')
    expect(codes).toContain('zh')
  })

  it('total languages across groups equals LANGUAGES count', () => {
    const groups = getLanguagesByGroup()
    const total = Object.values(groups).reduce((sum, langs) => sum + langs.length, 0)
    expect(total).toBe(Object.keys(LANGUAGES).length)
  })
})

describe('getLanguageName', () => {
  it('returns display name for valid code', () => {
    expect(getLanguageName('en')).toBe('English')
    expect(getLanguageName('fr')).toBe('French')
    expect(getLanguageName('hi')).toBe('Hindi')
  })

  it('returns empty string for unknown code', () => {
    expect(getLanguageName('xx')).toBe('')
  })
})

describe('isRTL', () => {
  it('returns true for Arabic', () => {
    expect(isRTL('ar')).toBe(true)
  })

  it('returns true for Hebrew', () => {
    expect(isRTL('he')).toBe(true)
  })

  it('returns true for Urdu', () => {
    expect(isRTL('ur')).toBe(true)
  })

  it('returns false for English', () => {
    expect(isRTL('en')).toBe(false)
  })

  it('returns false for Hindi', () => {
    expect(isRTL('hi')).toBe(false)
  })

  it('returns false for Japanese', () => {
    expect(isRTL('ja')).toBe(false)
  })

  it('returns false for unknown code', () => {
    expect(isRTL('xx')).toBe(false)
  })
})

describe('getTtsLang', () => {
  it('returns BCP-47 tag for English', () => {
    expect(getTtsLang('en')).toBe('en-US')
  })

  it('returns BCP-47 tag for English US', () => {
    expect(getTtsLang('en-US')).toBe('en-US')
  })

  it('returns BCP-47 tag for English GB', () => {
    expect(getTtsLang('en-GB')).toBe('en-GB')
  })

  it('returns BCP-47 tag for Hindi', () => {
    expect(getTtsLang('hi')).toBe('hi-IN')
  })

  it('returns BCP-47 tag for Japanese', () => {
    expect(getTtsLang('ja')).toBe('ja-JP')
  })

  it('returns BCP-47 tag for Chinese', () => {
    expect(getTtsLang('zh')).toBe('zh-CN')
  })

  it('returns BCP-47 tag for Chinese Traditional', () => {
    expect(getTtsLang('zh-TW')).toBe('zh-TW')
  })

  it('returns BCP-47 tag for Arabic', () => {
    expect(getTtsLang('ar')).toBe('ar-SA')
  })

  it('returns BCP-47 tag for French', () => {
    expect(getTtsLang('fr')).toBe('fr-FR')
  })

  it('returns the code itself for unknown languages', () => {
    expect(getTtsLang('xx')).toBe('xx')
  })
})
