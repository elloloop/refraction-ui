import { describe, it, expect } from 'vitest'
import {
  IMAGE_VIEWER_MIN_ZOOM,
  IMAGE_VIEWER_MAX_ZOOM,
  IMAGE_VIEWER_ZOOM_STEP_FACTOR,
  IMAGE_VIEWER_DOUBLE_CLICK_ZOOM,
  IMAGE_VIEWER_KEYBOARD_PAN_STEP_PX,
  IMAGE_VIEWER_WHEEL_ZOOM_SPEED,
  IMAGE_VIEWER_PINCH_WHEEL_ZOOM_SPEED,
  IMAGE_VIEWER_WHEEL_LINE_HEIGHT_PX,
  IMAGE_VIEWER_WHEEL_DELTA_MODE,
  IMAGE_VIEWER_IDENTITY,
  IMAGE_VIEWER_DEFAULT_LABELS,
  clampImageViewerZoom,
  isImageViewerZoomed,
  fitImageViewerImage,
  getImageViewerPanBounds,
  clampImageViewerTransform,
  zoomImageViewerAt,
  stepImageViewerZoom,
  panImageViewer,
  toggleImageViewerZoom,
  normalizeImageViewerWheelDelta,
  getImageViewerWheelScale,
  getImageViewerPointerDistance,
  getImageViewerPointerMidpoint,
  getImageViewerPinchScale,
  applyImageViewerPinch,
  getImageViewerFocalPoint,
  getImageViewerKeyAction,
  clampImageViewerIndex,
  getImageViewerNavIndex,
  canImageViewerNavigate,
  getImageViewerZoomPercent,
  resolveImageViewerLabels,
  createImageViewer,
  imageViewerStageVariants,
  imageViewerImageVariants,
  imageViewerNavVariants,
  type ImageViewerLayout,
  type ImageViewerPoint,
  type ImageViewerTransform,
} from '../src/index.js'

// An 800×600 stage showing a 400×300 fitted image: at 2× the image exactly
// fills the stage, so pan bounds are 0 at ≤2× and grow beyond.
const layout: ImageViewerLayout = {
  container: { width: 800, height: 600 },
  image: { width: 400, height: 300 },
}
const unknownLayout: ImageViewerLayout = {
  container: { width: 0, height: 0 },
  image: { width: 0, height: 0 },
}

/** Where image point `p` (from the image centre, unscaled) is drawn. */
function project(t: ImageViewerTransform, p: ImageViewerPoint): ImageViewerPoint {
  return { x: t.x + t.scale * p.x, y: t.y + t.scale * p.y }
}
/** Which image point is under stage point `f`. */
function unproject(t: ImageViewerTransform, f: ImageViewerPoint): ImageViewerPoint {
  return { x: (f.x - t.x) / t.scale, y: (f.y - t.y) / t.scale }
}

describe('zoom constants', () => {
  it('spans 1× to 8× and steps within that range', () => {
    expect(IMAGE_VIEWER_MIN_ZOOM).toBe(1)
    expect(IMAGE_VIEWER_MAX_ZOOM).toBe(8)
    expect(IMAGE_VIEWER_ZOOM_STEP_FACTOR).toBeGreaterThan(1)
    expect(IMAGE_VIEWER_DOUBLE_CLICK_ZOOM).toBeGreaterThan(IMAGE_VIEWER_MIN_ZOOM)
    expect(IMAGE_VIEWER_DOUBLE_CLICK_ZOOM).toBeLessThanOrEqual(IMAGE_VIEWER_MAX_ZOOM)
  })
})

describe('clampImageViewerZoom', () => {
  it('clamps into 1..8', () => {
    expect(clampImageViewerZoom(0.2)).toBe(1)
    expect(clampImageViewerZoom(3.5)).toBe(3.5)
    expect(clampImageViewerZoom(12)).toBe(8)
    expect(clampImageViewerZoom(1)).toBe(1)
    expect(clampImageViewerZoom(8)).toBe(8)
  })

  it('falls back to the minimum for non-finite input', () => {
    expect(clampImageViewerZoom(Number.NaN)).toBe(1)
    expect(clampImageViewerZoom(Number.POSITIVE_INFINITY)).toBe(1)
  })

  it('honours custom bounds', () => {
    expect(clampImageViewerZoom(5, 2, 4)).toBe(4)
    expect(clampImageViewerZoom(1, 2, 4)).toBe(2)
  })
})

