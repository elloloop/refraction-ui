import { describe, it, expect } from 'vitest'
import {
  reorder,
  getNextOrderIndex,
  createSortableList,
} from '../src/index.js'

describe('reorder', () => {
  it('moves an item forward', () => {
    expect(reorder(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
  })

  it('moves an item backward', () => {
    expect(reorder(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b'])
  })

  it('returns a copy when from === to', () => {
    const arr = ['a', 'b']
    const result = reorder(arr, 1, 1)
    expect(result).toEqual(['a', 'b'])
    expect(result).not.toBe(arr)
  })

  it('is immutable — original array is unchanged', () => {
    const arr = ['x', 'y', 'z']
    reorder(arr, 0, 2)
    expect(arr).toEqual(['x', 'y', 'z'])
  })

  it('returns a copy unchanged when from index is out of range', () => {
    expect(reorder(['a', 'b'], -1, 0)).toEqual(['a', 'b'])
    expect(reorder(['a', 'b'], 5, 0)).toEqual(['a', 'b'])
  })

  it('returns a copy unchanged when to index is out of range', () => {
    expect(reorder(['a', 'b'], 0, -1)).toEqual(['a', 'b'])
    expect(reorder(['a', 'b'], 0, 5)).toEqual(['a', 'b'])
  })

  it('returns a copy for an empty array', () => {
    const arr: string[] = []
    const result = reorder(arr, 0, 0)
    expect(result).toEqual([])
    expect(result).not.toBe(arr)
  })
})

describe('getNextOrderIndex', () => {
  it('ArrowUp decrements (clamped at 0)', () => {
    expect(getNextOrderIndex(2, 'ArrowUp', 5)).toBe(1)
    expect(getNextOrderIndex(0, 'ArrowUp', 5)).toBe(0)
  })

  it('ArrowLeft decrements (clamped at 0)', () => {
    expect(getNextOrderIndex(1, 'ArrowLeft', 5)).toBe(0)
    expect(getNextOrderIndex(0, 'ArrowLeft', 5)).toBe(0)
  })

  it('ArrowDown increments (clamped at count-1)', () => {
    expect(getNextOrderIndex(2, 'ArrowDown', 5)).toBe(3)
    expect(getNextOrderIndex(4, 'ArrowDown', 5)).toBe(4)
  })

  it('ArrowRight increments (clamped at count-1)', () => {
    expect(getNextOrderIndex(3, 'ArrowRight', 5)).toBe(4)
    expect(getNextOrderIndex(4, 'ArrowRight', 5)).toBe(4)
  })

  it('Home jumps to 0', () => {
    expect(getNextOrderIndex(3, 'Home', 5)).toBe(0)
    expect(getNextOrderIndex(0, 'Home', 5)).toBe(0)
  })

  it('End jumps to count-1', () => {
    expect(getNextOrderIndex(1, 'End', 5)).toBe(4)
    expect(getNextOrderIndex(4, 'End', 5)).toBe(4)
  })

  it('returns current for unhandled keys', () => {
    expect(getNextOrderIndex(2, 'Enter', 5)).toBe(2)
    expect(getNextOrderIndex(2, 'Space', 5)).toBe(2)
    expect(getNextOrderIndex(2, 'Tab', 5)).toBe(2)
  })

  it('returns current (clamped) for empty list', () => {
    expect(getNextOrderIndex(0, 'ArrowDown', 0)).toBe(0)
  })

  it('does NOT wrap — no circular navigation', () => {
    expect(getNextOrderIndex(4, 'ArrowDown', 5)).toBe(4)
    expect(getNextOrderIndex(0, 'ArrowUp', 5)).toBe(0)
  })
})

describe('createSortableList', () => {
  it('exposes role=list in ariaProps', () => {
    const { ariaProps } = createSortableList()
    expect(ariaProps.role).toBe('list')
  })

  it('exposes data-component data attribute', () => {
    const { dataAttributes } = createSortableList()
    expect(dataAttributes['data-component']).toBe('sortable-list')
  })
})
