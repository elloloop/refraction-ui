import { describe, it, expect } from 'vitest'
import {
  createFloatingPanel,
  parseFloatingPanelCorner,
  composeFloatingPanelCorner,
  isFloatingPanelCorner,
  getFloatingPanelCornerLabel,
  formatFloatingPanelCornerAnnouncement,
  clampFloatingPanelPosition,
  getFloatingPanelCornerPosition,
  getNearestFloatingPanelCorner,
  getFloatingPanelGrabOffset,
  getFloatingPanelDragPosition,
  isFloatingPanelMoveKey,
  getNextFloatingPanelCorner,
  getFloatingPanelAnchorStyle,
  getFloatingPanelMotion,
  FLOATING_PANEL_CORNERS,
  FLOATING_PANEL_DEFAULT_CORNER,
  FLOATING_PANEL_DEFAULT_MARGIN_PX,
  floatingPanelVariants,
  floatingPanelHandleVariants,
  type FloatingPanelCorner,
  type FloatingPanelLayout,
} from '../src/index.js'

const MARGIN = 16
// 1000x800 viewport, 200x100 panel: corner x ∈ {16, 784}, y ∈ {16, 684}.
const LAYOUT: FloatingPanelLayout = {
  viewport: { width: 1000, height: 800 },
  panel: { width: 200, height: 100 },
  margin: MARGIN,
}
const RIGHT_X = 1000 - 200 - MARGIN
const BOTTOM_Y = 800 - 100 - MARGIN

describe('corner parsing', () => {
  it('round-trips every corner', () => {
    for (const corner of FLOATING_PANEL_CORNERS) {
      const { vertical, horizontal } = parseFloatingPanelCorner(corner)
      expect(composeFloatingPanelCorner(vertical, horizontal)).toBe(corner)
    }
  })

  it('lists four distinct corners and defaults to bottom-right', () => {
    expect(new Set(FLOATING_PANEL_CORNERS).size).toBe(4)
    expect(FLOATING_PANEL_DEFAULT_CORNER).toBe('bottom-right')
    expect(FLOATING_PANEL_DEFAULT_MARGIN_PX).toBe(16)
  })

  it('guards untrusted values', () => {
    expect(isFloatingPanelCorner('top-left')).toBe(true)
    expect(isFloatingPanelCorner('middle')).toBe(false)
    expect(isFloatingPanelCorner(undefined)).toBe(false)
    expect(isFloatingPanelCorner(3)).toBe(false)
  })

  it('labels corners for announcements', () => {
    expect(getFloatingPanelCornerLabel('bottom-right')).toBe('bottom right')
    expect(formatFloatingPanelCornerAnnouncement('top-left')).toBe('Panel moved to top left')
  })
})

describe('getFloatingPanelCornerPosition', () => {
  it.each<[FloatingPanelCorner, number, number]>([
    ['top-left', MARGIN, MARGIN],
    ['top-right', RIGHT_X, MARGIN],
    ['bottom-left', MARGIN, BOTTOM_Y],
    ['bottom-right', RIGHT_X, BOTTOM_Y],
  ])('%s → (%d, %d)', (corner, x, y) => {
    expect(getFloatingPanelCornerPosition(corner, LAYOUT)).toEqual({ x, y })
  })

  it('honours a zero margin', () => {
    expect(getFloatingPanelCornerPosition('bottom-right', { ...LAYOUT, margin: 0 })).toEqual({
      x: 800,
      y: 700,
    })
  })

  it('centres an axis that does not fit with margins', () => {
    // 220 wide viewport: 200 + 2*16 > 220, so the panel sits at (220-200)/2.
    const tight = { ...LAYOUT, viewport: { width: 220, height: 800 } }
    expect(getFloatingPanelCornerPosition('top-right', tight).x).toBe(10)
    expect(getFloatingPanelCornerPosition('top-left', tight).x).toBe(10)
  })

  it('pins an oversized panel to the start edge so the handle stays visible', () => {
    const tiny = { ...LAYOUT, viewport: { width: 150, height: 60 } }
    expect(getFloatingPanelCornerPosition('bottom-right', tiny)).toEqual({ x: 0, y: 0 })
  })
})

