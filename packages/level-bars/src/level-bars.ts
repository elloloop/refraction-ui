import { getWaveformPeak, normalizeBarCount, normalizeIntensity } from '@refraction-ui/waveform'

/**
 * Semantic colour tokens the bars can be drawn in. These are token *names*
 * (mapped to `bg-<token>` classes in the styles), never raw CSS colours, so the
 * meter follows the active theme in light, dark and system modes.
 */
export const LEVEL_BARS_COLORS = [
  'primary',
  'foreground',
  'success',
  'destructive',
  'warning',
  'info',
  'pending',
  'neutral',
  'muted',
] as const

export type LevelBarsColor = (typeof LEVEL_BARS_COLORS)[number]

/** Levels a meter draws: plain numbers or a typed array straight from an analyser. */
export type LevelBarsInput = ReadonlyArray<number> | Float32Array

export const DEFAULT_LEVEL_BARS_COLOR: LevelBarsColor = 'primary'
/** Height of the meter box, in px. */
export const DEFAULT_LEVEL_BARS_HEIGHT = 24
/** Width of one bar, in px. */
export const DEFAULT_LEVEL_BARS_BAR_WIDTH = 3
/** Space between neighbouring bars, in px. */
export const DEFAULT_LEVEL_BARS_GAP = 2
/** Number of history entries a LiveLevelBars keeps. */
export const DEFAULT_LIVE_LEVEL_BARS_COUNT = 16
/** How often LiveLevelBars samples `level` into its history, in ms. */
export const DEFAULT_LIVE_LEVEL_BARS_INTERVAL_MS = 100
/**
 * Fastest allowed sampling cadence (about one display frame). Anything quicker
 * only burns renders: the eye cannot follow a history scrolling faster.
 */
export const MIN_LIVE_LEVEL_BARS_INTERVAL_MS = 16

/**
 * Height multiplier at the two ends of a tapered row. The middle bar keeps its
 * full height and the envelope eases down to this floor along a half sine, so
 * the row reads as a lens shape without the end bars vanishing.
 */
export const LEVEL_BARS_TAPER_FLOOR = 0.35

/** Accessible range of a meter. Percent, so screen readers read "42%". */
export const LEVEL_BARS_METER_MIN = 0
export const LEVEL_BARS_METER_MAX = 100

/** Geometry is rounded to this many decimals so SSR output is stable text. */
const GEOMETRY_DECIMALS = 3
const GEOMETRY_SCALE = 10 ** GEOMETRY_DECIMALS

/** One bar's box inside the meter, in px from the top-left corner. */
export interface LevelBarRect {
  x: number
  y: number
  width: number
  height: number
}

export interface LevelBarsDimensions {
  /** Height of the meter box, in px. */
  height?: number
  /** Width of one bar, in px. */
  barWidth?: number
  /** Space between bars, in px. */
  gap?: number
}

export interface NormalizedLevelBarsDimensions {
  height: number
  barWidth: number
  gap: number
}

export interface LevelBarsGeometryOptions extends LevelBarsDimensions {
  /** Ease the bars down towards both ends of the row. */
  taper?: boolean
}

export interface LevelBarsGeometry {
  /** Total width of the row, in px. */
  width: number
  /** Height of the meter box, in px. */
  height: number
  /** One rect per level, left to right. */
  rects: LevelBarRect[]
}

export interface LevelBarsAccessibilityOptions {
  /**
   * Accessible name (e.g. "Microphone level"). Omit it for a decorative meter
   * that sits beside text which already says what it shows.
   */
  label?: string
  /** The 0–1 level the meter reports. */
  value: number
}

/**
 * Clamp one level to 0–1. A missing reading (`NaN`, `Infinity`) counts as
 * silence: drawing it as a full bar would claim sound that is not there.
 */
export function clampLevelBarsValue(value: number): number {
  if (!Number.isFinite(value)) return 0
  return normalizeIntensity(value)
}

/** Clamp every level to 0–1, keeping the order and the count. */
export function clampLevelBarsValues(levels: LevelBarsInput | undefined): number[] {
  if (levels == null) return []
  return Array.from(levels, clampLevelBarsValue)
}

/**
 * Height multiplier for bar `index` of `count` when tapered: 1 in the middle,
 * {@link LEVEL_BARS_TAPER_FLOOR} at either end, following a half sine.
 */
export function getLevelBarsTaper(index: number, count: number): number {
  if (count <= 1) return 1
  const progress = index / (count - 1)
  return LEVEL_BARS_TAPER_FLOOR + (1 - LEVEL_BARS_TAPER_FLOOR) * Math.sin(progress * Math.PI)
}

/** Fill in defaults and reject sizes that cannot be drawn. */
export function normalizeLevelBarsDimensions(
  dimensions: LevelBarsDimensions = {},
): NormalizedLevelBarsDimensions {
  return {
    height: positiveOr(dimensions.height, DEFAULT_LEVEL_BARS_HEIGHT),
    barWidth: positiveOr(dimensions.barWidth, DEFAULT_LEVEL_BARS_BAR_WIDTH),
    gap: nonNegativeOr(dimensions.gap, DEFAULT_LEVEL_BARS_GAP),
  }
}

/** Total width of a row of `count` bars: the bars plus the gaps between them. */
export function getLevelBarsWidth(count: number, barWidth: number, gap: number): number {
  if (count <= 0) return 0
  return roundGeometry(count * barWidth + (count - 1) * gap)
}

/**
 * Lay out one bar per level. Bars are centred vertically, so a level of 1 fills
 * the box and 0 draws nothing. The same input always yields the same rects.
 */
