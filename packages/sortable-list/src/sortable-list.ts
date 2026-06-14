/**
 * Pure, JSX-free headless logic for a drag-to-reorder vertical list.
 *
 * Three exports:
 *   - `reorder`           — immutable array move, clamped
 *   - `getNextOrderIndex` — keyboard navigation rule (clamped, no wrap)
 *   - `createSortableList` — builds ARIA props for the list container
 */

export interface SortableListAPI {
  /** ARIA attributes to spread on the list element. */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Move an item from index `from` to index `to` in `items`, returning a new
 * array. Out-of-range indices return a shallow copy of the original array
 * (no mutation, no throw).
 */
export function reorder<T>(items: T[], from: number, to: number): T[] {
  const len = items.length
  if (
    len === 0 ||
    from < 0 ||
    from >= len ||
    to < 0 ||
    to >= len ||
    from === to
  ) {
    return [...items]
  }
  const result = [...items]
  const [moved] = result.splice(from, 1)
  result.splice(to, 0, moved)
  return result
}

/**
 * Keyboard reorder navigation — returns the next index for a given key.
 *
 * - ArrowUp / ArrowLeft   → max(0, current - 1)
 * - ArrowDown / ArrowRight → min(count - 1, current + 1)
 * - Home → 0
 * - End → count - 1
 * - All other keys / empty list → current (clamped to valid range)
 *
 * Never wraps.
 */
export function getNextOrderIndex(
  current: number,
  key: string,
  count: number,
): number {
  if (count <= 0) return current
  const clamped = Math.max(0, Math.min(current, count - 1))

  switch (key) {
    case 'ArrowUp':
    case 'ArrowLeft':
      return Math.max(0, clamped - 1)
    case 'ArrowDown':
    case 'ArrowRight':
      return Math.min(count - 1, clamped + 1)
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return clamped
  }
}

/**
 * Build the framework-agnostic props for a sortable list container.
 *
 * Returns `role="list"` so screen readers announce the number of items
 * correctly, plus a `data-component` hook for styling.
 */
export function createSortableList(): SortableListAPI {
  return {
    ariaProps: {
      role: 'list',
    },
    dataAttributes: {
      'data-component': 'sortable-list',
    },
  }
}
