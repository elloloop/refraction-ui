/**
 * Headless virtual-list maths.
 *
 * Everything here is pure and deterministic: given item sizes, a scroll
 * position and a viewport size it answers "which items should be mounted,
 * where do they go, and where should the scroller be?". Adapters own the DOM
 * (measurement, scroll events) and feed the results back in.
 *
 * Coordinates: an item's *offset* is its distance from the top of the list
 * content. `offsets` is a prefix-sum array of length `count + 1` where
 * `offsets[i]` is the top of item `i` and `offsets[count]` is the total size.
 * A bottom-anchored list whose content is shorter than the viewport is pushed
 * down by `leadingSpace`, so a scroll position is `leadingSpace + offset`.
 */

/** Stable identity of an item. Measurements and scroll anchors are keyed by it. */
export type VirtualListKey = string | number

/** Where an item lands in the viewport when scrolled to. `auto` scrolls the least. */
export type VirtualListAlign = 'start' | 'center' | 'end' | 'auto'

/**
 * `start` — an ordinary top-down list.
 * `end` — a history: starts at the bottom, sits short content at the bottom,
 * and sticks to the end while the reader is there.
 */
export type VirtualListAnchor = 'start' | 'end'

/** Scroll animation for programmatic scrolls. */
export type VirtualListScrollBehavior = 'auto' | 'smooth'

/** Accessible structure of the list. `log` is a live history (chat, activity feed). */
export type VirtualListRole = 'list' | 'log'

/** A half-open index range `[start, end)`. */
export interface VirtualListRange {
  start: number
  end: number
}

/** The mounted range (with overscan) plus the strictly visible range. */
export interface VirtualListWindow extends VirtualListRange {
  /** First item intersecting the viewport. */
  visibleStart: number
  /** One past the last item intersecting the viewport. */
  visibleEnd: number
}

/** Where the reader is: the first visible item and how far into it they are. */
export interface VirtualListScrollAnchor {
  key: VirtualListKey
  /** Distance from the item's top edge to the viewport's top edge. */
  offsetWithinItem: number
}

/** An in-flight programmatic scroll, re-applied as measurements settle. */
export type VirtualListScrollTarget =
  | { type: 'key'; key: VirtualListKey; align: VirtualListAlign }
  | { type: 'end' }

/** Size assumed for an item before it has been measured, in px. */
export const VIRTUAL_LIST_DEFAULT_ESTIMATED_ITEM_SIZE = 48
/** Items mounted beyond each edge of the viewport. */
export const VIRTUAL_LIST_DEFAULT_OVERSCAN = 4
/** Distance from the end, in px, that still counts as "at the end". */
export const VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD = 32
/** Items rendered before the viewport is known (SSR, first client render). */
export const VIRTUAL_LIST_DEFAULT_INITIAL_ITEM_COUNT = 10

const EMPTY_WINDOW: VirtualListWindow = {
  start: 0,
  end: 0,
  visibleStart: 0,
  visibleEnd: 0,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function isUsableSize(size: number | undefined): size is number {
  return typeof size === 'number' && Number.isFinite(size) && size >= 0
}

function toWholeCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

/** Number of items described by a prefix-sum offsets array. */
export function getVirtualListCount(offsets: readonly number[]): number {
  return Math.max(0, offsets.length - 1)
}

/** Total content size described by a prefix-sum offsets array. */
export function getVirtualListTotalSize(offsets: readonly number[]): number {
  return offsets.length > 0 ? offsets[offsets.length - 1] : 0
}

/**
 * Look up each key's measured size, leaving unmeasured items `undefined` so
 * {@link computeVirtualListOffsets} can substitute the estimate. Keyed (not
 * indexed) so a measurement survives older items being prepended.
 */
export function getVirtualListSizes(
  keys: readonly VirtualListKey[],
  measured: ReadonlyMap<VirtualListKey, number>,
): (number | undefined)[] {
  return keys.map((key) => measured.get(key))
}

/**
 * Prefix-sum offsets from measured sizes. Unmeasured or invalid sizes
 * (negative, NaN, infinite) fall back to `estimatedItemSize`; an invalid
 * estimate falls back to {@link VIRTUAL_LIST_DEFAULT_ESTIMATED_ITEM_SIZE}.
 * A measured size of 0 is kept — collapsed items legitimately take no space.
 */
export function computeVirtualListOffsets(
  sizes: ReadonlyArray<number | undefined>,
  estimatedItemSize: number = VIRTUAL_LIST_DEFAULT_ESTIMATED_ITEM_SIZE,
): number[] {
  const estimate = isUsableSize(estimatedItemSize)
    ? estimatedItemSize
    : VIRTUAL_LIST_DEFAULT_ESTIMATED_ITEM_SIZE
  const offsets = new Array<number>(sizes.length + 1)
  offsets[0] = 0
  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i]
    offsets[i + 1] = offsets[i] + (isUsableSize(size) ? size : estimate)
  }
  return offsets
}

