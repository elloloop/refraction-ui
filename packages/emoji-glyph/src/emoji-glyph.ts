import {
  DEFAULT_TWEMOJI_BASE_URL,
  twemojiAssetUrl,
  unicodeEmojiRuns,
} from '@refraction-ui/emoji-picker'
import { EMOJI_GLYPH_ANIMATED_KEYS } from './emoji-glyph-manifest.js'

/**
 * Default home of the animated Noto emoji: the Lottie files the Flutter
 * package bundles, served by jsDelivr from a pinned, immutable release tag.
 * The bytes are identical to Flutter's assets (one look on every platform),
 * the origin is the same CDN as the default Twemoji stills, and nothing
 * changes underneath a release. Self-host by copying
 * `packages/flutter/assets/emoji_animated/*.json` and passing its URL.
 */
export const EMOJI_GLYPH_ANIMATED_BASE_URL =
  'https://cdn.jsdelivr.net/gh/elloloop/refraction-ui@refraction_ui-v0.51.0/packages/flutter/assets/emoji_animated/'

/** File extension of one animated emoji (Lottie JSON). */
export const EMOJI_GLYPH_ANIMATED_EXTENSION = '.json'

/** Media query that, when it matches, forces the still glyph. */
export const EMOJI_GLYPH_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Size used when the caller gives none: follow the surrounding text. */
export const EMOJI_GLYPH_DEFAULT_SIZE = '1em'

/**
 * CSS pixels per rem at the browser default. Numeric sizes are given in
 * Flutter-style logical pixels and emitted as rem so they still scale with
 * the reader's root font size.
 */
export const EMOJI_GLYPH_PX_PER_REM = 16

/** Start loading animated art slightly before the glyph scrolls into view. */
export const EMOJI_GLYPH_PRELOAD_MARGIN = '128px'

const VARIATION_SELECTOR_16 = 0xfe0f
const VARIATION_SELECTOR_15 = '︎'
const HEX_RADIX = 16
const KEY_SEPARATOR = '_'

/** A glyph size: logical pixels (number) or any CSS length (string). */
export type EmojiGlyphSize = number | string

/** One way to draw an emoji, in the order the adapter tries them. */
export type EmojiGlyphSource =
  | { kind: 'animated'; key: string; url: string }
  | { kind: 'twemoji'; url: string }
  | { kind: 'native' }

export type EmojiGlyphSourceKind = EmojiGlyphSource['kind']

/** The art the resolver may choose from; injectable for tests and hosts. */
export interface EmojiGlyphManifests {
  /** Keys (see `emojiGlyphKey`) that have animated art. */
  animatedKeys: ReadonlySet<string>
  /** Whether a Twemoji still exists for exactly this emoji. */
  hasTwemojiArt: (emoji: string) => boolean
}

export interface ResolveEmojiGlyphOptions {
  /** Play animated art when it exists. Default `true`. */
  animate?: boolean
  /** The reader asked for reduced motion; always wins over `animate`. */
  reducedMotion?: boolean
  /** Directory holding `<key>.json` animated art. */
  animatedBaseUrl?: string
  /** Directory holding Twemoji SVG stills. */
  twemojiBaseUrl?: string
  /** Art manifests; defaults to the art the library ships. */
  manifests?: EmojiGlyphManifests
}

/**
 * Art key shared with Flutter: the code points in lowercase hex joined with
 * `_`, with U+FE0F left out — `❤️` → `2764`, `👍🏽` → `1f44d_1f3fd`.
 */
export function emojiGlyphKey(emoji: string): string {
  const parts: string[] = []
  for (const character of emoji) {
    const codePoint = character.codePointAt(0)
    if (codePoint === undefined || codePoint === VARIATION_SELECTOR_16) continue
    parts.push(codePoint.toString(HEX_RADIX))
  }
  return parts.join(KEY_SEPARATOR)
}

/** URL of one animated emoji under a base directory. */
export function emojiGlyphAnimatedUrl(
  key: string,
  baseUrl: string = EMOJI_GLYPH_ANIMATED_BASE_URL,
): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${base}${key}${EMOJI_GLYPH_ANIMATED_EXTENSION}`
}

/** True when Twemoji draws `emoji` as one complete grapheme. */
export function hasEmojiGlyphTwemojiArt(emoji: string): boolean {
  const runs = unicodeEmojiRuns(emoji)
  return runs.length === 1 && runs[0].emoji === emoji
}

/** The art the library ships: the animated Noto set and the Twemoji stills. */
export const EMOJI_GLYPH_MANIFESTS: EmojiGlyphManifests = {
  animatedKeys: EMOJI_GLYPH_ANIMATED_KEYS,
  hasTwemojiArt: hasEmojiGlyphTwemojiArt,
}

/**
 * The fallback chain for one emoji, best first: animated Noto art (when it
 * exists and motion is allowed), then the Twemoji still, then the native
 * glyph, which always closes the chain. Every emoji goes through this one
 * path, so adding a key to the manifest is all it takes to animate it.
 */
export function resolveEmojiGlyphSources(
  emoji: string,
  options: ResolveEmojiGlyphOptions = {},
): EmojiGlyphSource[] {
  const {
    animate = true,
    reducedMotion = false,
    animatedBaseUrl = EMOJI_GLYPH_ANIMATED_BASE_URL,
    twemojiBaseUrl = DEFAULT_TWEMOJI_BASE_URL,
    manifests = EMOJI_GLYPH_MANIFESTS,
  } = options
  const native: EmojiGlyphSource = { kind: 'native' }
  // U+FE0E asks for the text (monochrome) presentation: never swap in art.
  if (emoji.length === 0 || emoji.includes(VARIATION_SELECTOR_15)) return [native]

  const sources: EmojiGlyphSource[] = []
  const key = emojiGlyphKey(emoji)
  if (animate && !reducedMotion && manifests.animatedKeys.has(key)) {
    sources.push({ kind: 'animated', key, url: emojiGlyphAnimatedUrl(key, animatedBaseUrl) })
  }
  if (manifests.hasTwemojiArt(emoji)) {
    sources.push({ kind: 'twemoji', url: twemojiAssetUrl(emoji, twemojiBaseUrl) })
  }
  sources.push(native)
  return sources
}

/**
 * CSS length for a glyph size. Numbers are logical pixels emitted as rem;
 * strings pass through; missing or non-positive sizes follow the text (`1em`).
 */
export function emojiGlyphCssSize(size: EmojiGlyphSize | undefined): string {
  if (typeof size === 'string') return size.trim() === '' ? EMOJI_GLYPH_DEFAULT_SIZE : size
  if (size === undefined || !Number.isFinite(size) || size <= 0) return EMOJI_GLYPH_DEFAULT_SIZE
  return `${size / EMOJI_GLYPH_PX_PER_REM}rem`
}

/** Which layer is visible, given what has finished loading. */
export function getVisibleEmojiGlyphSource(state: {
  animationReady: boolean
  stillLoaded: boolean
}): EmojiGlyphSourceKind {
  if (state.animationReady) return 'animated'
  if (state.stillLoaded) return 'twemoji'
  return 'native'
}
