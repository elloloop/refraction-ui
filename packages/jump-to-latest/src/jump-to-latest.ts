/**
 * Headless "jump to latest" logic.
 *
 * A reader scrolls back through a history while new items keep arriving out
 * of sight. This module answers, purely and deterministically:
 *  - is the scroller at its end? (the same maths VirtualList uses);
 *  - which items arrived while the reader was away, and where the first of
 *    them is (a reducer fed with the item keys or the item count);
 *  - what the pill says, and when a screen reader hears about new items
 *    (a coalescing announcer driven by injected timers, never the clock).
 *
 * Adapters own the DOM: they read scroll metrics, dispatch actions and
 * perform the scroll.
 */
import {
  VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD,
  areVirtualListKeysEqual,
  createVirtualListKeyIndex,
  isVirtualListAtEnd,
  resolveVirtualListScrollBehavior,
  type VirtualListKey,
  type VirtualListScrollBehavior,
} from '@refraction-ui/virtual-list'

/** Stable identity of an item — the same keys a VirtualList's `getItemKey` returns. */
export type JumpToLatestKey = VirtualListKey

/** `smooth` animates the jump; `auto` is instant. Reduced motion always resolves to `auto`. */
export type JumpToLatestScrollBehavior = VirtualListScrollBehavior

/** Where the pill takes the reader: the newest item, or the first item they missed. */
export type JumpToLatestTarget = 'latest' | 'first-unread'

/** Formats a count of new items, e.g. `3` → `"3 new messages"`. */
export type JumpToLatestCountFormatter = (count: number) => string

/**
 * Distance from the end, in px, that still counts as "at the end". Shared with
 * VirtualList so a list and its pill never disagree about where the end is.
 */
export const JUMP_TO_LATEST_DEFAULT_THRESHOLD = VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD

/**
 * Window, in ms, over which arrivals are coalesced into one announcement, so a
 * burst of messages is read out once ("5 new messages"), not five times.
 */
export const JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY = 1000

/** Pill text when the reader is away but nothing new has arrived. */
export const JUMP_TO_LATEST_DEFAULT_LATEST_LABEL = 'Jump to latest'

/** Programmatic jumps animate unless the reader asked for reduced motion. */
const JUMP_TO_LATEST_DEFAULT_BEHAVIOR: JumpToLatestScrollBehavior = 'smooth'

const NO_KEYS: readonly JumpToLatestKey[] = []

function toWholeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

// ---- at end ----------------------------------------------------------------

/** The three numbers every scroll container exposes. */
export interface JumpToLatestScrollMetrics {
  scrollTop: number
  clientHeight: number
  scrollHeight: number
}

/**
 * Whether a scroll container is within `threshold` px of its end. Takes the
 * element's own property names so an adapter can pass the element directly.
 */
export function isJumpToLatestAtEnd(
  metrics: JumpToLatestScrollMetrics,
  threshold: number = JUMP_TO_LATEST_DEFAULT_THRESHOLD,
): boolean {
  return isVirtualListAtEnd({
    scrollOffset: metrics.scrollTop,
    viewportSize: metrics.clientHeight,
    contentSize: metrics.scrollHeight,
    threshold,
  })
}

/** The behaviour a jump should use: smooth by default, instant under reduced motion. */
export function resolveJumpToLatestScrollBehavior(
  prefersReducedMotion: boolean,
  requested: JumpToLatestScrollBehavior = JUMP_TO_LATEST_DEFAULT_BEHAVIOR,
): JumpToLatestScrollBehavior {
  return resolveVirtualListScrollBehavior(requested, prefersReducedMotion)
}

// ---- unread tracking ---------------------------------------------------------

/**
 * What the reader has missed. Keyed mode (`keys` set) tells appended items
 * from prepended history and survives deletions; count mode (`keys` null)
 * only sees the count grow, so it cannot tell a prepend from an append.
 */
export interface JumpToLatestState {
  atEnd: boolean
  /** The latest item keys (keyed mode), or `null` in count mode. */
  keys: readonly JumpToLatestKey[] | null
  /** The latest item count. */
  count: number
  /** Keys that arrived while away, in list order (keyed mode only). */
  unreadKeys: readonly JumpToLatestKey[]
  /** How many items arrived since the reader left the end. */
  newCount: number
}

