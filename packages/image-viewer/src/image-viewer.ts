/**
 * Headless ImageViewer core — the zoom, pan, pinch, keyboard and navigation
 * maths for a lightbox. Pure and deterministic: every function takes the
 * measured sizes and pointer positions as inputs, so adapters only measure
 * and render.
 *
 * Coordinate model. The image is laid out "contained" in the stage (see
 * {@link fitImageViewerImage}) and centred. The adapter then applies
 * `translate(x, y) scale(scale)` with `transform-origin: center`. All points
 * (focal points, pointers) are expressed relative to the **stage centre**, so
 * an image point `p` (relative to the image centre, unscaled) is drawn at
 * `translate + scale * p`.
 */

/** Smallest zoom: the image fitted to the stage. */
export const IMAGE_VIEWER_MIN_ZOOM = 1
/** Largest zoom (8×). */
export const IMAGE_VIEWER_MAX_ZOOM = 8
/** Multiplicative step for the +/− keys and the zoom buttons. */
export const IMAGE_VIEWER_ZOOM_STEP_FACTOR = 1.5
/** Zoom a double-click jumps to from the fitted view. */
export const IMAGE_VIEWER_DOUBLE_CLICK_ZOOM = 2
/** Distance one arrow-key press pans, in CSS pixels. */
export const IMAGE_VIEWER_KEYBOARD_PAN_STEP_PX = 48
/**
 * Wheel sensitivity: `scale *= exp(-deltaY * speed)`. A mouse notch is about
 * 100 px of delta (≈18 % per notch); a trackpad pinch arrives as `ctrlKey`
 * wheel events with much smaller deltas, so it gets a larger factor.
 */
export const IMAGE_VIEWER_WHEEL_ZOOM_SPEED = 0.002
export const IMAGE_VIEWER_PINCH_WHEEL_ZOOM_SPEED = 0.01
/** CSS pixels per line for `WheelEvent.DOM_DELTA_LINE` deltas. */
export const IMAGE_VIEWER_WHEEL_LINE_HEIGHT_PX = 16
/** Below this the scale counts as "not zoomed" (absorbs float drift). */
const ZOOM_EPSILON = 1e-6
const PERCENT = 100

/** `WheelEvent.deltaMode` values (the DOM constants, named here). */
export const IMAGE_VIEWER_WHEEL_DELTA_MODE = { pixel: 0, line: 1, page: 2 } as const

export interface ImageViewerSize {
  width: number
  height: number
}

/** A point relative to the stage centre (or a raw client point). */
export interface ImageViewerPoint {
  x: number
  y: number
}

/** The view transform: zoom and translation (CSS px, from the stage centre). */
export interface ImageViewerTransform {
  scale: number
  x: number
  y: number
}

/** The measured stage and the fitted (scale 1) image size. */
export interface ImageViewerLayout {
  container: ImageViewerSize
  image: ImageViewerSize
}

/** The fitted, centred view. */
export const IMAGE_VIEWER_IDENTITY: ImageViewerTransform = Object.freeze({ scale: 1, x: 0, y: 0 })

const ORIGIN: ImageViewerPoint = Object.freeze({ x: 0, y: 0 })

function isPositive(n: number): boolean {
  return Number.isFinite(n) && n > 0
}

/** Clamp a zoom into `[min, max]`; a non-finite zoom falls back to `min`. */
export function clampImageViewerZoom(
  scale: number,
  min: number = IMAGE_VIEWER_MIN_ZOOM,
  max: number = IMAGE_VIEWER_MAX_ZOOM,
): number {
  if (!Number.isFinite(scale)) return min
  return Math.min(max, Math.max(min, scale))
}

/** Whether the view is zoomed in past the fitted view. */
export function isImageViewerZoomed(transform: ImageViewerTransform): boolean {
  return transform.scale > IMAGE_VIEWER_MIN_ZOOM + ZOOM_EPSILON
}

/**
 * Size of the image at zoom 1: contained in the stage, preserving aspect
 * ratio, and never upscaled past its natural size (a small screenshot stays
 * crisp until the user zooms). Unknown sizes give `{0, 0}`.
 */
export function fitImageViewerImage(
  natural: ImageViewerSize,
  container: ImageViewerSize,
): ImageViewerSize {
  if (![natural.width, natural.height, container.width, container.height].every(isPositive)) {
    return { width: 0, height: 0 }
  }
  const ratio = Math.min(container.width / natural.width, container.height / natural.height, 1)
  return { width: natural.width * ratio, height: natural.height * ratio }
}

/**
 * How far the image may move from centre on each axis at `scale`. On an axis
 * where the scaled image fits inside the stage it stays centred (0); where it
 * overflows, its edges may reach — but never pass — the stage edges, so the
 * image can't be dragged out of view.
 */
