/** A single item in a checklist. */
export interface ChecklistItemData {
  /** Unique identifier for this item. */
  id: string
  /** Display label for the item. */
  label: string
  /** Whether the item is completed. */
  checked?: boolean
  /** Optional additional description text. */
  description?: string
}

export interface ChecklistAPI {
  /** ARIA attributes to spread on the list container (`role="list"`). */
  ariaProps: { role: 'list' }
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic container props for a checklist.
 *
 * Returns `role="list"` plus a `data-component` attribute. Adapters spread
 * these onto their container element.
 */
export function createChecklist(): ChecklistAPI {
  return {
    ariaProps: { role: 'list' },
    dataAttributes: { 'data-component': 'checklist' },
  }
}

/**
 * Compute progress statistics for a checklist.
 *
 * Pure function — does not mutate the array.
 */
export function checklistProgress(items: ChecklistItemData[]): {
  completed: number
  total: number
  fraction: number
} {
  const total = items.length
  const completed = items.filter((item) => item.checked).length
  const fraction = total === 0 ? 0 : completed / total
  return { completed, total, fraction }
}

/**
 * Toggle a single item's `checked` state by id.
 *
 * Pure — returns a new array; the original is not mutated.
 * Items whose id does not match are returned unchanged (same reference).
 */
export function toggleChecklistItem(
  items: ChecklistItemData[],
  id: string,
): ChecklistItemData[] {
  return items.map((item) =>
    item.id === id ? { ...item, checked: !item.checked } : item,
  )
}
