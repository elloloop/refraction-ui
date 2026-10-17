/**
 * Headless logic for a chat message row: action overflow, toolbar visibility,
 * roving toolbar focus, long-press and tap gating, highlight timing and the
 * accessible-label wiring. Everything here is pure and DOM-free so each rule
 * is unit-testable and shared by every adapter.
 */

/** Hold a press this long (ms) before it counts as a long-press. Matches Flutter's `kLongPressTimeout`. */
export const MESSAGE_ROW_LONG_PRESS_DELAY_MS = 500

/**
 * A pointer that travels further than this (CSS px) while pressed is a drag —
 * usually a text selection — so it cancels the long-press. Small enough to
 * catch a selection drag, large enough to forgive finger jitter.
 */
export const MESSAGE_ROW_LONG_PRESS_MOVE_TOLERANCE_PX = 10

/** Actions shown as inline toolbar buttons before the rest overflow into a menu. */
export const MESSAGE_ROW_DEFAULT_MAX_INLINE_ACTIONS = 3

/** Avatar gutter width (CSS px). Continuation rows keep the gutter so bodies line up. */
export const MESSAGE_ROW_DEFAULT_AVATAR_SIZE_PX = 36

/** How long a `highlighted` jump target stays fully highlighted before it fades. */
export const MESSAGE_ROW_HIGHLIGHT_HOLD_MS = 1000

/**
 * Length of the fade. Keep in sync with the `duration-1000` class in
 * `messageRowVariants` (the CSS transition does the actual fading).
 */
export const MESSAGE_ROW_HIGHLIGHT_FADE_MS = 1000

export const MESSAGE_ROW_DEFAULT_TOMBSTONE_TEXT = 'This message was deleted'
export const MESSAGE_ROW_DEFAULT_TOOLBAR_LABEL = 'Message actions'
export const MESSAGE_ROW_DEFAULT_MORE_ACTIONS_LABEL = 'More actions'

/** Browser default root font size; used to express the avatar gutter in rem. */
const ROOT_FONT_SIZE_PX = 16

/**
 * Elements inside a row that own their own click / press. A tap or a
 * long-press that starts on one of these belongs to that control, not to the
 * row (e.g. a toolbar button, a link in the body, a reaction pill).
 */
export const MESSAGE_ROW_INTERACTIVE_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="checkbox"]',
  '[role="switch"]',
].join(',')

/**
 * Focusable items the roving toolbar moves between. Deliberately not keyed
 * on `tabindex`: the roving logic rewrites tabindex itself.
 */
export const MESSAGE_ROW_TOOLBAR_ITEM_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  '[role="button"]:not([aria-disabled="true"])',
].join(',')

/** One toolbar action. `TIcon` is the adapter's node type (e.g. `React.ReactNode`). */
export interface MessageRowActionDescriptor<TIcon = unknown> {
  /** The glyph. Decorative; `label` is the accessible name. */
  icon: TIcon
  /** Accessible name, tooltip text and overflow-menu text. */
  label: string
  /** Called when the action is chosen (button press or menu item). */
  onSelected: () => void
  /** Marks a destructive action (e.g. Delete): styled as such, and its label must say so. */
  destructive?: boolean
}

export interface MessageRowActionPartition<T> {
  /** Actions rendered as inline toolbar buttons. */
  inline: T[]
  /** Actions moved into the "More actions" menu. Empty when everything fits. */
  overflow: T[]
}

/** Non-finite or negative limits fall back to the default; fractions round down. */
export function resolveMessageRowMaxInlineActions(maxInlineActions: number | undefined): number {
  if (maxInlineActions === undefined || !Number.isFinite(maxInlineActions) || maxInlineActions < 0) {
    return MESSAGE_ROW_DEFAULT_MAX_INLINE_ACTIONS
  }
  return Math.floor(maxInlineActions)
}

/**
 * Split actions into inline buttons and an overflow menu, keeping the given
 * order (put destructive actions last so they land in the menu).
 */
export function partitionMessageRowActions<T>(
  actions: readonly T[] | undefined,
  maxInlineActions?: number,
): MessageRowActionPartition<T> {
  const list = actions ?? []
  const limit = resolveMessageRowMaxInlineActions(maxInlineActions)
  return { inline: list.slice(0, limit), overflow: list.slice(limit) }
}

export interface MessageRowToolbarVisibilityInput {
  /** The row renders a toolbar at all (has actions or a leading slot, and is not a tombstone). */
  hasToolbar: boolean
  /** A hover-capable pointer is over the row. */
  hovered: boolean
  /** Keyboard (or programmatic) focus is inside the row. */
  focusWithin: boolean
  /** The overflow menu is open (it is portalled, so focus has left the row). */
  menuOpen: boolean
  /** A text selection is in progress in the body, or a selection sits under the toolbar. */
  selecting: boolean
}

/**
 * Whether the toolbar is shown. Selection wins over everything: the toolbar
 * must never cover text the reader is selecting.
 */
export function isMessageRowToolbarVisible(input: MessageRowToolbarVisibilityInput): boolean {
  if (!input.hasToolbar || input.selecting) return false
  return input.menuOpen || input.hovered || input.focusWithin
}

/** Clamp a remembered roving index into `[0, count - 1]` (0 when empty). */
export function clampMessageRowToolbarIndex(index: number, count: number): number {
  if (count <= 0 || !Number.isFinite(index)) return 0
  return Math.min(Math.max(Math.trunc(index), 0), count - 1)
}

/**
 * Roving-focus keyboard map for the toolbar (WAI-ARIA toolbar pattern,
 * horizontal). Arrows wrap; Home/End jump to the ends; any other key returns
 * `current` unchanged so the adapter leaves it alone.
 */
