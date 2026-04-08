import { describe, it, expect } from 'vitest'
import {
  createLinearScale,
  createBandScale,
  createTimeScale,
} from '../src/scales.js'

describe('createLinearScale', () => {
  it('maps domain min to range min', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    expect(scale(0)).toBe(0)
  })

  it('maps domain max to range max', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    expect(scale(100)).toBe(500)
  })

  it('maps a midpoint value correctly', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    expect(scale(50)).toBe(250)
  })

  it('handles inverted ranges', () => {
    const scale = createLinearScale([0, 100], [500, 0])
    expect(scale(0)).toBe(500)
    expect(scale(100)).toBe(0)
    expect(scale(50)).toBe(250)
  })

  it('handles negative domain values', () => {
    const scale = createLinearScale([-50, 50], [0, 200])
    expect(scale(0)).toBe(100)
    expect(scale(-50)).toBe(0)
    expect(scale(50)).toBe(200)
  })

  it('extrapolates beyond domain', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    expect(scale(200)).toBe(1000)
  })

  it('invert maps range value back to domain value', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    expect(scale.invert(250)).toBe(50)
  })

  it('invert maps range min to domain min', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    expect(scale.invert(0)).toBe(0)
  })

  it('invert maps range max to domain max', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    expect(scale.invert(500)).toBe(100)
  })

  it('generates correct number of ticks', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    const ticks = scale.ticks(5)
    expect(ticks).toHaveLength(5)
  })

  it('generates ticks within domain', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    const ticks = scale.ticks(5)
    ticks.forEach((t) => {
      expect(t).toBeGreaterThanOrEqual(0)
      expect(t).toBeLessThanOrEqual(100)
    })
  })

  it('generates evenly spaced ticks', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    const ticks = scale.ticks(5)
    const spacing = ticks[1] - ticks[0]
    for (let i = 2; i < ticks.length; i++) {
      expect(ticks[i] - ticks[i - 1]).toBeCloseTo(spacing)
    }
  })

  it('ticks defaults to a reasonable count', () => {
    const scale = createLinearScale([0, 100], [0, 500])
    const ticks = scale.ticks()
    expect(ticks.length).toBeGreaterThan(0)
    expect(ticks.length).toBeLessThanOrEqual(12)
  })

  it('handles zero-width domain', () => {
    const scale = createLinearScale([50, 50], [0, 500])
    expect(scale(50)).toBe(0)
  })
})

describe('createBandScale', () => {
  it('maps first band to start of range', () => {
    const scale = createBandScale(['a', 'b', 'c'], [0, 300])
    expect(scale('a')).toBe(0)
  })

  it('maps bands evenly across range', () => {
    const scale = createBandScale(['a', 'b', 'c'], [0, 300])
    expect(scale('b')).toBe(100)
    expect(scale('c')).toBe(200)
  })

  it('computes correct bandwidth without padding', () => {
    const scale = createBandScale(['a', 'b', 'c'], [0, 300])
    expect(scale.bandwidth()).toBe(100)
  })

  it('applies padding between bands', () => {
    const scale = createBandScale(['a', 'b', 'c'], [0, 300], 0.5)
    const bw = scale.bandwidth()
    expect(bw).toBeLessThan(100)
    expect(bw).toBeGreaterThan(0)
  })

  it('bandwidth is positive with padding', () => {
    const scale = createBandScale(['x', 'y'], [0, 200], 0.2)
    expect(scale.bandwidth()).toBeGreaterThan(0)
  })

  it('returns 0 for unknown domain values', () => {
    const scale = createBandScale(['a', 'b'], [0, 200])
    expect(scale('z')).toBe(0)
  })

  it('handles single band', () => {
    const scale = createBandScale(['only'], [0, 400])
    expect(scale('only')).toBe(0)
    expect(scale.bandwidth()).toBe(400)
  })

  it('handles empty domain', () => {
    const scale = createBandScale([], [0, 300])
    expect(scale.bandwidth()).toBe(0)
  })
})

describe('createTimeScale', () => {
  const d1 = new Date('2024-01-01')
  const d2 = new Date('2024-12-31')

  it('maps start date to range min', () => {
    const scale = createTimeScale([d1, d2], [0, 500])
    expect(scale(d1)).toBe(0)
  })

  it('maps end date to range max', () => {
    const scale = createTimeScale([d1, d2], [0, 500])
    expect(scale(d2)).toBe(500)
  })

  it('maps midpoint date proportionally', () => {
    const mid = new Date((d1.getTime() + d2.getTime()) / 2)
    const scale = createTimeScale([d1, d2], [0, 500])
    expect(scale(mid)).toBeCloseTo(250, 0)
  })

  it('invert maps range value back to date', () => {
    const scale = createTimeScale([d1, d2], [0, 500])
    const result = scale.invert(0)
    expect(result.getTime()).toBe(d1.getTime())
  })

  it('invert maps range max back to end date', () => {
    const scale = createTimeScale([d1, d2], [0, 500])
    const result = scale.invert(500)
    expect(result.getTime()).toBe(d2.getTime())
  })

  it('generates ticks as Date objects', () => {
    const scale = createTimeScale([d1, d2], [0, 500])
    const ticks = scale.ticks(4)
    expect(ticks.length).toBe(4)
    ticks.forEach((t) => {
      expect(t).toBeInstanceOf(Date)
    })
  })

  it('generates ticks within domain', () => {
    const scale = createTimeScale([d1, d2], [0, 500])
    const ticks = scale.ticks(4)
    ticks.forEach((t) => {
      expect(t.getTime()).toBeGreaterThanOrEqual(d1.getTime())
      expect(t.getTime()).toBeLessThanOrEqual(d2.getTime())
    })
  })
})
