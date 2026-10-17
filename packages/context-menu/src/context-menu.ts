import type { MenuItemProps } from '@refraction-ui/dropdown-menu'

// ---------------------------------------------------------------------------
// Named constants
// ---------------------------------------------------------------------------

/** How long a touch or pen must rest before it counts as a long-press. */
export const CONTEXT_MENU_LONG_PRESS_DELAY_MS = 500

/** How far (px) a long-press may drift before it is treated as a scroll/drag. */
export const CONTEXT_MENU_LONG_PRESS_TOLERANCE_PX = 10

/** Minimum gap (px) kept between the menu and the viewport edge. */
export const CONTEXT_MENU_COLLISION_PADDING_PX = 8

/**
 * A submenu is pulled up by the menu's inner padding so its first item lines
 * up with the sub-trigger instead of sitting one padding-width lower.
 */
export const CONTEXT_SUBMENU_ALIGN_OFFSET_PX = 4

/** Hover intent: how long the pointer rests on a sub-trigger before it opens. */
export const CONTEXT_SUBMENU_OPEN_DELAY_MS = 100

/**
 * Hover intent: grace period after the pointer leaves a sub-trigger or submenu,
 * long enough to travel diagonally into the submenu without it collapsing.
 */
export const CONTEXT_SUBMENU_CLOSE_DELAY_MS = 300

/** Typed characters within this window extend the typeahead query. */
export const CONTEXT_MENU_TYPEAHEAD_RESET_MS = 500

/** Keyboard key that opens a context menu at the focused element. */
export const CONTEXT_MENU_KEY = 'ContextMenu'

/** Shift + this key also opens a context menu (the common platform fallback). */
export const CONTEXT_MENU_SHIFT_KEY = 'F10'

const SUBMENU_OPEN_KEYS: readonly string[] = ['ArrowRight', 'Enter', ' ']
const SUBMENU_CLOSE_KEY = 'ArrowLeft'
const LONG_PRESS_POINTER_TYPES: readonly string[] = ['touch', 'pen']

// ---------------------------------------------------------------------------
// Item shapes — mirror DropdownMenu so one menu definition serves both
// ---------------------------------------------------------------------------

/** Visual tone of an item. `destructive` marks irreversible actions. */
export type ContextMenuItemVariant = 'default' | 'destructive'

/**
 * A plain action item. Extends DropdownMenu's `MenuItemProps`
 * (`disabled`, `onSelect`) so the same item definition renders in either menu.
 */
export interface ContextMenuItemProps extends MenuItemProps {
  /** Tone of the item. Defaults to `default`. */
  variant?: ContextMenuItemVariant
  /** Indent the label to line up with checkable items. */
  inset?: boolean
  /** Text used for typeahead when the children are not plain text. */
  textValue?: string
}

/** A toggleable item (`role="menuitemcheckbox"`). */
export interface ContextMenuCheckboxItemProps extends MenuItemProps {
  /** Whether the item is checked (controlled). */
  checked?: boolean
  /** Called with the next checked state when the item is toggled. */
  onCheckedChange?: (checked: boolean) => void
  /** Text used for typeahead when the children are not plain text. */
  textValue?: string
}

/** One choice inside a radio group (`role="menuitemradio"`). */
export interface ContextMenuRadioItemProps extends MenuItemProps {
  /** The value this item selects in its group. */
  value: string
  /** Text used for typeahead when the children are not plain text. */
  textValue?: string
}

/** The kind of menu row, which decides its role and ARIA state. */
export type ContextMenuItemKind = 'item' | 'checkbox' | 'radio' | 'subtrigger'

export interface ContextMenuItemAriaInput {
  kind: ContextMenuItemKind
  disabled?: boolean
  /** Checked state for `checkbox` and `radio` kinds. */
  checked?: boolean
  /** Whether the submenu is open, for the `subtrigger` kind. */
  expanded?: boolean
  /** Id of the submenu content, for the `subtrigger` kind. */
  controls?: string
}

const ITEM_ROLES: Record<ContextMenuItemKind, string> = {
  item: 'menuitem',
  checkbox: 'menuitemcheckbox',
  radio: 'menuitemradio',
  subtrigger: 'menuitem',
}

/** Roles that roving focus and typeahead move between. */
export const CONTEXT_MENU_ITEM_ROLES: readonly string[] = ['menuitem', 'menuitemcheckbox', 'menuitemradio']

/**
 * Role, focusability and ARIA state for one menu row. Items are focused
 * programmatically (roving focus), so every row is `tabIndex: -1`; Tab leaves
 * the menu rather than walking it.
 */
export function getContextMenuItemAria(
  input: ContextMenuItemAriaInput,
): Record<string, string | number | boolean> {
  const { kind, disabled = false } = input
  const props: Record<string, string | number | boolean> = {
    role: ITEM_ROLES[kind],
    tabIndex: -1,
  }
  if (disabled) {
    props['aria-disabled'] = true
    props['data-disabled'] = ''
  }
  if (kind === 'checkbox' || kind === 'radio') {
    const checked = input.checked ?? false
    props['aria-checked'] = checked
    props['data-state'] = checked ? 'checked' : 'unchecked'
  }
  if (kind === 'subtrigger') {
    const expanded = input.expanded ?? false
    props['aria-haspopup'] = 'menu'
    props['aria-expanded'] = expanded
    props['data-state'] = expanded ? 'open' : 'closed'
    if (input.controls) props['aria-controls'] = input.controls
  }
  return props
}

