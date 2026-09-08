import * as React from 'react'
import {
  initialLoaderVisibility,
  reduceLoaderVisibility,
  isLoaderVisible,
  nextLoaderTransitionAt,
  type LoaderTimingOptions,
  type LoaderVisibilityEvent,
  type LoaderVisibilityState,
} from '@refraction-ui/loader'

/**
 * Anti-flicker gate for any loader.
 *
 * Returns `true` only after `pending` has been true for `delayMs`, and keeps
 * returning `true` for at least `minDurationMs` once shown — so fast responses
 * never flash a spinner and slow ones never blink it away. The state machine
 * is the core's pure reducer; this hook only owns the clock and one timer.
 */
export function useDelayedLoading(
  pending: boolean,
  options: LoaderTimingOptions = {},
): boolean {
  const { delayMs, minDurationMs } = options
  const timing = React.useMemo(() => ({ delayMs, minDurationMs }), [delayMs, minDurationMs])

  const [state, dispatch] = React.useReducer(
    (current: LoaderVisibilityState, event: LoaderVisibilityEvent) =>
      reduceLoaderVisibility(current, event, timing),
    undefined,
    () => initialLoaderVisibility(0),
  )

  React.useEffect(() => {
    dispatch({ type: pending ? 'start' : 'stop', now: Date.now() })
  }, [pending])

  React.useEffect(() => {
    const at = nextLoaderTransitionAt(state, timing)
    if (at === null) return
    const timer = setTimeout(
      () => dispatch({ type: 'tick', now: Date.now() }),
      Math.max(0, at - Date.now()),
    )
    return () => clearTimeout(timer)
  }, [state, timing])

  return isLoaderVisible(state)
}
