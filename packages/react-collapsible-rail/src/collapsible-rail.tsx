import * as React from 'react'
import {
  RAIL_MOBILE_MEDIA_QUERY,
  initialRailState,
  railReducer,
  shouldPersistRail,
  serializeRailCollapsed,
  parseRailCollapsed,
  isRailChromeClick,
  collapsibleRailVariants,
  railEdgeToggleVariants,
  railEdgeToggleIconVariants,
  railBackdropVariants,
  type RailAction,
  type RailState,
  type RailTone,
} from '@refraction-ui/collapsible-rail'
import { cn, devWarn, getFocusableElements } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Remembered width
// ---------------------------------------------------------------------------

function warnStorageUnavailable(storageKey: string, error: unknown): void {
  devWarn(
    'react-collapsible-rail/storage-unavailable',
    'useCollapsibleRail could not use localStorage, so the rail width is not remembered across visits. The rail still works on this page.',
    { storageKey, error: String(error) },
  )
}

function readStoredCollapsed(storageKey: string | undefined, fallback: boolean): boolean {
  if (!storageKey) return fallback
  try {
    return parseRailCollapsed(window.localStorage.getItem(storageKey), fallback)
  } catch (error) {
    warnStorageUnavailable(storageKey, error)
    return fallback
  }
}

function writeStoredCollapsed(storageKey: string, collapsed: boolean): void {
  try {
    window.localStorage.setItem(storageKey, serializeRailCollapsed(collapsed))
  } catch (error) {
    warnStorageUnavailable(storageKey, error)
  }
}

// ---------------------------------------------------------------------------
// useCollapsibleRail
// ---------------------------------------------------------------------------

export interface UseCollapsibleRailOptions {
  /**
   * localStorage key the wide-viewport width is remembered under. Omit it to
   * remember the width for the life of the component only.
   */
  storageKey?: string
  /** The wide-viewport width when nothing is remembered. Default: full. */
  defaultCollapsed?: boolean
}

export interface CollapsibleRailController {
  /** The rail's state; pass `collapsed`, `open` and `mobile` to the rail parts. */
  state: RailState
  expand: () => void
  collapse: () => void
  /** Flip the width; on a closed overlay, open it instead. */
  toggle: () => void
  /** Narrow viewport: open the overlay, at its collapsed width. */
  openMobile: () => void
  /** Narrow viewport: close the overlay. */
  closeMobile: () => void
  /** Pass as the rail's `onClick`: a click on its empty chrome flips the width. */
  onChromeClick: (event: React.MouseEvent<HTMLElement>) => void
}

/**
 * State for a {@link CollapsibleRail}: its width, remembered per device, and
 * on a narrow viewport whether its overlay is open. Escape closes an open
 * overlay. Until the viewport is known (the server render and the first
 * paint), the rail is at `defaultCollapsed` and its overlay is closed.
 */
