import { describe, it, expect } from 'vitest'
import {
  clampZoom,
  fitTransform,
  transformToCss,
  createInfiniteCanvas,
} from '../src/index.js'

describe('clampZoom', () => {
  it('clamps below the minimum', () => {
    expect(clampZoom(0.1)).toBe(0.25)
  })

  it('clamps above the maximum', () => {
    expect(clampZoom(10)).toBe(4)
  })

  it('passes through a value within range', () => {
    expect(clampZoom(1.5)).toBe(1.5)
  })

  it('respects custom min and max', () => {
    expect(clampZoom(0.5, 0.5, 2)).toBe(0.5)
    expect(clampZoom(3, 0.5, 2)).toBe(2)
  })
})

describe('fitTransform', () => {
  it('centers a 200×100 bound in a 800×600 viewport', () => {
    const t = fitTransform({ minX: 0, minY: 0, maxX: 200, maxY: 100 }, 800, 600)
    // zoom should be limited by height: (600 - 64) / 100 = 5.36 → clamped to 4
    // but width: (800 - 64) / 200 = 3.68 → min(3.68, 5.36) = 3.68 → clamped to 3.68
    expect(t.zoom).toBeCloseTo(3.68, 1)
    // x centers: (800 - 200*3.68) / 2 - 0 = (800 - 736) / 2 = 32
    expect(t.x).toBeCloseTo(32, 0)
  })

  it('centers content that is smaller than the viewport', () => {
    const t = fitTransform({ minX: 0, minY: 0, maxX: 100, maxY: 100 }, 400, 400)
    // zoom: (400 - 64) / 100 = 3.36 → clamped to 3.36
    expect(t.zoom).toBeGreaterThan(1)
    // content should be centered: x = y
    expect(t.x).toBeCloseTo(t.y, 5)
  })

  it('returns identity for degenerate bounds', () => {
    expect(fitTransform({ minX: 0, minY: 0, maxX: 0, maxY: 0 }, 800, 600)).toEqual({
      zoom: 1,
      x: 0,
      y: 0,
    })
  })

  it('clamps zoom to max 4', () => {
    // Very small content in a large viewport → raw zoom would exceed 4
    const t = fitTransform({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, 800, 600)
    expect(t.zoom).toBe(4)
  })
})

describe('transformToCss', () => {
  it('produces the correct CSS string', () => {
    expect(transformToCss({ zoom: 1, x: 0, y: 0 })).toBe(
      'translate(0px, 0px) scale(1)',
    )
    expect(transformToCss({ zoom: 2.5, x: 100, y: -50 })).toBe(
      'translate(100px, -50px) scale(2.5)',
    )
  })
})

describe('createInfiniteCanvas', () => {
  it('returns role=group and aria-label=Canvas', () => {
    const { ariaProps } = createInfiniteCanvas()
    expect(ariaProps.role).toBe('group')
    expect(ariaProps['aria-label']).toBe('Canvas')
  })

  it('reflects the zoom in data-zoom', () => {
    expect(createInfiniteCanvas({ zoom: 1.5 }).dataAttributes['data-zoom']).toBe(1.5)
  })

  it('defaults data-zoom to 1', () => {
    expect(createInfiniteCanvas().dataAttributes['data-zoom']).toBe(1)
  })
})