export interface JumpToLatestStateInit {
  /** Defaults to `true`: assume the end until a measurement says otherwise (SSR-safe). */
  atEnd?: boolean
  keys?: readonly JumpToLatestKey[]
  count?: number
}

export type JumpToLatestAction =
  /** The items changed. Pass `keys` (preferred) or just `count`. */
  | { type: 'items'; keys?: readonly JumpToLatestKey[]; count?: number }
  /** A scroll measurement. Reaching the end marks everything read. */
  | { type: 'atEnd'; atEnd: boolean }
  /** Mark everything read without moving (e.g. after jumping to the first unread). */
  | { type: 'markRead' }

/** Initial state. Items present at creation are never counted as new. */
export function createJumpToLatestState({
  atEnd = true,
  keys,
  count,
}: JumpToLatestStateInit = {}): JumpToLatestState {
  return {
    atEnd,
    keys: keys ?? null,
    count: toWholeCount(count ?? keys?.length ?? 0),
    unreadKeys: NO_KEYS,
    newCount: 0,
  }
}

/**
 * Keys appended to `next` since `previous`: everything after the newest
 * `previous` key that still exists. Scanning back from the newest survivor
 * means deleting the last item does not make its neighbours look new, and
 * prepended history (before the survivor) is never counted. No survivor at
 * all means the list was replaced (another conversation), not appended to.
 */
export function getJumpToLatestAppendedKeys(
  previous: readonly JumpToLatestKey[],
  next: readonly JumpToLatestKey[],
): JumpToLatestKey[] {
  if (previous.length === 0) return next.slice()
  const index = createVirtualListKeyIndex(next)
  for (let i = previous.length - 1; i >= 0; i--) {
    const position = index.get(previous[i])
    if (position !== undefined) return next.slice(position + 1)
  }
  return []
}

/**
 * The unread keys after an update: those still unread plus the newly
 * appended, minus any that were deleted, in list order.
 */
export function getJumpToLatestUnreadKeys(
  previousKeys: readonly JumpToLatestKey[],
  nextKeys: readonly JumpToLatestKey[],
  previousUnread: readonly JumpToLatestKey[],
): readonly JumpToLatestKey[] {
  const unread = new Set<JumpToLatestKey>(previousUnread)
  for (const key of getJumpToLatestAppendedKeys(previousKeys, nextKeys)) unread.add(key)
  if (unread.size === 0) return NO_KEYS
  return nextKeys.filter((key) => unread.has(key))
}

function markRead(state: JumpToLatestState): JumpToLatestState {
  if (state.newCount === 0 && state.unreadKeys.length === 0) return state
  return { ...state, unreadKeys: NO_KEYS, newCount: 0 }
}

function applyKeys(state: JumpToLatestState, keys: readonly JumpToLatestKey[]): JumpToLatestState {
  if (state.keys && areVirtualListKeysEqual(state.keys, keys)) return state
  if (state.atEnd) return { ...state, keys, count: keys.length }
  const unreadKeys = getJumpToLatestUnreadKeys(state.keys ?? NO_KEYS, keys, state.unreadKeys)
  return { ...state, keys, count: keys.length, unreadKeys, newCount: unreadKeys.length }
}

function applyCount(state: JumpToLatestState, rawCount: number): JumpToLatestState {
  const count = toWholeCount(rawCount)
  if (state.keys === null && count === state.count) return state
  const added = state.atEnd ? 0 : Math.max(0, count - state.count)
  // Count mode cannot tell which items were removed; never claim more new
  // items than exist.
  const newCount = Math.min(state.newCount + added, count)
  return { ...state, keys: null, count, unreadKeys: NO_KEYS, newCount }
}

/** Pure state transition for the unread tracker. */
export function jumpToLatestReducer(
  state: JumpToLatestState,
  action: JumpToLatestAction,
): JumpToLatestState {
  switch (action.type) {
    case 'atEnd':
      if (action.atEnd) return markRead(state.atEnd ? state : { ...state, atEnd: true })
      return state.atEnd ? { ...state, atEnd: false } : state
    case 'markRead':
      return markRead(state)
    case 'items':
      if (action.keys) return applyKeys(state, action.keys)
      return applyCount(state, action.count ?? 0)
  }
}

/** Key of the first item the reader missed, or `null`. */
export function getJumpToLatestFirstUnreadKey(state: JumpToLatestState): JumpToLatestKey | null {
  return state.unreadKeys.length > 0 ? state.unreadKeys[0] : null
}

