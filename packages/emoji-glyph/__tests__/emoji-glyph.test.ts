import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DEFAULT_TWEMOJI_BASE_URL } from '@refraction-ui/emoji-picker'
import {
  EMOJI_GLYPH_ANIMATED_BASE_URL,
  EMOJI_GLYPH_ANIMATED_KEYS,
  EMOJI_GLYPH_DEFAULT_SIZE,
  emojiGlyphAnimatedUrl,
  emojiGlyphCssSize,
  emojiGlyphKey,
  emojiGlyphLayerVariants,
  getVisibleEmojiGlyphSource,
  hasEmojiGlyphTwemojiArt,
  resolveEmojiGlyphSources,
  type EmojiGlyphManifests,
} from '../src/index.js'

const THUMBS_UP = '\u{1F44D}'
const THUMBS_UP_MEDIUM = '\u{1F44D}\u{1F3FD}'
const HEART = '❤️'
const HEART_BARE = '❤'
const HEART_TEXT = '❤︎'
const HEART_ON_FIRE = '❤️‍\u{1F525}'
const UK_FLAG = '\u{1F1EC}\u{1F1E7}'
const KEYCAP_ONE = '1️⃣'
const FAMILY = '\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}'

const flutterDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'flutter')

describe('emojiGlyphKey', () => {
  it('uses lowercase hex code points', () => {
    expect(emojiGlyphKey(THUMBS_UP)).toBe('1f44d')
    expect(emojiGlyphKey('\u{1F92A}')).toBe('1f92a')
  })

  it('leaves out U+FE0F everywhere, including inside ZWJ sequences', () => {
    expect(emojiGlyphKey(HEART)).toBe('2764')
    expect(emojiGlyphKey(HEART_BARE)).toBe('2764')
    expect(emojiGlyphKey(HEART_ON_FIRE)).toBe('2764_200d_1f525')
    expect(emojiGlyphKey(KEYCAP_ONE)).toBe('31_20e3')
  })

  it('joins every code point of a sequence with underscores', () => {
    expect(emojiGlyphKey(THUMBS_UP_MEDIUM)).toBe('1f44d_1f3fd')
    expect(emojiGlyphKey(UK_FLAG)).toBe('1f1ec_1f1e7')
    expect(emojiGlyphKey(FAMILY)).toBe('1f468_200d_1f469_200d_1f467_200d_1f466')
  })

  it('keeps U+FE0E so text presentation never shares a key with the emoji', () => {
    expect(emojiGlyphKey(HEART_TEXT)).toBe('2764_fe0e')
  })

  it('returns an empty key for an empty string', () => {
    expect(emojiGlyphKey('')).toBe('')
  })
})

describe('emojiGlyphAnimatedUrl', () => {
  it('defaults to the pinned Flutter release on jsDelivr', () => {
    expect(emojiGlyphAnimatedUrl('1f44d')).toBe(`${EMOJI_GLYPH_ANIMATED_BASE_URL}1f44d.json`)
    expect(EMOJI_GLYPH_ANIMATED_BASE_URL).toMatch(/@refraction_ui-v\d+\.\d+\.\d+\/packages\/flutter\/assets\/emoji_animated\/$/)
  })

  it('accepts a base with or without a trailing slash', () => {
    expect(emojiGlyphAnimatedUrl('2764', '/emoji-animated')).toBe('/emoji-animated/2764.json')
    expect(emojiGlyphAnimatedUrl('2764', '/emoji-animated/')).toBe('/emoji-animated/2764.json')
  })
})

describe('hasEmojiGlyphTwemojiArt', () => {
  it('is true for one complete supported grapheme', () => {
    expect(hasEmojiGlyphTwemojiArt(THUMBS_UP)).toBe(true)
    expect(hasEmojiGlyphTwemojiArt(UK_FLAG)).toBe(true)
    expect(hasEmojiGlyphTwemojiArt(FAMILY)).toBe(true)
  })

  it('is false for text, several emoji, or text presentation', () => {
    expect(hasEmojiGlyphTwemojiArt('x')).toBe(false)
    expect(hasEmojiGlyphTwemojiArt(`${THUMBS_UP}${THUMBS_UP}`)).toBe(false)
    expect(hasEmojiGlyphTwemojiArt(` ${THUMBS_UP}`)).toBe(false)
    expect(hasEmojiGlyphTwemojiArt(HEART_TEXT)).toBe(false)
    expect(hasEmojiGlyphTwemojiArt('')).toBe(false)
  })
})

