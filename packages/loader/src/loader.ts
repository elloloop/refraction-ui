/** Shape of an indeterminate spinner. */
export type LoaderVariant = 'ring' | 'dots' | 'bars' | 'orbit' | 'ripple'

/** Visual size of a loader. Geometry lives in the loader stylesheet. */
export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Colour role a loader inherits. */
export type LoaderTone = 'primary' | 'tertiary' | 'muted' | 'inverse' | 'current'

/** Number of animated child parts each spinner variant renders. */
export const LOADER_PART_COUNT: Record<LoaderVariant, number> = {
  ring: 1,
  dots: 3,
  bars: 4,
  orbit: 3,
  ripple: 2,
}

/** Accessible name announced when a consumer gives none. */
export const DEFAULT_LOADER_LABEL = 'Loading'

export interface LoaderProps {
  /** Spinner shape. */
  variant?: LoaderVariant
  /** Visual size. */
  size?: LoaderSize
  /** Colour role. */
  tone?: LoaderTone
  /** Accessible name; announced by screen readers. */
  label?: string
  /**
   * Hide from assistive tech. Use when the loader sits inside a control that
   * already announces its busy state (e.g. a button with `aria-busy`).
   */
  decorative?: boolean
}

export interface LoaderAPI {
  /** ARIA attributes to spread on the root element. */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes that drive the stylesheet and expose state. */
  dataAttributes: Record<string, string>
  /** How many `[data-part]` children the adapter must render. */
  partCount: number
}

/**
 * Build the framework-agnostic props for an indeterminate spinner.
 *
 * The root is a polite live region (`role="status"`) so the loading state is
 * announced once without interrupting. `decorative` drops the semantics
 * entirely for spinners that only decorate an already-announced control.
 */
export function createLoader(props: LoaderProps = {}): LoaderAPI {
  const {
    variant = 'ring',
    size = 'md',
    tone = 'primary',
    label = DEFAULT_LOADER_LABEL,
    decorative = false,
  } = props

  const ariaProps: Record<string, string | number | boolean> = decorative
    ? { 'aria-hidden': true }
    : { role: 'status', 'aria-live': 'polite', 'aria-busy': true, 'aria-label': label }

  const dataAttributes: Record<string, string> = {
    'data-rfr-loader': 'spinner',
    'data-slot': 'loader',
    'data-variant': variant,
    'data-size': size,
    'data-tone': tone,
  }

  return { ariaProps, dataAttributes, partCount: LOADER_PART_COUNT[variant] }
}

// ---------------------------------------------------------------------------
// Anti-flicker visibility (delay + minimum duration)
// ---------------------------------------------------------------------------

/**
 * A loader that flashes for 40ms is worse than no loader; one that vanishes
 * the instant data lands reads as a glitch. The reducer below implements the
 * standard remedy: wait `delayMs` before showing, then stay for at least
 * `minDurationMs` once shown. It is a pure function of `(state, event)` with
 * the clock passed in, so adapters own timers and cores stay deterministic.
 */
export type LoaderPhase =
  /** Nothing pending, loader hidden. */
  | 'idle'
  /** Pending, but still inside the show delay — hidden. */
  | 'waiting'
  /** Pending and shown. */
  | 'visible'
  /** Work finished, but the minimum duration has not elapsed — still shown. */
  | 'settling'

export interface LoaderVisibilityState {
  phase: LoaderPhase
  /** Timestamp (ms) the current phase — or the visible run — began. */
  since: number
}

export interface LoaderTimingOptions {
  /** How long work must be pending before the loader shows. */
  delayMs?: number
  /** Once shown, how long the loader stays visible at minimum. */
  minDurationMs?: number
}

export type LoaderVisibilityEvent = {
  type: 'start' | 'stop' | 'tick'
  /** Current time in ms (any monotonic clock — the reducer only diffs). */
  now: number
}

export const DEFAULT_LOADER_DELAY_MS = 150
export const DEFAULT_LOADER_MIN_DURATION_MS = 500

export function initialLoaderVisibility(now = 0): LoaderVisibilityState {
  return { phase: 'idle', since: now }
}

function resolveTiming(options: LoaderTimingOptions): Required<LoaderTimingOptions> {
  return {
    delayMs: options.delayMs ?? DEFAULT_LOADER_DELAY_MS,
    minDurationMs: options.minDurationMs ?? DEFAULT_LOADER_MIN_DURATION_MS,
  }
}

export function reduceLoaderVisibility(
  state: LoaderVisibilityState,
  event: LoaderVisibilityEvent,
  options: LoaderTimingOptions = {},
): LoaderVisibilityState {
  const { delayMs, minDurationMs } = resolveTiming(options)
  const { type, now } = event

  switch (state.phase) {
    case 'idle':
      if (type !== 'start') return state
      return delayMs <= 0
        ? { phase: 'visible', since: now }
        : { phase: 'waiting', since: now }

    case 'waiting':
      if (type === 'stop') return { phase: 'idle', since: now }
      return now - state.since >= delayMs ? { phase: 'visible', since: now } : state

    case 'visible':
      if (type !== 'stop') return state
      return now - state.since >= minDurationMs
        ? { phase: 'idle', since: now }
        : { phase: 'settling', since: state.since }

    case 'settling':
      if (type === 'start') return { phase: 'visible', since: state.since }
      return now - state.since >= minDurationMs ? { phase: 'idle', since: now } : state
  }
}

export function isLoaderVisible(state: LoaderVisibilityState): boolean {
  return state.phase === 'visible' || state.phase === 'settling'
}

/**
 * Absolute time at which the state needs a `tick` to advance, or `null` when
 * it is stable until the next `start`/`stop`. Adapters schedule one timer from
 * this instead of polling.
 */
export function nextLoaderTransitionAt(
  state: LoaderVisibilityState,
  options: LoaderTimingOptions = {},
): number | null {
  const { delayMs, minDurationMs } = resolveTiming(options)
  if (state.phase === 'waiting') return state.since + delayMs
  if (state.phase === 'settling') return state.since + minDurationMs
  return null
}

// ---------------------------------------------------------------------------
// Message rotation for long waits
// ---------------------------------------------------------------------------

/** Pick the message for the n-th rotation, wrapping around the list. */
export function pickLoaderMessage(messages: readonly string[], index: number): string | undefined {
  if (messages.length === 0) return undefined
  const safe = ((index % messages.length) + messages.length) % messages.length
  return messages[safe]
}
