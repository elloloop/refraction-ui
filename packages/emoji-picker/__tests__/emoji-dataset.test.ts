import { describe, it, expect } from 'vitest'
import {
  getAllEmojis,
  EMOJI_COUNT_TOTAL,
  EMOJI_CATEGORIES,
  resolveShortcode,
  buildShortcodeMap,
  searchEmojis,
  SHORTCODE_ALIASES,
} from '../src/emoji-data.js'
import { twemojiFilename, twemojiAssetUrl } from '../src/twemoji.js'
import { STARTER_STICKER_SET } from '../src/stickers.js'

describe('full emoji dataset', () => {
  it('ships the full modern base set (>= 1800 emoji)', () => {
    const all = getAllEmojis()
    expect(all.length).toBeGreaterThanOrEqual(1800)
    expect(all.length).toBe(EMOJI_COUNT_TOTAL)
  })

  it('every entry has a glyph, name, category, keywords, and shortcode', () => {
    for (const e of getAllEmojis()) {
      expect(e.emoji.length).toBeGreaterThan(0)
      expect(e.name.length).toBeGreaterThan(0)
      expect(EMOJI_CATEGORIES).toContain(e.category)
      expect(e.keywords.length).toBeGreaterThan(0)
      expect(e.shortcode.length).toBeGreaterThan(0)
    }
  })

  it('excludes skin-tone variant entries (base set only)', () => {
    const withSkinTone = getAllEmojis().filter((e) => /[\u{1F3FB}-\u{1F3FF}]/u.test(e.emoji))
    expect(withSkinTone).toHaveLength(0)
  })

  it('shortcodes are unique', () => {
    const codes = getAllEmojis().map((e) => e.shortcode)
    expect(new Set(codes).size).toBe(codes.length)
  })
})

describe('shortcode resolution (shared source of truth)', () => {
  it('resolves derived shortcodes to their glyph', () => {
    expect(resolveShortcode('fire')).toBe('\u{1F525}')
    expect(resolveShortcode(':rocket:')).toBe('\u{1F680}')
  })

  it('resolves curated aliases, which win over derived', () => {
    expect(resolveShortcode(':smile:')).toBe('\u{1F604}')
    expect(resolveShortcode('joy')).toBe('\u{1F602}')
    expect(resolveShortcode(':100:')).toBe('\u{1F4AF}')
  })

  it('returns null for an unknown shortcode', () => {
    expect(resolveShortcode(':definitely_not_an_emoji_xyz:')).toBeNull()
  })

  it('buildShortcodeMap covers derived + aliases and is colon-wrapped', () => {
    const map = buildShortcodeMap()
    expect(Object.keys(map).length).toBeGreaterThan(1800)
    expect(map[':fire:']).toBe('\u{1F525}')
    expect(map[':smile:']).toBe('\u{1F604}')
    for (const key of Object.keys(map)) {
      expect(key.startsWith(':')).toBe(true)
      expect(key.endsWith(':')).toBe(true)
    }
  })

  it('every alias points at a non-empty glyph', () => {
    for (const glyph of Object.values(SHORTCODE_ALIASES)) {
      expect(typeof glyph).toBe('string')
      expect(glyph.length).toBeGreaterThan(0)
    }
  })
})

describe('searchEmojis', () => {
  it('ranks an exact shortcode match first', () => {
    const results = searchEmojis('fire', 5)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].emoji).toBe('\u{1F525}')
  })

  it('finds emoji via a curated alias term', () => {
    const results = searchEmojis('joy', 10)
    expect(results.some((e) => e.emoji === '\u{1F602}')).toBe(true)
  })

  it('respects the limit', () => {
    expect(searchEmojis('a', 8).length).toBeLessThanOrEqual(8)
  })

  it('returns nothing for gibberish', () => {
    expect(searchEmojis('zzzqqqxxx', 10)).toHaveLength(0)
  })
})

describe('twemoji seam', () => {
  it('maps a simple glyph to its codepoint filename', () => {
    expect(twemojiFilename('\u{1F600}')).toBe('1f600')
  })

  it('strips the FE0F variation selector from non-ZWJ glyphs', () => {
    expect(twemojiFilename('❤️')).toBe('2764')
  })

  it('keeps multi-codepoint (flag) sequences dash-joined', () => {
    expect(twemojiFilename('\u{1F1FA}\u{1F1F8}')).toBe('1f1fa-1f1f8')
  })

  it('builds a full SVG url', () => {
    expect(twemojiAssetUrl('\u{1F600}')).toMatch(/1f600\.svg$/)
    expect(twemojiAssetUrl('\u{1F600}', 'https://cdn.example.com/svg')).toBe(
      'https://cdn.example.com/svg/1f600.svg',
    )
  })
})

describe('sticker starter pack', () => {
  it('ships a non-empty starter set', () => {
    expect(STARTER_STICKER_SET.stickers.length).toBeGreaterThanOrEqual(6)
  })

  it('proves the animated render path with a self-animating SVG', () => {
    const animated = STARTER_STICKER_SET.stickers.filter((s) => s.animated)
    expect(animated.length).toBeGreaterThanOrEqual(1)
    expect(animated[0].kind).toBe('svg')
    expect(animated[0].source).toContain('<animate')
  })

  it('every sticker has an id, label, kind, and source', () => {
    for (const s of STARTER_STICKER_SET.stickers) {
      expect(s.id.length).toBeGreaterThan(0)
      expect(s.label.length).toBeGreaterThan(0)
      expect(['svg', 'image', 'lottie']).toContain(s.kind)
      expect(s.source.length).toBeGreaterThan(0)
    }
  })
})