export function getNextMessageRowToolbarIndex(current: number, key: string, count: number): number {
  if (count <= 0) return current
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count
    case 'ArrowLeft':
      return (current - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return current
  }
}

export interface MessageRowPoint {
  x: number
  y: number
}

/** True once the pointer has travelled past `tolerancePx` from where it went down. */
export function hasMessageRowPointerMoved(
  start: MessageRowPoint,
  current: MessageRowPoint,
  tolerancePx: number = MESSAGE_ROW_LONG_PRESS_MOVE_TOLERANCE_PX,
): boolean {
  return Math.hypot(current.x - start.x, current.y - start.y) > tolerancePx
}

/** Non-finite or negative delays fall back to the default. */
export function resolveMessageRowLongPressDelay(delayMs: number | undefined): number {
  if (delayMs === undefined || !Number.isFinite(delayMs) || delayMs < 0) {
    return MESSAGE_ROW_LONG_PRESS_DELAY_MS
  }
  return delayMs
}

export interface MessageRowTapInput {
  /** The click landed on (or inside) a control that owns it. */
  targetIsInteractive: boolean
  /** The press ended with a non-collapsed selection in the row (the reader selected text). */
  hasSelection: boolean
  /** This press already fired `onLongPress`. */
  longPressFired: boolean
}

/** A click is a row tap only when nothing else claimed it. */
export function shouldMessageRowHandleTap(input: MessageRowTapInput): boolean {
  return !input.targetIsInteractive && !input.hasSelection && !input.longPressFired
}

export interface MessageRowRect {
  top: number
  left: number
  right: number
  bottom: number
}

/** Axis-aligned overlap test; touching edges do not overlap. Empty rects never overlap. */
export function doMessageRowRectsOverlap(a: MessageRowRect, b: MessageRowRect): boolean {
  const aEmpty = a.right <= a.left || a.bottom <= a.top
  const bEmpty = b.right <= b.left || b.bottom <= b.top
  if (aEmpty || bEmpty) return false
  return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
}

/** Whether any selection rectangle falls under the toolbar. */
export function doesMessageRowSelectionOverlapToolbar(
  toolbar: MessageRowRect,
  selectionRects: readonly MessageRowRect[],
): boolean {
  return selectionRects.some((rect) => doMessageRowRectsOverlap(toolbar, rect))
}

/** `off` → no highlight; `on` → full highlight; `fading` → transitioning back to `off`. */
export type MessageRowHighlightPhase = 'off' | 'on' | 'fading'

export interface MessageRowHighlightStep {
  phase: MessageRowHighlightPhase
  /** Milliseconds after `highlighted` turned on. */
  atMs: number
}

/**
 * The phase timeline for a highlighted row. With reduced motion the highlight
 * is static: it stays `on` (no fade) until `highlighted` is turned off.
 */
export function getMessageRowHighlightSchedule(reducedMotion: boolean): MessageRowHighlightStep[] {
  if (reducedMotion) return [{ phase: 'on', atMs: 0 }]
  return [
    { phase: 'on', atMs: 0 },
    { phase: 'fading', atMs: MESSAGE_ROW_HIGHLIGHT_HOLD_MS },
    { phase: 'off', atMs: MESSAGE_ROW_HIGHLIGHT_HOLD_MS + MESSAGE_ROW_HIGHLIGHT_FADE_MS },
  ]
}

export interface MessageRowLabelIds {
  author: string
  time: string
  body: string
  edited: string
}

export interface MessageRowLabelInput {
  ids: MessageRowLabelIds
  hasTimestamp: boolean
  hasEditedLabel: boolean
  tombstone: boolean
}

/**
 * `aria-labelledby` for the row: author, time, then the text (and the edited
 * marker). Referencing the rendered parts keeps one label per row without
 * copying the body into an attribute, so rich bodies (links, code) are named
 * by their real text and stay selectable and readable in browse mode.
 */
export function getMessageRowLabelledBy(input: MessageRowLabelInput): string {
  const { ids } = input
  const parts = [ids.author]
  if (input.hasTimestamp) parts.push(ids.time)
  parts.push(ids.body)
  if (input.hasEditedLabel && !input.tombstone) parts.push(ids.edited)
  return parts.join(' ')
}

/** Avatar gutter width as rem, so it scales with the root font size. Invalid sizes use the default. */
export function getMessageRowAvatarGutter(avatarSize: number | undefined): string {
  const px =
    avatarSize !== undefined && Number.isFinite(avatarSize) && avatarSize > 0
      ? avatarSize
      : MESSAGE_ROW_DEFAULT_AVATAR_SIZE_PX
  return `${px / ROOT_FONT_SIZE_PX}rem`
}

export interface MessageRowStateInput {
  continuation: boolean
  tombstone: boolean
  highlightPhase: MessageRowHighlightPhase
  /** Hovered or focus inside; reveals the continuation timestamp. */
  active: boolean
  toolbarVisible: boolean
}

export interface MessageRowAPI {
  /** Data attributes for the row root (styling and test hooks). */
  dataAttributes: Record<string, string>
}

/** Framework-agnostic row attributes. */
export function createMessageRow(input: MessageRowStateInput): MessageRowAPI {
  const dataAttributes: Record<string, string> = {
    'data-message-row': '',
    'data-highlight': input.highlightPhase,
    'data-active': input.active ? 'true' : 'false',
    'data-toolbar': input.toolbarVisible ? 'visible' : 'hidden',
  }
  if (input.continuation) dataAttributes['data-continuation'] = ''
  if (input.tombstone) dataAttributes['data-tombstone'] = ''
  return { dataAttributes }
}
