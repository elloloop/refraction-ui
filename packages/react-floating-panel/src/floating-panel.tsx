import * as React from 'react'
import {
  createFloatingPanel,
  clampFloatingPanelPosition,
  getFloatingPanelCornerPosition,
  getNearestFloatingPanelCorner,
  getFloatingPanelGrabOffset,
  getFloatingPanelDragPosition,
  isFloatingPanelMoveKey,
  getNextFloatingPanelCorner,
  getFloatingPanelAnchorStyle,
  getFloatingPanelMotion,
  formatFloatingPanelCornerAnnouncement,
  floatingPanelVariants,
  floatingPanelHeaderClass,
  floatingPanelHandleVariants,
  floatingPanelHeaderContentClass,
  floatingPanelBodyClass,
  floatingPanelSrOnlyClass,
  FLOATING_PANEL_DEFAULT_CORNER,
  FLOATING_PANEL_DEFAULT_MARGIN_PX,
  FLOATING_PANEL_DEFAULT_LABELS,
  FLOATING_PANEL_REDUCED_MOTION_QUERY,
  type FloatingPanelCorner,
  type FloatingPanelLayout,
  type FloatingPanelPoint,
} from '@refraction-ui/floating-panel'
import { IconButton } from '@refraction-ui/react-icon-button'
import { cn } from '@refraction-ui/shared'

export type { FloatingPanelCorner }

export interface FloatingPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'aria-label'> {
  /** Required accessible name of the panel region (e.g. "Call with Ada"). */
  label: string
  /** Visible header content next to the drag handle (e.g. caller name, timer). */
  header?: React.ReactNode
  /** Controlled corner. */
  corner?: FloatingPanelCorner
  /** Initial corner for uncontrolled usage. */
  defaultCorner?: FloatingPanelCorner
  /** Called with the corner the user moved the panel to (drop or arrow key). */
  onCornerChange?: (corner: FloatingPanelCorner) => void
  /** Controlled collapsed state. */
  collapsed?: boolean
  /** Initial collapsed state for uncontrolled usage. */
  defaultCollapsed?: boolean
  /** Called when the collapse control is toggled. */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Gap between the panel and the viewport edges, in CSS pixels. */
  margin?: number
  /** Accessible name of the drag handle. */
  handleLabel?: string
  /** Screen-reader hint on the drag handle describing the keyboard moves. */
  handleDescription?: string
  /** Accessible name of the collapse control while expanded. */
  collapseLabel?: string
  /** Accessible name of the collapse control while collapsed. */
  expandLabel?: string
  /** Live-region text announced after the panel lands in a new corner. */
  formatCornerAnnouncement?: (corner: FloatingPanelCorner) => string
}

// useLayoutEffect warns during SSR on React 18; measuring only matters in the browser.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

const PRIMARY_BUTTON = 0
const GRIP_ICON_SIZE_PX = 16
const CHEVRON_ICON_SIZE_PX = 16

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
): [T, (value: T) => void] {
  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : internal
  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )
  return [value, setValue]
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia(FLOATING_PANEL_REDUCED_MOTION_QUERY)
    setReduced(query.matches)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])
  return reduced
}

function viewportSize() {
  const root = document.documentElement
  return {
    width: root.clientWidth || window.innerWidth,
    height: root.clientHeight || window.innerHeight,
  }
}

function sameLayout(a: FloatingPanelLayout | null, b: FloatingPanelLayout): boolean {
  return (
    a !== null &&
    a.margin === b.margin &&
    a.viewport.width === b.viewport.width &&
    a.viewport.height === b.viewport.height &&
    a.panel.width === b.panel.width &&
    a.panel.height === b.panel.height
  )
}

/**
 * Viewport + panel size, re-measured on mount, on window resize, when the
 * panel resizes (ResizeObserver, where available) and whenever
 * `remeasureKey` changes (collapsing changes the height, and jsdom/older
 * browsers have no ResizeObserver to notice).
 */
function useFloatingPanelLayout(
  panelRef: React.RefObject<HTMLDivElement | null>,
  margin: number,
  onViewportResize: () => void,
  remeasureKey: unknown,
): FloatingPanelLayout | null {
  const [layout, setLayout] = React.useState<FloatingPanelLayout | null>(null)

  const measure = React.useCallback(() => {
    const panel = panelRef.current
    if (!panel) return
    const next = {
      viewport: viewportSize(),
      panel: { width: panel.offsetWidth, height: panel.offsetHeight },
      margin,
    }
    setLayout((prev) => (sameLayout(prev, next) ? prev : next))
  }, [panelRef, margin])

  useIsomorphicLayoutEffect(measure, [measure, remeasureKey])

  const onResizeRef = React.useRef(onViewportResize)
  onResizeRef.current = onViewportResize

  React.useEffect(() => {
    const onResize = () => {
      onResizeRef.current()
      measure()
    }
    window.addEventListener('resize', onResize)
    const panel = panelRef.current
    const observer =
      typeof ResizeObserver !== 'undefined' && panel ? new ResizeObserver(measure) : null
    if (observer && panel) observer.observe(panel)
    return () => {
      window.removeEventListener('resize', onResize)
      observer?.disconnect()
    }
  }, [measure, panelRef])

  return layout
}