// ---------------------------------------------------------------------------
// Collision-aware positioning
// ---------------------------------------------------------------------------

export interface ContextMenuPoint {
  x: number
  y: number
}

export interface ContextMenuSize {
  width: number
  height: number
}

export interface ContextMenuRect {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ContextMenuPlacement {
  /** Left edge in viewport (fixed) coordinates. */
  x: number
  /** Top edge in viewport (fixed) coordinates. */
  y: number
  /** True when the menu opens leftwards of its anchor because the right side had no room. */
  flippedX: boolean
  /** True when the menu opens upwards of its anchor because there was no room below. */
  flippedY: boolean
  /** Largest height that fits in the viewport; taller menus scroll. */
  maxHeight: number
}

export interface ContextMenuPositionOptions {
  /** Minimum gap kept from every viewport edge. */
  padding?: number
}

interface AxisPlacement {
  position: number
  flipped: boolean
}

/**
 * Resolve one axis: use the preferred side if it fits, else flip to the
 * opposite side if that fits, else shift the menu so it stays on screen
 * (pinned to the start edge when it is larger than the viewport).
 */
function resolveAxis(
  preferred: number,
  flipped: number,
  size: number,
  viewport: number,
  padding: number,
): AxisPlacement {
  const max = viewport - padding - size
  if (preferred <= max) return { position: Math.max(padding, preferred), flipped: false }
  if (flipped >= padding) return { position: flipped, flipped: true }
  return { position: Math.max(padding, max), flipped: false }
}

function availableHeight(viewport: ContextMenuSize, padding: number): number {
  return Math.max(0, viewport.height - padding * 2)
}

/**
 * Place a context menu opened at `point` (the pointer, or an element anchor
 * for keyboard opening). The menu's top-left corner sits on the point; it
 * flips left/up when it would overflow, and shifts back inside the viewport
 * when neither side fits.
 */
export function computeContextMenuPosition(
  point: ContextMenuPoint,
  menu: ContextMenuSize,
  viewport: ContextMenuSize,
  options: ContextMenuPositionOptions = {},
): ContextMenuPlacement {
  const padding = options.padding ?? CONTEXT_MENU_COLLISION_PADDING_PX
  const x = resolveAxis(point.x, point.x - menu.width, menu.width, viewport.width, padding)
  const y = resolveAxis(point.y, point.y - menu.height, menu.height, viewport.height, padding)
  return {
    x: x.position,
    y: y.position,
    flippedX: x.flipped,
    flippedY: y.flipped,
    maxHeight: availableHeight(viewport, padding),
  }
}

export interface ContextSubmenuPositionOptions extends ContextMenuPositionOptions {
  /** How far the submenu is pulled up so its first item aligns with the trigger. */
  alignOffset?: number
}

/**
 * Place a submenu beside its sub-trigger: to the right, top-aligned, flipping
 * to the left of the parent menu and/or bottom-aligned when it would overflow.
 */
export function computeContextSubmenuPosition(
  anchor: ContextMenuRect,
  menu: ContextMenuSize,
  viewport: ContextMenuSize,
  options: ContextSubmenuPositionOptions = {},
): ContextMenuPlacement {
  const padding = options.padding ?? CONTEXT_MENU_COLLISION_PADDING_PX
  const alignOffset = options.alignOffset ?? CONTEXT_SUBMENU_ALIGN_OFFSET_PX
  const x = resolveAxis(anchor.right, anchor.left - menu.width, menu.width, viewport.width, padding)
  const y = resolveAxis(
    anchor.top - alignOffset,
    anchor.bottom + alignOffset - menu.height,
    menu.height,
    viewport.height,
    padding,
  )
  return {
    x: x.position,
    y: y.position,
    flippedX: x.flipped,
    flippedY: y.flipped,
    maxHeight: availableHeight(viewport, padding),
  }
}

/**
 * Where a keyboard-opened menu anchors: the focused element's bottom-start
 * corner, so the menu appears under the row it acts on.
 */
export function getContextMenuElementAnchor(rect: ContextMenuRect): ContextMenuPoint {
  return { x: rect.left, y: rect.bottom }
}

// ---------------------------------------------------------------------------
// Opening gestures
// ---------------------------------------------------------------------------

export interface ContextMenuKeyInput {
  key: string
  shiftKey?: boolean
}

/** True for the ContextMenu key and Shift+F10, the keyboard ways to open a context menu. */
export function isContextMenuOpenKey(event: ContextMenuKeyInput): boolean {
  if (event.key === CONTEXT_MENU_KEY) return true
  return event.key === CONTEXT_MENU_SHIFT_KEY && event.shiftKey === true
}

/** Long-press opens the menu only for touch and pen; mice use the secondary button. */
export function isContextMenuLongPressPointer(pointerType: string): boolean {
  return LONG_PRESS_POINTER_TYPES.includes(pointerType)
}

/** True once a pressed pointer has moved far enough that it is a scroll or drag, not a long-press. */
export function exceedsContextMenuLongPressTolerance(
  start: ContextMenuPoint,
  current: ContextMenuPoint,
  tolerance: number = CONTEXT_MENU_LONG_PRESS_TOLERANCE_PX,
): boolean {
  return Math.hypot(current.x - start.x, current.y - start.y) > tolerance
}

// ---------------------------------------------------------------------------
// Roving focus and submenu keys
// ---------------------------------------------------------------------------

function firstEnabled(disabled: readonly boolean[]): number {
  return disabled.findIndex((d) => !d)
}

function lastEnabled(disabled: readonly boolean[]): number {
  for (let i = disabled.length - 1; i >= 0; i--) if (!disabled[i]) return i
  return -1
}

function stepEnabled(disabled: readonly boolean[], current: number, step: 1 | -1): number {
  const count = disabled.length
  for (let offset = 1; offset <= count; offset++) {
    const index = (((current + step * offset) % count) + count) % count
    if (!disabled[index]) return index
  }
  return -1
}

/**
 * Next focused row for a navigation key, skipping disabled rows and wrapping
 * at the ends. `current` is -1 when no row is focused yet (the menu itself has
 * focus): ArrowDown then lands on the first row and ArrowUp on the last.
 * Unhandled keys return `current`; a menu with no enabled rows returns -1.
 */
export function getNextContextMenuIndex(disabled: readonly boolean[], current: number, key: string): number {
  if (firstEnabled(disabled) === -1) return -1
  switch (key) {
    case 'Home':
      return firstEnabled(disabled)
    case 'End':
      return lastEnabled(disabled)
    case 'ArrowDown':
      return current < 0 ? firstEnabled(disabled) : stepEnabled(disabled, current, 1)
    case 'ArrowUp':
      return current < 0 ? lastEnabled(disabled) : stepEnabled(disabled, current, -1)
    default:
      return current
  }
}

/** Keys that open a submenu from its focused sub-trigger. */
export function isContextSubmenuOpenKey(key: string): boolean {
  return SUBMENU_OPEN_KEYS.includes(key)
}

/** Key that closes a submenu and returns focus to its sub-trigger. */
export function isContextSubmenuCloseKey(key: string): boolean {
  return key === SUBMENU_CLOSE_KEY
}

// ---------------------------------------------------------------------------
// Typeahead
// ---------------------------------------------------------------------------

export interface ContextMenuTypeaheadState {
  /** Characters typed so far in this burst (lower-cased). */
  query: string
  /** Timestamp of the last typed character, or null before any typing. */
  lastKeyAt: number | null
}

export const CONTEXT_MENU_TYPEAHEAD_INITIAL: ContextMenuTypeaheadState = { query: '', lastKeyAt: null }

export interface ContextMenuTypeaheadKeyInput {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
}

/**
 * A printable single character with no command modifier. Space is excluded
 * because it activates the focused row.
 */
export function isContextMenuTypeaheadKey(event: ContextMenuTypeaheadKeyInput): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false
  return event.key.length === 1 && event.key !== ' '
}

