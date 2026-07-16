/**
 * Emoji system — shortcode to unicode mapping and search.
 *
 * The map is derived from the single shared emoji dataset in
 * `@refraction-ui/emoji-picker` (`buildShortcodeMap`), so rich-editor, the
 * emoji picker, and the composer's `:` trigger all resolve `:shortcode:` the
 * same way — the ~120-entry hand-list that used to live here (and diverge from
 * the picker) is gone. Popular aliases (`:smile:`, `:joy:`, `:100:`) live in
 * the shared dataset's `SHORTCODE_ALIASES`.
 */
import { buildShortcodeMap } from '@refraction-ui/emoji-picker'

// ---------------------------------------------------------------------------
// Emoji map
// ---------------------------------------------------------------------------

/** `:shortcode:` → glyph, built from the shared dataset (full set + aliases). */
export const EMOJI_MAP: Record<string, string> = buildShortcodeMap()

// ---------------------------------------------------------------------------
// Detection and search
// ---------------------------------------------------------------------------

/**
 * Detect if a text ends with a completed emoji shortcode like `:smile:`.
 * Returns the shortcode and its unicode value if found, null otherwise.
 */
export function detectEmojiShortcode(
  text: string,
): { shortcode: string; unicode: string } | null {
  // Look for a pattern like :word: at the end of text
  const match = text.match(/:([a-z0-9_]+):$/)
  if (!match) return null

  const shortcode = `:${match[1]}:`
  const unicode = EMOJI_MAP[shortcode]
  if (!unicode) return null

  return { shortcode, unicode }
}

/**
 * Search emoji by partial query (matches against shortcode names).
 */
export function searchEmoji(
  query: string,
): { shortcode: string; unicode: string }[] {
  const q = query.toLowerCase().replace(/^:/, '').replace(/:$/, '')
  if (q === '') {
    return Object.entries(EMOJI_MAP).map(([shortcode, unicode]) => ({ shortcode, unicode }))
  }

  return Object.entries(EMOJI_MAP)
    .filter(([shortcode]) => {
      const name = shortcode.slice(1, -1) // remove colons
      return name.includes(q)
    })
    .map(([shortcode, unicode]) => ({ shortcode, unicode }))
    .sort((a, b) => {
      const aName = a.shortcode.slice(1, -1)
      const bName = b.shortcode.slice(1, -1)
      // Exact start match first
      const aStarts = aName.startsWith(q)
      const bStarts = bName.startsWith(q)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      return aName.localeCompare(bName)
    })
}
