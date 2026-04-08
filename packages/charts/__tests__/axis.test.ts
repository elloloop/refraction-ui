import { describe, it, expect } from 'vitest'
import { generateTicks, formatTick } from '../src/axis.js'
import { createLinearScale, createBandScale, createTimeScale } from '../src/scales.js'

describe('generateTicks', () => {
  it('generates ticks from a linear scale', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    const ticks = generateTicks(scale, 5)
    expect(ticks).toHaveLength(5)
  })

  it('tick values are within domain for linear', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    const ticks = generateTicks(scale, 5)
    ticks.forEach((t) => {
      expect(t as number).toBeGreaterThanOrEqual(0)
      expect(t as number).toBeLessThanOrEqual(100)
    })
  })

  it('generates ticks from a band scale', () => {
    const scale = createBandScale(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], [0, 500])
    const ticks = generateTicks(scale)
    expect(ticks).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
  })

  it('generates ticks from a time scale', () => {
    const d1 = new Date('2024-01-01')
    const d2 = new Date('2024-12-31')
    const scale = createTimeScale([d1, d2], [0, 500])
    const ticks = generateTicks(scale, 4)
    expect(ticks).toHaveLength(4)
    ticks.forEach((t) => expect(t).toBeInstanceOf(Date))
  })

  it('defaults to reasonable tick count', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    const ticks = generateTicks(scale)
    expect(ticks.length).toBeGreaterThan(0)
  })
})

describe('formatTick', () => {
  it('formats numbers with default precision', () => {
    expect(formatTick(42, 'number')).toBe('42')
  })

  it('formats decimal numbers', () => {
    expect(formatTick(3.14159, 'number')).toBe('3.14')
  })

  it('formats large numbers', () => {
    expect(formatTick(1000000, 'number')).toBe('1,000,000')
  })

  it('formats date values', () => {
    const d = new Date('2024-06-15')
    const formatted = formatTick(d, 'date')
    expect(formatted).toContain('2024')
  })

  it('formats string values as-is', () => {
    expect(formatTick('Monday', 'string')).toBe('Monday')
  })

  it('formats zero correctly', () => {
    expect(formatTick(0, 'number')).toBe('0')
  })

  it('formats negative numbers', () => {
    const result = formatTick(-42, 'number')
    expect(result).toContain('-42')
  })

  it('formats integer-valued decimals without trailing zeros', () => {
    expect(formatTick(5.0, 'number')).toBe('5')
  })
})