/**
 * Binary search: the item that contains `offset` — the last item whose top is
 * at or above it. Clamped to `[0, count - 1]`; `-1` for an empty list.
 * Zero-size items at the same offset resolve to the last of the run, the one
 * that actually occupies the space.
 */
export function findVirtualListIndexAtOffset(
  offsets: readonly number[],
  offset: number,
): number {
  const count = getVirtualListCount(offsets)
  if (count === 0) return -1
  let low = 0
  let high = count - 1
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (offsets[mid] <= offset) low = mid
    else high = mid - 1
  }
  return low
}

/** Binary search: the last item whose top is strictly above `offset`, or -1. */
function findLastIndexStartingBefore(offsets: readonly number[], offset: number): number {
  const count = getVirtualListCount(offsets)
  let low = -1
  let high = count - 1
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (offsets[mid] < offset) low = mid
    else high = mid - 1
  }
  return low
}

export interface VirtualListRangeInput {
  offsets: readonly number[]
  /** Scroll position within the list content (leading space already removed). */
  scrollOffset: number
  viewportSize: number
  /** Extra items mounted beyond each edge. */
  overscan?: number
}

/**
 * The window of items to mount for a scroll position: the items intersecting
 * the viewport, widened by `overscan` on each side and clamped to the list.
 * A zero-height viewport still mounts the item at the scroll position.
 */
export function getVirtualListRange({
  offsets,
  scrollOffset,
  viewportSize,
  overscan = VIRTUAL_LIST_DEFAULT_OVERSCAN,
}: VirtualListRangeInput): VirtualListWindow {
  const count = getVirtualListCount(offsets)
  if (count === 0) return EMPTY_WINDOW
  const extra = toWholeCount(overscan)
  const top = Math.max(0, scrollOffset)
  const bottom = top + Math.max(0, viewportSize)

  const visibleStart = findVirtualListIndexAtOffset(offsets, top)
  const lastVisible = findLastIndexStartingBefore(offsets, bottom)
  const visibleEnd = Math.max(visibleStart + 1, lastVisible + 1)

  return {
    start: Math.max(0, visibleStart - extra),
    end: Math.min(count, visibleEnd + extra),
    visibleStart,
    visibleEnd,
  }
}

export interface VirtualListInitialRangeInput {
  count: number
  initialItemCount?: number
  anchor?: VirtualListAnchor
}

/**
 * The window rendered before anything is measured (SSR and the first client
 * render, which must match it): the first items, or the last ones for a
 * bottom-anchored history.
 */
export function getVirtualListInitialRange({
  count,
  initialItemCount = VIRTUAL_LIST_DEFAULT_INITIAL_ITEM_COUNT,
  anchor = 'start',
}: VirtualListInitialRangeInput): VirtualListWindow {
  const total = toWholeCount(count)
  const size = Math.min(total, toWholeCount(initialItemCount))
  const start = anchor === 'end' ? total - size : 0
  const end = start + size
  return { start, end, visibleStart: start, visibleEnd: end }
}

/**
 * Indexes to mount: the window plus any pinned indexes (the focused item, so
 * keyboard focus is never destroyed by scrolling away). Sorted, unique and
 * limited to valid indexes.
 */
export function getVirtualListRenderIndexes(
  range: VirtualListRange,
  pinned: Iterable<number>,
  count: number,
): number[] {
  const total = toWholeCount(count)
  const indexes = new Set<number>()
  const start = clamp(Math.floor(range.start), 0, total)
  const end = clamp(Math.floor(range.end), start, total)
  for (let i = start; i < end; i++) indexes.add(i)
  for (const index of pinned) {
    if (Number.isInteger(index) && index >= 0 && index < total) indexes.add(index)
  }
  return Array.from(indexes).sort((a, b) => a - b)
}

/** Whether two window states mount and report the same items. */
export function areVirtualListWindowsEqual(a: VirtualListWindow, b: VirtualListWindow): boolean {
  return (
    a.start === b.start &&
    a.end === b.end &&
    a.visibleStart === b.visibleStart &&
    a.visibleEnd === b.visibleEnd
  )
}

/** Whether two key lists are identical, so derived layout can be reused. */
export function areVirtualListKeysEqual(
  a: readonly VirtualListKey[],
  b: readonly VirtualListKey[],
): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/** Key → index lookup. With duplicate keys the last index wins. */
export function createVirtualListKeyIndex(
  keys: readonly VirtualListKey[],
): Map<VirtualListKey, number> {
  const index = new Map<VirtualListKey, number>()
  keys.forEach((key, i) => index.set(key, i))
  return index
}

