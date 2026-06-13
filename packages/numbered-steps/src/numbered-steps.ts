/** A single step item in the numbered steps grid. */
export type NumberedStepItem = {
  /** Step title displayed prominently below the ordinal badge. */
  title: string
  /** Step body copy displayed below the title. */
  body: string
}

export interface NumberedStepsProps {
  /** The step items to display. */
  items: NumberedStepItem[]
  /**
   * Number of grid columns. When omitted, defaults to clamping the item count
   * to the 2–5 range via {@link stepColumns}.
   */
  columns?: number
}

export interface NumberedStepsAPI {
  /** ARIA attributes to spread on the container element (`role="list"`). */
  ariaProps: { role: 'list' }
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Zero-pad a 1-indexed ordinal to at least two digits.
 *
 * @example
 * padOrdinal(1)  // '01'
 * padOrdinal(10) // '10'
 */
export function padOrdinal(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Derive the number of grid columns from the item count.
 * Clamps the count to the 2–5 range.
 *
 * @example
 * stepColumns(3) // 3
 * stepColumns(1) // 2
 * stepColumns(6) // 5
 */
export function stepColumns(count: number): number {
  return Math.min(5, Math.max(2, count))
}

/**
 * Build the framework-agnostic container props for a numbered-steps grid.
 *
 * Returns `role="list"` plus data attributes; adapters spread these onto their
 * container and render each step as a `role="listitem"`.
 */
export function createNumberedSteps(): NumberedStepsAPI {
  const ariaProps = { role: 'list' } as const

  const dataAttributes: Record<string, string> = {
    'data-component': 'numbered-steps',
  }

  return { ariaProps, dataAttributes }
}
