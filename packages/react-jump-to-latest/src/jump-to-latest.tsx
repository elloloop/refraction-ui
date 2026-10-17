import * as React from 'react'
import type { VirtualListHandle } from '@refraction-ui/react-virtual-list'
import {
  createJumpToLatestAnnouncer,
  createJumpToLatestState,
  getJumpToLatestButtonProps,
  getJumpToLatestFirstUnreadIndex,
  getJumpToLatestFirstUnreadKey,
  getJumpToLatestLabel,
  getJumpToLatestLiveRegionProps,
  isJumpToLatestAtEnd,
  isJumpToLatestVisible,
  jumpToLatestIconClass,
  jumpToLatestLiveRegionClass,
  jumpToLatestReducer,
  jumpToLatestVariants,
  resolveJumpToLatestScrollBehavior,
  JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY,
  JUMP_TO_LATEST_DEFAULT_THRESHOLD,
  type JumpToLatestAction,
  type JumpToLatestCountFormatter,
  type JumpToLatestKey,
  type JumpToLatestScrollBehavior,
  type JumpToLatestTarget,
} from '@refraction-ui/jump-to-latest'
import { cn } from '@refraction-ui/shared'

export type {
  JumpToLatestCountFormatter,
  JumpToLatestKey,
  JumpToLatestScrollBehavior,
  JumpToLatestTarget,
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

/** Options for {@link JumpToLatestController.jump} / `jumpToFirstUnread`. */
export interface JumpToLatestJumpOptions {
  /** Defaults to `'smooth'`; always `'auto'` (instant) under `prefers-reduced-motion`. */
  behavior?: JumpToLatestScrollBehavior
}

/** The first item the reader missed, handed to {@link UseJumpToLatestOptions.scrollToItem}. */
export interface JumpToLatestItemTarget {
  /** `null` when tracking by `count` rather than `keys`. */
  key: JumpToLatestKey | null
  index: number
}

export interface UseJumpToLatestOptions {
  /**
   * A plain scroll container. Use this or `listRef`. It may mount after the
   * hook or be replaced; the listener follows it on the next render.
   */
  scrollRef?: React.RefObject<HTMLElement | null>
  /** A VirtualList handle. Use this or `scrollRef`. */
  listRef?: React.RefObject<VirtualListHandle | null>
  /**
   * Item keys in list order (the VirtualList's `getItemKey` values). Lets the
   * tracker tell new items from loaded history and survive deletions.
   */
  keys?: readonly JumpToLatestKey[]
  /** Item count, when keys are not available. Every increase while away counts as new. */
  count?: number
  /** Distance in px from the end that still counts as at the end. */
  threshold?: number
  /**
   * Plain scrollers only: when items arrive while the reader is at the end,
   * keep them at the end (a VirtualList with `anchor="end"` already does).
   */
  stickToEnd?: boolean
  /**
   * Plain scrollers only: scroll the first unread item into view. Without it
   * `jumpToFirstUnread` falls back to the end. A VirtualList needs nothing:
   * its handle's `scrollToKey` / `scrollToIndex` is used.
   */
  scrollToItem?: (target: JumpToLatestItemTarget, behavior: JumpToLatestScrollBehavior) => void
}

/** State and actions for a {@link JumpToLatest} pill. */
export interface JumpToLatestController {
  /** Whether the reader is at (within `threshold` of) the end. */
  atEnd: boolean
  /** Items that arrived since the reader left the end. */
  newCount: number
  /** Key of the first missed item (keyed tracking only), or `null`. */
  firstUnreadKey: JumpToLatestKey | null
  /** Index of the first missed item, or `null`. */
  firstUnreadIndex: number | null
  /** Scroll to the end. */
  jump(options?: JumpToLatestJumpOptions): void
  /** Scroll to the first missed item and mark everything read; the end when nothing is unread. */
  jumpToFirstUnread(options?: JumpToLatestJumpOptions): void
  /** The tracked scroll container. */
  getScrollElement(): HTMLElement | null
}

/**
 * Tracks whether a scroll container (or a VirtualList) is at its end and how
 * many items arrived while the reader was away. All counting rules live in
 * the pure `jumpToLatestReducer`; this hook only feeds it DOM measurements.
 */
export function useJumpToLatest(options: UseJumpToLatestOptions = {}): JumpToLatestController {
  const { keys, count, threshold = JUMP_TO_LATEST_DEFAULT_THRESHOLD } = options
  const itemCount = keys ? keys.length : (count ?? 0)
  const [state, dispatch] = React.useReducer(
    jumpToLatestReducer,
    { keys, count: itemCount },
    createJumpToLatestState,
  )

  // Read inside listeners and imperative calls without re-subscribing.
  const optionsRef = React.useRef(options)
  optionsRef.current = options
  const stateRef = React.useRef(state)
  stateRef.current = state
  const thresholdRef = React.useRef(threshold)
  thresholdRef.current = threshold

  const getScrollElement = React.useCallback((): HTMLElement | null => {
    const { scrollRef, listRef } = optionsRef.current
    return scrollRef?.current ?? listRef?.current?.getScrollElement() ?? null
  }, [])

  const measure = React.useCallback(() => {
    const el = getScrollElement()
    if (!el) return
    dispatch({ type: 'atEnd', atEnd: isJumpToLatestAtEnd(el, thresholdRef.current) })
  }, [getScrollElement])

  React.useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  // A new threshold can change the answer without any scrolling.
  const isFirstThresholdRun = React.useRef(true)
  React.useEffect(() => {
    if (isFirstThresholdRun.current) {
      isFirstThresholdRun.current = false
      return
    }
    measure()
  }, [threshold, measure])

  // Items changed: count them against where the reader was *before* the
  // change (arrivals seen at the end are not new), then re-measure, since
  // the content height moved without a scroll event.
  const isFirstItemsRun = React.useRef(true)
  useIsomorphicLayoutEffect(() => {
    if (isFirstItemsRun.current) {
      isFirstItemsRun.current = false
      return
    }
    const action: JumpToLatestAction = keys
      ? { type: 'items', keys }
      : { type: 'items', count: itemCount }
    // `keys` is usually a fresh array every render; the pure reducer says
    // whether anything really changed, so equal lists cost no dispatch or scroll.
    const previous = stateRef.current
    if (jumpToLatestReducer(previous, action) === previous) return
    dispatch(action)
    const el = getScrollElement()
    if (previous.atEnd && el && optionsRef.current.stickToEnd && !optionsRef.current.listRef) {
      el.scrollTop = el.scrollHeight
    }
    measure()
  }, [keys, itemCount, getScrollElement, measure])

  // The scroller can mount after the hook (`loading ? <Spinner /> : <div ref={scrollRef}>`),
  // be swapped for another, or come from a VirtualList whose element changes.
  // Refs don't trigger renders, so check after every render (no deps) and
  // move the listener when the element differs. Declared after the items
  // effect so arrivals in the same render are counted before re-measuring.
  const subscribedRef = React.useRef<HTMLElement | null>(null)
  useIsomorphicLayoutEffect(() => {
    const el = getScrollElement()
    if (el === subscribedRef.current) return
    subscribedRef.current?.removeEventListener('scroll', measure)
    subscribedRef.current = el
    if (!el) return
    el.addEventListener('scroll', measure, { passive: true })
    measure()
  })
  React.useEffect(
    () => () => {
      subscribedRef.current?.removeEventListener('scroll', measure)
      subscribedRef.current = null
    },
    [measure],
  )

  const jump = React.useCallback(
    (jumpOptions?: JumpToLatestJumpOptions) => {
      const behavior = resolveJumpToLatestScrollBehavior(prefersReducedMotion(), jumpOptions?.behavior)
      const handle = optionsRef.current.listRef?.current
      if (handle) {
        handle.scrollToEnd({ behavior })
      } else {
        const el = getScrollElement()
        if (!el) return
        if (typeof el.scrollTo === 'function') el.scrollTo({ top: el.scrollHeight, behavior })
        else el.scrollTop = el.scrollHeight
      }
      // An instant jump lands before any scroll event; a smooth one reports in as it moves.
      measure()
    },
    [getScrollElement, measure],
  )

  const jumpToFirstUnread = React.useCallback(
    (jumpOptions?: JumpToLatestJumpOptions) => {
      const current = stateRef.current
      const index = getJumpToLatestFirstUnreadIndex(current)
      const key = getJumpToLatestFirstUnreadKey(current)
      const handle = optionsRef.current.listRef?.current
      const scrollToItem = optionsRef.current.scrollToItem
      if (index === null || (!handle && !scrollToItem)) {
        jump(jumpOptions)
        return
      }
      const behavior = resolveJumpToLatestScrollBehavior(prefersReducedMotion(), jumpOptions?.behavior)
      if (handle) {
        if (key !== null) handle.scrollToKey(key, { align: 'start', behavior })
        else handle.scrollToIndex(index, { align: 'start', behavior })
      } else {
        scrollToItem?.({ key, index }, behavior)
      }
      // The reader is now at what they missed; the next press goes to the end.
      dispatch({ type: 'markRead' })
      measure()
    },
    [jump, measure],
  )

  const firstUnreadKey = getJumpToLatestFirstUnreadKey(state)
  const firstUnreadIndex = React.useMemo(() => getJumpToLatestFirstUnreadIndex(state), [state])

  return React.useMemo(
    () => ({
      atEnd: state.atEnd,
      newCount: state.newCount,
      firstUnreadKey,
      firstUnreadIndex,
      jump,
      jumpToFirstUnread,
      getScrollElement,
    }),
    [state.atEnd, state.newCount, firstUnreadKey, firstUnreadIndex, jump, jumpToFirstUnread, getScrollElement],
  )
}

export interface JumpToLatestProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  /** The tracker from {@link useJumpToLatest} (or any object of the same shape). */
  controller: JumpToLatestController
  /** `'latest'` scrolls to the end; `'first-unread'` to the first missed item. */
  jumpTo?: JumpToLatestTarget
  /** Pluralised count text. Defaults to `1 new message` / `3 new messages`. */
  formatNewCount?: JumpToLatestCountFormatter
  /** Text when away with nothing new. Defaults to `Jump to latest`. */
  latestLabel?: string
  /** Live-region text for arrivals. Defaults to `formatNewCount`. */
  formatAnnouncement?: JumpToLatestCountFormatter
  /** Window in ms over which arrivals are coalesced into one announcement. */
  announceDelay?: number
}