/**
 * Append a typed character. `now` is injected (e.g. the event's timeStamp) so
 * the rule stays deterministic; a pause longer than `resetMs` starts a new query.
 */
export function appendContextMenuTypeahead(
  state: ContextMenuTypeaheadState,
  char: string,
  now: number,
  resetMs: number = CONTEXT_MENU_TYPEAHEAD_RESET_MS,
): ContextMenuTypeaheadState {
  const expired = state.lastKeyAt === null || now - state.lastKeyAt > resetMs
  const query = (expired ? '' : state.query) + char.toLowerCase()
  return { query, lastKeyAt: now }
}

export interface ContextMenuTypeaheadItem {
  label: string
  disabled?: boolean
}

function isRepeatedChar(query: string): boolean {
  return query.length > 1 && query.split('').every((c) => c === query[0])
}

/**
 * Index of the row whose label starts with the query, searching forward and
 * wrapping. A fresh single character (or the same character repeated) starts
 * after the current row so repeated presses cycle through matches; a longer
 * query starts at the current row so it stays put while it still matches.
 * Disabled rows never match. Returns -1 when nothing matches.
 */
export function findContextMenuTypeaheadIndex(
  items: readonly ContextMenuTypeaheadItem[],
  query: string,
  current: number,
): number {
  if (!query || items.length === 0) return -1
  const cycling = query.length === 1 || isRepeatedChar(query)
  const needle = cycling ? query[0] : query
  const start = cycling ? current + 1 : Math.max(current, 0)
  for (let offset = 0; offset < items.length; offset++) {
    const index = (((start + offset) % items.length) + items.length) % items.length
    const item = items[index]
    if (item.disabled) continue
    if (item.label.trim().toLowerCase().startsWith(needle)) return index
  }
  return -1
}