export interface VirtualListContentSizeInput {
  totalSize: number
  viewportSize: number
  anchor?: VirtualListAnchor
}

export interface VirtualListContentSize {
  /** Empty space above the first item (bottom-anchored short content only). */
  leadingSpace: number
  /** Scrollable height: leading space plus every item. */
  contentSize: number
}

/**
 * A bottom-anchored history shorter than its viewport sits at the bottom, as
 * a chat does, by adding leading space above the first item.
 */
export function getVirtualListContentSize({
  totalSize,
  viewportSize,
  anchor = 'start',
}: VirtualListContentSizeInput): VirtualListContentSize {
  const total = Math.max(0, totalSize)
  const leadingSpace = anchor === 'end' ? Math.max(0, viewportSize - total) : 0
  return { leadingSpace, contentSize: total + leadingSpace }
}

/** The largest valid scroll position. */
export function getVirtualListMaxScrollOffset(contentSize: number, viewportSize: number): number {
  return Math.max(0, contentSize - Math.max(0, viewportSize))
}

export interface VirtualListEndInput {
  /** Current scroll position (`scrollTop`). */
  scrollOffset: number
  /** Visible height (`clientHeight`). */
  viewportSize: number
  /** Scrollable height (`scrollHeight`). */
  contentSize: number
}

/**
 * Pixels between the bottom of the viewport and the end of the content. Takes
 * DOM-shaped inputs so any scroller (not only a VirtualList) can use it:
 * `{ scrollOffset: scrollTop, viewportSize: clientHeight, contentSize: scrollHeight }`.
 */
export function getVirtualListDistanceFromEnd({
  scrollOffset,
  viewportSize,
  contentSize,
}: VirtualListEndInput): number {
  return Math.max(0, contentSize - viewportSize - scrollOffset)
}

/**
 * Whether the reader is at the end, allowing `threshold` px of slack so
 * sub-pixel rounding and a nudge of the wheel don't drop "stick to bottom".
 * Content shorter than the viewport is always at the end. A negative or
 * invalid threshold is treated as 0.
 */
export function isVirtualListAtEnd(
  input: VirtualListEndInput & { threshold?: number },
): boolean {
  const { threshold = VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD } = input
  const slack = Number.isFinite(threshold) ? Math.max(0, threshold) : 0
  return getVirtualListDistanceFromEnd(input) <= slack
}

export interface VirtualListScrollToIndexInput {
  offsets: readonly number[]
  index: number
  align?: VirtualListAlign
  /** Current scroll position, used by `auto`. */
  scrollOffset: number
  viewportSize: number
  leadingSpace?: number
}

/**
 * The scroll position that brings an item into view with the given alignment,
 * clamped to the scrollable range. `auto` leaves a fully visible item alone
 * and otherwise scrolls the least distance; an item taller than the viewport
 * is aligned to its start so its beginning is readable.
 */
export function getVirtualListScrollOffsetForIndex({
  offsets,
  index,
  align = 'auto',
  scrollOffset,
  viewportSize,
  leadingSpace = 0,
}: VirtualListScrollToIndexInput): number {
  const count = getVirtualListCount(offsets)
  if (count === 0) return 0
  const i = clamp(Math.floor(index), 0, count - 1)
  const viewport = Math.max(0, viewportSize)
  const itemStart = leadingSpace + offsets[i]
  const itemEnd = leadingSpace + offsets[i + 1]
  const itemSize = itemEnd - itemStart
  const max = getVirtualListMaxScrollOffset(leadingSpace + getVirtualListTotalSize(offsets), viewport)

  const target = (() => {
    switch (align) {
      case 'start':
        return itemStart
      case 'end':
        return itemEnd - viewport
      case 'center':
        return itemStart + itemSize / 2 - viewport / 2
      default: {
        const fullyVisible = itemStart >= scrollOffset && itemEnd <= scrollOffset + viewport
        if (fullyVisible) return scrollOffset
        if (itemStart < scrollOffset || itemSize > viewport) return itemStart
        return itemEnd - viewport
      }
    }
  })()

  return clamp(target, 0, max)
}

export interface VirtualListAnchorInput {
  offsets: readonly number[]
  keys: readonly VirtualListKey[]
  scrollOffset: number
  leadingSpace?: number
}

/**
 * Record the reader's position as "N px into item K". Re-resolving it after
 * the layout changes keeps the same content under the reader's eyes, which is
 * what makes prepending older items and late measurements above the viewport
 * jump-free.
 */
export function captureVirtualListAnchor({
  offsets,
  keys,
  scrollOffset,
  leadingSpace = 0,
}: VirtualListAnchorInput): VirtualListScrollAnchor | null {
  const contentOffset = Math.max(0, scrollOffset - leadingSpace)
  const index = findVirtualListIndexAtOffset(offsets, contentOffset)
  if (index < 0 || index >= keys.length) return null
  return { key: keys[index], offsetWithinItem: contentOffset - offsets[index] }
}

