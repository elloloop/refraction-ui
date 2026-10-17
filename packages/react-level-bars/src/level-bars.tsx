import * as React from 'react'
import {
  DEFAULT_LEVEL_BARS_COLOR,
  clampLevelBarsValue,
  createLevelHistory,
  getLevelBarsAccessibility,
  getLevelBarsGeometry,
  getLevelBarsPeak,
  levelBarsBarVariants,
  levelBarsVariants,
  levelHistoryReducer,
  normalizeLiveLevelBarsCount,
  normalizeLiveLevelBarsInterval,
  resizeLevelHistory,
  type LevelBarsColor,
  type LevelBarsInput,
} from '@refraction-ui/level-bars'
import { cn } from '@refraction-ui/shared'

/** Props shared by both meters. `color` is a token name, so it replaces the DOM `color`. */
interface LevelBarsBaseProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'children'> {
  /** Semantic colour token for the bars (not a CSS colour). Defaults to `primary`. */
  color?: LevelBarsColor
  /** Height of the meter, in px. Defaults to 24. */
  height?: number
  /** Width of one bar, in px. Defaults to 3. */
  barWidth?: number
  /** Space between bars, in px. Defaults to 2. */
  gap?: number
  /**
   * Accessible name, e.g. "Microphone level". With it the meter is a
   * `role="meter"` reporting the level as a percent; without it the meter is
   * decorative and hidden from assistive technology.
   */
  label?: string
}

export interface LevelBarsProps extends LevelBarsBaseProps {
  /** Levels to draw, one bar each, left to right. Clamped to 0–1. */
  levels: LevelBarsInput
  /** Ease the bars down towards both ends of the row. */
  taper?: boolean
}

export interface LiveLevelBarsProps extends LevelBarsBaseProps {
  /** The current 0–1 input level. Clamped; `NaN` counts as silence. */
  level: number
  /** How many readings the scrolling history keeps. Defaults to 16. */
  bars?: number
  /** How often `level` is sampled into the history, in ms. Defaults to 100. */
  interval?: number
}

interface LevelBarsRowProps extends LevelBarsBaseProps {
  levels: LevelBarsInput
  taper?: boolean
  value: number
  live: boolean
}

/** Draws the rects from the core geometry; the one renderer both meters share. */
const LevelBarsRow = React.forwardRef<HTMLDivElement, LevelBarsRowProps>(
  function LevelBarsRow(
    {
      levels,
      taper = false,
      value,
      live,
      color = DEFAULT_LEVEL_BARS_COLOR,
      height,
      barWidth,
      gap,
      label,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const geometry = getLevelBarsGeometry(levels, { height, barWidth, gap, taper })
    const ariaProps = getLevelBarsAccessibility({ label, value })
    const barClassName = levelBarsBarVariants({ color, animated: live ? 'true' : 'false' })

    return (
      <div
        ref={ref}
        className={cn(levelBarsVariants(), className)}
        style={{ width: `${geometry.width}px`, height: `${geometry.height}px`, ...style }}
        data-level-bars=""
        data-mode={ariaProps.role === 'meter' ? 'meter' : 'decorative'}
        data-live={live ? 'true' : 'false'}
        data-color={color}
        {...ariaProps}
        {...props}
      >
        {geometry.rects.map((rect, index) => (
          <span
            key={index}
            data-level-bar=""
            className={barClassName}
            style={{
              left: `${rect.x}px`,
              top: `${rect.y}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
            }}
          />
        ))}
      </div>
    )
  },
)

/**
 * LevelBars — draws the given 0–1 levels exactly, one bar each.
 *
 * Deterministic: the same `levels` always render the same boxes. As a meter
 * (`label` set) it reports its loudest bar. Layout, clamping, the taper
 * envelope and ARIA come from the headless `@refraction-ui/level-bars` core.
 */
export const LevelBars = React.forwardRef<HTMLDivElement, LevelBarsProps>(
  function LevelBars({ levels, ...props }, ref) {
    return (
      <LevelBarsRow
        ref={ref}
        levels={levels}
        value={getLevelBarsPeak(levels)}
        live={false}
        {...props}
      />
    )
  },
)

/**
 * LiveLevelBars — a scrolling history of a live input level.
 *
 * Every `interval` ms the current `level` is pushed on the right and the oldest
 * reading scrolls off the left, so a steady or silent input still moves the
 * history along (equal readings are not skipped). Bars ease between samples;
 * under `prefers-reduced-motion` the easing is removed and each bar snaps to
 * its new value, while the history keeps sampling so it stays truthful.
 */
export const LiveLevelBars = React.forwardRef<HTMLDivElement, LiveLevelBarsProps>(
  function LiveLevelBars({ level, bars, interval, ...props }, ref) {
    const count = normalizeLiveLevelBarsCount(bars)
    const intervalMs = normalizeLiveLevelBarsInterval(interval)
    const [history, dispatch] = React.useReducer(
      levelHistoryReducer,
      undefined,
      () => createLevelHistory(count, level),
    )

    // The sampler reads the latest level without restarting its timer on
    // every change, which would starve the history under a fast-moving input.
    const levelRef = React.useRef(level)
    React.useEffect(() => {
      levelRef.current = level
    }, [level])

    React.useEffect(() => {
      dispatch({ type: 'resize', bars: count })
    }, [count])

    React.useEffect(() => {
      const timer = setInterval(() => {
        dispatch({ type: 'push', level: levelRef.current })
      }, intervalMs)
      return () => clearInterval(timer)
    }, [intervalMs])

    // Render the new length straight away rather than one commit late.
    const visible = resizeLevelHistory(history, count)

    return (
      <LevelBarsRow
        ref={ref}
        levels={visible.levels}
        value={clampLevelBarsValue(level)}
        live
        {...props}
      />
    )
  },
)
