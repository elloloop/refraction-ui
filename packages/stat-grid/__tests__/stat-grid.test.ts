import { describe, it, expect } from 'vitest'
import { statColumns, createStatGrid } from '../src/index.js'

describe('statColumns', () => {
  it('returns 1 for a single item', () => {
    expect(statColumns(1)).toBe(1)
  })

  it('returns 2 for two items', () => {
    expect(statColumns(2)).toBe(2)
  })

  it('returns 3 for three items', () => {
    expect(statColumns(3)).toBe(3)
  })

  it('caps at 3 for five items (default max)', () => {
    expect(statColumns(5)).toBe(3)
  })

  it('respects a custom max', () => {
    expect(statColumns(5, 4)).toBe(4)
    expect(statColumns(2, 4)).toBe(2)
  })

  it('returns 1 for zero or negative counts', () => {
    expect(statColumns(0)).toBe(1)
  })
})

describe('createStatGrid', () => {
  it('returns role="list" in ariaProps', () => {
    const { ariaProps } = createStatGrid()
    expect(ariaProps.role).toBe('list')
  })

  it('returns an empty dataAttributes object', () => {
    const { dataAttributes } = createStatGrid()
    expect(dataAttributes).toEqual({})
  })
})
