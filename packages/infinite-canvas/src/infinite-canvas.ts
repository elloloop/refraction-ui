/** Transform state for an infinite canvas viewport. */
export type CanvasTransform = {
  zoom: number
  x: number
  y: number
}

/** Axis-aligned bounding box of canvas content. */
export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

/**
 * Clamp a zoom level to [min, max].
 *
 * Defaults match common design-tool conventions: 25 % (0.25) to 400 % (4).
 */
export function clampZoom(zoom: number, min = 0.25, max = 4): number {
  return Math.min(Math.max(zoom, min), max)
}

/**
 * Compute the transform that centers `bounds` inside a viewport of size
 * `viewportW × viewportH` with optional uniform `padding` (default 32 px).
 *
 * Returns a `CanvasTransform` clamped to [0.25, 4].
 */
export function fitTransform(
  bounds: Bounds,
  viewportW: number,
  viewportH: number,
  padding = 32,
): CanvasTransform {
  const contentW = bounds.maxX - bounds.minX
  const contentH = bounds.maxY - bounds.minY

  if (contentW <= 0 || contentH <= 0 || viewportW <= 0 || viewportH <= 0) {
    return { zoom: 1, x: 0, y: 0 }
  }

  const availW = viewportW - padding * 2
  const availH = viewportH - padding * 2
  const rawZoom = Math.min(availW / contentW, availH / contentH)
  const zoom = clampZoom(rawZoom)

  // Center the scaled content within the viewport.
  const scaledW = contentW * zoom
  const scaledH = contentH * zoom
  const x = (viewportW - scaledW) / 2 - bounds.minX * zoom
  const y = (viewportH - scaledH) / 2 - bounds.minY * zoom

  return { zoom, x, y }
}

/**
 * Convert a `CanvasTransform` to a CSS `transform` string suitable for the
 * content layer (`transformOrigin: '0 0'`).
 */
export function transformToCss(t: CanvasTransform): string {
  return `translate(${t.x}px, ${t.y}px) scale(${t.zoom})`
}

export interface CreateInfiniteCanvasOptions {
  zoom?: number
}

export interface InfiniteCanvasAPI {
  /** ARIA attributes to spread on the viewport element. */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string | number | boolean>
}

/**
 * Build the framework-agnostic props for an infinite canvas viewport.
 *
 * Returns `role="group"` plus data attributes; adapters spread these onto
 * their container element.
 */
export function createInfiniteCanvas(
  options: CreateInfiniteCanvasOptions = {},
): InfiniteCanvasAPI {
  const { zoom = 1 } = options

  return {
    ariaProps: {
      role: 'group',
      'aria-label': 'Canvas',
    },
    dataAttributes: {
      'data-zoom': zoom,
    },
  }
}