describe('resolveEmojiGlyphSources', () => {
  it('orders animated → Twemoji → native when animated art exists', () => {
    expect(resolveEmojiGlyphSources(THUMBS_UP)).toEqual([
      { kind: 'animated', key: '1f44d', url: `${EMOJI_GLYPH_ANIMATED_BASE_URL}1f44d.json` },
      { kind: 'twemoji', url: `${DEFAULT_TWEMOJI_BASE_URL}1f44d.svg` },
      { kind: 'native' },
    ])
  })

  it('treats the FE0F and bare forms of an emoji the same', () => {
    expect(resolveEmojiGlyphSources(HEART).map((s) => s.kind)).toEqual(['animated', 'twemoji', 'native'])
    expect(resolveEmojiGlyphSources(HEART_BARE).map((s) => s.kind)).toEqual(['animated', 'twemoji', 'native'])
  })

  it('drops animated art when animate is false', () => {
    expect(resolveEmojiGlyphSources(THUMBS_UP, { animate: false }).map((s) => s.kind)).toEqual(['twemoji', 'native'])
  })

  it('drops animated art under reduced motion, even with animate', () => {
    expect(resolveEmojiGlyphSources(THUMBS_UP, { animate: true, reducedMotion: true }).map((s) => s.kind)).toEqual([
      'twemoji',
      'native',
    ])
  })

  it('falls back to Twemoji when no animation exists', () => {
    expect(resolveEmojiGlyphSources(UK_FLAG)).toEqual([
      { kind: 'twemoji', url: `${DEFAULT_TWEMOJI_BASE_URL}1f1ec-1f1e7.svg` },
      { kind: 'native' },
    ])
  })

  it('never strips a skin-tone modifier to borrow the base emoji art', () => {
    // Neither shipped set carries skin-tone variants, so only the native glyph is exact.
    expect(resolveEmojiGlyphSources(THUMBS_UP_MEDIUM)).toEqual([{ kind: 'native' }])
  })

  it('renders only the native glyph for text presentation, text, or empty input', () => {
    expect(resolveEmojiGlyphSources(HEART_TEXT)).toEqual([{ kind: 'native' }])
    expect(resolveEmojiGlyphSources('x')).toEqual([{ kind: 'native' }])
    expect(resolveEmojiGlyphSources('')).toEqual([{ kind: 'native' }])
  })

  it('uses the configured base URLs', () => {
    const sources = resolveEmojiGlyphSources(THUMBS_UP, { animatedBaseUrl: '/a', twemojiBaseUrl: '/t' })
    expect(sources).toEqual([
      { kind: 'animated', key: '1f44d', url: '/a/1f44d.json' },
      { kind: 'twemoji', url: '/t/1f44d.svg' },
      { kind: 'native' },
    ])
  })

  it('resolves purely from injected manifests', () => {
    const manifests: EmojiGlyphManifests = {
      animatedKeys: new Set(['1f1ec_1f1e7']),
      hasTwemojiArt: () => false,
    }
    expect(resolveEmojiGlyphSources(UK_FLAG, { manifests, animatedBaseUrl: '/a/' })).toEqual([
      { kind: 'animated', key: '1f1ec_1f1e7', url: '/a/1f1ec_1f1e7.json' },
      { kind: 'native' },
    ])
    expect(resolveEmojiGlyphSources(THUMBS_UP, { manifests })).toEqual([{ kind: 'native' }])
  })
})

describe('emojiGlyphCssSize', () => {
  it('turns logical pixels into rem', () => {
    expect(emojiGlyphCssSize(16)).toBe('1rem')
    expect(emojiGlyphCssSize(24)).toBe('1.5rem')
    expect(emojiGlyphCssSize(56)).toBe('3.5rem')
  })

  it('passes CSS lengths through', () => {
    expect(emojiGlyphCssSize('2em')).toBe('2em')
    expect(emojiGlyphCssSize('1.25rem')).toBe('1.25rem')
  })

  it('follows the text for missing, empty or invalid sizes', () => {
    expect(emojiGlyphCssSize(undefined)).toBe(EMOJI_GLYPH_DEFAULT_SIZE)
    expect(emojiGlyphCssSize('  ')).toBe(EMOJI_GLYPH_DEFAULT_SIZE)
    expect(emojiGlyphCssSize(0)).toBe(EMOJI_GLYPH_DEFAULT_SIZE)
    expect(emojiGlyphCssSize(-4)).toBe(EMOJI_GLYPH_DEFAULT_SIZE)
    expect(emojiGlyphCssSize(Number.NaN)).toBe(EMOJI_GLYPH_DEFAULT_SIZE)
    expect(emojiGlyphCssSize(Number.POSITIVE_INFINITY)).toBe(EMOJI_GLYPH_DEFAULT_SIZE)
  })
})

describe('getVisibleEmojiGlyphSource', () => {
  it('prefers a ready animation, then a loaded still, then native', () => {
    expect(getVisibleEmojiGlyphSource({ animationReady: true, stillLoaded: true })).toBe('animated')
    expect(getVisibleEmojiGlyphSource({ animationReady: true, stillLoaded: false })).toBe('animated')
    expect(getVisibleEmojiGlyphSource({ animationReady: false, stillLoaded: true })).toBe('twemoji')
    expect(getVisibleEmojiGlyphSource({ animationReady: false, stillLoaded: false })).toBe('native')
  })
})

describe('emojiGlyphLayerVariants', () => {
  it('hides layers by default and stops the fade under reduced motion', () => {
    expect(emojiGlyphLayerVariants()).toContain('opacity-0')
    expect(emojiGlyphLayerVariants({ visible: 'true' })).toContain('opacity-100')
    expect(emojiGlyphLayerVariants()).toContain('motion-reduce:transition-none')
  })
})

describe('EMOJI_GLYPH_ANIMATED_KEYS (shared with Flutter)', () => {
  const dartManifest = readFileSync(join(flutterDir, 'lib', 'src', 'data', 'animated_emoji_manifest.dart'), 'utf8')
  const dartKeys = [...dartManifest.matchAll(/'([0-9a-f_]+)'/g)].map((match) => match[1])

  it('matches the Flutter manifest exactly', () => {
    expect(dartKeys.length).toBeGreaterThan(0)
    expect([...EMOJI_GLYPH_ANIMATED_KEYS].sort()).toEqual([...dartKeys].sort())
  })

  it('has an animation file in the Flutter assets for every key', () => {
    const missing = [...EMOJI_GLYPH_ANIMATED_KEYS].filter(
      (key) => !existsSync(join(flutterDir, 'assets', 'emoji_animated', `${key}.json`)),
    )
    expect(missing).toEqual([])
  })

  it('stores only well-formed keys', () => {
    for (const key of EMOJI_GLYPH_ANIMATED_KEYS) {
      expect(key).toMatch(/^[0-9a-f]+(_[0-9a-f]+)*$/)
      expect(key).not.toContain('fe0f')
    }
  })
})