describe('clampFloatingPanelPosition', () => {
  it('leaves an in-bounds position alone', () => {
    expect(clampFloatingPanelPosition({ x: 300, y: 200 }, LAYOUT)).toEqual({ x: 300, y: 200 })
  })

  it('clamps past every edge to the margin', () => {
    expect(clampFloatingPanelPosition({ x: -50, y: -50 }, LAYOUT)).toEqual({ x: MARGIN, y: MARGIN })
    expect(clampFloatingPanelPosition({ x: 5000, y: 5000 }, LAYOUT)).toEqual({
      x: RIGHT_X,
      y: BOTTOM_Y,
    })
  })

  it('re-clamps a bottom-right panel when the viewport shrinks', () => {
    const before = getFloatingPanelCornerPosition('bottom-right', LAYOUT)
    const shrunk = { ...LAYOUT, viewport: { width: 600, height: 400 } }
    expect(clampFloatingPanelPosition(before, shrunk)).toEqual({ x: 384, y: 284 })
    // …which is exactly where the corner itself now resolves.
    expect(getFloatingPanelCornerPosition('bottom-right', shrunk)).toEqual({ x: 384, y: 284 })
  })

  it('is idempotent', () => {
    const once = clampFloatingPanelPosition({ x: 9999, y: -9 }, LAYOUT)
    expect(clampFloatingPanelPosition(once, LAYOUT)).toEqual(once)
  })
})

describe('getNearestFloatingPanelCorner', () => {
  it('snaps a drop at each corner position to that corner', () => {
    for (const corner of FLOATING_PANEL_CORNERS) {
      const at = getFloatingPanelCornerPosition(corner, LAYOUT)
      expect(getNearestFloatingPanelCorner(at, LAYOUT)).toBe(corner)
    }
  })

  it.each<[number, number, FloatingPanelCorner]>([
    [100, 100, 'top-left'],
    [700, 50, 'top-right'],
    [50, 600, 'bottom-left'],
    [650, 500, 'bottom-right'],
  ])('drop at (%d, %d) → %s', (x, y, corner) => {
    expect(getNearestFloatingPanelCorner({ x, y }, LAYOUT)).toBe(corner)
  })

  it('decides by the side of the midpoint, one pixel either way', () => {
    const midX = (MARGIN + RIGHT_X) / 2
    expect(getNearestFloatingPanelCorner({ x: midX - 1, y: MARGIN }, LAYOUT)).toBe('top-left')
    expect(getNearestFloatingPanelCorner({ x: midX + 1, y: MARGIN }, LAYOUT)).toBe('top-right')
    const midY = (MARGIN + BOTTOM_Y) / 2
    expect(getNearestFloatingPanelCorner({ x: MARGIN, y: midY + 1 }, LAYOUT)).toBe('bottom-left')
  })

  it('breaks an exact tie by corner order (deterministic)', () => {
    const centre = { x: (MARGIN + RIGHT_X) / 2, y: (MARGIN + BOTTOM_Y) / 2 }
    expect(getNearestFloatingPanelCorner(centre, LAYOUT)).toBe('top-left')
  })

  it('handles drops outside the viewport', () => {
    expect(getNearestFloatingPanelCorner({ x: 5000, y: 5000 }, LAYOUT)).toBe('bottom-right')
    expect(getNearestFloatingPanelCorner({ x: -5000, y: 5000 }, LAYOUT)).toBe('bottom-left')
  })
})

describe('drag maths', () => {
  it('keeps the grab point under the pointer', () => {
    const offset = getFloatingPanelGrabOffset({ x: 820, y: 700 }, { x: RIGHT_X, y: BOTTOM_Y })
    expect(offset).toEqual({ x: 36, y: 16 })
    expect(getFloatingPanelDragPosition({ x: 436, y: 316 }, offset, LAYOUT)).toEqual({
      x: 400,
      y: 300,
    })
  })

  it('clamps the dragged panel inside the viewport', () => {
    const offset = { x: 10, y: 10 }
    expect(getFloatingPanelDragPosition({ x: -100, y: 2000 }, offset, LAYOUT)).toEqual({
      x: MARGIN,
      y: BOTTOM_Y,
    })
  })
})

