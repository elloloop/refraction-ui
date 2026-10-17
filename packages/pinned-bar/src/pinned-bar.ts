/**
 * PinnedBar headless core — the pinned-items strip above a conversation.
 *
 * Navigation WRAPS (next on the last pin goes to the first, previous on the
 * first goes to the last). Two reasons:
 *  1. A clamped bar has to disable "next" on the last pin. Disabling the
 *     button the keyboard user just pressed drops their focus to <body>;
 *     wrapping keeps both controls enabled, so focus never moves.
 *  2. The bar is a small carousel over an unordered-feeling set; the visible
 *     "2 of 5" position tells the user where they are, so wrapping is never
 *     disorienting, and one "next" control reaches every pin.
 *
 * Indices that arrive from outside (a controlled `index`, or a stale index
 * after pins were removed) are CLAMPED, never wrapped: an out-of-range index
 * means "the list shrank under me", and the closest surviving pin is the one
 * the user expects to see — not one from the other end of the list.
 */

/** One pinned message. `id` is stable across re-renders and list changes. */
export interface PinnedBarItem {
  id: string
  /** Who wrote the pinned message. */
  author: string
  /** Plain-text excerpt of the message; truncated visually by the adapter. */
  snippet: string
}

/** Overridable strings. Functions receive 1-based positions. */
export interface PinnedBarLabels {
  /** Accessible name of the `role="region"` landmark. */
  region: string
  previous: string
  next: string
  openList: string
  unpin: string
  collapse: string
  expand: string
  /** Visible position text, e.g. "2 of 5". */
  position: (current: number, total: number) => string
  /** Text shown in place of the pin while collapsed, e.g. "5 pinned messages". */
  collapsedSummary: (total: number) => string
  /** Politely announced when the current pin changes. */
  announcement: (item: PinnedBarItem, position: string) => string
}

/** Where the bar was: the pin it showed and that pin's index at the time. */
export interface PinnedBarAnchor {
  id: string | undefined
  index: number
}

/** Index used when there is nothing to show. */
export const PINNED_BAR_NO_INDEX = -1

/**
 * Longest snippet read out by the live region. Screen readers read the whole
 * string; a pinned code block would otherwise monopolise speech. The visible
 * snippet is truncated with CSS instead and keeps its full text in the DOM.
 */
export const PINNED_BAR_ANNOUNCEMENT_SNIPPET_MAX_CHARS = 120

const ELLIPSIS = '…'
const WHITESPACE_RUN = /\s+/g

export const PINNED_BAR_DEFAULT_LABELS: PinnedBarLabels = {
  region: 'Pinned messages',
  previous: 'Previous pinned message',
  next: 'Next pinned message',
  openList: 'Show all pinned messages',
  unpin: 'Unpin message',
  collapse: 'Collapse pinned messages',
  expand: 'Expand pinned messages',
  position: (current, total) => `${current} of ${total}`,
  collapsedSummary: (total) =>
    total === 1 ? '1 pinned message' : `${total} pinned messages`,
  announcement: (item, position) =>
    `Pinned message ${position}. ${item.author}: ${truncatePinnedBarText(
      item.snippet,
      PINNED_BAR_ANNOUNCEMENT_SNIPPET_MAX_CHARS,
    )}`,
}

/** Merge partial overrides onto the defaults. */
export function resolvePinnedBarLabels(
  overrides: Partial<PinnedBarLabels> | undefined,
): PinnedBarLabels {
  return { ...PINNED_BAR_DEFAULT_LABELS, ...overrides }
}

/**
 * Clamp an externally supplied index into `[0, total - 1]`. Non-finite input
 * means "no preference" and resolves to the first pin; fractions floor.
 * Returns {@link PINNED_BAR_NO_INDEX} when there are no pins.
 */
export function clampPinnedBarIndex(index: number | undefined, total: number): number {
  if (total <= 0) return PINNED_BAR_NO_INDEX
  if (index === undefined || !Number.isFinite(index)) return 0
  return Math.min(Math.max(Math.floor(index), 0), total - 1)
}

/** The pin after `index`, wrapping from the last to the first. */
export function getNextPinnedBarIndex(index: number, total: number): number {
  if (total <= 0) return PINNED_BAR_NO_INDEX
  return (clampPinnedBarIndex(index, total) + 1) % total
}