describe('isImageViewerZoomed', () => {
  it('is false at 1× (and within float drift of it)', () => {
    expect(isImageViewerZoomed(IMAGE_VIEWER_IDENTITY)).toBe(false)
    expect(isImageViewerZoomed({ scale: 1 + 1e-9, x: 0, y: 0 })).toBe(false)
  })
  it('is true past 1×', () => {
    expect(isImageViewerZoomed({ scale: 1.01, x: 0, y: 0 })).toBe(true)
  })
})

describe('fitImageViewerImage', () => {
  it('contains a large image preserving aspect ratio', () => {
    expect(fitImageViewerImage({ width: 1600, height: 1200 }, { width: 800, height: 800 })).toEqual({
      width: 800,
      height: 600,
    })
    expect(fitImageViewerImage({ width: 1000, height: 2000 }, { width: 800, height: 600 })).toEqual({
      width: 300,
      height: 600,
    })
  })

  it('never upscales a small image', () => {
    expect(fitImageViewerImage({ width: 200, height: 100 }, { width: 800, height: 600 })).toEqual({
      width: 200,
      height: 100,
    })
  })

  it('returns zero for unknown or invalid sizes', () => {
    expect(fitImageViewerImage({ width: 0, height: 100 }, { width: 800, height: 600 })).toEqual({
      width: 0,
      height: 0,
    })
    expect(fitImageViewerImage({ width: 100, height: 100 }, { width: Number.NaN, height: 600 })).toEqual({
      width: 0,
      height: 0,
    })
    expect(fitImageViewerImage({ width: -5, height: 100 }, { width: 800, height: 600 })).toEqual({
      width: 0,
      height: 0,
    })
  })
})

describe('getImageViewerPanBounds', () => {
  it('is zero while the scaled image fits in the stage', () => {
    expect(getImageViewerPanBounds(1, layout)).toEqual({ x: 0, y: 0 })
    expect(getImageViewerPanBounds(2, layout)).toEqual({ x: 0, y: 0 })
  })

  it('is half the overflow once the image is larger than the stage', () => {
    // 4×: 1600×1200 image in an 800×600 stage → 400 / 300 of slack each way.
    expect(getImageViewerPanBounds(4, layout)).toEqual({ x: 400, y: 300 })
  })

  it('clamps each axis independently (wide image)', () => {
    const wide: ImageViewerLayout = {
      container: { width: 800, height: 600 },
      image: { width: 800, height: 200 },
    }
    // 2×: 1600 wide (overflows by 800), 400 tall (fits).
    expect(getImageViewerPanBounds(2, wide)).toEqual({ x: 400, y: 0 })
  })

  it('is zero for an unmeasured layout', () => {
    expect(getImageViewerPanBounds(8, unknownLayout)).toEqual({ x: 0, y: 0 })
  })
})

describe('clampImageViewerTransform', () => {
  it('keeps the image edges from passing the stage edges', () => {
    expect(clampImageViewerTransform({ scale: 4, x: 1000, y: -1000 }, layout)).toEqual({
      scale: 4,
      x: 400,
      y: -300,
    })
  })

  it('recentres an axis that fits', () => {
    expect(clampImageViewerTransform({ scale: 1.5, x: 120, y: -40 }, layout)).toEqual({
      scale: 1.5,
      x: 0,
      y: 0,
    })
  })

  it('clamps the zoom too', () => {
    expect(clampImageViewerTransform({ scale: 20, x: 0, y: 0 }, layout).scale).toBe(8)
    expect(clampImageViewerTransform({ scale: 0.1, x: 50, y: 50 }, layout)).toEqual(IMAGE_VIEWER_IDENTITY)
  })

  it('never yields negative zero', () => {
    const t = clampImageViewerTransform({ scale: 1, x: -10, y: -10 }, layout)
    expect(Object.is(t.x, -0)).toBe(false)
    expect(Object.is(t.y, -0)).toBe(false)
  })

  it('keeps every corner of the zoomed image covering the stage at any pan', () => {
    for (const scale of [2.5, 4, 8]) {
      for (const pan of [-5000, -100, 0, 100, 5000]) {
        const t = clampImageViewerTransform({ scale, x: pan, y: -pan }, layout)
        const topLeft = project(t, { x: -layout.image.width / 2, y: -layout.image.height / 2 })
        const bottomRight = project(t, { x: layout.image.width / 2, y: layout.image.height / 2 })
        expect(topLeft.x).toBeLessThanOrEqual(-layout.container.width / 2 + 1e-9)
        expect(topLeft.y).toBeLessThanOrEqual(-layout.container.height / 2 + 1e-9)
        expect(bottomRight.x).toBeGreaterThanOrEqual(layout.container.width / 2 - 1e-9)
        expect(bottomRight.y).toBeGreaterThanOrEqual(layout.container.height / 2 - 1e-9)
      }
    }
  })
})