describe('keyboard moves', () => {
  it('recognises only the arrow keys', () => {
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
      expect(isFloatingPanelMoveKey(key)).toBe(true)
    }
    for (const key of ['Enter', ' ', 'Home', 'Tab', 'a']) {
      expect(isFloatingPanelMoveKey(key)).toBe(false)
    }
  })

  it.each<[FloatingPanelCorner, string, FloatingPanelCorner]>([
    ['bottom-right', 'ArrowUp', 'top-right'],
    ['bottom-right', 'ArrowLeft', 'bottom-left'],
    ['top-left', 'ArrowDown', 'bottom-left'],
    ['top-left', 'ArrowRight', 'top-right'],
    ['bottom-left', 'ArrowUp', 'top-left'],
    ['top-right', 'ArrowLeft', 'top-left'],
  ])('%s + %s → %s', (corner, key, next) => {
    expect(getNextFloatingPanelCorner(corner, key)).toBe(next)
  })

  it.each<[FloatingPanelCorner, string]>([
    ['top-left', 'ArrowUp'],
    ['top-left', 'ArrowLeft'],
    ['bottom-right', 'ArrowDown'],
    ['bottom-right', 'ArrowRight'],
  ])('%s + %s stays put at the edge (no wrap)', (corner, key) => {
    expect(getNextFloatingPanelCorner(corner, key)).toBe(corner)
  })

  it('ignores non-arrow keys', () => {
    expect(getNextFloatingPanelCorner('top-right', 'Enter')).toBe('top-right')
  })

  it('reaches the opposite corner in two presses', () => {
    const next = getNextFloatingPanelCorner(
      getNextFloatingPanelCorner('bottom-right', 'ArrowUp'),
      'ArrowLeft',
    )
    expect(next).toBe('top-left')
  })
})

describe('getFloatingPanelAnchorStyle', () => {
  it('pins the two edges of the corner by the margin', () => {
    expect(getFloatingPanelAnchorStyle('bottom-right', 24)).toEqual({ bottom: 24, right: 24 })
    expect(getFloatingPanelAnchorStyle('top-left', 0)).toEqual({ top: 0, left: 0 })
  })
})

describe('getFloatingPanelMotion', () => {
  it('animates only a settling move with motion allowed', () => {
    expect(getFloatingPanelMotion({ settling: true, dragging: false, reducedMotion: false })).toBe(
      'animated',
    )
  })

  it.each([
    { settling: true, dragging: false, reducedMotion: true },
    { settling: true, dragging: true, reducedMotion: false },
    { settling: false, dragging: false, reducedMotion: false },
    { settling: false, dragging: true, reducedMotion: true },
  ])('is instant for %o', (options) => {
    expect(getFloatingPanelMotion(options)).toBe('instant')
  })
})

describe('createFloatingPanel', () => {
  it('is a region with state data attributes', () => {
    const api = createFloatingPanel({ corner: 'top-left' })
    expect(api.ariaProps).toEqual({ role: 'region' })
    expect(api.ariaProps).not.toHaveProperty('aria-modal')
    expect(api.dataAttributes).toEqual({
      'data-corner': 'top-left',
      'data-state': 'expanded',
      'data-dragging': 'false',
      'data-motion': 'instant',
    })
  })

  it('reflects collapsed and dragging', () => {
    const api = createFloatingPanel({
      corner: 'bottom-left',
      collapsed: true,
      dragging: true,
      motion: 'animated',
    })
    expect(api.dataAttributes['data-state']).toBe('collapsed')
    expect(api.dataAttributes['data-motion']).toBe('animated')
    expect(api.dataAttributes['data-dragging']).toBe('true')
  })
})

describe('styles', () => {
  it('turns the snap transition off for instant motion and under reduced motion', () => {
    expect(floatingPanelVariants({ motion: 'animated' })).toContain('transition-transform')
    expect(floatingPanelVariants({ motion: 'animated' })).toContain('motion-reduce:transition-none')
    expect(floatingPanelVariants({ motion: 'instant' })).toContain('transition-none')
    expect(floatingPanelVariants({ motion: 'instant' })).not.toContain('duration-200')
  })

  it('stops text selection while dragging', () => {
    expect(floatingPanelVariants({ dragging: 'true' })).toContain('select-none')
    expect(floatingPanelVariants({ dragging: 'false' })).not.toContain('select-none')
  })

  it('gives the handle a 44px target, a focus ring and touch-none', () => {
    const cls = floatingPanelHandleVariants({ dragging: 'false' })
    expect(cls).toContain('size-11')
    expect(cls).toContain('touch-none')
    expect(cls).toContain('focus-visible:ring-2')
    expect(cls).toContain('cursor-grab')
    expect(floatingPanelHandleVariants({ dragging: 'true' })).toContain('cursor-grabbing')
  })
})