/** Index of the first item the reader missed, or `null`. */
export function getJumpToLatestFirstUnreadIndex(state: JumpToLatestState): number | null {
  if (state.newCount === 0) return null
  if (state.keys === null) return Math.max(0, state.count - state.newCount)
  const index = state.keys.indexOf(state.unreadKeys[0])
  return index < 0 ? null : index
}

// ---- text and ARIA -------------------------------------------------------------

/** Default English pluralisation: `1 new message`, `3 new messages`. */
export function formatJumpToLatestNewCount(count: number): string {
  return count === 1 ? '1 new message' : `${count} new messages`
}

export interface JumpToLatestLabelOptions {
  formatNewCount?: JumpToLatestCountFormatter
  latestLabel?: string
}

/** The pill text: the new-item count, or "Jump to latest" when there is none. */
export function getJumpToLatestLabel(
  newCount: number,
  {
    formatNewCount = formatJumpToLatestNewCount,
    latestLabel = JUMP_TO_LATEST_DEFAULT_LATEST_LABEL,
  }: JumpToLatestLabelOptions = {},
): string {
  const count = toWholeCount(newCount)
  return count > 0 ? formatNewCount(count) : latestLabel
}

/** The pill shows only while the reader is away from the end. */
export function isJumpToLatestVisible(atEnd: boolean): boolean {
  return !atEnd
}

/**
 * Button attributes for the shown/hidden pill. A hidden pill stays mounted
 * (so it can fade out) but leaves the tab order and the accessibility tree.
 */
export function getJumpToLatestButtonProps(
  visible: boolean,
): Record<string, string | number | boolean> {
  if (visible) return { 'data-state': 'visible' }
  return { 'data-state': 'hidden', 'aria-hidden': true, tabIndex: -1 }
}

/** The polite, atomic status region that announces arrivals. */
export function getJumpToLatestLiveRegionProps(): Record<string, string | number | boolean> {
  return { role: 'status', 'aria-live': 'polite', 'aria-atomic': true }
}

// ---- announcements -------------------------------------------------------------

/** Timer functions, injected so the announcer is deterministic under test. */
export interface JumpToLatestTimers {
  setTimeout(callback: () => void, ms: number): unknown
  clearTimeout(handle: unknown): void
}

export interface JumpToLatestAnnouncerOptions {
  timers: JumpToLatestTimers
  /** Called with the coalesced count once the delay has passed. */
  onAnnounce: (count: number) => void
  /** Called when the reader returns to the end, so the next arrival is heard afresh. */
  onClear: () => void
  delay?: number
}

export interface JumpToLatestAnnouncerInput {
  atEnd: boolean
  newCount: number
}

export interface JumpToLatestAnnouncer {
  /** Feed every state change. The first call is a baseline and never announces. */
  update(input: JumpToLatestAnnouncerInput): void
  dispose(): void
}

/**
 * Announces arrivals while the reader is away. The first arrival opens a
 * window of `delay` ms; further arrivals join it; when it closes the latest
 * count is announced once. Unlike a restarting debounce this still speaks
 * during a steady stream of messages. Nothing is announced for the state at
 * mount, for decreases, or once the reader is back at the end.
 */
export function createJumpToLatestAnnouncer({
  timers,
  onAnnounce,
  onClear,
  delay = JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY,
}: JumpToLatestAnnouncerOptions): JumpToLatestAnnouncer {
  const wait = Math.max(0, Number.isFinite(delay) ? delay : JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY)
  let baseline: number | null = null
  let latest = 0
  let pending: unknown = null
  let spoken = false

  const cancel = () => {
    if (pending === null) return
    timers.clearTimeout(pending)
    pending = null
  }

  const fire = () => {
    pending = null
    if (latest === 0) return
    spoken = true
    onAnnounce(latest)
  }

  return {
    update({ atEnd, newCount }) {
      const count = toWholeCount(newCount)
      const previous = baseline
      baseline = count
      latest = count
      if (previous === null) return
      if (atEnd || count === 0) {
        cancel()
        if (spoken) {
          spoken = false
          onClear()
        }
        return
      }
      if (count > previous && pending === null) pending = timers.setTimeout(fire, wait)
    },
    dispose: cancel,
  }
}
