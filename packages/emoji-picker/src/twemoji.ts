/**
 * Twemoji asset resolution — maps a native emoji glyph to its Twemoji SVG
 * filename/URL. This is the data half of the `emojiRenderer` seam: it lets the
 * React/Astro adapters render a UNIFORM emoji set (one look on every OS) instead
 * of per-platform native glyphs, WhatsApp-style, by lazily loading one small SVG
 * per glyph from a CDN (or a self-hosted mirror) — nothing is bundled eagerly.
 *
 * Twemoji graphics are © Twitter / the Twemoji contributors, licensed CC-BY 4.0.
 * Consumers rendering with Twemoji must preserve that attribution (see the
 * package README / NOTICE).
 *
 * The filename algorithm mirrors upstream `twemoji.toCodePoint`: surrogate
 * pairs are combined to codepoints, and the U+FE0F variation selector is
 * stripped from non-ZWJ sequences (Twemoji names files without it).
 */

/** Default CDN base for Twemoji SVG assets (jsDelivr, pinned). */
export const DEFAULT_TWEMOJI_BASE_URL =
  'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/'

const ZWJ = '‍'
const VARIATION_SELECTOR_16 = /️/g

/** Combine surrogate pairs into dash-joined lowercase hex codepoints. */
function toCodePoint(input: string): string {
  const parts: string[] = []
  let pending = 0
  let i = 0
  while (i < input.length) {
    const c = input.charCodeAt(i++)
    if (pending) {
      parts.push((0x10000 + ((pending - 0xd800) << 10) + (c - 0xdc00)).toString(16))
      pending = 0
    } else if (c >= 0xd800 && c <= 0xdbff) {
      pending = c
    } else {
      parts.push(c.toString(16))
    }
  }
  return parts.join('-')
}

/**
 * Twemoji asset filename (without extension) for a glyph, e.g. `1f600`,
 * `1f1fa-1f1f8`, `2764` (heart, FE0F stripped).
 */
export function twemojiFilename(emoji: string): string {
  // Keep FE0F only for ZWJ sequences, matching upstream Twemoji naming.
  const normalized = emoji.indexOf(ZWJ) < 0 ? emoji.replace(VARIATION_SELECTOR_16, '') : emoji
  return toCodePoint(normalized)
}

/** Full Twemoji SVG URL for a glyph. */
export function twemojiAssetUrl(
  emoji: string,
  baseUrl: string = DEFAULT_TWEMOJI_BASE_URL,
): string {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${base}${twemojiFilename(emoji)}.svg`
}
