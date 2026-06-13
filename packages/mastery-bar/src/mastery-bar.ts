/** Visual size of a mastery bar. */
export type MasteryBarSize = 'sm' | 'md' | 'lg'

export interface MasteryBarProps {
  /** Progress value (0–100). Values outside this range are clamped. */
  value: number
  /** Label shown on the right side of the header row. */
  label?: string
  /** Label shown on the left side of the header row. */
  leadingLabel?: string
  /** Visual size of the track. */
  size?: MasteryBarSize
  /** Renders the fill at reduced opacity to indicate a muted/secondary state. */
  muted?: boolean
}

export interface MasteryBarAPI {
  /** ARIA attributes to spread on the progressbar element. */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Clamp a raw numeric value to the [0, 100] range.
 *
 * Values below 0 become 0; values above 100 become 100; NaN is treated as 0.
 */
export function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}

/**
 * Build the framework-agnostic progressbar props for a mastery bar.
 *
 * Returns `role="progressbar"` ARIA attributes plus data attributes; adapters
 * spread these onto their track element.
 */
export function createMasteryBar({ value }: Pick<MasteryBarProps, 'value'>): MasteryBarAPI {
  const clamped = clampPercent(value)

  const ariaProps: Record<string, string | number | boolean> = {
    role: 'progressbar',
    'aria-valuenow': clamped,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
  }

  const dataAttributes: Record<string, string> = {
    'data-value': String(clamped),
  }

  return { ariaProps, dataAttributes }
}
