import * as React from 'react'
import { createMotion, type MotionPattern, type MotionSpeed } from '@refraction-ui/motion'
import { MotionStyleSheet } from './motion-style-sheet.js'

export type { MotionPattern, MotionSpeed }

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Named choreography to arrive with. */
  pattern: MotionPattern
  /** Extra delay before the animation starts. */
  delayMs?: number
  /** Skip the animation (content just appears). */
  disabled?: boolean
  /**
   * Playback speed: `'slow' | 'relaxed' | 'default' | 'brisk' | 'fast'`, or a
   * multiplier. Defaults to `'default'`; 2 plays twice as fast.
   */
  speed?: MotionSpeed
  /** Element to render. Defaults to `div`. */
  as?: keyof React.JSX.IntrinsicElements
}

/**
 * Reveal — animate an arriving element with one named pattern.
 *
 * The animation runs once on mount and holds its final frame. To play it
 * again (a new step, a new badge), change the element's React `key` so it
 * remounts — the same idiom the design system's `.tl-*` classes rely on.
 */
export const Reveal = React.forwardRef<HTMLElement, RevealProps>(function Reveal(
  { pattern, delayMs, disabled, speed, as = 'div', style, ...props },
  ref,
) {
  const api = createMotion({ pattern, delayMs, disabled, speed })
  const mergedStyle = { ...style, ...api.style } as React.CSSProperties

  return (
    <>
      <MotionStyleSheet />
      {React.createElement(as, {
        ref,
        style: mergedStyle,
        ...api.dataAttributes,
        ...props,
      })}
    </>
  )
})
