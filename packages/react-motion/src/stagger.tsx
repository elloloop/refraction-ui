import * as React from 'react'
import {
  staggerDelay,
  staggerVariants,
  MOTION_DURATIONS,
  STAGGER_CAP,
  resolveMotionSpeed,
  MOTION_SPEEDS,
  type MotionPattern,
  type MotionSpeed,
} from '@refraction-ui/motion'
import { cn } from '@refraction-ui/shared'
import { MotionStyleSheet } from './motion-style-sheet.js'

export type StaggerLayout = 'stack' | 'grid' | 'inline' | 'none'
export type StaggerPattern = Extract<MotionPattern, 'page-in' | 'side-next' | 'handoff' | 'celebrate'>

export interface StaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Milliseconds between children. Defaults to 45. */
  stepMs?: number
  /** Children beyond this index share the last delay. Defaults to 8. */
  cap?: number
  /** Arrival pattern for each child. Defaults to `page-in`. */
  pattern?: StaggerPattern
  /** Optional layout for the group. */
  layout?: StaggerLayout
  /** Skip the animation. */
  disabled?: boolean
  /**
   * Playback speed for the whole group: a named step or a multiplier. Scales
   * the per-child delay as well as each child's animation.
   */
  speed?: MotionSpeed
}

/**
 * Stagger — children arrive one after another so the eye is led through a
 * list instead of hit with all of it. 45ms apart, capped at eight: past
 * that a stagger reads as slow, not considerate. Each direct child gets its
 * delay as an inline custom property; re-key the group to replay.
 */
export const Stagger = React.forwardRef<HTMLDivElement, StaggerProps>(function Stagger(
  {
    stepMs = MOTION_DURATIONS.staggerStep,
    cap = STAGGER_CAP,
    pattern = 'page-in',
    layout = 'none',
    disabled,
    speed,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  // Set once on the group; custom properties inherit, so every child animates
  // at the same tempo and the stagger step scales with it.
  const resolvedSpeed = resolveMotionSpeed(speed)

  const items = React.Children.map(children, (child, index) => {
    if (!React.isValidElement<{ style?: React.CSSProperties }>(child)) return child
    const style = {
      ...child.props.style,
      '--rfr-motion-delay': `${staggerDelay(index, stepMs, cap)}ms`,
    } as React.CSSProperties
    return React.cloneElement(child, { style })
  })

  return (
    <>
      <MotionStyleSheet />
      <div
        ref={ref}
        className={cn(staggerVariants({ layout }), className)}
        style={
          resolvedSpeed === MOTION_SPEEDS.default
            ? style
            : ({ ...style, '--rfr-motion-speed': String(resolvedSpeed) } as React.CSSProperties)
        }
        data-rfr-motion="stagger"
        data-pattern={pattern}
        data-disabled={disabled ? 'true' : undefined}
        {...props}
      >
        {items}
      </div>
    </>
  )
})
