import * as React from 'react'
import {
  VIRTUAL_LIST_DEFAULT_ESTIMATED_ITEM_SIZE,
  VIRTUAL_LIST_DEFAULT_OVERSCAN,
  VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD,
  VIRTUAL_LIST_DEFAULT_INITIAL_ITEM_COUNT,
  areVirtualListKeysEqual,
  areVirtualListWindowsEqual,
  captureVirtualListAnchor,
  computeVirtualListOffsets,
  createVirtualListKeyIndex,
  getVirtualListAriaProps,
  getVirtualListContentSize,
  getVirtualListCorrectedScrollOffset,
  getVirtualListInitialRange,
  getVirtualListItemAriaProps,
  getVirtualListRange,
  getVirtualListRenderIndexes,
  getVirtualListSizes,
  getVirtualListTotalSize,
  isVirtualListAtEnd,
  resolveVirtualListScrollBehavior,
  virtualListItemClass,
  virtualListScrollerClass,
  virtualListSizerClass,
  type VirtualListAlign,
  type VirtualListAnchor,
  type VirtualListKey,
  type VirtualListRange,
  type VirtualListRole,
  type VirtualListScrollAnchor,
  type VirtualListScrollBehavior,
  type VirtualListScrollTarget,
  type VirtualListWindow,
} from '@refraction-ui/virtual-list'
import { cn } from '@refraction-ui/shared'

export type {
  VirtualListAlign,
  VirtualListAnchor,
  VirtualListKey,
  VirtualListRange,
  VirtualListRole,
  VirtualListScrollBehavior,
}

/** Options for {@link VirtualListHandle.scrollToIndex} / `scrollToKey`. */
export interface VirtualListScrollToOptions {
  /** Where the item lands in the viewport. Defaults to `'auto'` (least scrolling). */
  align?: VirtualListAlign
  /** Scroll animation; always `'auto'` under `prefers-reduced-motion`. */
  behavior?: VirtualListScrollBehavior
}

/** Options for {@link VirtualListHandle.scrollToEnd}. */
export interface VirtualListScrollToEndOptions {
  behavior?: VirtualListScrollBehavior
}

/** Imperative API exposed through `ref`. */
export interface VirtualListHandle {
  /** Scroll an item into view by index (clamped to the list). */
  scrollToIndex(index: number, options?: VirtualListScrollToOptions): void
  /** Scroll an item into view by key; unknown keys are ignored. */
  scrollToKey(key: VirtualListKey, options?: VirtualListScrollToOptions): void
  /** Scroll to the end and, for `anchor="end"`, resume sticking to it. */
  scrollToEnd(options?: VirtualListScrollToEndOptions): void
  /** Whether the viewport is within `atEndThreshold` of the end right now. */
  isAtEnd(): boolean
  /** The scroll container element. */
  getScrollElement(): HTMLDivElement | null
}

export interface VirtualListProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'children'> {
  /** The full list of items; only a window of them is mounted. */
  items: readonly T[]
  /** Stable identity per item. Measurements and scroll position follow keys. */
  getItemKey: (item: T, index: number) => VirtualListKey
  /** Render one item. Its height is measured; margins inside it are included. */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Height in px assumed for items not yet measured. */
  estimatedItemSize?: number
  /** Items mounted beyond each edge of the viewport. */
  overscan?: number
  /**
   * `'start'`: a top-down list. `'end'`: a history that opens at the bottom,
   * sits short content at the bottom, and sticks to the end while there.
   */
  anchor?: VirtualListAnchor
  /** Distance in px from the end that still counts as at the end. */
  atEndThreshold?: number
  /** Called on mount with the initial value, then whenever at-end changes. */
  onAtEndChange?: (atEnd: boolean) => void
  /** Called when the visible range `[start, end)` (overscan excluded) changes. */
  onRangeChange?: (range: VirtualListRange) => void
  /** Items rendered before the viewport is known (SSR and first render). */
  initialItemCount?: number
  /** `'list'` or `'log'` (a live history, announced only while at the end). */
  role?: VirtualListRole
  /** Extra classes for every item wrapper. */
  itemClassName?: string
}

