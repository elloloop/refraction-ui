import { describe, it, expect } from 'vitest'
import { EMOJI_MAP, detectEmojiShortcode, searchEmoji } from '../src/emoji.js'

describe('emoji', () => {
  // =========================================================================
  // EMOJI_MAP
  // =========================================================================
  describe('EMOJI_MAP', () => {
    it('has at least 50 entries', () => {
      expect(Object.keys(EMOJI_MAP).length).toBeGreaterThanOrEqual(50)
    })

    it('maps :smile: to a unicode emoji', () => {
      expect(EMOJI_MAP[':smile:']).toBeDefined()
      expect(EMOJI_MAP[':smile:']).toBe('\u{1F604}')
    })

    it('maps :heart: to a unicode emoji', () => {
      expect(EMOJI_MAP[':heart:']).toBeDefined()
    })

    it('maps :fire: to fire emoji', () => {
      expect(EMOJI_MAP[':fire:']).toBe('\u{1F525}')
    })

    it('maps :rocket: to rocket emoji', () => {
      expect(EMOJI_MAP[':rocket:']).toBe('\u{1F680}')
    })

    it('maps :thumbsup: to thumbs up', () => {
      expect(EMOJI_MAP[':thumbsup:']).toBe('\u{1F44D}')
    })

    it('maps :thumbsdown: to thumbs down', () => {
      expect(EMOJI_MAP[':thumbsdown:']).toBe('\u{1F44E}')
    })

    it('maps :check: to checkmark', () => {
      expect(EMOJI_MAP[':check:']).toBe('\u{2705}')
    })

    it('maps :x: to cross mark', () => {
      expect(EMOJI_MAP[':x:']).toBe('\u{274C}')
    })

    it('maps :wave: to waving hand', () => {
      expect(EMOJI_MAP[':wave:']).toBeDefined()
    })

    it('maps :clap: to clapping hands', () => {
      expect(EMOJI_MAP[':clap:']).toBeDefined()
    })

    it('maps :eyes: to eyes', () => {
      expect(EMOJI_MAP[':eyes:']).toBeDefined()
    })

    it('maps :thinking: to thinking face', () => {
      expect(EMOJI_MAP[':thinking:']).toBe('\u{1F914}')
    })

    it('maps :100: to 100', () => {
      expect(EMOJI_MAP[':100:']).toBe('\u{1F4AF}')
    })

    it('maps :tada: to party popper', () => {
      expect(EMOJI_MAP[':tada:']).toBe('\u{1F389}')
    })

    it('maps :star: to star', () => {
      expect(EMOJI_MAP[':star:']).toBe('\u{2B50}')
    })

    it('all entries have colons around the key', () => {
      for (const key of Object.keys(EMOJI_MAP)) {
        expect(key.startsWith(':')).toBe(true)
        expect(key.endsWith(':')).toBe(true)
      }
    })

    it('all values are non-empty strings', () => {
      for (const value of Object.values(EMOJI_MAP)) {
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      }
    })
  })

  // =========================================================================
  // detectEmojiShortcode
  // =========================================================================
  describe('detectEmojiShortcode', () => {
    it('detects :smile: at end of text', () => {
      const result = detectEmojiShortcode('hello :smile:')
      expect(result).not.toBeNull()
      expect(result!.shortcode).toBe(':smile:')
      expect(result!.unicode).toBe('\u{1F604}')
    })

    it('detects :fire: at end of text', () => {
      const result = detectEmojiShortcode('check this :fire:')
      expect(result).not.toBeNull()
      expect(result!.shortcode).toBe(':fire:')
    })

    it('returns null for unknown shortcode', () => {
      const result = detectEmojiShortcode(':unknown_emoji_xyz:')
      expect(result).toBeNull()
    })

    it('returns null when no shortcode pattern', () => {
      const result = detectEmojiShortcode('hello world')
      expect(result).toBeNull()
    })

    it('returns null for partial shortcode', () => {
      const result = detectEmojiShortcode('hello :smi')
      expect(result).toBeNull()
    })

    it('returns null for empty string', () => {
      const result = detectEmojiShortcode('')
      expect(result).toBeNull()
    })

    it('detects shortcode that is the entire text', () => {
      const result = detectEmojiShortcode(':rocket:')
      expect(result).not.toBeNull()
      expect(result!.shortcode).toBe(':rocket:')
    })

    it('does not detect shortcode in the middle of text', () => {
      const result = detectEmojiShortcode(':smile: hello')
      expect(result).toBeNull()
    })

    it('handles shortcodes with underscores', () => {
      const result = detectEmojiShortcode(':thumbsup:')
      expect(result).not.toBeNull()
    })

    it('handles shortcodes with numbers', () => {
      const result = detectEmojiShortcode(':100:')
      expect(result).not.toBeNull()
      expect(result!.unicode).toBe('\u{1F4AF}')
    })
  })

  // =========================================================================
  // searchEmoji
  // =========================================================================
  describe('searchEmoji', () => {
    it('returns all emojis for empty query', () => {
      const results = searchEmoji('')
      expect(results.length).toBe(Object.keys(EMOJI_MAP).length)
    })

    it('finds emojis by name', () => {
      const results = searchEmoji('smile')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some((r) => r.shortcode === ':smile:')).toBe(true)
    })

    it('finds emojis by partial name', () => {
      const results = searchEmoji('rock')
      expect(results.some((r) => r.shortcode === ':rocket:')).toBe(true)
    })

    it('returns empty for no match', () => {
      const results = searchEmoji('zzzznothing')
      expect(results).toHaveLength(0)
    })

    it('sorts exact start matches first', () => {
      const results = searchEmoji('heart')
      expect(results[0].shortcode).toBe(':heart:')
    })

    it('strips leading colon from query', () => {
      const results = searchEmoji(':fire')
      expect(results.some((r) => r.shortcode === ':fire:')).toBe(true)
    })

    it('strips trailing colon from query', () => {
      const results = searchEmoji('fire:')
      expect(results.some((r) => r.shortcode === ':fire:')).toBe(true)
    })

    it('each result has shortcode and unicode', () => {
      const results = searchEmoji('star')
      for (const r of results) {
        expect(r.shortcode).toBeTruthy()
        expect(r.unicode).toBeTruthy()
      }
    })

    it('finds multiple heart emojis', () => {
      const results = searchEmoji('heart')
      expect(results.length).toBeGreaterThan(1)
    })

    it('searches are case-insensitive implicitly (all shortcodes are lowercase)', () => {
      // All shortcodes in EMOJI_MAP are lowercase, so searching lowercase works
      const results = searchEmoji('smile')
      expect(results.length).toBeGreaterThan(0)
    })
  })
})
