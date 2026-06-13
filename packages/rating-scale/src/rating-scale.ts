import type { AccessibilityProps } from '@refraction-ui/shared'

/** Visual size of a rating scale. */
export type RatingScaleSize = 'sm' | 'md'

/** A single selectable point on the scale (1-indexed value + accessible label). */
export interface RatingScalePoint {
  /** The value this point represents. */
  value: number
  /** Accessible label for the point (falls back to the value). */
  label?: string
}

export interface RatingScaleProps {
  /** Currently selected value (controlled). */
  value?: number
  /** Number of points on the scale. Ignored when {@link points} is given. */
  count?: number
  /** Visual size. */
  size?: RatingScaleSize
}

export interface RatingScaleAPI {
  /** ARIA attributes to spread on the group element (`role="radiogroup"`). */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic group props for a rating / Likert scale.
 *
 * Returns `role="radiogroup"` plus data attributes; adapters spread these onto
 * their container and render the points themselves. A rating scale is a
 * single-select control with radio semantics, like a segmented control, but
 * tuned for ordinal self-rating (e.g. a 1–5 Likert prompt with end labels).
 */
export function createRatingScale(props: RatingScaleProps = {}): RatingScaleAPI {
  const { value, size = 'md' } = props

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'radiogroup',
  }

  const dataAttributes: Record<string, string> = {
    'data-size': size,
  }
  if (value !== undefined) {
    dataAttributes['data-value'] = String(value)
  }

  return { ariaProps, dataAttributes }
}

/**
 * Resolve the list of points for a scale from either an explicit list or a
 * `count` (producing `1..count`). The single source of truth shared by every
 * adapter so a `count={5}` scale renders identical points everywhere.
 */
export function resolveRatingPoints(
  points: RatingScalePoint[] | undefined,
  count = 5,
): RatingScalePoint[] {
  if (points && points.length > 0) return points
  return Array.from({ length: Math.max(0, count) }, (_, i) => ({ value: i + 1 }))
}

/**
 * Pure keyboard-navigation rule shared by every adapter.
 *
 * Unlike a wrapping segmented control, an ordinal rating scale **clamps** at
 * the ends (you can't wrap from "5 — strongly agree" back to "1"). Home/End
 * jump to the extremes; unhandled keys return `current` unchanged.
 *
 * - ArrowRight / ArrowUp   → next (clamped to last)
 * - ArrowLeft  / ArrowDown → previous (clamped to first)
 * - Home                   → first
 * - End                    → last
 */
export function getNextRatingIndex(
  current: number,
  key: string,
  count: number,
): number {
  if (count <= 0) return current

  switch (key) {
    case 'ArrowRight':
    case 'ArrowUp':
      return Math.min(current + 1, count - 1)
    case 'ArrowLeft':
    case 'ArrowDown':
      return Math.max(current - 1, 0)
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return current
  }
}
