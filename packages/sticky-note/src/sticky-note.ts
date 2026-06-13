/** The available color variants for a sticky note. */
export type StickyNoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange'

/** Ordered list of all sticky note colors — used for cycling and iteration. */
export const STICKY_NOTE_COLORS: StickyNoteColor[] = [
  'yellow',
  'pink',
  'blue',
  'green',
  'purple',
  'orange',
]

/**
 * Returns the next color in the cycle. Wraps from the last color back to the
 * first. Useful for "add note" flows that auto-assign colors in sequence.
 */
export function nextStickyColor(color: StickyNoteColor): StickyNoteColor {
  const index = STICKY_NOTE_COLORS.indexOf(color)
  const next = (index + 1) % STICKY_NOTE_COLORS.length
  return STICKY_NOTE_COLORS[next]
}

export interface CreateStickyNoteOptions {
  /** Color of the note. */
  color: StickyNoteColor
}

export interface StickyNoteAPI {
  /** Data attributes for styling hooks; spread onto the note container. */
  dataAttributes: { 'data-color': StickyNoteColor }
  /** ARIA props for the note container. */
  ariaProps: { role: 'group' }
}

/**
 * Build the framework-agnostic props for a sticky note container.
 *
 * Returns `role="group"` plus the `data-color` attribute that adapters use
 * as a styling hook. Logic is pure and SSR-safe — no Math.random, no Date.
 */
export function createStickyNote(options: CreateStickyNoteOptions): StickyNoteAPI {
  return {
    dataAttributes: { 'data-color': options.color },
    ariaProps: { role: 'group' },
  }
}
