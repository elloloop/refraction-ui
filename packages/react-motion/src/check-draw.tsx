import * as React from 'react'
import { createMotion, type MotionSpeed } from '@refraction-ui/motion'
import { MotionStyleSheet } from './motion-style-sheet.js'

export interface CheckDrawProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'children'> {
  /** Box size in px. Defaults to 24. */
  size?: number
  /** Stroke width. Defaults to 2.5. */
  strokeWidth?: number
  /** Extra delay before the stroke starts drawing. */
  delayMs?: number
  /** Show the finished check with no drawing. */
  disabled?: boolean
  /** Playback speed: a named step or a multiplier. Defaults to `'default'`. */
  speed?: MotionSpeed
  /** Accessible name. Omit for a decorative mark. */
  label?: string
}

/** Tick path in a 24×24 box. */
const CHECK_PATH = 'M5 12.5 L10 17.5 L19 7'

/**
 * CheckDraw — success is drawn, not popped in: the stroke writes itself.
 * Uses `pathLength="1"` so the dash animation is size-independent. Change
 * the `key` to draw it again.
 */
export const CheckDraw = React.forwardRef<SVGSVGElement, CheckDrawProps>(function CheckDraw(
  { size = 24, strokeWidth = 2.5, delayMs, disabled, speed, label, ...props },
  ref,
) {
  const api = createMotion({ pattern: 'check-draw', delayMs, disabled, speed })
  const accessible = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true }

  return (
    <>
      <MotionStyleSheet />
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        data-slot="check-draw"
        {...accessible}
        {...props}
      >
        <path
          d={CHECK_PATH}
          pathLength={1}
          style={api.style as React.CSSProperties}
          {...api.dataAttributes}
        />
      </svg>
    </>
  )
})
