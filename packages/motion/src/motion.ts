/**
 * Timing vocabulary. Calm by default: short and soft, no springs on anything
 * informational. Values mirror the Tortoise Learning motion tokens so a
 * themed app and this library agree to the millisecond.
 */
export const MOTION_DURATIONS = {
  instant: 90,
  fast: 160,
  base: 240,
  slow: 420,
  page: 420,
  sheet: 340,
  celebrate: 700,
  staggerStep: 45,
} as const

export const MOTION_EASINGS = {
  /** Default for anything that settles. */
  out: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  inOut: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
  /** Emphasised ease for elements that ARRIVE — never for exits. */
  emphasis: 'cubic-bezier(0.16, 0.84, 0.24, 1)',
  /** Celebration only: a badge or reward arriving. Never navigation. */
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

/**
 * Playback speed as a multiplier on every duration: 1 is the designed tempo,
 * 2 plays twice as fast, 0.5 half as fast. Named steps exist so a product can
 * offer a small, sane set in its own settings rather than a free number field.
 */
export const MOTION_SPEEDS = {
  /** Half speed — presentations, or users who asked for a gentler pace. */
  slow: 0.5,
  relaxed: 0.75,
  /** The designed tempo. */
  default: 1,
  brisk: 1.5,
  /** Twice as fast — dense internal tools. */
  fast: 2,
} as const

export type MotionSpeedName = keyof typeof MOTION_SPEEDS

/** A named step, or any multiplier. */
export type MotionSpeed = MotionSpeedName | number

export const MOTION_SPEED_NAMES: readonly MotionSpeedName[] = [
  'slow',
  'relaxed',
  'default',
  'brisk',
  'fast',
]

/** Multipliers outside this range make motion unreadable or imperceptible. */
export const MIN_MOTION_SPEED = 0.1
export const MAX_MOTION_SPEED = 5

/**
 * Resolve a named step or raw multiplier to a number, clamped to a usable
 * range. Anything unrecognised falls back to the designed tempo rather than
 * freezing or blurring the animation.
 */
export function resolveMotionSpeed(speed?: MotionSpeed): number {
  if (speed === undefined) return MOTION_SPEEDS.default
  const value = typeof speed === 'number' ? speed : MOTION_SPEEDS[speed]
  if (value === undefined || Number.isNaN(value) || value <= 0) return MOTION_SPEEDS.default
  return Math.min(MAX_MOTION_SPEED, Math.max(MIN_MOTION_SPEED, value))
}

/** Named choreography. Each pattern maps to one keyframe set in `motionStyles`. */
export type MotionPattern =
  /** Forward step: content rises into place. */
  | 'page-in'
  /** Back step: content settles down from above. */
  | 'page-back'
  /** Horizontal filmstrip, forward. */
  | 'side-next'
  /** Horizontal filmstrip, back. */
  | 'side-prev'
  /** A finished step slides sideways into a history rail. */
  | 'fold-in'
  /** Bottom sheet settling up. */
  | 'sheet-in'
  /** Scrim fade behind a sheet or dialog. */
  | 'scrim-in'
  /** Shared-element handoff: a tapped tile grows into the next header. */
  | 'handoff'
  /** The one bounce: a reward arriving. Once, never looped. */
  | 'celebrate'
  /** Progress grows from zero so completion is visibly earned. */
  | 'grow'
  /** Two attention pulses, at most. */
  | 'nudge'
  /** A glyph replaces another (scale + blur). */
  | 'icon-swap'
  /** A changed count rises and sharpens. */
  | 'num-pop'
  /** An SVG path draws itself. Apply to a path with `pathLength="1"`. */
  | 'check-draw'

export const MOTION_PATTERNS: readonly MotionPattern[] = [
  'page-in',
  'page-back',
  'side-next',
  'side-prev',
  'fold-in',
  'sheet-in',
  'scrim-in',
  'handoff',
  'celebrate',
  'grow',
  'nudge',
  'icon-swap',
  'num-pop',
  'check-draw',
]

/** Which way a page transition moves. */
export type MotionAxis = 'vertical' | 'horizontal'
export type MotionDirection = 'forward' | 'back'

/** Maximum children that receive a distinct stagger delay. */
export const STAGGER_CAP = 8

export interface MotionProps {
  pattern: MotionPattern
  /** Extra delay before the animation starts. */
  delayMs?: number
  /** Skip the animation entirely (content just appears). */
  disabled?: boolean
  /** Playback speed: a named step or a multiplier. Defaults to `'default'` (1). */
  speed?: MotionSpeed
}

export interface MotionAPI {
  /** Data attributes the stylesheet keys off. */
  dataAttributes: Record<string, string>
  /** Inline custom properties (delay, speed). */
  style: Record<string, string>
  /** The resolved speed multiplier. */
  speed: number
}

/**
 * Build the attributes that make an element animate with a named pattern.
 * Adapters spread these on the arriving element; re-keying the element
 * re-fires the animation.
 */
export function createMotion(props: MotionProps): MotionAPI {
  const { pattern, delayMs = 0, disabled = false } = props
  const speed = resolveMotionSpeed(props.speed)

  const dataAttributes: Record<string, string> = {
    'data-rfr-motion': 'reveal',
    'data-pattern': pattern,
  }
  if (disabled) dataAttributes['data-disabled'] = 'true'

  const style: Record<string, string> = {}
  if (delayMs > 0) style['--rfr-motion-delay'] = `${Math.round(delayMs)}ms`
  // Only emitted when it differs, so the common case adds no inline style.
  if (speed !== MOTION_SPEEDS.default) style['--rfr-motion-speed'] = String(speed)

  return { dataAttributes, style, speed }
}

/**
 * Direction tells you which way you went: forward rises (or slides in from
 * the right), back settles from above (or slides in from the left).
 */
export function resolveDirection(fromIndex: number, toIndex: number): MotionDirection {
  return toIndex < fromIndex ? 'back' : 'forward'
}

export function patternForDirection(direction: MotionDirection, axis: MotionAxis = 'vertical'): MotionPattern {
  if (axis === 'horizontal') return direction === 'back' ? 'side-prev' : 'side-next'
  return direction === 'back' ? 'page-back' : 'page-in'
}

/** Pattern for moving between two step indexes along an axis. */
export function resolvePageDirection(
  fromIndex: number,
  toIndex: number,
  axis: MotionAxis = 'vertical',
): MotionPattern {
  return patternForDirection(resolveDirection(fromIndex, toIndex), axis)
}

/**
 * Delay for the n-th child of a staggered group. Children past the cap all
 * share the cap delay — beyond eight a stagger reads as slow, not considerate.
 */
export function staggerDelay(
  index: number,
  stepMs: number = MOTION_DURATIONS.staggerStep,
  cap: number = STAGGER_CAP,
): number {
  const safeIndex = Math.max(0, Math.floor(index))
  const capped = Math.min(safeIndex, Math.max(0, cap - 1))
  return capped * stepMs
}
