/**
 * A single reaction in the tray. `TGlyph` is whatever the adapter can paint —
 * an emoji string everywhere, or a framework node (e.g. a React element) when
 * an adapter widens it.
 */
export interface ReactionTrayOptionData<TGlyph = string> {
  /** Stable identifier reported back on selection. */
  id: string
  /** What is painted in the cell (an emoji string or a framework node). */
  glyph: TGlyph
  /** Accessible name of the cell (e.g. "Thumbs up"). Never shown as the only cue. */
  label: string
  /** Whether the current user has already reacted with this option. */
  isActive?: boolean
}

/** Quick reactions shown before the rest move behind "More". */
export const REACTION_TRAY_DEFAULT_INLINE_COUNT = 6
/** WCAG 2.5.5 minimum target size: cells never render smaller than this. */
export const REACTION_TRAY_MIN_CELL_SIZE = 44
/** Default cell edge, in CSS pixels at the default root font size. */
export const REACTION_TRAY_DEFAULT_CELL_SIZE = 44
/** Default glyph size, in CSS pixels at the default root font size. */
export const REACTION_TRAY_DEFAULT_GLYPH_SIZE = 24
/** Browsers' default root font size; px inputs are converted to rem against it. */
export const REACTION_TRAY_ROOT_FONT_SIZE = 16
/** How long a selected glyph stays "popped" before settling back. */
export const REACTION_TRAY_POP_DURATION_MS = 180
export const REACTION_TRAY_DEFAULT_MORE_LABEL = 'More reactions'
export const REACTION_TRAY_DEFAULT_FEWER_LABEL = 'Fewer reactions'
export const REACTION_TRAY_DEFAULT_ARIA_LABEL = 'Reactions'

/** One navigable cell: either an option (by its index in `options`) or the More/Fewer toggle. */
export type ReactionTrayCell =
  | { type: 'option'; index: number; optionIndex: number }
  | { type: 'toggle'; index: number }

export interface ReactionTrayLayout {
  /** Cells per row; the first row is always the inline options plus the toggle. */
  columns: number
  /** Whether some options live behind the More/Fewer toggle. */
  hasOverflow: boolean
  /** Number of options rendered inline in the first row. */
  inlineCount: number
  /** Navigable index of the toggle, or -1 when there is no overflow. */
  toggleIndex: number
  /** All visible cells in navigation (reading) order. */
  cells: ReactionTrayCell[]
  /** `cells` split into rows of `columns`. */
  rows: ReactionTrayCell[][]
}

/** Clamp a requested inline count to `0..optionCount`, treating bad input as the default. */
export function resolveReactionTrayInlineCount(
  optionCount: number,
  inlineCount: number = REACTION_TRAY_DEFAULT_INLINE_COUNT,
): number {
  const requested = Number.isFinite(inlineCount)
    ? Math.floor(inlineCount)
    : REACTION_TRAY_DEFAULT_INLINE_COUNT
  return Math.min(Math.max(0, requested), Math.max(0, optionCount))
}

/**
 * Lay the tray out as a grid. The first row is the inline options followed by
 * the More/Fewer toggle, and the expanded options flow into rows of the same
 * width underneath. Keeping the toggle at a fixed position in the first row
 * means expanding or collapsing never moves it, so keyboard focus stays put.
 */
export function buildReactionTrayLayout(
  optionCount: number,
  inlineCount: number | undefined,
  expanded: boolean,
): ReactionTrayLayout {
  const total = Math.max(0, optionCount)
  const inline = resolveReactionTrayInlineCount(total, inlineCount)
  const hasOverflow = inline < total
  const cells: ReactionTrayCell[] = []

  for (let i = 0; i < inline; i++) {
    cells.push({ type: 'option', index: cells.length, optionIndex: i })
  }
  const toggleIndex = hasOverflow ? cells.length : -1
  if (hasOverflow) {
    cells.push({ type: 'toggle', index: cells.length })
    if (expanded) {
      for (let i = inline; i < total; i++) {
        cells.push({ type: 'option', index: cells.length, optionIndex: i })
      }
    }
  }

  const columns = Math.max(1, hasOverflow ? inline + 1 : inline)
  const rows: ReactionTrayCell[][] = []
  for (let start = 0; start < cells.length; start += columns) {
    rows.push(cells.slice(start, start + columns))
  }

  return { columns, hasOverflow, inlineCount: inline, toggleIndex, cells, rows }
}

export interface ReactionTrayNavigation {
  /** Number of navigable cells. */
  count: number
  /** Cells per row (full rows; only the last may be shorter). */
  columns: number
  /** Ctrl (or Cmd) held: Home/End then reach the whole grid's ends. */
  ctrlKey?: boolean
}

