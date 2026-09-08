/** Where the bar sits: pinned to the top of the viewport, or in flow. */
export type LoadingBarPlacement = 'fixed' | 'inline'

/** Progress values are percentages. */
export const PROGRESS_MIN = 0
export const PROGRESS_MAX = 100

/** An indeterminate trickle never claims to be finished. */
export const TRICKLE_CEILING = 94
/** Cadence adapters should trickle at. */
export const TRICKLE_INTERVAL_MS = 300

export const DEFAULT_LOADING_BAR_LABEL = 'Loading page'

export function clampProgress(value: number): number {
  if (Number.isNaN(value)) return PROGRESS_MIN
  return Math.min(PROGRESS_MAX, Math.max(PROGRESS_MIN, value))
}

/**
 * Next value for a route-transition bar that has no real progress signal.
 * Moves quickly at first, then in ever-smaller steps, and never passes the
 * ceiling — the bar only completes when the consumer says so.
 */
export function trickleProgress(value: number): number {
  const current = clampProgress(value)
  if (current >= TRICKLE_CEILING) return TRICKLE_CEILING
  const step = current < 20 ? 8 : current < 50 ? 4 : current < 80 ? 2 : 0.5
  return Math.min(TRICKLE_CEILING, current + step)
}

export type LoadingBarState = 'indeterminate' | 'loading' | 'complete'

export interface LoadingBarProps {
  /** Percentage complete. Omit for an indeterminate sweep. */
  value?: number
  /** Accessible name. */
  label?: string
  /** Placement. */
  placement?: LoadingBarPlacement
}

export interface LoadingBarAPI {
  /** ARIA attributes for the root (`role="progressbar"`). */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes that drive the stylesheet and expose state. */
  dataAttributes: Record<string, string>
  /** Inline CSS custom properties the fill reads its width from. */
  style: Record<string, string>
  state: LoadingBarState
}

export function resolveLoadingBarState(value: number | undefined): LoadingBarState {
  if (value === undefined) return 'indeterminate'
  return clampProgress(value) >= PROGRESS_MAX ? 'complete' : 'loading'
}

export function createLoadingBar(props: LoadingBarProps = {}): LoadingBarAPI {
  const { value, label = DEFAULT_LOADING_BAR_LABEL, placement = 'inline' } = props
  const state = resolveLoadingBarState(value)

  const ariaProps: Record<string, string | number | boolean> = {
    role: 'progressbar',
    'aria-label': label,
    'aria-valuemin': PROGRESS_MIN,
    'aria-valuemax': PROGRESS_MAX,
    'aria-busy': state !== 'complete',
  }
  if (value !== undefined) {
    ariaProps['aria-valuenow'] = Math.round(clampProgress(value))
  }

  const dataAttributes: Record<string, string> = {
    'data-rfr-loader': 'bar',
    'data-slot': 'loading-bar',
    'data-state': state,
    'data-placement': placement,
  }

  const style: Record<string, string> = {
    '--rfr-loader-value': `${value === undefined ? 0 : clampProgress(value)}%`,
  }

  return { ariaProps, dataAttributes, style, state }
}