/** The pin before `index`, wrapping from the first to the last. */
export function getPreviousPinnedBarIndex(index: number, total: number): number {
  if (total <= 0) return PINNED_BAR_NO_INDEX
  return (clampPinnedBarIndex(index, total) - 1 + total) % total
}

/**
 * Where the bar should be after `items` changed.
 *
 * - The anchored pin still exists → follow it to its new index (pins added or
 *   removed before it must not change what the user is looking at).
 * - The anchored pin was removed (e.g. unpinned) → stay at the same index, so
 *   the pin that slid into its place shows; if it was the last pin, clamp to
 *   the new last one.
 * - No pins left → {@link PINNED_BAR_NO_INDEX}.
 */
export function locatePinnedBarIndex(
  items: readonly PinnedBarItem[],
  anchor: PinnedBarAnchor,
): number {
  if (anchor.id !== undefined) {
    if (items[anchor.index]?.id === anchor.id) return anchor.index
    const moved = items.findIndex((item) => item.id === anchor.id)
    if (moved !== PINNED_BAR_NO_INDEX) return moved
  }
  return clampPinnedBarIndex(anchor.index, items.length)
}

/** Anchor for showing `index` of `items` (the shape uncontrolled state stores). */
export function createPinnedBarAnchor(
  items: readonly PinnedBarItem[],
  index: number | undefined,
): PinnedBarAnchor {
  const resolved = clampPinnedBarIndex(index, items.length)
  return { id: items[resolved]?.id, index: resolved }
}

/**
 * Collapse whitespace (pinned messages often span lines) and cut to
 * `maxChars`, ending with an ellipsis that counts toward the limit.
 */
export function truncatePinnedBarText(text: string, maxChars: number): string {
  const flat = text.replace(WHITESPACE_RUN, ' ').trim()
  if (maxChars <= 0) return ''
  if (flat.length <= maxChars) return flat
  return `${flat.slice(0, maxChars - ELLIPSIS.length).trimEnd()}${ELLIPSIS}`
}

export interface PinnedBarOptions {
  items: readonly PinnedBarItem[]
  /** The index to show (already located/clamped by the caller or not). */
  index: number
  collapsed?: boolean
  labels?: Partial<PinnedBarLabels>
}

export interface PinnedBarAPI {
  labels: PinnedBarLabels
  total: number
  /** Clamped current index, or {@link PINNED_BAR_NO_INDEX} when empty. */
  currentIndex: number
  currentItem: PinnedBarItem | undefined
  /** Visible position text ("2 of 5"); empty when there are no pins. */
  positionText: string
  /** Live-region text for the current pin; empty when there are no pins. */
  announcement: string
  /** Previous/next only make sense with two or more pins. */
  canNavigate: boolean
  nextIndex: number
  previousIndex: number
  /** Spread on the root element. */
  ariaProps: Record<string, string | number | boolean>
  dataAttributes: Record<string, string>
  /** Spread on the collapse toggle. */
  toggleAriaProps: Record<string, string | number | boolean>
  /** Label for the collapse toggle in its current state. */
  toggleLabel: string
}

export function createPinnedBar({
  items,
  index,
  collapsed = false,
  labels: labelOverrides,
}: PinnedBarOptions): PinnedBarAPI {
  const labels = resolvePinnedBarLabels(labelOverrides)
  const total = items.length
  const currentIndex = clampPinnedBarIndex(index, total)
  const currentItem = items[currentIndex]
  const positionText = currentItem ? labels.position(currentIndex + 1, total) : ''

  return {
    labels,
    total,
    currentIndex,
    currentItem,
    positionText,
    announcement: currentItem ? labels.announcement(currentItem, positionText) : '',
    canNavigate: total > 1,
    nextIndex: getNextPinnedBarIndex(currentIndex, total),
    previousIndex: getPreviousPinnedBarIndex(currentIndex, total),
    ariaProps: { role: 'region', 'aria-label': labels.region },
    dataAttributes: {
      'data-state': collapsed ? 'collapsed' : 'expanded',
      'data-count': String(total),
    },
    toggleAriaProps: { 'aria-expanded': !collapsed },
    toggleLabel: collapsed ? labels.expand : labels.collapse,
  }
}
