import { describe, it, expect } from 'vitest'
import {
  clampValue,
  valueToFraction,
  polarToCartesian,
  describeArc,
  gaugeStrokeDashoffset,
  resolveZoneTone,
  createRadialGauge,
  type GaugeZone,
} from '../src/index.js'

describe('clampValue', () => {
  it('clamps below minimum', () => {
    expect(clampValue(-10, 0, 100)).toBe(0)
  })

  it('clamps above maximum', () => {
    expect(clampValue(200, 0, 100)).toBe(100)
  })

  it('passes through values within range', () => {
    expect(clampValue(50, 0, 100)).toBe(50)
  })
})

describe('valueToFraction', () => {
  it('maps min to 0 and max to 1', () => {
    expect(valueToFraction(0, 0, 100)).toBe(0)
    expect(valueToFraction(100, 0, 100)).toBe(1)
  })

  it('maps mid to 0.5', () => {
    expect(valueToFraction(50, 0, 100)).toBeCloseTo(0.5)
  })

  it('returns 0 when min equals max (no division by zero)', () => {
    expect(valueToFraction(5, 5, 5)).toBe(0)
  })

  it('clamps out-of-range values to 0..1', () => {
    expect(valueToFraction(-50, 0, 100)).toBe(0)
    expect(valueToFraction(150, 0, 100)).toBe(1)
  })
})

describe('polarToCartesian', () => {
  it('returns top-center for 0 degrees (12-o-clock)', () => {
    const { x, y } = polarToCartesian(50, 50, 40, 0)
    expect(x).toBeCloseTo(50)
    expect(y).toBeCloseTo(10) // cy - r
  })

  it('returns right-center for 90 degrees', () => {
    const { x, y } = polarToCartesian(50, 50, 40, 90)
    expect(x).toBeCloseTo(90)
    expect(y).toBeCloseTo(50)
  })
})

describe('describeArc', () => {
  it('returns a non-empty string for a non-zero arc', () => {
    const d = describeArc(50, 50, 40, 0, 180)
    expect(typeof d).toBe('string')
    expect(d.length).toBeGreaterThan(0)
    expect(d).toContain('M')
    expect(d).toContain('A')
  })

  it('returns an empty string for a zero-span arc', () => {
    expect(describeArc(50, 50, 40, 90, 90)).toBe('')
  })

  it('handles a near-full-circle arc without empty string', () => {
    const d = describeArc(50, 50, 40, 0, 359)
    expect(d.length).toBeGreaterThan(0)
  })
})

describe('gaugeStrokeDashoffset', () => {
  it('returns full circumference at 0 fraction (nothing shown)', () => {
    expect(gaugeStrokeDashoffset(0, 100)).toBe(100)
  })

  it('returns 0 at full fraction (full circle shown)', () => {
    expect(gaugeStrokeDashoffset(1, 100)).toBe(0)
  })

  it('returns half circumference at 0.5 fraction', () => {
    expect(gaugeStrokeDashoffset(0.5, 100)).toBeCloseTo(50)
  })
})

describe('resolveZoneTone', () => {
  const zones: GaugeZone[] = [
    { upTo: 33, tone: 'danger' },
    { upTo: 66, tone: 'warning' },
    { upTo: 100, tone: 'success' },
  ]

  it('picks danger for low values', () => {
    expect(resolveZoneTone(10, zones, 100)).toBe('danger')
    expect(resolveZoneTone(33, zones, 100)).toBe('danger')
  })

  it('picks warning for mid values', () => {
    expect(resolveZoneTone(50, zones, 100)).toBe('warning')
  })

  it('picks success for high values', () => {
    expect(resolveZoneTone(100, zones, 100)).toBe('success')
  })

  it('returns default when zones array is empty', () => {
    expect(resolveZoneTone(50, [], 100)).toBe('default')
  })

  it('uses the last zone tone when value exceeds all upTo boundaries', () => {
    const partial: GaugeZone[] = [{ upTo: 50, tone: 'warning' }]
    expect(resolveZoneTone(80, partial, 100)).toBe('warning')
  })

  it('sorts zones regardless of input order', () => {
    const unordered: GaugeZone[] = [
      { upTo: 100, tone: 'success' },
      { upTo: 33, tone: 'danger' },
    ]
    expect(resolveZoneTone(20, unordered, 100)).toBe('danger')
  })
})

describe('createRadialGauge', () => {
  it('sets role="meter" and aria value attributes', () => {
    const { ariaProps } = createRadialGauge({ value: 75 })
    expect(ariaProps.role).toBe('meter')
    expect(ariaProps['aria-valuenow']).toBe(75)
    expect(ariaProps['aria-valuemin']).toBe(0)
    expect(ariaProps['aria-valuemax']).toBe(100)
  })

  it('clamps the value in aria-valuenow and data-value', () => {
    const { ariaProps, dataAttributes } = createRadialGauge({ value: 150, min: 0, max: 100 })
    expect(ariaProps['aria-valuenow']).toBe(100)
    expect(dataAttributes['data-value']).toBe('100')
  })

  it('emits data-size from the size prop', () => {
    const { dataAttributes } = createRadialGauge({ value: 50, size: 'lg' })
    expect(dataAttributes['data-size']).toBe('lg')
  })
})