describe('zoomImageViewerAt', () => {
  it('zooms around the centre without translating', () => {
    expect(zoomImageViewerAt(IMAGE_VIEWER_IDENTITY, 3, { x: 0, y: 0 }, layout)).toEqual({
      scale: 3,
      x: 0,
      y: 0,
    })
  })

  it('keeps the image point under the cursor fixed (no clamping in play)', () => {
    const start: ImageViewerTransform = { scale: 4, x: 100, y: -50 }
    const focal = { x: 150, y: 90 }
    const under = unproject(start, focal)
    const next = zoomImageViewerAt(start, 6, focal, layout)
    expect(next.scale).toBe(6)
    const after = project(next, under)
    expect(after.x).toBeCloseTo(focal.x, 9)
    expect(after.y).toBeCloseTo(focal.y, 9)
  })

  it('anchors at the cursor from the fitted view when the result is in bounds', () => {
    // 1× → 4× at (100, 75): translate = f - 4f = (-300, -225), inside ±(400, 300).
    const next = zoomImageViewerAt(IMAGE_VIEWER_IDENTITY, 4, { x: 100, y: 75 }, layout)
    expect(next).toEqual({ scale: 4, x: -300, y: -225 })
    expect(project(next, { x: 100, y: 75 })).toEqual({ x: 100, y: 75 })
  })

  it('clamps the pan when anchoring would expose the stage', () => {
    // A corner focal at 4× wants translate (-1200, -900); bounds are ±(400, 300).
    expect(zoomImageViewerAt(IMAGE_VIEWER_IDENTITY, 4, { x: 400, y: 300 }, layout)).toEqual({
      scale: 4,
      x: -400,
      y: -300,
    })
  })

  it('clamps the zoom to 8× and to 1×', () => {
    expect(zoomImageViewerAt(IMAGE_VIEWER_IDENTITY, 50, { x: 0, y: 0 }, layout).scale).toBe(8)
    expect(zoomImageViewerAt({ scale: 4, x: 400, y: 300 }, 0.5, { x: 10, y: 10 }, layout)).toEqual(
      IMAGE_VIEWER_IDENTITY,
    )
  })

  it('zooming out recentres once the image fits', () => {
    expect(zoomImageViewerAt({ scale: 4, x: 400, y: -300 }, 2, { x: 0, y: 0 }, layout)).toEqual({
      scale: 2,
      x: 0,
      y: 0,
    })
  })
})

describe('stepImageViewerZoom', () => {
  it('multiplies or divides by the step factor around the centre', () => {
    expect(stepImageViewerZoom(IMAGE_VIEWER_IDENTITY, 1, layout).scale).toBe(IMAGE_VIEWER_ZOOM_STEP_FACTOR)
    const zoomed = { scale: 3, x: 0, y: 0 }
    expect(stepImageViewerZoom(zoomed, -1, layout).scale).toBeCloseTo(3 / IMAGE_VIEWER_ZOOM_STEP_FACTOR, 12)
  })

  it('stops at both ends', () => {
    expect(stepImageViewerZoom({ scale: 7, x: 0, y: 0 }, 1, layout).scale).toBe(8)
    expect(stepImageViewerZoom({ scale: 8, x: 0, y: 0 }, 1, layout).scale).toBe(8)
    expect(stepImageViewerZoom(IMAGE_VIEWER_IDENTITY, -1, layout)).toEqual(IMAGE_VIEWER_IDENTITY)
  })

  it('reaches 8× from 1× in a bounded number of steps', () => {
    let t: ImageViewerTransform = IMAGE_VIEWER_IDENTITY
    let steps = 0
    while (t.scale < IMAGE_VIEWER_MAX_ZOOM) {
      t = stepImageViewerZoom(t, 1, layout)
      steps += 1
    }
    expect(steps).toBe(Math.ceil(Math.log(8) / Math.log(IMAGE_VIEWER_ZOOM_STEP_FACTOR)))
  })

  it('accepts a focal point', () => {
    const t = stepImageViewerZoom({ scale: 4, x: 0, y: 0 }, 1, layout, { x: 100, y: 0 })
    expect(t.x).toBeCloseTo(100 - IMAGE_VIEWER_ZOOM_STEP_FACTOR * 100, 9)
  })
})

