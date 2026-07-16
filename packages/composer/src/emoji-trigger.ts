/**
 * `createEmojiTrigger` — a ready-made `:` shortcode trigger backed by the shared
 * emoji dataset (`@refraction-ui/emoji-picker`, ~1900 base emoji), so the
 * composer's `:` menu is complete and matches the picker exactly (one source of
 * truth, no divergence). The committed token is the native glyph.
 *
 * This module is side-effect free and imports the dataset lazily via the emoji
 * search API, so it is only pulled into a bundle when `createEmojiTrigger` is
 * actually referenced.
 */
import { searchEmojis } from '@refraction-ui/emoji-picker'
import type { ComposerCandidate, ComposerTrigger } from './types.js'

export interface EmojiTriggerOptions {
  /** Trigger id. Default 'emoji'. */
  id?: string
  /** Symbol. Default ':'. */
  symbol?: string
  /** Max results surfaced to the menu. Default 8. */
  maxResults?: number
  /**
   * Minimum query length before resolving (avoids flooding the menu with the
   * whole set on a lone ':'). Default 1.
   */
  minQueryLength?: number
}

/**
 * Build a `:` emoji trigger. Typing `:fir` filters the full set; committing
 * inserts the glyph (🔥). Pair it with the picker for the same coverage in both
 * surfaces.
 */
export function createEmojiTrigger(options: EmojiTriggerOptions = {}): ComposerTrigger {
  const { id = 'emoji', symbol = ':', maxResults = 8, minQueryLength = 1 } = options
  return {
    id,
    symbol,
    // The committed token is the glyph itself, not `:name:`.
    toDisplay: (candidate: ComposerCandidate) =>
      (candidate.metadata?.emoji as string | undefined) ?? candidate.display,
    resolve: (query: string): ComposerCandidate[] => {
      if (query.length < minQueryLength) return []
      return searchEmojis(query, maxResults).map((entry) => ({
        id: `${entry.shortcode}`,
        display: `${entry.emoji} :${entry.shortcode}:`,
        subtitle: entry.name,
        metadata: { emoji: entry.emoji, shortcode: entry.shortcode },
      }))
    },
  }
}
