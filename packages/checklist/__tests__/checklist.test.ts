import { describe, it, expect } from 'vitest'
import {
  createChecklist,
  checklistProgress,
  toggleChecklistItem,
  type ChecklistItemData,
} from '../src/index.js'

const ITEMS: ChecklistItemData[] = [
  { id: 'a', label: 'Alpha', checked: true },
  { id: 'b', label: 'Beta', checked: false },
  { id: 'c', label: 'Gamma', checked: true },
]

describe('createChecklist', () => {
  it('exposes role="list"', () => {
    const { ariaProps } = createChecklist()
    expect(ariaProps.role).toBe('list')
  })

  it('includes a data-component attribute', () => {
    const { dataAttributes } = createChecklist()
    expect(dataAttributes['data-component']).toBe('checklist')
  })
})

describe('checklistProgress', () => {
  it('counts completed and total items', () => {
    const { completed, total } = checklistProgress(ITEMS)
    expect(completed).toBe(2)
    expect(total).toBe(3)
  })

  it('computes the fraction correctly', () => {
    expect(checklistProgress(ITEMS).fraction).toBeCloseTo(2 / 3)
  })

  it('returns 0 fraction for an empty list', () => {
    const { completed, total, fraction } = checklistProgress([])
    expect(completed).toBe(0)
    expect(total).toBe(0)
    expect(fraction).toBe(0)
  })

  it('returns fraction 1 when all items are checked', () => {
    const all = ITEMS.map((i) => ({ ...i, checked: true }))
    expect(checklistProgress(all).fraction).toBe(1)
  })

  it('treats items without a checked field as unchecked', () => {
    const items: ChecklistItemData[] = [{ id: 'x', label: 'X' }]
    expect(checklistProgress(items).completed).toBe(0)
  })
})

describe('toggleChecklistItem', () => {
  it('flips the checked state of the matching item', () => {
    const result = toggleChecklistItem(ITEMS, 'b')
    expect(result.find((i) => i.id === 'b')?.checked).toBe(true)
  })

  it('does not mutate the original array', () => {
    const copy = ITEMS.map((i) => ({ ...i }))
    toggleChecklistItem(ITEMS, 'a')
    expect(ITEMS[0].checked).toBe(copy[0].checked)
  })

  it('leaves non-matching items as the same reference', () => {
    const result = toggleChecklistItem(ITEMS, 'a')
    expect(result[1]).toBe(ITEMS[1])
    expect(result[2]).toBe(ITEMS[2])
  })

  it('toggles checked → unchecked', () => {
    const result = toggleChecklistItem(ITEMS, 'a')
    expect(result.find((i) => i.id === 'a')?.checked).toBe(false)
  })

  it('is a no-op for an unknown id', () => {
    const result = toggleChecklistItem(ITEMS, 'z')
    result.forEach((item, i) => expect(item).toBe(ITEMS[i]))
  })
})
