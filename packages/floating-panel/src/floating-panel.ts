/**
 * Headless logic for a floating panel: a small, non-modal window (e.g. a mini
 * call preview) that rests in one of the four viewport corners, is dragged by
 * a handle and snaps to the nearest corner on drop.
 *
 * All geometry is in CSS pixels in viewport coordinates, and a position is
 * always the panel's top-left point (what `left`/`top` on a `position: fixed`
 * element take). Everything here is pure: adapters measure the DOM and feed
 * the numbers in.
 */

/** A viewport corner the panel can rest in. Physical, not logical (RTL-independent). */
export type FloatingPanelCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/** Vertical half of a corner. */
export type FloatingPanelVerticalSide = 'top' | 'bottom'

/** Horizontal half of a corner. */
export type FloatingPanelHorizontalSide = 'left' | 'right'

/** Width/height in CSS pixels. */
export interface FloatingPanelSize {
  width: number
  height: number
}

/** A point in viewport coordinates (CSS pixels). */
export interface FloatingPanelPoint {
  x: number
  y: number
}

/** Everything the geometry helpers need to know about the layout. */
export interface FloatingPanelLayout {
  /** The visible viewport size. */
  viewport: FloatingPanelSize
  /** The panel's rendered size. */
  panel: FloatingPanelSize
  /** Gap kept between the panel and the viewport edges. */
  margin: number
}

/** Whether the panel animates into place or jumps there. */
export type FloatingPanelMotion = 'animated' | 'instant'

/** Every corner, in a fixed order (also the tie-break order for snapping). */
export const FLOATING_PANEL_CORNERS: readonly FloatingPanelCorner[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
]

/** Where the panel starts when no corner is given: out of the way of most content. */
export const FLOATING_PANEL_DEFAULT_CORNER: FloatingPanelCorner = 'bottom-right'

/** Default gap between the panel and the viewport edges (Tailwind `4` = 1rem). */
export const FLOATING_PANEL_DEFAULT_MARGIN_PX = 16

/** Media query adapters use to make the snap instant. */
export const FLOATING_PANEL_REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

/** Default user-facing strings; adapters expose each one as an overridable prop. */
export const FLOATING_PANEL_DEFAULT_LABELS = {
  handle: 'Move panel',
  handleDescription: 'Use the arrow keys to move the panel to another corner.',
  collapse: 'Collapse panel',
  expand: 'Expand panel',
} as const

const CORNER_LABELS: Record<FloatingPanelCorner, string> = {
  'top-left': 'top left',
  'top-right': 'top right',
  'bottom-left': 'bottom left',
  'bottom-right': 'bottom right',
}

/** Split a corner into its vertical and horizontal sides. */
export function parseFloatingPanelCorner(corner: FloatingPanelCorner): {
  vertical: FloatingPanelVerticalSide
  horizontal: FloatingPanelHorizontalSide
} {
  const [vertical, horizontal] = corner.split('-') as [
    FloatingPanelVerticalSide,
    FloatingPanelHorizontalSide,
  ]
  return { vertical, horizontal }
}

/** Join a vertical and horizontal side into a corner. */
export function composeFloatingPanelCorner(
  vertical: FloatingPanelVerticalSide,
  horizontal: FloatingPanelHorizontalSide,
): FloatingPanelCorner {
  return `${vertical}-${horizontal}`
}

/** Type guard for untrusted input (e.g. a corner restored from storage). */
export function isFloatingPanelCorner(value: unknown): value is FloatingPanelCorner {
  return typeof value === 'string' && (FLOATING_PANEL_CORNERS as readonly string[]).includes(value)
}

/** Human-readable corner name ("bottom right"), for announcements. */
export function getFloatingPanelCornerLabel(corner: FloatingPanelCorner): string {
  return CORNER_LABELS[corner]
}

/** Default live-region text after the panel lands in a new corner. */
export function formatFloatingPanelCornerAnnouncement(corner: FloatingPanelCorner): string {
  return `Panel moved to ${getFloatingPanelCornerLabel(corner)}`
}

/**
 * Clamp one axis so the panel stays `margin` away from both edges.
 *
 * When the panel does not fit with margins on that axis it is centred in what
 * room there is, and when it is larger than the viewport it is pinned to the
 * start edge (0) so its top/left — where the drag handle lives — stays visible.
 */
function clampAxis(value: number, size: number, viewportSize: number, margin: number): number {
  const max = viewportSize - size - margin
  if (max < margin) return Math.max(0, (viewportSize - size) / 2)
  return Math.min(Math.max(value, margin), max)
}

/** Keep a panel position inside the viewport (minus the margin) on both axes. */
export function clampFloatingPanelPosition(
  position: FloatingPanelPoint,
  layout: FloatingPanelLayout,
): FloatingPanelPoint {
  const { viewport, panel, margin } = layout
  return {
    x: clampAxis(position.x, panel.width, viewport.width, margin),
    y: clampAxis(position.y, panel.height, viewport.height, margin),
  }
}

/**
 * The top-left point of a panel resting in `corner`. Always clamped, so a
 * viewport that shrank below the panel size still yields an on-screen point.
 */
export function getFloatingPanelCornerPosition(
  corner: FloatingPanelCorner,
  layout: FloatingPanelLayout,
): FloatingPanelPoint {
  const { viewport, panel, margin } = layout
  const { vertical, horizontal } = parseFloatingPanelCorner(corner)
  const raw = {
    x: horizontal === 'left' ? margin : viewport.width - panel.width - margin,
    y: vertical === 'top' ? margin : viewport.height - panel.height - margin,
  }
  return clampFloatingPanelPosition(raw, layout)
}

