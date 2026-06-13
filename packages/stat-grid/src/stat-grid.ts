/** A single stat callout displayed in the grid. */
export type StatItem = {
  /** The primary value displayed prominently (e.g. "10k+", "$4.2M"). */
  value: string
  /** The descriptive label shown below the value. */
  label: string
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
export function statColumns(count: number, max = 3): number {
  if (count <= 0) return 1
  if (count === 1) return 1
  if (count === 2) return 2
  return Math.min(count, max)
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
