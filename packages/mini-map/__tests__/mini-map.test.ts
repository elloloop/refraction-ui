import { describe, it, expect } from 'vitest'
import {
  contentBounds,
  miniScale,
  worldToMini,
  viewportRectInMini,
  createMiniMap,
} from '../src/index.js'

describe('contentBounds', () => {
  it('returns a zero rect when there are no items', () => {
    expect(contentBounds([])).toEqual({ x: 0, y: 0, width: 0, height: 0 })
  })

  it('encloses all items with their extents', () => {
    const bounds = contentBounds([
      { id: 'a', x: 10, y: 20, width: 50, height: 30 },
      { id: 'b', x: 100, y: 5, width: 20, height: 10 },
    ])
    // minX=10, minY=5, maxX=120, maxY=50
    expect(bounds.x).toBe(10)
    expect(bounds.y).toBe(5)
    expect(bounds.width).toBe(110)
    expect(bounds.height).toBe(45)
  })

  it('treats items with no width/height as points', () => {
    const bounds = contentBounds([
      { id: 'a', x: 0, y: 0 },
      { id: 'b', x: 200, y: 100 },
    ])
    expect(bounds.width).toBe(200)
    expect(bounds.height).toBe(100)
  })
})

describe('miniScale', () => {
  it('returns ≤1 when content is larger than the minimap box', () => {
    const content = { x: 0, y: 0, width: 1000, height: 800 }
    const scale = miniScale(content, 200, 140, 8)
    expect(scale).toBeLessThanOrEqual(1)
    expect(scale).toBeGreaterThan(0)
  })

  it('fits content within available area', () => {
    const content = { x: 0, y: 0, width: 100, height: 100 }
    const scale = miniScale(content, 200, 140, 0)
    // available = 200x140; fits 140/100 = 1.4 — but we take the min so 1.4
    expect(scale).toBeCloseTo(1.4)
  })

  it('returns 1 for zero-size content', () => {
    expect(miniScale({ x: 0, y: 0, width: 0, height: 0 }, 200, 140, 8)).toBe(1)
  })
})

describe('worldToMini', () => {
  it('maps the top-left corner of content to ~padding', () => {
    const content = { x: 50, y: 50, width: 500, height: 400 }
    const scale = miniScale(content, 200, 140, 8)
    const pt = worldToMini({ x: 50, y: 50 }, content, scale, 8)
    expect(pt.x).toBeCloseTo(8)
    expect(pt.y).toBeCloseTo(8)
  })

  it('shifts correctly for non-zero content origin', () => {
    const content = { x: 100, y: 200, width: 200, height: 100 }
    const scale = 0.5
    const pt = worldToMini({ x: 150, y: 250 }, content, scale, 0)
    // (150-100)*0.5=25, (250-200)*0.5=25
    expect(pt.x).toBeCloseTo(25)
    expect(pt.y).toBeCloseTo(25)
  })
})

describe('viewportRectInMini', () => {
  it('scales the viewport width/height by the scale factor', () => {
    const content = { x: 0, y: 0, width: 1000, height: 800 }
    const viewport = { x: 0, y: 0, width: 400, height: 300 }
    const scale = miniScale(content, 200, 140, 8)
    const rect = viewportRectInMini(viewport, content, scale, 8)
    expect(rect.width).toBeCloseTo(viewport.width * scale)
    expect(rect.height).toBeCloseTo(viewport.height * scale)
  })

  it('positions the viewport rect at the correct minimap coordinates', () => {
    const content = { x: 0, y: 0, width: 500, height: 500 }
    const viewport = { x: 100, y: 200, width: 50, height: 50 }
    const scale = 0.2
    const rect = viewportRectInMini(viewport, content, scale, 0)
    // worldToMini({100,200}, {0,0,...}, 0.2, 0) = {20, 40}
    expect(rect.x).toBeCloseTo(20)
    expect(rect.y).toBeCloseTo(40)
  })
})

describe('createMiniMap', () => {
  it('returns role=img aria-label=Minimap', () => {
    const { ariaProps } = createMiniMap()
    expect(ariaProps.role).toBe('img')
    expect(ariaProps['aria-label']).toBe('Minimap')
  })

  it('includes a data-component attribute', () => {
    const { dataAttributes } = createMiniMap()
    expect(dataAttributes['data-component']).toBe('mini-map')
  })
})