export function useCollapsibleRail({
  storageKey,
  defaultCollapsed = false,
}: UseCollapsibleRailOptions = {}): CollapsibleRailController {
  const [state, setState] = React.useState<RailState>(() => initialRailState(defaultCollapsed))
  // The last state applied, so consecutive actions compute (and persist) from
  // it rather than from a render's snapshot.
  const latest = React.useRef(state)
  // The wide-viewport width chosen on this page, for a viewport round trip
  // without storage (or when storage fails).
  const chosen = React.useRef<boolean | null>(null)

  const dispatch = React.useCallback(
    (action: RailAction) => {
      const previous = latest.current
      const next = railReducer(previous, action)
      if (next === previous) return
      latest.current = next
      setState(next)
      if (shouldPersistRail(previous, next, action)) {
        chosen.current = next.collapsed
        if (storageKey) writeStoredCollapsed(storageKey, next.collapsed)
      }
    },
    [storageKey],
  )

  React.useEffect(() => {
    const query =
      typeof window.matchMedia === 'function' ? window.matchMedia(RAIL_MOBILE_MEDIA_QUERY) : null
    const apply = (mobile: boolean) =>
      dispatch({
        type: 'viewport',
        mobile,
        storedCollapsed: readStoredCollapsed(storageKey, chosen.current ?? defaultCollapsed),
      })
    apply(query?.matches ?? false)
    if (!query) return
    const onChange = (event: MediaQueryListEvent) => apply(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [dispatch, storageKey, defaultCollapsed])

  const overlayOpen = state.mobile && state.open
  React.useEffect(() => {
    if (!overlayOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      dispatch({ type: 'closeMobile' })
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [overlayOpen, dispatch])

  const actions = React.useMemo(
    () => ({
      expand: () => dispatch({ type: 'expand' }),
      collapse: () => dispatch({ type: 'collapse' }),
      toggle: () => dispatch({ type: 'toggle' }),
      openMobile: () => dispatch({ type: 'openMobile' }),
      closeMobile: () => dispatch({ type: 'closeMobile' }),
      onChromeClick: (event: React.MouseEvent<HTMLElement>) => {
        if (event.defaultPrevented) return
        const target = event.target instanceof Element ? event.target : null
        if (!isRailChromeClick(target, event.currentTarget)) return
        dispatch({ type: latest.current.collapsed ? 'expand' : 'collapse' })
      },
    }),
    [dispatch],
  )

  return React.useMemo(() => ({ state, ...actions }), [state, actions])
}

// ---------------------------------------------------------------------------
// CollapsibleRail
// ---------------------------------------------------------------------------

function useComposedRef<T>(
  forwarded: React.ForwardedRef<T>,
  local: React.MutableRefObject<T | null>,
): React.RefCallback<T> {
  return React.useCallback(
    (node: T | null) => {
      local.current = node
      if (typeof forwarded === 'function') forwarded(node)
      else if (forwarded) forwarded.current = node
    },
    [forwarded, local],
  )
}

/**
 * Keeps keyboard focus sensible around the overlay: a closed overlay is inert
 * (off screen, so nothing in it can be focused or read), opening it moves
 * focus to its first control, and closing it returns focus to whatever had it
 * before, when focus was inside the rail or was lost with the backdrop.
 */
function useOverlayFocus(
  railRef: React.RefObject<HTMLElement | null>,
  mobile: boolean,
  open: boolean,
): void {
  const opener = React.useRef<HTMLElement | null>(null)
  const wasOverlayOpen = React.useRef(false)

  React.useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    const overlayOpen = mobile && open
    const overlayClosed = mobile && !open
    const active = rail.ownerDocument.activeElement
    const focusInsideOrLost = !active || active === rail.ownerDocument.body || rail.contains(active)

    rail.toggleAttribute('inert', overlayClosed)

    if (overlayOpen && !wasOverlayOpen.current) {
      opener.current = active instanceof HTMLElement && !rail.contains(active) ? active : null
      const first = getFocusableElements(rail)[0]
      if (first instanceof HTMLElement) first.focus()
    } else if (overlayClosed && wasOverlayOpen.current) {
      const target = opener.current
      if (focusInsideOrLost && target?.isConnected) target.focus()
    }
    if (!overlayOpen) opener.current = null
    wasOverlayOpen.current = overlayOpen
  }, [railRef, mobile, open])
}

export interface CollapsibleRailProps extends React.HTMLAttributes<HTMLElement> {
  /** Collapsed (icons only) or full width. */
  collapsed: boolean
  /** The rail is on screen; on a narrow viewport, whether the overlay is open. */
  open: boolean
  /**
   * The viewport is narrow and the rail is an overlay. A closed overlay is
   * inert, and opening and closing it moves focus. Default `false`.
   */
  mobile?: boolean
  /** Full width, any CSS length. Default `14rem`. */
  expandedWidth?: string
  /** Collapsed width, any CSS length. Default `4rem`. */
  collapsedWidth?: string
}

/**
 * A side rail whose width follows `collapsed` and which, on a narrow viewport,
 * is an off-canvas overlay that slides in when `open`. Drive it with
 * {@link useCollapsibleRail}. It renders an `<aside>`; put a labelled `<nav>`
 * inside it, and keep it `overflow: visible` so its {@link RailEdgeToggle} can
 * hang over the edge (scroll a child instead).
 */
export const CollapsibleRail = React.forwardRef<HTMLElement, CollapsibleRailProps>(
  function CollapsibleRail(
    {
      collapsed,
      open,
      mobile = false,
      expandedWidth = '14rem',
      collapsedWidth = '4rem',
      className,
      style,
      ...props
    },
    ref,
  ) {
    const railRef = React.useRef<HTMLElement | null>(null)
    const setRef = useComposedRef(ref, railRef)
    useOverlayFocus(railRef, mobile, open)

    return (
      <aside
        ref={setRef}
        data-slot="collapsible-rail"
        data-collapsed={collapsed ? 'true' : 'false'}
        data-open={open ? 'true' : 'false'}
        data-mobile={mobile ? 'true' : 'false'}
        className={cn(collapsibleRailVariants({ open: open ? 'true' : 'false' }), className)}
        style={{ width: collapsed ? collapsedWidth : expandedWidth, ...style }}
        {...props}
      />
    )
  },
)

// ---------------------------------------------------------------------------
// RailEdgeToggle
// ---------------------------------------------------------------------------

export interface RailEdgeToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The rail is collapsed; the control then offers to expand it. */
  collapsed: boolean
  /** The rail is on screen; the control hides with a closed overlay. */
  open: boolean
  /** The surface the rail is drawn on. Default `'default'`. */
  tone?: RailTone
  /** Accessible name while collapsed. Default "Expand navigation". */
  expandLabel?: string
  /** Accessible name while expanded. Default "Collapse navigation". */
  collapseLabel?: string
}

/** The round control on the rail's end edge that flips its width. Place it inside the rail. */
export const RailEdgeToggle = React.forwardRef<HTMLButtonElement, RailEdgeToggleProps>(
  function RailEdgeToggle(
    {
      collapsed,
      open,
      tone = 'default',
      expandLabel = 'Expand navigation',
      collapseLabel = 'Collapse navigation',
      className,
      ...props
    },
    ref,
  ) {
    const label = collapsed ? expandLabel : collapseLabel
    return (
      <button
        ref={ref}
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={!collapsed}
        data-slot="rail-edge-toggle"
        className={cn(railEdgeToggleVariants({ tone, open: open ? 'true' : 'false' }), className)}
        {...props}
      >
        <svg
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
          focusable="false"
          className={railEdgeToggleIconVariants()}
        >
          <path
            d={collapsed ? 'M3.5 1.5 7 5 3.5 8.5' : 'M6.5 1.5 3 5l3.5 3.5'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    )
  },
)

// ---------------------------------------------------------------------------
// RailBackdrop
// ---------------------------------------------------------------------------

export interface RailBackdropProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The name of the dismiss action, such as "Close navigation". */
  'aria-label': string
}

/**
 * The scrim beside an open overlay rail. Render it while the overlay is open
 * and close the rail on click; it never shows on a wide viewport.
 */
export const RailBackdrop = React.forwardRef<HTMLButtonElement, RailBackdropProps>(
  function RailBackdrop({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        data-slot="rail-backdrop"
        className={cn(railBackdropVariants(), className)}
        {...props}
      />
    )
  },
)