describe('panImageViewer', () => {
  it('moves within the bounds', () => {
    expect(panImageViewer({ scale: 4, x: 0, y: 0 }, 50, -20, layout)).toEqual({ scale: 4, x: 50, y: -20 })
  })

  it('stops at the edges', () => {
    expect(panImageViewer({ scale: 4, x: 390, y: 0 }, 50, 0, layout).x).toBe(400)
    expect(panImageViewer({ scale: 4, x: 0, y: -290 }, 0, -50, layout).y).toBe(-300)
  })

  it('cannot pan at 1×', () => {
    expect(panImageViewer(IMAGE_VIEWER_IDENTITY, 100, 100, layout)).toEqual(IMAGE_VIEWER_IDENTITY)
  })

  it('a keyboard step moves by the named pan step', () => {
    const action = getImageViewerKeyAction('ArrowLeft', { zoomed: true })
    if (action?.type !== 'pan') throw new Error('expected a pan')
    expect(panImageViewer({ scale: 4, x: 0, y: 0 }, action.dx, action.dy, layout).x).toBe(
      IMAGE_VIEWER_KEYBOARD_PAN_STEP_PX,
    )
  })
})

describe('toggleImageViewerZoom (double-click)', () => {
  it('zooms in to the double-click zoom at the cursor', () => {
    const focal = { x: 40, y: -30 }
    const t = toggleImageViewerZoom(IMAGE_VIEWER_IDENTITY, focal, layout)
    expect(t.scale).toBe(IMAGE_VIEWER_DOUBLE_CLICK_ZOOM)
  })

  it('keeps the clicked point under the cursor when bounds allow', () => {
    const big: ImageViewerLayout = { container: { width: 800, height: 600 }, image: { width: 800, height: 600 } }
    const focal = { x: 100, y: 50 }
    const t = toggleImageViewerZoom(IMAGE_VIEWER_IDENTITY, focal, big)
    expect(project(t, focal)).toEqual(focal)
  })

  it('resets when already zoomed', () => {
    expect(toggleImageViewerZoom({ scale: 3, x: 50, y: 20 }, { x: 0, y: 0 }, layout)).toEqual(
      IMAGE_VIEWER_IDENTITY,
    )
  })

  it('returns a fresh object, not the frozen identity', () => {
    const t = toggleImageViewerZoom({ scale: 3, x: 0, y: 0 }, { x: 0, y: 0 }, layout)
    expect(t).not.toBe(IMAGE_VIEWER_IDENTITY)
  })
})