export function getLevelBarsGeometry(
  levels: LevelBarsInput | undefined,
  options: LevelBarsGeometryOptions = {},
): LevelBarsGeometry {
  const { height, barWidth, gap } = normalizeLevelBarsDimensions(options)
  const clamped = clampLevelBarsValues(levels)
  const count = clamped.length

  const rects = clamped.map((level, index) => {
    const envelope = options.taper ? getLevelBarsTaper(index, count) : 1
    const barHeight = level * envelope * height
    return {
      x: roundGeometry(index * (barWidth + gap)),
      y: roundGeometry((height - barHeight) / 2),
      width: barWidth,
      height: roundGeometry(barHeight),
    }
  })

  return { width: getLevelBarsWidth(count, barWidth, gap), height, rects }
}

/**
 * The single level a static row reports as a meter: its loudest bar, which is
 * what a "too quiet / too loud" check looks at.
 */
export function getLevelBarsPeak(levels: LevelBarsInput | undefined): number {
  return getWaveformPeak(clampLevelBarsValues(levels))
}

/** Express a 0–1 level as a whole percent on the meter range. */
export function toLevelBarsPercent(value: number): number {
  const span = LEVEL_BARS_METER_MAX - LEVEL_BARS_METER_MIN
  return Math.round(LEVEL_BARS_METER_MIN + clampLevelBarsValue(value) * span)
}

/**
 * ARIA for the root. With a label it is a `role="meter"` reporting `value` as a
 * percent; without one it is decorative and hidden from assistive technology,
 * so nothing is ever carried by the bars' colour or shape alone.
 */
export function getLevelBarsAccessibility(
  options: LevelBarsAccessibilityOptions,
): Record<string, string | number | boolean> {
  const label = options.label?.trim()
  if (!label) return { 'aria-hidden': true }

  const percent = toLevelBarsPercent(options.value)
  return {
    role: 'meter',
    'aria-label': label,
    'aria-valuemin': LEVEL_BARS_METER_MIN,
    'aria-valuemax': LEVEL_BARS_METER_MAX,
    'aria-valuenow': percent,
    'aria-valuetext': `${percent}%`,
  }
}

/** Resolve a `bars` prop to a usable history length. */
export function normalizeLiveLevelBarsCount(bars: number | undefined): number {
  if (bars == null || !Number.isFinite(bars)) return DEFAULT_LIVE_LEVEL_BARS_COUNT
  return normalizeBarCount(bars)
}

/** Resolve an `interval` prop to a sampling cadence in ms. */
export function normalizeLiveLevelBarsInterval(interval: number | undefined): number {
  if (interval == null || !Number.isFinite(interval) || interval <= 0) {
    return DEFAULT_LIVE_LEVEL_BARS_INTERVAL_MS
  }
  return Math.max(MIN_LIVE_LEVEL_BARS_INTERVAL_MS, interval)
}

// ── Scrolling history ────────────────────────────────────────────────────────

/** A fixed-length history of levels, oldest first, newest last. */
export interface LevelHistoryState {
  bars: number
  levels: number[]
}

export type LevelHistoryAction =
  /** Append a reading; the oldest one scrolls off the left edge. */
  | { type: 'push'; level: number }
  /** Change the length, keeping the newest readings. */
  | { type: 'resize'; bars: number }
  /** Back to silence. */
  | { type: 'reset' }

/** A silent history of `bars` entries, optionally ending in a first reading. */
export function createLevelHistory(bars: number, initialLevel?: number): LevelHistoryState {
  const count = normalizeLiveLevelBarsCount(bars)
  const silent: LevelHistoryState = { bars: count, levels: new Array<number>(count).fill(0) }
  return initialLevel === undefined ? silent : pushLevelHistory(silent, initialLevel)
}

/** Append one clamped reading and drop the oldest, keeping `bars` entries. */
export function pushLevelHistory(state: LevelHistoryState, level: number): LevelHistoryState {
  const levels = [...state.levels, clampLevelBarsValue(level)].slice(-state.bars)
  return { bars: state.bars, levels: padToLength(levels, state.bars) }
}

/** Keep the newest `bars` readings; a longer history is padded with silence. */
export function resizeLevelHistory(state: LevelHistoryState, bars: number): LevelHistoryState {
  const count = normalizeLiveLevelBarsCount(bars)
  if (count === state.bars) return state
  return { bars: count, levels: padToLength(state.levels.slice(-count), count) }
}

/** Pure reducer over the scrolling history, for `useReducer` or any store. */
export function levelHistoryReducer(
  state: LevelHistoryState,
  action: LevelHistoryAction,
): LevelHistoryState {
  switch (action.type) {
    case 'push':
      return pushLevelHistory(state, action.level)
    case 'resize':
      return resizeLevelHistory(state, action.bars)
    case 'reset':
      return createLevelHistory(state.bars)
    default:
      return state
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Silence goes on the left (oldest) side so the newest reading stays at the right edge. */
function padToLength(levels: number[], length: number): number[] {
  const missing = length - levels.length
  if (missing <= 0) return levels
  return [...new Array<number>(missing).fill(0), ...levels]
}

function positiveOr(value: number | undefined, fallback: number): number {
  return value != null && Number.isFinite(value) && value > 0 ? value : fallback
}

function nonNegativeOr(value: number | undefined, fallback: number): number {
  return value != null && Number.isFinite(value) && value >= 0 ? value : fallback
}

function roundGeometry(value: number): number {
  return Math.round(value * GEOMETRY_SCALE) / GEOMETRY_SCALE
}