/**
 * Pure 2-D grid keyboard rule (WAI-ARIA grid pattern), shared by adapters.
 * Arrows never wrap past the grid's ends; unhandled keys return `current`.
 *
 * - ArrowRight / ArrowLeft → next / previous cell in reading order
 * - ArrowDown / ArrowUp    → same column in the next / previous row; Down onto a
 *                            shorter last row lands on its final cell
 * - Home / End             → first / last cell of the current row
 * - Ctrl+Home / Ctrl+End   → first / last cell of the grid
 */
export function getNextReactionTrayIndex(
  current: number,
  key: string,
  { count, columns, ctrlKey = false }: ReactionTrayNavigation,
): number {
  if (count <= 0) return current
  const cols = Math.max(1, Math.floor(columns))
  const last = count - 1
  const from = Math.min(Math.max(0, current), last)
  const rowStart = from - (from % cols)

  switch (key) {
    case 'ArrowRight':
      return Math.min(from + 1, last)
    case 'ArrowLeft':
      return Math.max(from - 1, 0)
    case 'ArrowDown':
      return moveDown(from, cols, last)
    case 'ArrowUp':
      return from - cols >= 0 ? from - cols : from
    case 'Home':
      return ctrlKey ? 0 : rowStart
    case 'End':
      return ctrlKey ? last : Math.min(rowStart + cols - 1, last)
    default:
      return current
  }
}

const REACTION_TRAY_NAVIGATION_KEYS: ReadonlySet<string> = new Set([
  'ArrowRight',
  'ArrowLeft',
  'ArrowDown',
  'ArrowUp',
  'Home',
  'End',
])

/**
 * Whether the grid owns this key. Adapters prevent the browser default for
 * these even at an edge, so an arrow press inside the grid never scrolls the page.
 */
export function isReactionTrayNavigationKey(key: string): boolean {
  return REACTION_TRAY_NAVIGATION_KEYS.has(key)
}

function moveDown(from: number, cols: number, last: number): number {
  if (from + cols <= last) return from + cols
  const onLastRow = Math.floor(from / cols) === Math.floor(last / cols)
  return onLastRow ? from : last
}

/** Keep a roving focus index inside the visible cells. */
export function clampReactionTrayIndex(index: number, count: number): number {
  if (count <= 0) return 0
  return Math.min(Math.max(0, index), count - 1)
}

/** Resolve a cell edge in px, never below the 44 px minimum target size. */
export function resolveReactionTrayCellSize(cellSize?: number): number {
  const requested =
    cellSize !== undefined && Number.isFinite(cellSize)
      ? cellSize
      : REACTION_TRAY_DEFAULT_CELL_SIZE
  return Math.max(REACTION_TRAY_MIN_CELL_SIZE, requested)
}

/** Resolve a glyph size in px, positive and never larger than its cell. */
export function resolveReactionTrayGlyphSize(
  glyphSize: number | undefined,
  cellSize: number,
): number {
  const requested =
    glyphSize !== undefined && Number.isFinite(glyphSize) && glyphSize > 0
      ? glyphSize
      : REACTION_TRAY_DEFAULT_GLYPH_SIZE
  return Math.min(requested, cellSize)
}

/** Convert a px measurement to a rem string so sizes follow the user's font setting. */
export function reactionTrayPxToRem(px: number): string {
  return `${px / REACTION_TRAY_ROOT_FONT_SIZE}rem`
}

export interface ReactionTrayProps {
  /** Accessible name of the grid. */
  ariaLabel?: string
  /** Whether the overflow options are revealed. */
  expanded: boolean
  /** Whether the tray has a More/Fewer toggle at all. */
  hasOverflow: boolean
}

export interface ReactionTrayAPI {
  /** Spread on the grid container. */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks on the container. */
  dataAttributes: Record<string, string>
  /** ARIA for an option's button: toggle semantics, named by its label. */
  getOptionAriaProps(
    option: Pick<ReactionTrayOptionData<unknown>, 'label' | 'isActive'>,
  ): Record<string, string | number | boolean>
  /** ARIA for the More/Fewer toggle, named for what it will do next. */
  getToggleAriaProps(labels: {
    moreLabel: string
    fewerLabel: string
  }): Record<string, string | number | boolean>
}

/** Framework-agnostic ARIA and data attributes for a reaction tray. */
export function createReactionTray(props: ReactionTrayProps): ReactionTrayAPI {
  const { ariaLabel = REACTION_TRAY_DEFAULT_ARIA_LABEL, expanded, hasOverflow } = props
  const state = expanded ? 'expanded' : 'collapsed'

  const ariaProps: Record<string, string | number | boolean> = {
    role: 'grid',
    'aria-label': ariaLabel,
  }

  const dataAttributes: Record<string, string> = {
    'data-state': hasOverflow ? state : 'static',
  }

  return {
    ariaProps,
    dataAttributes,
    getOptionAriaProps(option) {
      return { 'aria-pressed': option.isActive === true, 'aria-label': option.label }
    },
    getToggleAriaProps({ moreLabel, fewerLabel }) {
      return {
        'aria-expanded': expanded,
        'aria-label': expanded ? fewerLabel : moreLabel,
      }
    },
  }
}