function squaredDistance(a: FloatingPanelPoint, b: FloatingPanelPoint): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

/**
 * The corner a panel dropped at `position` snaps to: the corner whose resting
 * position is closest (Euclidean). Ties — e.g. a drop exactly in the middle —
 * go to the earliest corner in {@link FLOATING_PANEL_CORNERS} so the result is
 * deterministic.
 */
export function getNearestFloatingPanelCorner(
  position: FloatingPanelPoint,
  layout: FloatingPanelLayout,
): FloatingPanelCorner {
  let nearest = FLOATING_PANEL_CORNERS[0]
  let best = Number.POSITIVE_INFINITY
  for (const corner of FLOATING_PANEL_CORNERS) {
    const distance = squaredDistance(position, getFloatingPanelCornerPosition(corner, layout))
    if (distance < best) {
      best = distance
      nearest = corner
    }
  }
  return nearest
}

/** Where on the panel the pointer grabbed it, so the panel doesn't jump under the pointer. */
export function getFloatingPanelGrabOffset(
  pointer: FloatingPanelPoint,
  panelPosition: FloatingPanelPoint,
): FloatingPanelPoint {
  return { x: pointer.x - panelPosition.x, y: pointer.y - panelPosition.y }
}

/** The panel position while dragging: follows the pointer, clamped inside the viewport. */
export function getFloatingPanelDragPosition(
  pointer: FloatingPanelPoint,
  grabOffset: FloatingPanelPoint,
  layout: FloatingPanelLayout,
): FloatingPanelPoint {
  return clampFloatingPanelPosition(
    { x: pointer.x - grabOffset.x, y: pointer.y - grabOffset.y },
    layout,
  )
}

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'] as const

/** Whether a key moves the panel (adapters prevent page scroll for these). */
export function isFloatingPanelMoveKey(key: string): boolean {
  return (ARROW_KEYS as readonly string[]).includes(key)
}

/**
 * Keyboard move rule: an arrow key moves the panel to the adjacent corner in
 * that direction; at an edge it stays put (no wrapping, like the pointer can't
 * push it off-screen). Other keys return `corner` unchanged.
 *
 * Corners are the only resting places, so jumping corner-to-corner gives every
 * key press a visible, announceable result. A pixel nudge would snap back to
 * the same corner for any nudge under half the viewport, i.e. look like a
 * no-op, and would need a second "drop" key to commit.
 */
export function getNextFloatingPanelCorner(
  corner: FloatingPanelCorner,
  key: string,
): FloatingPanelCorner {
  const { vertical, horizontal } = parseFloatingPanelCorner(corner)
  switch (key) {
    case 'ArrowUp':
      return composeFloatingPanelCorner('top', horizontal)
    case 'ArrowDown':
      return composeFloatingPanelCorner('bottom', horizontal)
    case 'ArrowLeft':
      return composeFloatingPanelCorner(vertical, 'left')
    case 'ArrowRight':
      return composeFloatingPanelCorner(vertical, 'right')
    default:
      return corner
  }
}

/**
 * CSS offsets that pin the panel to `corner` without measuring — used for the
 * server render and first paint, before the adapter knows the panel size.
 */
export function getFloatingPanelAnchorStyle(
  corner: FloatingPanelCorner,
  margin: number,
): Partial<Record<FloatingPanelVerticalSide | FloatingPanelHorizontalSide, number>> {
  const { vertical, horizontal } = parseFloatingPanelCorner(corner)
  return { [vertical]: margin, [horizontal]: margin }
}

/**
 * Whether the next position change animates. Only a user-initiated move (a
 * drop, an arrow key or a new `corner`) animates — `settling` — so the panel
 * glides into its corner. A drag follows the pointer 1:1 (easing would lag),
 * re-clamping on resize or collapse should not trail the viewport edge, and
 * under reduced motion every move is instant.
 */
export function getFloatingPanelMotion(options: {
  settling: boolean
  dragging: boolean
  reducedMotion: boolean
}): FloatingPanelMotion {
  const { settling, dragging, reducedMotion } = options
  return settling && !dragging && !reducedMotion ? 'animated' : 'instant'
}

export interface FloatingPanelOptions {
  /** Current corner. */
  corner: FloatingPanelCorner
  /** Whether the body is collapsed. */
  collapsed?: boolean
  /** Whether a pointer drag is in progress. */
  dragging?: boolean
  /** Result of {@link getFloatingPanelMotion}. */
  motion?: FloatingPanelMotion
}

export interface FloatingPanelAPI {
  /** ARIA attributes for the panel root. */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Root props for a floating panel.
 *
 * The root is `role="region"` (named by the adapter), not `role="dialog"`: the
 * panel is persistent page content the user keeps working beside, it never
 * takes focus on open, has no Escape-to-close contract and traps nothing. A
 * named region is a landmark, so screen-reader users can still jump straight
 * to it; a non-modal dialog would promise dialog behaviour it doesn't have.
 */
export function createFloatingPanel(options: FloatingPanelOptions): FloatingPanelAPI {
  const { corner, collapsed = false, dragging = false, motion = 'instant' } = options
  return {
    ariaProps: { role: 'region' },
    dataAttributes: {
      'data-corner': corner,
      'data-state': collapsed ? 'collapsed' : 'expanded',
      'data-dragging': dragging ? 'true' : 'false',
      'data-motion': motion,
    },
  }
}
