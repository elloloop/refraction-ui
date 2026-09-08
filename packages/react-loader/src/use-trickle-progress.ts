import * as React from 'react'
import {
  trickleProgress,
  PROGRESS_MAX,
  PROGRESS_MIN,
  TRICKLE_INTERVAL_MS,
} from '@refraction-ui/loader'

export interface TrickleProgressOptions {
  /** Cadence of trickle steps. */
  intervalMs?: number
  /** How long the completed bar stays before hiding. */
  completeHoldMs?: number
}

export interface TrickleProgressResult {
  /** Current percentage (0–100). */
  value: number
  /** Whether a bar should be rendered at all. */
  visible: boolean
}

const DEFAULT_COMPLETE_HOLD_MS = 450

/**
 * Fake-but-honest progress for work with no progress signal (a route change,
 * a fetch). Trickles towards a ceiling while `active`, sprints to 100% when
 * `active` drops, then hides after a short hold. Timers live here; the step
 * function itself is the pure `trickleProgress` from the core.
 */
export function useTrickleProgress(
  active: boolean,
  options: TrickleProgressOptions = {},
): TrickleProgressResult {
  const intervalMs = options.intervalMs ?? TRICKLE_INTERVAL_MS
  const completeHoldMs = options.completeHoldMs ?? DEFAULT_COMPLETE_HOLD_MS

  const [value, setValue] = React.useState(PROGRESS_MIN)
  const [visible, setVisible] = React.useState(false)
  const wasActive = React.useRef(false)

  React.useEffect(() => {
    if (active) {
      wasActive.current = true
      setVisible(true)
      setValue(trickleProgress(PROGRESS_MIN))
      const timer = setInterval(() => setValue((v) => trickleProgress(v)), intervalMs)
      return () => clearInterval(timer)
    }

    if (!wasActive.current) return
    wasActive.current = false
    setValue(PROGRESS_MAX)
    const timer = setTimeout(() => {
      setVisible(false)
      setValue(PROGRESS_MIN)
    }, completeHoldMs)
    return () => clearTimeout(timer)
  }, [active, intervalMs, completeHoldMs])

  return { value, visible }
}
