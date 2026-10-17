/**
 * CollapsibleRail — headless core.
 *
 * A side rail with two widths, full (labels) and collapsed (icons only), that
 * becomes an off-canvas overlay on a narrow viewport: closed until opened,
 * opened at its collapsed width, dismissed by a backdrop or Escape. Pure state,
 * stored-width parsing and a click classifier; no framework.
 */

/**
 * The viewport at which the rail is an overlay: below 768px, the library's
 * mobile breakpoint. The overlay classes use this exact query as an arbitrary
 * variant, so the query an adapter listens to and the CSS that lays the rail
 * out cannot disagree.
 */
export const RAIL_MOBILE_MEDIA_QUERY = '(max-width: 767px)'

export interface RailState {
  /** The viewport matches {@link RAIL_MOBILE_MEDIA_QUERY}: the rail is an overlay. */
  mobile: boolean
  /**
   * The rail is on screen: always, once the viewport is known, on a wide
   * viewport; while the overlay is open on a narrow one. False until the
   * viewport is known, so a server render never paints an open overlay.
   */
  open: boolean
  /** Collapsed (icons only) or full width. */
  collapsed: boolean
}

/** The surface the rail is drawn on, which the edge control matches. */
export type RailTone = 'default' | 'tertiary'

/** The state before the viewport is known: the server render and the first paint. */
export function initialRailState(defaultCollapsed = false): RailState {
  return { mobile: false, open: false, collapsed: defaultCollapsed }
}

export type RailAction =
  /** The viewport is known or changed; `storedCollapsed` is the remembered wide-viewport width. */
  | { type: 'viewport'; mobile: boolean; storedCollapsed: boolean }
  | { type: 'expand' }
  | { type: 'collapse' }
  /** Flip the width; on a closed overlay, open it at its collapsed width instead. */
  | { type: 'toggle' }
  /** Narrow viewport: open the overlay at its collapsed width. Does nothing on a wide one. */
  | { type: 'openMobile' }
  /** Narrow viewport: close the overlay. Does nothing on a wide one. */
  | { type: 'closeMobile' }

/** The next state. Returns the same object when an action changes nothing. */
export function railReducer(state: RailState, action: RailAction): RailState {
  switch (action.type) {
    case 'viewport':
      return action.mobile
        ? { mobile: true, open: false, collapsed: true }
        : { mobile: false, open: true, collapsed: action.storedCollapsed }
    case 'expand':
      return state.collapsed ? { ...state, collapsed: false } : state
    case 'collapse':
      return state.collapsed ? state : { ...state, collapsed: true }
    case 'toggle':
      if (state.mobile && !state.open) return { ...state, open: true, collapsed: true }
      return { ...state, collapsed: !state.collapsed }
    case 'openMobile':
      return state.mobile && !state.open ? { ...state, open: true, collapsed: true } : state
    case 'closeMobile':
      return state.mobile && state.open ? { ...state, open: false, collapsed: true } : state
  }
}

/**
 * Whether a transition is a width to remember: a person's change of the
 * wide-viewport width. A viewport change is not one, and neither is the
 * overlay's own width, so using the rail on a phone never overwrites the
 * width chosen on a desktop.
 */
export function shouldPersistRail(
  previous: RailState,
  next: RailState,
  action: RailAction,
): boolean {
  return action.type !== 'viewport' && !next.mobile && previous.collapsed !== next.collapsed
}

/** The stored form of a remembered width. */
export function serializeRailCollapsed(collapsed: boolean): string {
  return collapsed ? 'true' : 'false'
}

/** A remembered width, or `fallback` when nothing (or something unreadable) is stored. */
export function parseRailCollapsed(stored: string | null, fallback: boolean): boolean {
  if (stored === 'true') return true
  if (stored === 'false') return false
  return fallback
}

/**
 * Elements inside the rail that own their click. A disabled entry is an item,
 * not empty chrome: clicking it does nothing rather than resizing the rail.
 */
export const RAIL_INTERACTIVE_SELECTOR =
  'a[href], button, input, select, textarea, label, summary, [contenteditable], ' +
  '[role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="tab"], ' +
  '[role="option"], [role="menuitem"], [aria-disabled="true"]'

/**
 * A click on the rail's own empty chrome (padding, gaps, plain text), not on a
 * control inside it, and not on content rendered elsewhere, such as a portal,
 * whose events still bubble through the rail. An adapter resizes the rail on
 * such a click.
 */
export function isRailChromeClick(target: Element | null, rail: Element): boolean {
  if (!target || !rail.contains(target)) return false
  const control = target.closest(RAIL_INTERACTIVE_SELECTOR)
  return control === null || !rail.contains(control)
}
