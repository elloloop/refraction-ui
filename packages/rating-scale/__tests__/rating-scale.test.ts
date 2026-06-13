import { describe, it, expect } from 'vitest'
import {
  createRatingScale,
  resolveRatingPoints,
  getNextRatingIndex,
} from '../src/index.js'

describe('createRatingScale', () => {
  it('exposes radiogroup role and size data attribute', () => {
    const { ariaProps, dataAttributes } = createRatingScale({ size: 'sm' })
    expect(ariaProps.role).toBe('radiogroup')
    expect(dataAttributes['data-size']).toBe('sm')
    expect(dataAttributes['data-value']).toBeUndefined()
  })

  it('emits data-value only when a value is set', () => {
    expect(createRatingScale({ value: 3 }).dataAttributes['data-value']).toBe('3')
  })
})

describe('resolveRatingPoints', () => {
  it('builds 1..count when no explicit points', () => {
    expect(resolveRatingPoints(undefined, 5).map((p) => p.value)).toEqual([
      1, 2, 3, 4, 5,
    ])
  })

  it('defaults to a 5-point scale', () => {
    expect(resolveRatingPoints(undefined)).toHaveLength(5)
  })

  it('prefers explicit points', () => {
    const pts = [
      { value: 1, label: 'low' },
      { value: 2, label: 'high' },
    ]
    expect(resolveRatingPoints(pts, 5)).toBe(pts)
  })
})

describe('getNextRatingIndex', () => {
  it('clamps at the ends (no wrap)', () => {
    expect(getNextRatingIndex(4, 'ArrowRight', 5)).toBe(4)
    expect(getNextRatingIndex(0, 'ArrowLeft', 5)).toBe(0)
  })

  it('moves within range', () => {
    expect(getNextRatingIndex(1, 'ArrowRight', 5)).toBe(2)
    expect(getNextRatingIndex(2, 'ArrowDown', 5)).toBe(1)
  })

  it('Home/End jump to extremes', () => {
    expect(getNextRatingIndex(3, 'Home', 5)).toBe(0)
    expect(getNextRatingIndex(1, 'End', 5)).toBe(4)
  })

  it('returns current for unhandled keys or empty scale', () => {
    expect(getNextRatingIndex(2, 'Enter', 5)).toBe(2)
    expect(getNextRatingIndex(0, 'ArrowRight', 0)).toBe(0)
  })
})
