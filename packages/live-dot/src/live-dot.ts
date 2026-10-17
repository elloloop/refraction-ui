/**
 * Semantic colour tokens a LiveDot can be drawn in. These are token *names*
 * (mapped to `bg-<token>` classes in the styles), never raw CSS colours, so the
 * dot follows the active theme in light, dark and system modes.
 */
export const LIVE_DOT_COLORS = [
  'primary',
  'success',
  'destructive',
  'warning',
  'info',
  'pending',
  'neutral',
  'muted',
] as const

export type LiveDotColor = (typeof LIVE_DOT_COLORS)[number]

/** Named sizes on the dot scale, smallest to largest. */
export const LIVE_DOT_SIZES = ['xs', 'sm', 'md', 'lg'] as const

export type LiveDotSizeName = (typeof LIVE_DOT_SIZES)[number]

/**
 * A dot size: a named step on the scale, or a positive number of `rem` for the
 * rare case the scale does not fit (e.g. matching a custom icon).
 */
export type LiveDotSize = LiveDotSizeName | number

/** Size variant key used when the size is a custom rem value. */
export const LIVE_DOT_CUSTOM_SIZE = 'custom'

export type LiveDotSizeVariant = LiveDotSizeName | typeof LIVE_DOT_CUSTOM_SIZE

export const LIVE_DOT_DEFAULT_COLOR: LiveDotColor = 'success'
export const LIVE_DOT_DEFAULT_SIZE: LiveDotSizeName = 'sm'

export interface LiveDotOptions {
  /** Whether something is live: draws the breathing halo. Defaults to `true`. */
  live?: boolean
  /** Semantic colour token. Defaults to `success`. */
  color?: LiveDotColor
  /** Named size or a positive rem value. Defaults to `sm`. */
  size?: LiveDotSize
  /**
   * Accessible name for when the dot stands alone. Omit it (the default) when
   * adjacent text already says what the dot means; the dot is then hidden from
   * assistive technology so the meaning is never carried by colour alone.
   */
  label?: string
}

export interface ResolvedLiveDotSize {
  /** The size variant to apply (`custom` when a rem value was given). */
  variant: LiveDotSizeVariant
  /** CSS width/height (e.g. `0.875rem`) for a custom size; absent otherwise. */
  dimension?: string
}

export interface LiveDotAPI {
  /** Resolved liveness. */
  live: boolean
  /** Resolved colour token. */
  color: LiveDotColor
  /** Resolved size. */
  size: ResolvedLiveDotSize
  /** Resolved accessible name, or `undefined` when the dot is decorative. */
  label: string | undefined
  /**
   * ARIA attributes for the root: `role="img"` + `aria-label` when labelled,
   * otherwise `aria-hidden="true"`.
   */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks and tests. */
  dataAttributes: Record<string, string>
  /** Inline style for a custom rem size; empty for named sizes. */
  style: Record<string, string>
}

const REM_UNIT = 'rem'

/** Type guard: is `value` one of the supported colour token names? */
export function isLiveDotColor(value: unknown): value is LiveDotColor {
  return (
    typeof value === 'string' &&
    (LIVE_DOT_COLORS as readonly string[]).includes(value)
  )
}

/** Type guard: is `value` one of the named sizes? */
export function isLiveDotSizeName(value: unknown): value is LiveDotSizeName {
  return (
    typeof value === 'string' &&
    (LIVE_DOT_SIZES as readonly string[]).includes(value)
  )
}

/**
 * Resolve a size prop into a variant plus, for rem values, a CSS dimension.
 *
 * Unknown names and non-positive / non-finite numbers fall back to the default
 * size rather than rendering an invisible or broken dot.
 */
export function resolveLiveDotSize(size: LiveDotSize | undefined): ResolvedLiveDotSize {
  if (isLiveDotSizeName(size)) return { variant: size }
  if (typeof size === 'number' && Number.isFinite(size) && size > 0) {
    return { variant: LIVE_DOT_CUSTOM_SIZE, dimension: `${size}${REM_UNIT}` }
  }
  return { variant: LIVE_DOT_DEFAULT_SIZE }
}

/** Resolve a colour prop, falling back to the default for unknown names. */
export function resolveLiveDotColor(color: string | undefined): LiveDotColor {
  return isLiveDotColor(color) ? color : LIVE_DOT_DEFAULT_COLOR
}

/** A label counts only when it has visible characters. */
function normaliseLabel(label: string | undefined): string | undefined {
  const trimmed = label?.trim()
  return trimmed ? trimmed : undefined
}

/**
 * Build the framework-agnostic state for a LiveDot.
 *
 * The dot is decorative by default (`aria-hidden`) because its meaning is
 * given by adjacent text ("Recording", "Live"). Passing a `label` turns it into
 * a standalone graphic (`role="img"` with that name). Liveness is exposed as
 * `data-live` so adapters render the halo only while live.
 */
export function createLiveDot(props: LiveDotOptions = {}): LiveDotAPI {
  const live = props.live ?? true
  const color = resolveLiveDotColor(props.color)
  const size = resolveLiveDotSize(props.size)
  const label = normaliseLabel(props.label)

  const ariaProps: Record<string, string | number | boolean> = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': 'true' }

  const dataAttributes: Record<string, string> = {
    'data-live': live ? 'true' : 'false',
    'data-color': color,
    'data-size': size.variant,
  }

  const style: Record<string, string> = size.dimension
    ? { width: size.dimension, height: size.dimension }
    : {}

  return { live, color, size, label, ariaProps, dataAttributes, style }
}