describe('wheel', () => {
  it('normalises line and page delta modes to pixels', () => {
    expect(normalizeImageViewerWheelDelta(3, IMAGE_VIEWER_WHEEL_DELTA_MODE.pixel, 600)).toBe(3)
    expect(normalizeImageViewerWheelDelta(3, IMAGE_VIEWER_WHEEL_DELTA_MODE.line, 600)).toBe(
      3 * IMAGE_VIEWER_WHEEL_LINE_HEIGHT_PX,
    )
    expect(normalizeImageViewerWheelDelta(1, IMAGE_VIEWER_WHEEL_DELTA_MODE.page, 600)).toBe(600)
  })

  it('scrolling up zooms in, scrolling down zooms out', () => {
    expect(getImageViewerWheelScale(2, { deltaY: -100 })).toBeCloseTo(
      2 * Math.exp(100 * IMAGE_VIEWER_WHEEL_ZOOM_SPEED),
      12,
    )
    expect(getImageViewerWheelScale(2, { deltaY: 100 })).toBeLessThan(2)
  })

  it('a ctrl+wheel (trackpad pinch) uses the pinch sensitivity', () => {
    expect(getImageViewerWheelScale(2, { deltaY: -10, ctrlKey: true })).toBeCloseTo(
      2 * Math.exp(10 * IMAGE_VIEWER_PINCH_WHEEL_ZOOM_SPEED),
      12,
    )
    expect(getImageViewerWheelScale(2, { deltaY: -10, ctrlKey: true })).toBeGreaterThan(
      getImageViewerWheelScale(2, { deltaY: -10 }),
    )
  })

  it('clamps to 1..8', () => {
    expect(getImageViewerWheelScale(7.9, { deltaY: -10000 })).toBe(8)
    expect(getImageViewerWheelScale(1.1, { deltaY: 10000 })).toBe(1)
  })

  it('honours line mode', () => {
    expect(
      getImageViewerWheelScale(1, { deltaY: -1, deltaMode: IMAGE_VIEWER_WHEEL_DELTA_MODE.line }),
    ).toBeCloseTo(Math.exp(IMAGE_VIEWER_WHEEL_LINE_HEIGHT_PX * IMAGE_VIEWER_WHEEL_ZOOM_SPEED), 12)
  })
})

describe('pinch', () => {
  it('measures distance and midpoint', () => {
    expect(getImageViewerPointerDistance({ x: 0, y: 0 }, { x: 30, y: 40 })).toBe(50)
    expect(getImageViewerPointerMidpoint({ x: -10, y: 20 }, { x: 30, y: 40 })).toEqual({ x: 10, y: 30 })
  })

  it('maps finger spread to zoom', () => {
    expect(getImageViewerPinchScale(1, 100, 200)).toBe(2)
    expect(getImageViewerPinchScale(4, 200, 100)).toBe(2)
    expect(getImageViewerPinchScale(4, 100, 1000)).toBe(8)
    expect(getImageViewerPinchScale(2, 100, 10)).toBe(1)
  })

  it('keeps the start zoom for a degenerate start distance', () => {
    expect(getImageViewerPinchScale(3, 0, 100)).toBe(3)
    expect(getImageViewerPinchScale(3, 100, Number.NaN)).toBe(3)
  })

  it('spreading two fingers around the centre zooms in place', () => {
    const t = applyImageViewerPinch(
      IMAGE_VIEWER_IDENTITY,
      [{ x: -50, y: 0 }, { x: 50, y: 0 }],
      [{ x: -150, y: 0 }, { x: 150, y: 0 }],
      layout,
    )
    expect(t).toEqual({ scale: 3, x: 0, y: 0 })
  })

  it('keeps the point between the fingers under them', () => {
    const start: ImageViewerTransform = { scale: 4, x: 0, y: 0 }
    const prev = [{ x: 50, y: 50 }, { x: 150, y: 50 }] as const
    const next = [{ x: 25, y: 50 }, { x: 175, y: 50 }] as const
    const under = unproject(start, getImageViewerPointerMidpoint(prev[0], prev[1]))
    const t = applyImageViewerPinch(start, prev, next, layout)
    expect(t.scale).toBe(6)
    const at = project(t, under)
    expect(at.x).toBeCloseTo(100, 9)
    expect(at.y).toBeCloseTo(50, 9)
  })

  it('pans with the midpoint when the spread is unchanged', () => {
    const t = applyImageViewerPinch(
      { scale: 4, x: 0, y: 0 },
      [{ x: 0, y: 0 }, { x: 100, y: 0 }],
      [{ x: 30, y: -20 }, { x: 130, y: -20 }],
      layout,
    )
    expect(t).toEqual({ scale: 4, x: 30, y: -20 })
  })

  it('is clamped', () => {
    const t = applyImageViewerPinch(
      { scale: 4, x: 0, y: 0 },
      [{ x: 0, y: 0 }, { x: 100, y: 0 }],
      [{ x: 5000, y: 0 }, { x: 5100, y: 0 }],
      layout,
    )
    expect(t.x).toBe(400)
  })
})