/** Correction passes a programmatic scroll gets while estimates turn into measurements. */
const MAX_SCROLL_CORRECTION_PASSES = 4
/** Sub-pixel differences that are not worth a scroll write (avoids feedback loops). */
const SCROLL_EPSILON = 0.5
/** Size changes below this are layout noise, not a new measurement. */
const SIZE_EPSILON = 0.1
const ITEM_SELECTOR = '[data-virtual-list-index]'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const NO_PINNED_INDEXES: readonly number[] = []

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

interface PendingScroll {
  target: VirtualListScrollTarget
  behavior: VirtualListScrollBehavior
  /** Re-aims left before giving up (bounds a fight with the reader). */
  passesLeft: number
  /** Last position written, so an in-flight smooth scroll is not restarted. */
  lastWritten: number | null
}

/** The latest render's layout, read by event handlers and observers. */
interface LayoutSnapshot {
  keys: readonly VirtualListKey[]
  keyIndex: ReadonlyMap<VirtualListKey, number>
  offsets: readonly number[]
  leadingSpace: number
  contentSize: number
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/** Border-box height, preferring the observer's value (no forced layout). */
function readItemSize(element: Element, entry?: ResizeObserverEntry): number {
  const box = entry?.borderBoxSize?.[0]
  if (box) return box.blockSize
  return element.getBoundingClientRect().height
}

function writeScroll(element: HTMLDivElement, top: number, behavior: VirtualListScrollBehavior) {
  if (behavior === 'smooth' && typeof element.scrollTo === 'function') {
    element.scrollTo({ top, behavior })
    return
  }
  element.scrollTop = top
}

/** Reuse the previous key array when keys are unchanged, so layout stays memoised. */
function useStableKeys<T>(
  items: readonly T[],
  getItemKey: (item: T, index: number) => VirtualListKey,
): readonly VirtualListKey[] {
  const previous = React.useRef<readonly VirtualListKey[]>([])
  const next = items.map((item, index) => getItemKey(item, index))
  if (!areVirtualListKeysEqual(previous.current, next)) previous.current = next
  return previous.current
}

function VirtualListInner<T>(
  {
    items,
    getItemKey,
    renderItem,
    estimatedItemSize = VIRTUAL_LIST_DEFAULT_ESTIMATED_ITEM_SIZE,
    overscan = VIRTUAL_LIST_DEFAULT_OVERSCAN,
    anchor = 'start',
    atEndThreshold = VIRTUAL_LIST_DEFAULT_AT_END_THRESHOLD,
    onAtEndChange,
    onRangeChange,
    initialItemCount = VIRTUAL_LIST_DEFAULT_INITIAL_ITEM_COUNT,
    role = 'list',
    itemClassName,
    className,
    style,
    onScroll,
    onFocus,
    onBlur,
    onWheel,
    onTouchStart,
    onKeyDown,
    tabIndex = 0,
    ...props
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<VirtualListHandle>,
) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const sizerRef = React.useRef<HTMLDivElement>(null)
  const sizeCache = React.useRef(new Map<VirtualListKey, number>())
  const [measureVersion, bumpMeasureVersion] = React.useReducer((v: number) => v + 1, 0)
  const [viewportSize, setViewportSize] = React.useState(0)
  const [windowState, setWindowState] = React.useState<VirtualListWindow>(() =>
    getVirtualListInitialRange({ count: items.length, initialItemCount, anchor }),
  )
  const [focusedKey, setFocusedKey] = React.useState<VirtualListKey | null>(null)
  // A bottom-anchored history opens at the end, so it starts out stuck there.
  const [atEnd, setAtEnd] = React.useState(anchor === 'end')

  const atEndRef = React.useRef(anchor === 'end')
  const scrollAnchorRef = React.useRef<VirtualListScrollAnchor | null>(null)
  const pendingRef = React.useRef<PendingScroll | null>(null)
  const notifiedAtEndRef = React.useRef<boolean | null>(null)
  const notifiedRangeRef = React.useRef<VirtualListRange | null>(null)
  const elementKeys = React.useRef(new Map<Element, VirtualListKey>())
  const observed = React.useRef(new Set<Element>())
  const itemObserverRef = React.useRef<ResizeObserver | null>(null)
  const prunedKeysRef = React.useRef<readonly VirtualListKey[] | null>(null)
  const callbacksRef = React.useRef({ onAtEndChange, onRangeChange })
  callbacksRef.current = { onAtEndChange, onRangeChange }

  const keys = useStableKeys(items, getItemKey)
  const keyIndex = React.useMemo(() => createVirtualListKeyIndex(keys), [keys])
  const offsets = React.useMemo(
    () => computeVirtualListOffsets(getVirtualListSizes(keys, sizeCache.current), estimatedItemSize),
    // measureVersion: the cache is mutated in place; the version marks a change.
    [keys, estimatedItemSize, measureVersion],
  )
  const { leadingSpace, contentSize } = getVirtualListContentSize({
    totalSize: getVirtualListTotalSize(offsets),
    viewportSize,
    anchor,
  })
  const layoutRef = React.useRef<LayoutSnapshot>({ keys, keyIndex, offsets, leadingSpace, contentSize })

  /** Read the scroller, then publish range, at-end and the reader anchor. */
  const syncFromScroll = React.useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const layout = layoutRef.current
    const scrollOffset = el.scrollTop
    const size = el.clientHeight

    const next = getVirtualListRange({
      offsets: layout.offsets,
      scrollOffset: scrollOffset - layout.leadingSpace,
      viewportSize: size,
      overscan,
    })
    setWindowState((current) => (areVirtualListWindowsEqual(current, next) ? current : next))

    const nowAtEnd = isVirtualListAtEnd({
      scrollOffset,
      viewportSize: size,
      contentSize: layout.contentSize,
      threshold: atEndThreshold,
    })
    atEndRef.current = nowAtEnd
    setAtEnd(nowAtEnd)
    scrollAnchorRef.current = captureVirtualListAnchor({
      offsets: layout.offsets,
      keys: layout.keys,
      scrollOffset,
      leadingSpace: layout.leadingSpace,
    })

    const { onAtEndChange: notifyAtEnd, onRangeChange: notifyRange } = callbacksRef.current
    if (notifiedAtEndRef.current !== nowAtEnd) {
      notifiedAtEndRef.current = nowAtEnd
      notifyAtEnd?.(nowAtEnd)
    }
    const visible = { start: next.visibleStart, end: next.visibleEnd }
    const lastRange = notifiedRangeRef.current
    if (!lastRange || lastRange.start !== visible.start || lastRange.end !== visible.end) {
      notifiedRangeRef.current = visible
      notifyRange?.(visible)
    }
  }, [overscan, atEndThreshold])

  /** Store any size change; returns whether the layout needs recomputing. */
  const recordSize = React.useCallback((element: Element, size: number): boolean => {
    const key = elementKeys.current.get(element)
    if (key === undefined) return false
    // A hidden (display:none) or not-yet-laid-out list reports 0 for every
    // item; keep the estimate rather than collapsing the whole list.
    if (size === 0 && (scrollerRef.current?.clientHeight ?? 0) === 0) return false
    const previous = sizeCache.current.get(key)
    if (previous !== undefined && Math.abs(previous - size) < SIZE_EPSILON) return false
    sizeCache.current.set(key, size)
    return true
  }, [])

  // One observer for every mounted item; guarded for SSR and old browsers,
  // where items are still measured once on mount by the layout effect below.
  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      let changed = false
      for (const entry of entries) {
        if (recordSize(entry.target, readItemSize(entry.target, entry))) changed = true
      }
      if (changed) bumpMeasureVersion()
    })
    itemObserverRef.current = observer
    const tracked = observed.current
    return () => {
      observer.disconnect()
      tracked.clear()
      itemObserverRef.current = null
    }
  }, [recordSize])

  // The viewport's own height drives the window size and short-content spacing.
  React.useEffect(() => {
    const el = scrollerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => setViewportSize(el.clientHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Runs after every commit, before paint. Each step is idempotent, so a pass
  // with nothing new is a cheap no-op.
  useIsomorphicLayoutEffect(() => {
    const el = scrollerRef.current
    const sizer = sizerRef.current
    if (!el || !sizer) return
    layoutRef.current = { keys, keyIndex, offsets, leadingSpace, contentSize }
    if (prunedKeysRef.current !== keys) {
      // Forget sizes of removed items so a long-lived feed doesn't leak.
      for (const key of sizeCache.current.keys()) {
        if (!keyIndex.has(key)) sizeCache.current.delete(key)
      }
      prunedKeysRef.current = keys
    }

    if (el.clientHeight !== viewportSize) {
      setViewportSize(el.clientHeight)
      return
    }

    // 1. Map mounted elements to keys; measure newcomers synchronously so the
    //    first paint already uses real heights.
    const mounted = Array.from(sizer.querySelectorAll<HTMLElement>(ITEM_SELECTOR))
    const live = new Set<Element>()
    let measuredNew = false
    for (const element of mounted) {
      const key = keys[Number(element.dataset.virtualListIndex)]
      if (key === undefined) continue
      live.add(element)
      elementKeys.current.set(element, key)
      if (!sizeCache.current.has(key) && recordSize(element, readItemSize(element))) {
        measuredNew = true
      }
    }
    syncObserved(live)
    if (measuredNew) {
      bumpMeasureVersion()
      return
    }

    // 2. Keep the reader where they were (pending scroll > stick to end > anchor).
    const pending = pendingRef.current
    const corrected = getVirtualListCorrectedScrollOffset({
      anchor,
      wasAtEnd: atEndRef.current,
      scrollAnchor: scrollAnchorRef.current,
      target: pending?.target ?? null,
      offsets,
      keyIndex,
      scrollOffset: el.scrollTop,
      viewportSize: el.clientHeight,
      leadingSpace,
    })
    if (pending) steerPending(el, pending, corrected)
    else if (corrected !== null && Math.abs(corrected - el.scrollTop) > SCROLL_EPSILON) {
      writeScroll(el, corrected, 'auto')
    }

    // 3. Publish the window, at-end and the new anchor for the next change.
    syncFromScroll()
  })

  /**
   * Re-aim a programmatic scroll whose target moved as estimates became
   * measurements; finish once it has arrived or run out of passes.
   */
  function steerPending(el: HTMLDivElement, pending: PendingScroll, target: number | null) {
    if (target === null || Math.abs(target - el.scrollTop) <= SCROLL_EPSILON) {
      pendingRef.current = null
      return
    }
    const moved =
      pending.lastWritten === null || Math.abs(target - pending.lastWritten) > SCROLL_EPSILON
    if (!moved) return // a smooth scroll is still travelling to the same place
    writeScroll(el, target, pending.behavior)
    pending.lastWritten = target
    pending.passesLeft -= 1
    if (pending.passesLeft <= 0) pendingRef.current = null
  }

  /** Observe newly mounted items and release unmounted ones (no leaks). */
  function syncObserved(live: Set<Element>) {
    const observer = itemObserverRef.current
    for (const element of observed.current) {
      if (live.has(element)) continue
      observer?.unobserve(element)
      observed.current.delete(element)
      elementKeys.current.delete(element)
    }
    if (!observer) return
    for (const element of live) {
      if (observed.current.has(element)) continue
      observer.observe(element)
      observed.current.add(element)
    }
  }

  const startScroll = React.useCallback(
    (target: VirtualListScrollTarget, requested: VirtualListScrollBehavior | undefined) => {
      const behavior = resolveVirtualListScrollBehavior(requested, prefersReducedMotion())
      const pending: PendingScroll = {
        target,
        behavior,
        passesLeft: MAX_SCROLL_CORRECTION_PASSES,
        lastWritten: null,
      }
      pendingRef.current = pending
      const el = scrollerRef.current
      if (!el) return
      const layout = layoutRef.current
      const top = getVirtualListCorrectedScrollOffset({
        anchor,
        wasAtEnd: false,
        scrollAnchor: null,
        target,
        offsets: layout.offsets,
        keyIndex: layout.keyIndex,
        scrollOffset: el.scrollTop,
        viewportSize: el.clientHeight,
        leadingSpace: layout.leadingSpace,
      })
      if (top !== null) {
        writeScroll(el, top, behavior)
        pending.lastWritten = top
      }
      syncFromScroll()
    },
    [anchor, syncFromScroll],
  )

  React.useImperativeHandle(
    ref,
    (): VirtualListHandle => ({
      scrollToIndex(index, options) {
        const { keys: current } = layoutRef.current
        if (current.length === 0) return
        const clamped = Math.min(Math.max(Math.floor(index), 0), current.length - 1)
        startScroll({ type: 'key', key: current[clamped], align: options?.align ?? 'auto' }, options?.behavior)
      },
      scrollToKey(key, options) {
        if (!layoutRef.current.keyIndex.has(key)) return
        startScroll({ type: 'key', key, align: options?.align ?? 'auto' }, options?.behavior)
      },
      scrollToEnd(options) {
        startScroll({ type: 'end' }, options?.behavior)
      },
      isAtEnd: () => atEndRef.current,
      getScrollElement: () => scrollerRef.current,
    }),
    [startScroll],
  )

  /** The reader took over: stop steering a programmatic scroll. */
  const cancelPending = () => {
    pendingRef.current = null
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    syncFromScroll()
    onScroll?.(event)
  }

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const item = (event.target as Element).closest?.(ITEM_SELECTOR) as HTMLElement | null
    const key =
      item && scrollerRef.current?.contains(item)
        ? layoutRef.current.keys[Number(item.dataset.virtualListIndex)]
        : undefined
    setFocusedKey(key ?? null)
    onFocus?.(event)
  }

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null
    if (!next || !scrollerRef.current?.contains(next)) setFocusedKey(null)
    onBlur?.(event)
  }

  const focusedIndex = focusedKey === null ? undefined : keyIndex.get(focusedKey)
  const pinned = focusedIndex === undefined ? NO_PINNED_INDEXES : [focusedIndex]
  const indexes = getVirtualListRenderIndexes(windowState, pinned, items.length)
  const aria = getVirtualListAriaProps({ role, atEnd })

  return (
    <div
      ref={scrollerRef}
      className={cn(virtualListScrollerClass, className)}
      style={style}
      tabIndex={tabIndex}
      data-anchor={anchor}
      data-at-end={atEnd ? 'true' : 'false'}
      {...aria.scroller}
      {...props}
      onScroll={handleScroll}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onWheel={(event) => {
        cancelPending()
        onWheel?.(event)
      }}
      onTouchStart={(event) => {
        cancelPending()
        onTouchStart?.(event)
      }}
      onKeyDown={(event) => {
        cancelPending()
        onKeyDown?.(event)
      }}
    >
      <div
        ref={sizerRef}
        className={virtualListSizerClass}
        style={{ height: contentSize }}
        {...aria.sizer}
      >
        {indexes.map((index) => (
          <div
            key={keys[index]}
            data-virtual-list-index={index}
            className={cn(virtualListItemClass, itemClassName)}
            style={{ top: leadingSpace + offsets[index] }}
            {...getVirtualListItemAriaProps(index, items.length)}
          >
            {renderItem(items[index], index)}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * VirtualList — a virtualised list for long, variable-height histories.
 *
 * Mounts only the items near the viewport (plus `overscan`), measures each
 * with a ResizeObserver, and positions them from prefix-sum offsets. With
 * `anchor="end"` it opens at the bottom, sticks there while the reader is at
 * the end, and keeps the view still when older items are prepended or late
 * measurements land above the viewport. The focused item stays mounted.
 * All range, alignment and anchor maths live in `@refraction-ui/virtual-list`.
 */
export const VirtualList = React.forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & React.RefAttributes<VirtualListHandle>,
) => React.ReactElement | null

;(VirtualList as unknown as { displayName: string }).displayName = 'VirtualList'
