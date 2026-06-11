import type { AccessibilityProps } from '@refraction-ui/shared'

export type SegmentedControlSize = 'sm' | 'md'

/** Value identifying a single segment. */
export type SegmentedControlValue = string

export interface SegmentedControlProps {
  /** Currently selected segment value (controlled). */
  value?: SegmentedControlValue
  /** Visual size of the control. */
  size?: SegmentedControlSize
}

export interface SegmentedControlAPI {
  /** ARIA attributes to spread on the group element. */
  ariaProps: Partial<AccessibilityProps>
  /** Data attributes for CSS styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic group props for a segmented control.
 *
 * Returns `role="radiogroup"` plus data attributes; adapters spread these
 * onto their group element and handle their own rendering/state.
 */
export function createSegmentedControl(
  props: SegmentedControlProps = {},
): SegmentedControlAPI {
  const { value, size = 'md' } = props

  const ariaProps: Partial<AccessibilityProps> = {
    role: 'radiogroup',
  }

  const dataAttributes: Record<string, string> = {
    'data-size': size,
  }
  if (value !== undefined) {
    dataAttributes['data-value'] = value
  }

  return { ariaProps, dataAttributes }
}

/**
 * Pure keyboard-navigation rule shared by every adapter.
 *
 * Given the current index, the pressed key, and the item count, returns the
 * index that focus/selection should move to. Arrow keys wrap; Home/End jump
 * to the ends. Unhandled keys (or an empty group) return `current` unchanged.
 *
 * - ArrowRight / ArrowDown → next (wraps to 0 past the end)
 * - ArrowLeft  / ArrowUp   → previous (wraps to last before 0)
 * - Home                   → first
 * - End                    → last
 */
export function getNextSegmentIndex(
  current: number,
  key: string,
  count: number,
): number {
  if (count <= 0) return current

  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return current
  }
}
