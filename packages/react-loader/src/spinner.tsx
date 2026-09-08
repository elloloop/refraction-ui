import * as React from 'react'
import {
  createLoader,
  spinnerVariants,
  type LoaderVariant,
  type LoaderSize,
  type LoaderTone,
} from '@refraction-ui/loader'
import { cn } from '@refraction-ui/shared'
import { LoaderStyleSheet } from './loader-style-sheet.js'

export type { LoaderVariant, LoaderSize, LoaderTone }

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Spinner shape. */
  variant?: LoaderVariant
  /** Visual size. */
  size?: LoaderSize
  /** Colour role; `current` inherits the surrounding text colour. */
  tone?: LoaderTone
  /** Accessible name. Defaults to "Loading". */
  label?: string
  /**
   * Hide from assistive tech — for spinners inside a control that already
   * announces its busy state (e.g. a button with `aria-busy`).
   */
  decorative?: boolean
  /** Playback speed multiplier. `1` is the designed tempo. */
  speed?: number
}

/**
 * Spinner — an indeterminate activity indicator in five shapes.
 *
 * Renders a polite `role="status"` live region; geometry and motion come from
 * the shared loader stylesheet, colour from the tone's theme token. Respects
 * `prefers-reduced-motion` by collapsing to a slow opacity pulse.
 */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  function Spinner(
    {
      variant = 'ring',
      size = 'md',
      tone = 'primary',
      label,
      decorative = false,
      speed,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const api = createLoader({ variant, size, tone, label, decorative })
    const mergedStyle =
      speed === undefined
        ? style
        : ({ ...style, '--rfr-loader-speed': speed } as React.CSSProperties)

    const parts: React.ReactElement[] = []
    for (let i = 0; i < api.partCount; i++) {
      parts.push(<span key={i} data-part={String(i)} />)
    }

    return (
      <>
        <LoaderStyleSheet />
        <span
          ref={ref}
          className={cn(spinnerVariants({ tone }), className)}
          style={mergedStyle}
          {...api.ariaProps}
          {...api.dataAttributes}
          {...props}
        >
          {parts}
        </span>
      </>
    )
  },
)
