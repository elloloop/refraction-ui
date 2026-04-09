import * as React from 'react'
import {
  createAnimatedText,
  createTypewriter,
  animatedTextVariants,
  typewriterVariants,
  type AnimatedTextProps as CoreAnimatedTextProps,
  type TypewriterProps as CoreTypewriterProps,
} from '@elloloop/animated-text'
import { cn } from '@elloloop/shared'

/* ------------------------------------------------------------------ */
/*  AnimatedText — word carousel                                       */
/* ------------------------------------------------------------------ */

export interface AnimatedTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    CoreAnimatedTextProps {}

export const AnimatedText = React.forwardRef<HTMLSpanElement, AnimatedTextProps>(
  ({ words, interval = 2500, transitionDuration = 1000, className, ...props }, ref) => {
    const apiRef = React.useRef(
      createAnimatedText({ words, interval, transitionDuration }),
    )
    const api = apiRef.current

    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isExiting, setIsExiting] = React.useState(false)

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof globalThis !== 'undefined' &&
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches

    React.useEffect(() => {
      if (words.length <= 1) return

      const tick = setInterval(() => {
        if (prefersReducedMotion) {
          // Skip animation, just switch
          api.state.currentIndex = api.getNextIndex()
          setCurrentIndex(api.state.currentIndex)
        } else {
          setIsExiting(true)
          setTimeout(() => {
            api.state.currentIndex = api.getNextIndex()
            setCurrentIndex(api.state.currentIndex)
            setIsExiting(false)
          }, transitionDuration / 2)
        }
      }, interval)

      return () => clearInterval(tick)
    }, [words.length, interval, transitionDuration, prefersReducedMotion])

    // Keep api in sync
    api.state.currentIndex = currentIndex

    const state = isExiting ? 'exiting' : 'entering'

    return (
      <span
        ref={ref}
        className={cn(
          animatedTextVariants({ state: prefersReducedMotion ? 'idle' : state }),
          className,
        )}
        aria-live="polite"
        aria-atomic="true"
        {...props}
      >
        {api.getCurrentWord()}
      </span>
    )
  },
)

AnimatedText.displayName = 'AnimatedText'

/* ------------------------------------------------------------------ */
/*  TypewriterText — char-by-char reveal                               */
/* ------------------------------------------------------------------ */

export interface TypewriterTextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'>,
    CoreTypewriterProps {}

export const TypewriterText = React.forwardRef<HTMLSpanElement, TypewriterTextProps>(
  ({ text, speed = 50, startDelay = 0, className, ...props }, ref) => {
    const apiRef = React.useRef(createTypewriter({ text, speed, startDelay }))
    const api = apiRef.current

    const [currentIndex, setCurrentIndex] = React.useState(0)

    const prefersReducedMotion =
      typeof globalThis !== 'undefined' &&
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches

    React.useEffect(() => {
      if (prefersReducedMotion) {
        api.state.currentIndex = text.length
        setCurrentIndex(text.length)
        return
      }

      const startTimeout = setTimeout(() => {
        const tick = () => {
          if (api.state.currentIndex < text.length) {
            api.state.currentIndex += 1
            setCurrentIndex(api.state.currentIndex)
            setTimeout(tick, speed)
          }
        }
        tick()
      }, startDelay)

      return () => clearTimeout(startTimeout)
    }, [text, speed, startDelay, prefersReducedMotion])

    api.state.currentIndex = currentIndex

    return (
      <span
        ref={ref}
        className={cn(
          typewriterVariants({ cursor: api.isComplete() ? 'hidden' : 'blinking' }),
          className,
        )}
        aria-label={text}
        {...props}
      >
        {api.getVisibleText()}
      </span>
    )
  },
)

TypewriterText.displayName = 'TypewriterText'
