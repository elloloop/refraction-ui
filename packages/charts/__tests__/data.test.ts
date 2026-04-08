import { describe, it, expect } from 'vitest'
import {
  computeHistogramBins,
  computeExtent,
  computeMean,
  normalizeData,
} from '../src/data.js'

describe('computeExtent', () => {
  it('returns min and max of an array', () => {
    expect(computeExtent([3, 1, 4, 1, 5, 9])).toEqual([1, 9])
  })

  it('handles single element', () => {
    expect(computeExtent([42])).toEqual([42, 42])
  })

  it('handles already sorted array', () => {
    expect(computeExtent([1, 2, 3, 4, 5])).toEqual([1, 5])
  })

  it('handles negative values', () => {
    expect(computeExtent([-10, -5, 0, 5, 10])).toEqual([-10, 10])
  })

  it('handles all identical values', () => {
    expect(computeExtent([7, 7, 7])).toEqual([7, 7])
  })

  it('handles two elements', () => {
    expect(computeExtent([100, 1])).toEqual([1, 100])
  })
})

describe('computeMean', () => {
  it('computes mean of positive numbers', () => {
    expect(computeMean([2, 4, 6])).toBe(4)
  })

  it('computes mean of single value', () => {
    expect(computeMean([10])).toBe(10)
  })

  it('computes mean with negative numbers', () => {
    expect(computeMean([-10, 10])).toBe(0)
  })

  it('computes mean of floating point numbers', () => {
    expect(computeMean([1.5, 2.5])).toBe(2)
  })

  it('handles large array', () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i)
    expect(computeMean(arr)).toBeCloseTo(499.5)
  })
})

describe('computeHistogramBins', () => {
  it('returns correct number of bins', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const bins = computeHistogramBins(data, 5)
    expect(bins).toHaveLength(5)
  })

  it('each bin has x0, x1, and count', () => {
    const data = [1, 2, 3, 4, 5]
    const bins = computeHistogramBins(data, 2)
    bins.forEach((bin) => {
      expect(bin).toHaveProperty('x0')
      expect(bin).toHaveProperty('x1')
      expect(bin).toHaveProperty('count')
    })
  })

  it('bins cover the full data range', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const bins = computeHistogramBins(data, 5)
    expect(bins[0].x0).toBe(1)
    expect(bins[bins.length - 1].x1).toBe(10)
  })

  it('sum of counts equals data length', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const bins = computeHistogramBins(data, 5)
    const total = bins.reduce((sum, b) => sum + b.count, 0)
    expect(total).toBe(10)
  })

  it('uses default bin count when not specified', () => {
    const data = Array.from({ length: 100 }, (_, i) => i)
    const bins = computeHistogramBins(data)
    expect(bins.length).toBeGreaterThan(0)
  })

  it('handles all same values', () => {
    const data = [5, 5, 5, 5]
    const bins = computeHistogramBins(data, 3)
    const total = bins.reduce((sum, b) => sum + b.count, 0)
    expect(total).toBe(4)
  })

  it('bins are contiguous (x1 of bin i equals x0 of bin i+1)', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const bins = computeHistogramBins(data, 4)
    for (let i = 0; i < bins.length - 1; i++) {
      expect(bins[i].x1).toBeCloseTo(bins[i + 1].x0)
    }
  })
})

describe('normalizeData', () => {
  it('extracts values using accessor string', () => {
    const data = [{ value: 10 }, { value: 20 }, { value: 30 }]
    expect(normalizeData(data, 'value')).toEqual([10, 20, 30])
  })

  it('extracts values using accessor function', () => {
    const data = [{ x: 1 }, { x: 2 }, { x: 3 }]
    expect(normalizeData(data, (d: { x: number }) => d.x)).toEqual([1, 2, 3])
  })

  it('handles empty array', () => {
    expect(normalizeData([], 'value')).toEqual([])
  })

  it('handles nested accessor string', () => {
    const data = [{ a: { b: 1 } }, { a: { b: 2 } }]
    expect(normalizeData(data, (d: { a: { b: number } }) => d.a.b)).toEqual([1, 2])
  })
})
