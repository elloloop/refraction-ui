import { describe, it, expect } from 'vitest'
import { linePath, areaPath, arcPath } from '../src/geometry.js'

describe('linePath', () => {
  it('generates M and L commands for points', () => {
    const d = linePath([{ x: 0, y: 0 }, { x: 10, y: 20 }, { x: 30, y: 40 }])
    expect(d).toBe('M0,0L10,20L30,40')
  })

  it('handles single point', () => {
    const d = linePath([{ x: 5, y: 10 }])
    expect(d).toBe('M5,10')
  })

  it('handles two points', () => {
    const d = linePath([{ x: 0, y: 0 }, { x: 100, y: 200 }])
    expect(d).toBe('M0,0L100,200')
  })

  it('returns empty string for empty array', () => {
    expect(linePath([])).toBe('')
  })

  it('handles decimal coordinates', () => {
    const d = linePath([{ x: 1.5, y: 2.5 }, { x: 3.5, y: 4.5 }])
    expect(d).toBe('M1.5,2.5L3.5,4.5')
  })

  it('handles negative coordinates', () => {
    const d = linePath([{ x: -10, y: -20 }, { x: 10, y: 20 }])
    expect(d).toBe('M-10,-20L10,20')
  })
})

describe('areaPath', () => {
  it('generates a closed area path', () => {
    const d = areaPath([{ x: 0, y: 10 }, { x: 50, y: 20 }, { x: 100, y: 10 }], 100)
    expect(d).toContain('M0,10')
    expect(d).toContain('L100,10')
    expect(d).toContain('L100,100')
    expect(d).toContain('L0,100')
    expect(d).toContain('Z')
  })

  it('returns empty string for empty array', () => {
    expect(areaPath([], 100)).toBe('')
  })

  it('handles single point', () => {
    const d = areaPath([{ x: 10, y: 20 }], 50)
    expect(d).toContain('M10,20')
    expect(d).toContain('Z')
  })

  it('baseline defines the bottom of the area', () => {
    const d = areaPath([{ x: 0, y: 0 }, { x: 100, y: 0 }], 200)
    expect(d).toContain('L100,200')
    expect(d).toContain('L0,200')
  })

  it('path starts with M and ends with Z', () => {
    const d = areaPath([{ x: 0, y: 5 }, { x: 10, y: 15 }], 50)
    expect(d[0]).toBe('M')
    expect(d[d.length - 1]).toBe('Z')
  })
})

describe('arcPath', () => {
  it('returns a valid SVG path string', () => {
    const d = arcPath(100, 100, 50, 0, Math.PI / 2)
    expect(d).toContain('M')
    expect(d).toContain('A')
  })

  it('starts at the correct point on the circle', () => {
    const d = arcPath(0, 0, 100, 0, Math.PI / 2)
    // Start angle 0 => point at (100, 0) relative to center
    expect(d).toMatch(/^M100/)
  })

  it('uses the arc command with correct radius', () => {
    const d = arcPath(0, 0, 50, 0, Math.PI / 2)
    expect(d).toContain('A50,50')
  })

  it('handles full semicircle', () => {
    const d = arcPath(0, 0, 100, 0, Math.PI)
    // Large arc flag should be 0 for exactly PI, but path should be valid
    expect(d).toContain('A')
  })

  it('includes line back to center for pie slices', () => {
    const d = arcPath(50, 50, 40, 0, Math.PI / 3)
    expect(d).toContain('L50,50')
    expect(d).toContain('Z')
  })

  it('handles large arc (> PI)', () => {
    const d = arcPath(0, 0, 100, 0, Math.PI * 1.5)
    // large-arc-flag should be 1
    expect(d).toContain('A100,100')
  })

  it('handles zero-radius arc', () => {
    const d = arcPath(50, 50, 0, 0, Math.PI)
    expect(d).toContain('M50')
  })
})