/** Global timers, wrapped so the core's announcer can stay clock-free. */
const browserTimers = {
  setTimeout: (callback: () => void, ms: number): unknown => globalThis.setTimeout(callback, ms),
  clearTimeout: (handle: unknown) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
}

function useJumpToLatestAnnouncement(
  atEnd: boolean,
  newCount: number,
  format: JumpToLatestCountFormatter,
  delay: number,
): string {
  const [message, setMessage] = React.useState('')
  const formatRef = React.useRef(format)
  formatRef.current = format

  const announcerRef = React.useRef<ReturnType<typeof createJumpToLatestAnnouncer> | null>(null)
  React.useEffect(() => {
    const announcer = createJumpToLatestAnnouncer({
      timers: browserTimers,
      delay,
      onAnnounce: (count) => setMessage(formatRef.current(count)),
      onClear: () => setMessage(''),
    })
    announcerRef.current = announcer
    return () => {
      announcer.dispose()
      announcerRef.current = null
    }
  }, [delay])

  // Declared after the announcer effect so the first update (the baseline)
  // reaches it on mount.
  React.useEffect(() => {
    announcerRef.current?.update({ atEnd, newCount })
  }, [atEnd, newCount, delay])

  return message
}

function ArrowDownIcon() {
  return (
    <svg
      className={jumpToLatestIconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  )
}

/**
 * JumpToLatest — a pill that returns a scrolled-back reader to the newest
 * item. It shows while the reader is away from the end ("3 new messages", or
 * "Jump to latest" when nothing is new), scrolls on click/Enter/Space
 * (smooth, instant under reduced motion), and politely announces arrivals.
 * Position it yourself (e.g. absolutely over the bottom of the list).
 */
export const JumpToLatest = React.forwardRef<HTMLButtonElement, JumpToLatestProps>(
  function JumpToLatest(
    {
      controller,
      jumpTo = 'latest',
      formatNewCount,
      latestLabel,
      formatAnnouncement,
      announceDelay = JUMP_TO_LATEST_DEFAULT_ANNOUNCE_DELAY,
      className,
      onClick,
      ...props
    },
    ref,
  ) {
    const { atEnd, newCount } = controller
    const visible = isJumpToLatestVisible(atEnd)
    const label = getJumpToLatestLabel(newCount, { formatNewCount, latestLabel })
    const announcement = useJumpToLatestAnnouncement(
      atEnd,
      newCount,
      formatAnnouncement ?? ((count) => getJumpToLatestLabel(count, { formatNewCount, latestLabel })),
      announceDelay,
    )

    const buttonRef = React.useRef<HTMLButtonElement | null>(null)
    const setRefs = React.useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    // A pill pressed from the keyboard hides once the jump lands; don't leave
    // focus on a hidden control — hand it to the (focusable) scroller.
    React.useEffect(() => {
      const button = buttonRef.current
      if (visible || !button || button.ownerDocument.activeElement !== button) return
      const scroller = controller.getScrollElement()
      if (scroller && scroller.tabIndex >= 0) scroller.focus({ preventScroll: true })
    }, [visible, controller])

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (event.defaultPrevented || !visible) return
      if (jumpTo === 'first-unread') controller.jumpToFirstUnread()
      else controller.jump()
    }

    return (
      <>
        <button
          ref={setRefs}
          type="button"
          className={cn(jumpToLatestVariants({ visible: visible ? 'true' : 'false' }), className)}
          data-jump-to={jumpTo}
          {...props}
          {...getJumpToLatestButtonProps(visible)}
          onClick={handleClick}
        >
          <ArrowDownIcon />
          <span>{label}</span>
        </button>
        <span className={jumpToLatestLiveRegionClass} {...getJumpToLatestLiveRegionProps()}>
          {announcement}
        </span>
      </>
    )
  },
)