/** Stops text selection anywhere on the page while a drag is in progress. */
function useSelectionLock() {
  const previousRef = React.useRef<string | null>(null)
  const release = React.useCallback(() => {
    if (previousRef.current === null) return
    document.body.style.userSelect = previousRef.current
    previousRef.current = null
  }, [])
  const lock = React.useCallback(() => {
    if (previousRef.current !== null) return
    previousRef.current = document.body.style.userSelect
    document.body.style.userSelect = 'none'
  }, [])
  React.useEffect(() => release, [release])
  return { lock, release }
}

interface DragSession {
  pointerId: number
  grabOffset: FloatingPanelPoint
}

function toPoint(event: React.PointerEvent): FloatingPanelPoint {
  return { x: event.clientX, y: event.clientY }
}

function roundPoint(point: FloatingPanelPoint): FloatingPanelPoint {
  // Whole pixels keep the panel's text crisp under a transform.
  return { x: Math.round(point.x), y: Math.round(point.y) }
}

function GripIcon() {
  return (
    <svg
      width={GRIP_ICON_SIZE_PX}
      height={GRIP_ICON_SIZE_PX}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="5.5" cy="3.5" r="1.25" />
      <circle cx="10.5" cy="3.5" r="1.25" />
      <circle cx="5.5" cy="8" r="1.25" />
      <circle cx="10.5" cy="8" r="1.25" />
      <circle cx="5.5" cy="12.5" r="1.25" />
      <circle cx="10.5" cy="12.5" r="1.25" />
    </svg>
  )
}

function ChevronIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg
      width={CHEVRON_ICON_SIZE_PX}
      height={CHEVRON_ICON_SIZE_PX}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={direction === 'down' ? 'M4 6l4 4 4-4' : 'M4 10l4-4 4 4'} />
    </svg>
  )
}

/**
 * FloatingPanel — a small, non-modal window (e.g. a mini call preview) that
 * rests in a viewport corner.
 *
 * Drag it by the handle and it snaps to the nearest corner on drop; the arrow
 * keys on the handle move it to the adjacent corner. It is re-clamped inside
 * the viewport whenever the window or the panel resizes. Position (`corner`)
 * and `collapsed` are controllable. The root is a named `role="region"`: it
 * never takes or traps focus and the page behind it stays interactive. The
 * snap animates only after a user move and is instant under reduced motion.
 * Geometry and keyboard rules come from the headless
 * `@refraction-ui/floating-panel` core.
 */
