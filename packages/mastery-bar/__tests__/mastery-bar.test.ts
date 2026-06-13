import { describe, it, expect } from 'vitest'
import { clampPercent, createMasteryBar } from '../src/index.js'

describe('clampPercent', () => {
  it('clamps negative values to 0', () => {
    expect(clampPercent(-5)).toBe(0)
  })

  it('passes through in-range values unchanged', () => {
    expect(clampPercent(50)).toBe(50)
  })

  it('clamps values above 100 to 100', () => {
    expect(clampPercent(120)).toBe(100)
  })

  it('treats NaN as 0', () => {
    expect(clampPercent(NaN)).toBe(0)
  })

  it('preserves boundary values exactly', () => {
    expect(clampPercent(0)).toBe(0)
    expect(clampPercent(100)).toBe(100)
  })
})

describe('createMasteryBar', () => {
  it('returns role=progressbar in ariaProps', () => {
    const { ariaProps } = createMasteryBar({ value: 42 })
    expect(ariaProps['role']).toBe('progressbar')
  })

  it('sets aria-valuenow to the clamped value', () => {
    expect(createMasteryBar({ value: 75 }).ariaProps['aria-valuenow']).toBe(75)
    expect(createMasteryBar({ value: -10 }).ariaProps['aria-valuenow']).toBe(0)
    expect(createMasteryBar({ value: 150 }).ariaProps['aria-valuenow']).toBe(100)
  })

  it('sets aria-valuemin=0 and aria-valuemax=100', () => {
    const { ariaProps } = createMasteryBar({ value: 50 })
    expect(ariaProps['aria-valuemin']).toBe(0)
    expect(ariaProps['aria-valuemax']).toBe(100)
  })

  it('emits data-value as a string of the clamped value', () => {
    expect(createMasteryBar({ value: 30 }).dataAttributes['data-value']).toBe('30')
  })
})