describe('getImageViewerFocalPoint', () => {
  it('converts a client point to stage-centre coordinates', () => {
    const rect = { left: 100, top: 50, width: 800, height: 600 }
    expect(getImageViewerFocalPoint({ x: 500, y: 350 }, rect)).toEqual({ x: 0, y: 0 })
    expect(getImageViewerFocalPoint({ x: 100, y: 50 }, rect)).toEqual({ x: -400, y: -300 })
  })
})

describe('getImageViewerKeyAction', () => {
  it('maps + / = and - / _ to zoom and 0 to reset', () => {
    for (const key of ['+', '=']) {
      expect(getImageViewerKeyAction(key, { zoomed: false })).toEqual({ type: 'zoom-in' })
    }
    for (const key of ['-', '_']) {
      expect(getImageViewerKeyAction(key, { zoomed: true })).toEqual({ type: 'zoom-out' })
    }
    expect(getImageViewerKeyAction('0', { zoomed: true })).toEqual({ type: 'reset' })
  })

  it('pans with the arrows when zoomed (the view moves toward the arrow)', () => {
    const step = IMAGE_VIEWER_KEYBOARD_PAN_STEP_PX
    expect(getImageViewerKeyAction('ArrowLeft', { zoomed: true })).toEqual({ type: 'pan', dx: step, dy: 0 })
    expect(getImageViewerKeyAction('ArrowRight', { zoomed: true })).toEqual({ type: 'pan', dx: -step, dy: 0 })
    expect(getImageViewerKeyAction('ArrowUp', { zoomed: true })).toEqual({ type: 'pan', dx: 0, dy: step })
    expect(getImageViewerKeyAction('ArrowDown', { zoomed: true })).toEqual({ type: 'pan', dx: 0, dy: -step })
  })

  it('honours a custom pan step', () => {
    expect(getImageViewerKeyAction('ArrowRight', { zoomed: true, panStep: 10 })).toEqual({
      type: 'pan',
      dx: -10,
      dy: 0,
    })
  })

  it('switches images with left / right when not zoomed', () => {
    expect(getImageViewerKeyAction('ArrowLeft', { zoomed: false })).toEqual({ type: 'navigate', direction: -1 })
    expect(getImageViewerKeyAction('ArrowRight', { zoomed: false })).toEqual({ type: 'navigate', direction: 1 })
    expect(getImageViewerKeyAction('ArrowUp', { zoomed: false })).toBeNull()
    expect(getImageViewerKeyAction('ArrowDown', { zoomed: false })).toBeNull()
  })

  it('ignores other keys', () => {
    for (const key of ['a', 'Enter', ' ', 'Escape', 'Tab', '1']) {
      expect(getImageViewerKeyAction(key, { zoomed: true })).toBeNull()
    }
  })
})

describe('navigation', () => {
  it('clamps an index into range', () => {
    expect(clampImageViewerIndex(-3, 5)).toBe(0)
    expect(clampImageViewerIndex(9, 5)).toBe(4)
    expect(clampImageViewerIndex(2.7, 5)).toBe(2)
    expect(clampImageViewerIndex(2, 0)).toBe(0)
    expect(clampImageViewerIndex(Number.NaN, 5)).toBe(0)
  })

  it('clamps at the ends by default', () => {
    expect(getImageViewerNavIndex(0, -1, 5)).toBe(0)
    expect(getImageViewerNavIndex(4, 1, 5)).toBe(4)
    expect(getImageViewerNavIndex(2, 1, 5)).toBe(3)
    expect(getImageViewerNavIndex(2, -1, 5)).toBe(1)
  })

  it('wraps with loop', () => {
    expect(getImageViewerNavIndex(0, -1, 5, true)).toBe(4)
    expect(getImageViewerNavIndex(4, 1, 5, true)).toBe(0)
  })

  it('handles empty and single sets', () => {
    expect(getImageViewerNavIndex(0, 1, 0)).toBe(0)
    expect(getImageViewerNavIndex(0, 1, 1, true)).toBe(0)
    expect(canImageViewerNavigate(0, 1, 1, true)).toBe(false)
    expect(canImageViewerNavigate(0, 1, 0)).toBe(false)
  })

  it('reports whether previous / next can move', () => {
    expect(canImageViewerNavigate(0, -1, 3)).toBe(false)
    expect(canImageViewerNavigate(0, 1, 3)).toBe(true)
    expect(canImageViewerNavigate(2, 1, 3)).toBe(false)
    expect(canImageViewerNavigate(2, 1, 3, true)).toBe(true)
  })
})