export function getImageViewerPanBounds(scale: number, layout: ImageViewerLayout): ImageViewerPoint {
  const overflow = (image: number, container: number) =>
    Math.max(0, (image * scale - container) / 2)
  return {
    x: overflow(layout.image.width, layout.container.width),
    y: overflow(layout.image.height, layout.container.height),
  }
}

function clampAxis(value: number, bound: number): number {
  // `+ 0` normalises -0, which would otherwise leak into equality checks.
  return Math.min(bound, Math.max(-bound, value)) + 0
}

/** Clamp the zoom and the translation so the image stays in view. */
export function clampImageViewerTransform(
  transform: ImageViewerTransform,
  layout: ImageViewerLayout,
): ImageViewerTransform {
  const scale = clampImageViewerZoom(transform.scale)
  const bounds = getImageViewerPanBounds(scale, layout)
  return { scale, x: clampAxis(transform.x, bounds.x), y: clampAxis(transform.y, bounds.y) }
}

/** Unclamped focal zoom: keeps the image point under `focal` in place. */
function zoomAround(
  transform: ImageViewerTransform,
  nextScale: number,
  focal: ImageViewerPoint,
): ImageViewerTransform {
  const ratio = nextScale / transform.scale
  return {
    scale: nextScale,
    x: focal.x - ratio * (focal.x - transform.x),
    y: focal.y - ratio * (focal.y - transform.y),
  }
}

/**
 * Zoom to `nextScale` around `focal` (relative to the stage centre). The image
 * point under the focal point stays under it — what makes wheel, pinch and
 * double-click zoom feel anchored to the cursor — then the result is clamped.
 */
export function zoomImageViewerAt(
  transform: ImageViewerTransform,
  nextScale: number,
  focal: ImageViewerPoint,
  layout: ImageViewerLayout,
): ImageViewerTransform {
  const scale = clampImageViewerZoom(nextScale)
  return clampImageViewerTransform(zoomAround(transform, scale, focal), layout)
}

/** One +/− step (`direction` 1 zooms in, -1 out) around `focal` (default: centre). */
export function stepImageViewerZoom(
  transform: ImageViewerTransform,
  direction: 1 | -1,
  layout: ImageViewerLayout,
  focal: ImageViewerPoint = ORIGIN,
): ImageViewerTransform {
  const factor = direction > 0 ? IMAGE_VIEWER_ZOOM_STEP_FACTOR : 1 / IMAGE_VIEWER_ZOOM_STEP_FACTOR
  return zoomImageViewerAt(transform, transform.scale * factor, focal, layout)
}

/** Move the image by `(dx, dy)` CSS px, clamped to the pan bounds. */
export function panImageViewer(
  transform: ImageViewerTransform,
  dx: number,
  dy: number,
  layout: ImageViewerLayout,
): ImageViewerTransform {
  return clampImageViewerTransform({ ...transform, x: transform.x + dx, y: transform.y + dy }, layout)
}

/** Double-click: zoom in to {@link IMAGE_VIEWER_DOUBLE_CLICK_ZOOM} at `focal`, or reset when zoomed. */
export function toggleImageViewerZoom(
  transform: ImageViewerTransform,
  focal: ImageViewerPoint,
  layout: ImageViewerLayout,
): ImageViewerTransform {
  if (isImageViewerZoomed(transform)) return { ...IMAGE_VIEWER_IDENTITY }
  return zoomImageViewerAt(transform, IMAGE_VIEWER_DOUBLE_CLICK_ZOOM, focal, layout)
}

/** Convert a wheel delta to CSS pixels whatever its `deltaMode`. */
export function normalizeImageViewerWheelDelta(
  delta: number,
  deltaMode: number,
  pageHeight: number,
): number {
  if (deltaMode === IMAGE_VIEWER_WHEEL_DELTA_MODE.line) return delta * IMAGE_VIEWER_WHEEL_LINE_HEIGHT_PX
  if (deltaMode === IMAGE_VIEWER_WHEEL_DELTA_MODE.page) return delta * pageHeight
  return delta
}

export interface ImageViewerWheelInput {
  deltaY: number
  /** `WheelEvent.deltaMode`; defaults to pixels. */
  deltaMode?: number
  /** True for a trackpad pinch (browsers report it as a ctrl+wheel). */
  ctrlKey?: boolean
  /** Stage height, used for page-mode deltas. */
  pageHeight?: number
}

