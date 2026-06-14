import { describe, it, expect } from 'vitest'
import {
  padOrdinal,
  stepColumns,
  createNumberedSteps,
} from '../src/index.js'

describe('padOrdinal', () => {
  it('zero-pads single-digit numbers', () => {
    expect(padOrdinal(1)).toBe('01')
    expect(padOrdinal(9)).toBe('09')
  })

  it('does not pad two-digit numbers', () => {
    expect(padOrdinal(10)).toBe('10')
    expect(padOrdinal(12)).toBe('12')
  })
})

describe('stepColumns', () => {
  it('clamps below 2 up to 2', () => {
    expect(stepColumns(1)).toBe(2)
    expect(stepColumns(0)).toBe(2)
  })

  it('passes through counts in range 2–5', () => {
    expect(stepColumns(2)).toBe(2)
    expect(stepColumns(3)).toBe(3)
    expect(stepColumns(4)).toBe(4)
    expect(stepColumns(5)).toBe(5)
  })

  it('clamps above 5 to 5', () => {
    expect(stepColumns(6)).toBe(5)
    expect(stepColumns(10)).toBe(5)
  })
})

describe('createNumberedSteps', () => {
  it('returns role="list" as the aria role', () => {
    const { ariaProps } = createNumberedSteps()
    expect(ariaProps.role).toBe('list')
  })

  it('includes a data-component attribute', () => {
    const { dataAttributes } = createNumberedSteps()
    expect(dataAttributes['data-component']).toBe('numbered-steps')
  })
})