describe('labels and createImageViewer', () => {
  it('formats the zoom percentage', () => {
    expect(getImageViewerZoomPercent(1)).toBe(100)
    expect(getImageViewerZoomPercent(2.256)).toBe(226)
    expect(getImageViewerZoomPercent(20)).toBe(800)
  })

  it('merges label overrides', () => {
    const labels = resolveImageViewerLabels({ close: 'Fermer' })
    expect(labels.close).toBe('Fermer')
    expect(labels.zoomIn).toBe(IMAGE_VIEWER_DEFAULT_LABELS.zoomIn)
    expect(IMAGE_VIEWER_DEFAULT_LABELS.position(2, 5)).toBe('Image 2 of 5')
    expect(IMAGE_VIEWER_DEFAULT_LABELS.zoom(200)).toBe('Zoom 200%')
  })

  it('derives the render state', () => {
    const api = createImageViewer({ index: 1, count: 5, transform: { scale: 2, x: 0, y: 0 } })
    expect(api.labels.dialog).toBe('Image viewer')
    expect(api.dataAttributes).toEqual({ 'data-zoomed': 'true', 'data-index': '1' })
    expect(api.positionText).toBe('Image 2 of 5')
    expect(api.zoomText).toBe('Zoom 200%')
    expect(api).toMatchObject({ zoomed: true, canZoomIn: true, canZoomOut: true, canPrevious: true, canNext: true })
  })

  it('disables the controls at the limits', () => {
    const atMin = createImageViewer({ index: 0, count: 3, transform: IMAGE_VIEWER_IDENTITY })
    expect(atMin).toMatchObject({ zoomed: false, canZoomOut: false, canZoomIn: true, canPrevious: false, canNext: true })
    const atMax = createImageViewer({ index: 2, count: 3, transform: { scale: 8, x: 0, y: 0 } })
    expect(atMax).toMatchObject({ canZoomIn: false, canNext: false })
    expect(createImageViewer({ index: 2, count: 3, transform: IMAGE_VIEWER_IDENTITY, loop: true }).canNext).toBe(true)
  })

  it('omits the position for a single image and clamps a stray index', () => {
    expect(createImageViewer({ index: 0, count: 1, transform: IMAGE_VIEWER_IDENTITY }).positionText).toBeNull()
    const api = createImageViewer({ index: 9, count: 3, transform: IMAGE_VIEWER_IDENTITY })
    expect(api.positionText).toBe('Image 3 of 3')
    expect(api.dataAttributes['data-index']).toBe('2')
  })

  it('uses custom label formatters', () => {
    const api = createImageViewer({
      index: 0,
      count: 2,
      transform: IMAGE_VIEWER_IDENTITY,
      labels: { position: (i, n) => `${i}/${n}`, zoom: (p) => `${p} pour cent`, dialog: 'Visionneuse' },
    })
    expect(api.positionText).toBe('1/2')
    expect(api.zoomText).toBe('100 pour cent')
    expect(api.labels.dialog).toBe('Visionneuse')
  })
})

describe('styles', () => {
  it('stage cursor reflects zoom and drag', () => {
    expect(imageViewerStageVariants({ zoomed: 'false' })).toContain('cursor-zoom-in')
    expect(imageViewerStageVariants({ zoomed: 'true' })).toContain('cursor-grab')
    expect(imageViewerStageVariants({ zoomed: 'true', dragging: 'true' })).toContain('cursor-grabbing')
    expect(imageViewerStageVariants()).toContain('touch-none')
  })

  it('animates only when asked, and never under reduced motion', () => {
    expect(imageViewerImageVariants({ animate: 'true' })).toContain('transition-transform')
    expect(imageViewerImageVariants({ animate: 'true' })).toContain('motion-reduce:transition-none')
    expect(imageViewerImageVariants()).toContain('transition-none')
  })

  it('places nav buttons on logical sides', () => {
    expect(imageViewerNavVariants({ side: 'start' })).toContain('start-2')
    expect(imageViewerNavVariants({ side: 'end' })).toContain('end-2')
  })
})
