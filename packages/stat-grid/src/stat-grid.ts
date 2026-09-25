/** Semantic colour of a stat's value. */
export type StatTone = 'default' | 'positive' | 'negative' | 'caution'
/** `plain` = marketing callouts; `card` = bordered dashboard KPI cards. */
export type StatGridVariant = 'plain' | 'card'
/** Whether the label sits under the value (callout) or above it (KPI). */
export type StatGridLayout = 'value-first' | 'label-first'
/** Column count: a fixed maximum that reflows down on narrow screens, or `auto`. */
export type StatGridColumns = 1 | 2 | 3 | 4 | 'auto'

/** A single stat callout displayed in the grid. */
export type StatItem = {
  /** The primary value displayed prominently (e.g. "10k+", "$4.2M"). */
  value: string
  /** The descriptive label. */
  label: string
  /** Stable key; defaults to the index. */
  id?: string
  /** Optional line explaining the figure (how it was computed, a delta). */
  description?: string
  /** Colour of the value. Defaults to `default`. */
  tone?: StatTone
}

export interface StatGridAPI {
  /** ARIA attributes to spread on the grid container element (`role="list"`). */
  ariaProps: { role: 'list' }
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Compute the number of grid columns for a stat grid.
 *
 * - 1 item  → 1 column
 * - 2 items → 2 columns
 * - 3 or more items → capped at `max` (default 3)
 */
export function statColumns(count: number, max = 3): 1 | 2 | 3 | 4 {
  if (count <= 1) return 1
  if (count === 2) return 2
  return Math.min(count, max, 4) as 3 | 4
}

/** The cva key for a column setting (clamped to the supported 1–4). */
export function statColumnsKey(columns: StatGridColumns): '1' | '2' | '3' | '4' | 'auto' {
  if (columns === 'auto') return 'auto'
  return String(Math.min(Math.max(Math.round(columns), 1), 4)) as '1' | '2' | '3' | '4'
}

/**
 * Build the framework-agnostic container props for a stat grid.
 *
 * Returns `role="list"` and data attributes; adapters spread these onto their
 * container element and render the items themselves.
 */
export function createStatGrid(): StatGridAPI {
  return {
    ariaProps: { role: 'list' },
    dataAttributes: {},
  }
}