/** Zoom a wheel event asks for (clamped). Scrolling up / pinching out zooms in. */
export function getImageViewerWheelScale(scale: number, input: ImageViewerWheelInput): number {
  const delta = normalizeImageViewerWheelDelta(
    input.deltaY,
    input.deltaMode ?? IMAGE_VIEWER_WHEEL_DELTA_MODE.pixel,
    input.pageHeight ?? 0,
  )
  const speed = input.ctrlKey ? IMAGE_VIEWER_PINCH_WHEEL_ZOOM_SPEED : IMAGE_VIEWER_WHEEL_ZOOM_SPEED
  return clampImageViewerZoom(scale * Math.exp(-delta * speed))
}

/** Distance between two pointers. */
export function getImageViewerPointerDistance(a: ImageViewerPoint, b: ImageViewerPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

/** Midpoint between two pointers (the pinch focal point). */
export function getImageViewerPointerMidpoint(a: ImageViewerPoint, b: ImageViewerPoint): ImageViewerPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/**
 * Pinch distance → zoom: the zoom scales with the finger spread relative to
 * where the pinch started. A degenerate start (fingers together) keeps the
 * starting zoom rather than dividing by zero.
 */
export function getImageViewerPinchScale(
  startScale: number,
  startDistance: number,
  distance: number,
): number {
  if (!isPositive(startDistance) || !Number.isFinite(distance)) return clampImageViewerZoom(startScale)
  return clampImageViewerZoom(startScale * (distance / startDistance))
}

/** Two pointer positions (relative to the stage centre). */
export type ImageViewerPointerPair = readonly [ImageViewerPoint, ImageViewerPoint]

/**
 * One two-finger move: the image follows the midpoint (pan) and scales with
 * the spread around the new midpoint (zoom), then is clamped.
 */
export function applyImageViewerPinch(
  transform: ImageViewerTransform,
  previous: ImageViewerPointerPair,
  next: ImageViewerPointerPair,
  layout: ImageViewerLayout,
): ImageViewerTransform {
  const from = getImageViewerPointerMidpoint(previous[0], previous[1])
  const to = getImageViewerPointerMidpoint(next[0], next[1])
  const scale = getImageViewerPinchScale(
    transform.scale,
    getImageViewerPointerDistance(previous[0], previous[1]),
    getImageViewerPointerDistance(next[0], next[1]),
  )
  const moved = { ...transform, x: transform.x + to.x - from.x, y: transform.y + to.y - from.y }
  return clampImageViewerTransform(zoomAround(moved, scale, to), layout)
}

/** A client point → a point relative to the centre of `rect` (the stage). */
export function getImageViewerFocalPoint(
  client: ImageViewerPoint,
  rect: { left: number; top: number; width: number; height: number },
): ImageViewerPoint {
  return { x: client.x - rect.left - rect.width / 2, y: client.y - rect.top - rect.height / 2 }
}

/** What a key press does in the viewer. */
export type ImageViewerKeyAction =
  | { type: 'zoom-in' }
  | { type: 'zoom-out' }
  | { type: 'reset' }
  | { type: 'pan'; dx: number; dy: number }
  | { type: 'navigate'; direction: 1 | -1 }

const ZOOM_IN_KEYS = new Set(['+', '='])
const ZOOM_OUT_KEYS = new Set(['-', '_'])
const RESET_KEY = '0'

// Arrow keys move the *view* in the arrow's direction, so the image moves the
// opposite way: ArrowLeft reveals the part of the image to the left.
const PAN_DIRECTIONS: Record<string, ImageViewerPoint> = {
  ArrowLeft: { x: 1, y: 0 },
  ArrowRight: { x: -1, y: 0 },
  ArrowUp: { x: 0, y: 1 },
  ArrowDown: { x: 0, y: -1 },
}
const NAVIGATE_DIRECTIONS: Record<string, 1 | -1> = { ArrowLeft: -1, ArrowRight: 1 }

/**
 * The keyboard map, shared by every adapter.
 *
 * - `+` / `=` zoom in, `-` / `_` zoom out, `0` resets.
 * - Arrow keys **pan when zoomed** (by `panStep`), and ArrowLeft / ArrowRight
 *   **switch images when not zoomed** — at 1× there is nothing to pan, so the
 *   arrows do the next most useful thing. Up / Down do nothing at 1×.
 *
 * Returns `null` for keys the viewer does not handle.
 */
export function getImageViewerKeyAction(
  key: string,
  options: { zoomed: boolean; panStep?: number },
): ImageViewerKeyAction | null {
  if (ZOOM_IN_KEYS.has(key)) return { type: 'zoom-in' }
  if (ZOOM_OUT_KEYS.has(key)) return { type: 'zoom-out' }
  if (key === RESET_KEY) return { type: 'reset' }
  const pan = PAN_DIRECTIONS[key]
  if (!pan) return null
  if (options.zoomed) {
    const step = options.panStep ?? IMAGE_VIEWER_KEYBOARD_PAN_STEP_PX
    // `+ 0` keeps a zero axis as +0 rather than -0.
    return { type: 'pan', dx: pan.x * step + 0, dy: pan.y * step + 0 }
  }
  const direction = NAVIGATE_DIRECTIONS[key]
  return direction ? { type: 'navigate', direction } : null
}

/** Clamp an index into `[0, count - 1]` (0 for an empty set). */
export function clampImageViewerIndex(index: number, count: number): number {
  if (count <= 0 || !Number.isFinite(index)) return 0
  return Math.min(count - 1, Math.max(0, Math.trunc(index)))
}

/**
 * Previous / next. By default the set **clamps** at its ends (the buttons
 * disable, and "Image 5 of 5" never silently jumps back to 1); `loop` wraps.
 */
export function getImageViewerNavIndex(
  index: number,
  direction: 1 | -1,
  count: number,
  loop = false,
): number {
  if (count <= 0) return 0
  const target = clampImageViewerIndex(index, count) + direction
  if (loop) return (target + count) % count
  return clampImageViewerIndex(target, count)
}

/** Whether previous / next would move to another image. */
export function canImageViewerNavigate(
  index: number,
  direction: 1 | -1,
  count: number,
  loop = false,
): boolean {
  if (count <= 1) return false
  return getImageViewerNavIndex(index, direction, count, loop) !== clampImageViewerIndex(index, count)
}

/** Zoom as a whole percentage (2 → 200). */
export function getImageViewerZoomPercent(scale: number): number {
  return Math.round(clampImageViewerZoom(scale) * PERCENT)
}

/** Every user-visible / announced string, overridable for localisation. */
export interface ImageViewerLabels {
  dialog: string
  close: string
  zoomIn: string
  zoomOut: string
  resetZoom: string
  previous: string
  next: string
  /** Position in the set, 1-based: "Image 2 of 5". */
  position: (index: number, count: number) => string
  /** Zoom announcement: "Zoom 200%". */
  zoom: (percent: number) => string
}

export const IMAGE_VIEWER_DEFAULT_LABELS: ImageViewerLabels = Object.freeze({
  dialog: 'Image viewer',
  close: 'Close',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  resetZoom: 'Reset zoom',
  previous: 'Previous image',
  next: 'Next image',
  position: (index: number, count: number) => `Image ${index} of ${count}`,
  zoom: (percent: number) => `Zoom ${percent}%`,
})

/** Merge partial label overrides over the defaults. */
export function resolveImageViewerLabels(labels?: Partial<ImageViewerLabels>): ImageViewerLabels {
  return { ...IMAGE_VIEWER_DEFAULT_LABELS, ...labels }
}

export interface ImageViewerProps {
  /** Current image (0-based). */
  index: number
  /** Number of images in the set. */
  count: number
  /** Current view transform. */
  transform: ImageViewerTransform
  /** Wrap previous / next at the ends. */
  loop?: boolean
  labels?: Partial<ImageViewerLabels>
}

export interface ImageViewerAPI {
  /** Styling hooks. */
  dataAttributes: Record<string, string>
  /** "Image 2 of 5", or `null` for a single image. */
  positionText: string | null
  /** "Zoom 200%". */
  zoomText: string
  zoomPercent: number
  zoomed: boolean
  canZoomIn: boolean
  canZoomOut: boolean
  canPrevious: boolean
  canNext: boolean
  labels: ImageViewerLabels
}

/** Derive everything an adapter renders from the current state. */
export function createImageViewer(props: ImageViewerProps): ImageViewerAPI {
  const { count, transform, loop = false } = props
  const labels = resolveImageViewerLabels(props.labels)
  const index = clampImageViewerIndex(props.index, count)
  const zoomPercent = getImageViewerZoomPercent(transform.scale)
  const zoomed = isImageViewerZoomed(transform)
  const scale = clampImageViewerZoom(transform.scale)
  return {
    dataAttributes: {
      'data-zoomed': zoomed ? 'true' : 'false',
      'data-index': String(index),
    },
    positionText: count > 1 ? labels.position(index + 1, count) : null,
    zoomText: labels.zoom(zoomPercent),
    zoomPercent,
    zoomed,
    canZoomIn: scale < IMAGE_VIEWER_MAX_ZOOM,
    canZoomOut: zoomed,
    canPrevious: canImageViewerNavigate(index, -1, count, loop),
    canNext: canImageViewerNavigate(index, 1, count, loop),
    labels,
  }
}