export interface VirtualListResolveAnchorInput {
  anchor: VirtualListScrollAnchor
  offsets: readonly number[]
  keyIndex: ReadonlyMap<VirtualListKey, number>
  leadingSpace?: number
}

/**
 * The scroll position that puts an anchor back where it was in the (possibly
 * changed) layout, or `null` when its item is gone. Not clamped.
 */
export function resolveVirtualListAnchorOffset({
  anchor,
  offsets,
  keyIndex,
  leadingSpace = 0,
}: VirtualListResolveAnchorInput): number | null {
  const index = keyIndex.get(anchor.key)
  if (index === undefined || index >= getVirtualListCount(offsets)) return null
  return leadingSpace + offsets[index] + anchor.offsetWithinItem
}

export interface VirtualListCorrectionInput {
  anchor: VirtualListAnchor
  /** Whether the reader was at the end before this layout change. */
  wasAtEnd: boolean
  /** Reader position captured before this layout change. */
  scrollAnchor: VirtualListScrollAnchor | null
  /** A programmatic scroll still converging, if any. */
  target: VirtualListScrollTarget | null
  offsets: readonly number[]
  keyIndex: ReadonlyMap<VirtualListKey, number>
  scrollOffset: number
  viewportSize: number
  leadingSpace?: number
}

/**
 * After the layout changed (items added or removed, sizes measured, viewport
 * resized), where should the scroller be? In priority order:
 *
 * 1. an in-flight programmatic scroll is re-aimed at its (re-measured) target;
 * 2. a bottom-anchored list that was at the end stays pinned to the end;
 * 3. otherwise the reader's anchor item stays put (prepend without jumping).
 *
 * Returns `null` when nothing applies (leave the scroller alone).
 */
export function getVirtualListCorrectedScrollOffset({
  anchor,
  wasAtEnd,
  scrollAnchor,
  target,
  offsets,
  keyIndex,
  scrollOffset,
  viewportSize,
  leadingSpace = 0,
}: VirtualListCorrectionInput): number | null {
  const max = getVirtualListMaxScrollOffset(
    leadingSpace + getVirtualListTotalSize(offsets),
    viewportSize,
  )

  if (target?.type === 'end') return max
  if (target?.type === 'key') {
    const index = keyIndex.get(target.key)
    if (index !== undefined) {
      return getVirtualListScrollOffsetForIndex({
        offsets,
        index,
        align: target.align,
        scrollOffset,
        viewportSize,
        leadingSpace,
      })
    }
  }

  if (anchor === 'end' && wasAtEnd) return max

  if (!scrollAnchor) return null
  const resolved = resolveVirtualListAnchorOffset({
    anchor: scrollAnchor,
    offsets,
    keyIndex,
    leadingSpace,
  })
  return resolved === null ? null : clamp(resolved, 0, max)
}

/** Programmatic scrolls never animate for readers who asked for reduced motion. */
export function resolveVirtualListScrollBehavior(
  requested: VirtualListScrollBehavior | undefined,
  prefersReducedMotion: boolean,
): VirtualListScrollBehavior {
  if (prefersReducedMotion) return 'auto'
  return requested ?? 'auto'
}

export interface VirtualListAriaInput {
  role?: VirtualListRole
  /** Whether the reader is at the end (drives `log` announcements). */
  atEnd: boolean
}

export interface VirtualListAriaProps {
  /** Spread on the scroll container. */
  scroller: Record<string, string | number | boolean>
  /** Spread on the sizing element that directly holds the items. */
  sizer: Record<string, string | number | boolean>
}

/**
 * Accessible structure. `list`: the scroller is the list. `log`: the scroller
 * is a live region holding a list. A virtualised log mounts old items as the
 * reader scrolls back, which a polite live region would announce as
 * "additions"; so the region is only live while the reader is at the end,
 * where additions really are new messages.
 */
export function getVirtualListAriaProps({
  role = 'list',
  atEnd,
}: VirtualListAriaInput): VirtualListAriaProps {
  if (role === 'log') {
    return {
      scroller: {
        role: 'log',
        'aria-live': atEnd ? 'polite' : 'off',
        'aria-relevant': 'additions',
      },
      sizer: { role: 'list' },
    }
  }
  return { scroller: { role: 'list' }, sizer: { role: 'presentation' } }
}

/** Position-in-set attributes so assistive tech reports "item 512 of 3000". */
export function getVirtualListItemAriaProps(
  index: number,
  count: number,
): Record<string, string | number | boolean> {
  return {
    role: 'listitem',
    'aria-posinset': index + 1,
    'aria-setsize': count,
  }
}