export const FloatingPanel = React.forwardRef<HTMLDivElement, FloatingPanelProps>(
  function FloatingPanel(
    {
      label,
      header,
      corner: cornerProp,
      defaultCorner = FLOATING_PANEL_DEFAULT_CORNER,
      onCornerChange,
      collapsed: collapsedProp,
      defaultCollapsed = false,
      onCollapsedChange,
      margin = FLOATING_PANEL_DEFAULT_MARGIN_PX,
      handleLabel = FLOATING_PANEL_DEFAULT_LABELS.handle,
      handleDescription = FLOATING_PANEL_DEFAULT_LABELS.handleDescription,
      collapseLabel = FLOATING_PANEL_DEFAULT_LABELS.collapse,
      expandLabel = FLOATING_PANEL_DEFAULT_LABELS.expand,
      formatCornerAnnouncement = formatFloatingPanelCornerAnnouncement,
      className,
      style,
      children,
      onTransitionEnd,
      ...props
    },
    ref,
  ) {
    const [corner, setCorner] = useControllableState(cornerProp, defaultCorner, onCornerChange)
    const [collapsed, setCollapsed] = useControllableState(
      collapsedProp,
      defaultCollapsed,
      onCollapsedChange,
    )
    const reducedMotion = usePrefersReducedMotion()
    const [settling, setSettling] = React.useState(false)
    const [announcement, setAnnouncement] = React.useState('')

    // A new corner (from a drop, a key or the parent) glides into place and is
    // announced. Derived during render so the animation starts with the move.
    const [prevCorner, setPrevCorner] = React.useState(corner)
    if (corner !== prevCorner) {
      setPrevCorner(corner)
      setSettling(true)
      setAnnouncement(formatCornerAnnouncement(corner))
    }

    const panelRef = React.useRef<HTMLDivElement | null>(null)
    const setRefs = React.useCallback(
      (node: HTMLDivElement | null) => {
        panelRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const stopSettling = React.useCallback(() => setSettling(false), [])
    const layout = useFloatingPanelLayout(panelRef, margin, stopSettling, collapsed)

    const dragRef = React.useRef<DragSession | null>(null)
    const [dragPosition, setDragPosition] = React.useState<FloatingPanelPoint | null>(null)
    const selection = useSelectionLock()
    const dragging = dragPosition !== null

    const resting = layout ? getFloatingPanelCornerPosition(corner, layout) : null
    const position =
      dragPosition && layout ? clampFloatingPanelPosition(dragPosition, layout) : resting

    const endDrag = (target: Element, pointerId: number) => {
      dragRef.current = null
      setDragPosition(null)
      selection.release()
      if (target.hasPointerCapture?.(pointerId)) target.releasePointerCapture(pointerId)
    }

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
      // Primary button / first touch only; a right-click or second finger
      // shouldn't start a drag.
      if (event.button !== PRIMARY_BUTTON || event.isPrimary === false || !resting) return
      const pointer = toPoint(event)
      dragRef.current = {
        pointerId: event.pointerId,
        grabOffset: getFloatingPanelGrabOffset(pointer, resting),
      }
      event.currentTarget.setPointerCapture?.(event.pointerId)
      selection.lock()
      setDragPosition(resting)
    }

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId || !layout) return
      setDragPosition(getFloatingPanelDragPosition(toPoint(event), drag.grabOffset, layout))
    }

    const handlePointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId || !layout) return
      const dropped = getFloatingPanelDragPosition(toPoint(event), drag.grabOffset, layout)
      endDrag(event.currentTarget, event.pointerId)
      // Animate back even when the nearest corner is the current one.
      setSettling(true)
      const next = getNearestFloatingPanelCorner(dropped, layout)
      if (next !== corner) setCorner(next)
    }

    // A cancelled gesture (or lost capture) puts the panel back where it was.
    const handlePointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== event.pointerId) return
      endDrag(event.currentTarget, event.pointerId)
      setSettling(true)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!isFloatingPanelMoveKey(event.key)) return
      // Arrows at an edge are still consumed so the page doesn't scroll.
      event.preventDefault()
      const next = getNextFloatingPanelCorner(corner, event.key)
      if (next !== corner) setCorner(next)
    }

    const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) setSettling(false)
      onTransitionEnd?.(event)
    }

    const motion = getFloatingPanelMotion({ settling, dragging, reducedMotion })
    const api = createFloatingPanel({ corner, collapsed, dragging, motion })

    const placed = position ? roundPoint(position) : null
    const positionStyle: React.CSSProperties = placed
      ? { left: 0, top: 0, transform: `translate3d(${placed.x}px, ${placed.y}px, 0)` }
      : getFloatingPanelAnchorStyle(corner, margin)

    const bodyId = React.useId()
    const hintId = React.useId()

    return (
      <div
        {...props}
        ref={setRefs}
        {...api.ariaProps}
        aria-label={label}
        {...api.dataAttributes}
        className={cn(
          floatingPanelVariants({ motion, dragging: dragging ? 'true' : 'false' }),
          className,
        )}
        style={{ ...style, ...positionStyle }}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className={floatingPanelHeaderClass}>
          <button
            type="button"
            aria-label={handleLabel}
            aria-describedby={hintId}
            data-floating-panel-handle=""
            className={floatingPanelHandleVariants({ dragging: dragging ? 'true' : 'false' })}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onLostPointerCapture={handlePointerCancel}
            onKeyDown={handleKeyDown}
          >
            <GripIcon />
          </button>
          <span id={hintId} className={floatingPanelSrOnlyClass}>
            {handleDescription}
          </span>
          <div className={floatingPanelHeaderContentClass}>{header}</div>
          <IconButton
            variant="ghost"
            size="sm"
            icon={<ChevronIcon direction={collapsed ? 'up' : 'down'} />}
            label={collapsed ? expandLabel : collapseLabel}
            aria-expanded={!collapsed}
            aria-controls={bodyId}
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>
        <div id={bodyId} hidden={collapsed} className={floatingPanelBodyClass}>
          {children}
        </div>
        <span role="status" aria-live="polite" className={floatingPanelSrOnlyClass}>
          {announcement}
        </span>
      </div>
    )
  },
)
