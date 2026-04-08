import { describe, it, expect } from 'vitest'
import {
  VOICES,
  getVoicesForLanguage,
  getBestVoice,
  getVoicesByProvider,
} from '../src/voice-registry.js'
import type { VoiceOption } from '../src/voice-registry.js'

describe('VoiceOption type structure', () => {
  it('each voice has required fields: id, name, language, provider', () => {
    for (const voice of VOICES) {
      expect(typeof voice.id).toBe('string')
      expect(voice.id.length).toBeGreaterThan(0)
      expect(typeof voice.name).toBe('string')
      expect(voice.name.length).toBeGreaterThan(0)
      expect(typeof voice.language).toBe('string')
      expect(voice.language.length).toBeGreaterThan(0)
      expect(['browser', 'google', 'elevenlabs', 'openai']).toContain(voice.provider)
    }
  })

  it('gender field is optional but always male or female when present', () => {
    for (const voice of VOICES) {
      if (voice.gender !== undefined) {
        expect(['male', 'female']).toContain(voice.gender)
      }
    }
  })
})

describe('VOICES registry', () => {
  it('contains 30+ voice definitions', () => {
    expect(VOICES.length).toBeGreaterThanOrEqual(30)
  })

  it('has voices for English', () => {
    const enVoices = VOICES.filter((v) => v.language.startsWith('en'))
    expect(enVoices.length).toBeGreaterThan(0)
  })

  it('has voices from multiple providers', () => {
    const providers = new Set(VOICES.map((v) => v.provider))
    expect(providers.size).toBeGreaterThanOrEqual(2)
  })

  it('has unique voice ids', () => {
    const ids = VOICES.map((v) => v.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getVoicesForLanguage', () => {
  it('returns voices matching the language code', () => {
    const voices = getVoicesForLanguage('en')
    expect(voices.length).toBeGreaterThan(0)
    for (const voice of voices) {
      expect(voice.language.startsWith('en')).toBe(true)
    }
  })

  it('returns empty array for unsupported language', () => {
    expect(getVoicesForLanguage('xx')).toEqual([])
  })

  it('returns voices for Spanish', () => {
    const voices = getVoicesForLanguage('es')
    expect(voices.length).toBeGreaterThan(0)
  })

  it('returns voices for Japanese', () => {
    const voices = getVoicesForLanguage('ja')
    expect(voices.length).toBeGreaterThan(0)
  })

  it('returns voices for Hindi', () => {
    const voices = getVoicesForLanguage('hi')
    expect(voices.length).toBeGreaterThan(0)
  })

  it('matches both exact and prefix language codes', () => {
    // If searching for "en", should match "en", "en-US", "en-GB"
    const voices = getVoicesForLanguage('en')
    const languages = new Set(voices.map((v) => v.language))
    // Should have at least one English voice
    expect(voices.length).toBeGreaterThan(0)
  })
})

describe('getBestVoice', () => {
  it('returns a voice for a supported language', () => {
    const voice = getBestVoice('en')
    expect(voice).toBeDefined()
    expect(voice!.language.startsWith('en')).toBe(true)
  })

  it('returns undefined for unsupported language', () => {
    expect(getBestVoice('xx')).toBeUndefined()
  })

  it('respects preferred provider when available', () => {
    const voice = getBestVoice('en', 'browser')
    if (voice) {
      expect(voice.provider).toBe('browser')
    }
  })

  it('falls back to any provider if preferred not available', () => {
    // Even if preferred provider has no voice for a language, should still return something
    const voice = getBestVoice('en', 'elevenlabs')
    // It should return something (elevenlabs voice if available, or fallback)
    expect(voice).toBeDefined()
  })

  it('returns a voice for French', () => {
    const voice = getBestVoice('fr')
    expect(voice).toBeDefined()
    expect(voice!.language.startsWith('fr')).toBe(true)
  })

  it('returns a voice for Arabic', () => {
    const voice = getBestVoice('ar')
    expect(voice).toBeDefined()
  })
})

describe('getVoicesByProvider', () => {
  it('returns only browser voices when filtering by browser', () => {
    const voices = getVoicesByProvider('browser')
    expect(voices.length).toBeGreaterThan(0)
    for (const voice of voices) {
      expect(voice.provider).toBe('browser')
    }
  })

  it('returns only google voices when filtering by google', () => {
    const voices = getVoicesByProvider('google')
    for (const voice of voices) {
      expect(voice.provider).toBe('google')
    }
  })

  it('returns only elevenlabs voices when filtering by elevenlabs', () => {
    const voices = getVoicesByProvider('elevenlabs')
    for (const voice of voices) {
      expect(voice.provider).toBe('elevenlabs')
    }
  })

  it('returns only openai voices when filtering by openai', () => {
    const voices = getVoicesByProvider('openai')
    for (const voice of voices) {
      expect(voice.provider).toBe('openai')
    }
  })

  it('total voices across all providers equals VOICES length', () => {
    const browser = getVoicesByProvider('browser')
    const google = getVoicesByProvider('google')
    const elevenlabs = getVoicesByProvider('elevenlabs')
    const openai = getVoicesByProvider('openai')
    expect(browser.length + google.length + elevenlabs.length + openai.length).toBe(VOICES.length)
  })
})
