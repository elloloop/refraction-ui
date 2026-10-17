import * as React from 'react'
import {
  followAfterScroll,
  type TranscriptEntry,
  type TranscriptScrollMetrics,
} from '@refraction-ui/live-transcript'
import { prefersReducedMotion } from '@refraction-ui/shared'

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect

function readScrollMetrics(element: HTMLElement): TranscriptScrollMetrics {
  return {
    scrollTop: element.scrollTop,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
  }
}

export interface AutoFollow {
  /** Attach to the scroll container. */
  containerRef: React.MutableRefObject<HTMLDivElement | null>
  /** Attach to the jump-to-live control, so focus survives it unmounting. */
  jumpRef: React.MutableRefObject<HTMLButtonElement | null>
  /** Whether new lines are being kept in view. */
  following: boolean
  /** Call from the container's scroll handler. */
  onScroll(): void
  /** Scroll to the newest line and resume following. */
  jumpToLive(): void
}

/**
 * Keeps a scroll container at its newest line while `enabled`, pausing when
 * the reader scrolls up to older lines and resuming when they return to the
 * live edge or jump back to it. The decisions are the headless
 * `followAfterScroll`; this hook only reads the DOM and moves the scroll.
 */
export function useAutoFollow(
  enabled: boolean,
  entries: readonly TranscriptEntry[],
): AutoFollow {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const jumpRef = React.useRef<HTMLButtonElement | null>(null)
  const followingRef = React.useRef(true)
  const scrollTopRef = React.useRef(0)
  const [following, setFollowingState] = React.useState(true)

  const setFollowing = React.useCallback((next: boolean) => {
    followingRef.current = next
    setFollowingState(next)
  }, [])

  // Folds the reader's latest scroll into the follow state. Run before every
  // pin too: a scroll the browser has not reported yet must not be undone by
  // a line that lands first.
  const syncFromScroll = React.useCallback(
    (element: HTMLElement) => {
      const next = followAfterScroll(
        followingRef.current,
        scrollTopRef.current,
        readScrollMetrics(element),
      )
      scrollTopRef.current = element.scrollTop
      if (next !== followingRef.current) setFollowing(next)
      return next
    },
    [setFollowing],
  )

  const pin = React.useCallback((element: HTMLElement) => {
    element.scrollTop = element.scrollHeight
    scrollTopRef.current = element.scrollTop
  }, [])

  // Turning auto-follow on starts at the live edge.
  useIsomorphicLayoutEffect(() => {
    const element = containerRef.current
    if (!enabled || !element) return
    setFollowing(true)
    pin(element)
  }, [enabled, pin, setFollowing])

  // Each new or revised line lands in view while following.
  useIsomorphicLayoutEffect(() => {
    const element = containerRef.current
    if (!enabled || !element) return
    if (syncFromScroll(element)) pin(element)
  }, [enabled, entries, pin, syncFromScroll])

  // A resized panel re-wraps its lines; stay at the live edge while following.
  React.useEffect(() => {
    const element = containerRef.current
    if (!enabled || !element || typeof ResizeObserver !== 'function') return
    const observer = new ResizeObserver(() => {
      if (followingRef.current) pin(element)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, pin])

  const onScroll = React.useCallback(() => {
    const element = containerRef.current
    if (!enabled || !element) return
    syncFromScroll(element)
  }, [enabled, syncFromScroll])

  const jumpToLive = React.useCallback(() => {
    const element = containerRef.current
    if (!element) return
    const controlHadFocus =
      jumpRef.current != null && jumpRef.current === element.ownerDocument.activeElement
    setFollowing(true)
    element.scrollTo({
      top: element.scrollHeight,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
    // The control disappears once following; keep keyboard focus in the
    // transcript instead of dropping it to the page.
    if (controlHadFocus) element.focus({ preventScroll: true })
  }, [setFollowing])

  return { containerRef, jumpRef, following, onScroll, jumpToLive }
}
