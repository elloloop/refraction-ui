import * as React from 'react'
import {
  patternForDirection,
  resolveDirection,
  pageTransitionClass,
  type MotionAxis,
  type MotionDirection,
  type MotionSpeed,
} from '@refraction-ui/motion'
import { cn } from '@refraction-ui/shared'
import { Reveal } from './reveal.js'

export type { MotionAxis, MotionDirection, MotionSpeed }

export interface PageTransitionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Current step index. Moving to a higher index plays the forward pattern,
   * a lower one the back pattern; each change re-keys the page so the
   * animation re-fires. Ignored when `direction` is given.
   */
  step?: number
  /** Explicit direction, for flows that are not index-based. */
  direction?: MotionDirection
  /** Vertical (parent wizards) or horizontal filmstrip (kid lessons). */
  axis?: MotionAxis
  /** Skip the animation. */
  disabled?: boolean
  /** Playback speed: a named step or a multiplier. Defaults to `'default'`. */
  speed?: MotionSpeed
  /** The page for the current step. */
  children?: React.ReactNode
}

/**
 * PageTransition — step and screen transitions where direction tells you
 * which way you went.
 *
 * Forward arrives from below (or the right), back from above (or the left).
 * The child is keyed by `step` so each change remounts it and the pattern
 * plays again — the "changing key" idiom, handled for you.
 */
export const PageTransition = React.forwardRef<HTMLDivElement, PageTransitionProps>(
  function PageTransition(
    { step = 0, direction, axis = 'vertical', disabled, speed, className, children, ...props },
    ref,
  ) {
    const previousStep = React.useRef(step)
    const resolvedDirection: MotionDirection =
      direction ?? resolveDirection(previousStep.current, step)

    React.useEffect(() => {
      previousStep.current = step
    }, [step])

    const pattern = patternForDirection(resolvedDirection, axis)

    return (
      <div
        ref={ref}
        className={cn(pageTransitionClass, className)}
        data-slot="page-transition"
        data-step={String(step)}
        data-direction={resolvedDirection}
        data-axis={axis}
        {...props}
      >
        <Reveal key={step} pattern={pattern} disabled={disabled} speed={speed}>
          {children}
        </Reveal>
      </div>
    )
  },
)
