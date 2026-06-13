/** A rectangle in 2-D space. */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** A single item to be represented as a dot on the minimap. */
export interface MiniMapItem {
  id: string
  x: number
  y: number
  width?: number
  height?: number
}

export interface MiniMapAPI {
  /** ARIA attributes to spread on the minimap container element. */
  ariaProps: { role: 'img'; 'aria-label': string }
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Compute the bounding box that encloses all items (using their x/y + optional
 * width/height). Returns a zero-size rect at the origin when `items` is empty.
 */
export function contentBounds(items: MiniMapItem[]): Rect {
  if (items.length === 0) return { x: 0, y: 0, width: 0, height: 0 }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const item of items) {
    const right = item.x + (item.width ?? 0)
    const bottom = item.y + (item.height ?? 0)
    if (item.x < minX) minX = item.x
    if (item.y < minY) minY = item.y
    if (right > maxX) maxX = right
    if (bottom > maxY) maxY = bottom
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

/**
 * Compute the uniform scale factor that fits `contentRect` into the minimap
 * box (after subtracting `padding` on each side). Returns 1 when the content
 * has zero area (nothing to scale).
 */
export function miniScale(
  contentRect: Rect,
  miniW: number,
  miniH: number,
  padding = 8,
): number {
  const availW = miniW - padding * 2
  const availH = miniH - padding * 2
  if (availW <= 0 || availH <= 0) return 1
  if (contentRect.width === 0 || contentRect.height === 0) return 1
  return Math.min(availW / contentRect.width, availH / contentRect.height)
}

/**
 * Map a world-space point `{ x, y }` to minimap pixel coordinates.
 *
 * @param point       World coordinate
 * @param contentRect Bounding box of all content (from `contentBounds`)
 * @param scale       Scale factor (from `miniScale`)
 * @param padding     Padding inset in px (must match the value passed to `miniScale`)
 */
export function worldToMini(
  point: { x: number; y: number },
  contentRect: Rect,
  scale: number,
  padding = 8,
): { x: number; y: number } {
  return {
    x: (point.x - contentRect.x) * scale + padding,
    y: (point.y - contentRect.y) * scale + padding,
  }
}

/**
 * Compute the position and size of the viewport indicator rectangle in
 * minimap coordinates, ready to be applied as CSS `left/top/width/height`.
 */
export function viewportRectInMini(
  viewport: Rect,
  contentRect: Rect,
  scale: number,
  padding = 8,
): Rect {
  const { x, y } = worldToMini(
    { x: viewport.x, y: viewport.y },
    contentRect,
    scale,
    padding,
  )
  return {
    x,
    y,
    width: viewport.width * scale,
    height: viewport.height * scale,
  }
}

/**
 * Build the framework-agnostic ARIA props for the minimap container.
 *
 * Every adapter spreads `ariaProps` onto its outermost element; `dataAttributes`
 * are available for CSS hooks.
 */
export function createMiniMap(): MiniMapAPI {
  return {
    ariaProps: { role: 'img', 'aria-label': 'Minimap' },
    dataAttributes: { 'data-component': 'mini-map' },
  }
}
