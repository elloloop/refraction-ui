import * as React from 'react'
import {
  createLiveDot,
  liveDotVariants,
  liveDotCoreVariants,
  liveDotHaloVariants,
  type LiveDotColor,
  type LiveDotSize,
} from '@refraction-ui/live-dot'
import { cn } from '@refraction-ui/shared'

export interface LiveDotProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color' | 'children'> {
  /** While `true` a halo swells and fades around the dot; `false` draws a plain dot. */
  live?: boolean
  /** Semantic colour token (never a raw CSS colour). */
  color?: LiveDotColor
  /** Named size (`xs`–`lg`) or a positive rem value. */
  size?: LiveDotSize
  /**
   * Accessible name for a dot that stands alone. Omit it when adjacent text
   * gives the meaning; the dot is then decorative (`aria-hidden`). An
   * `aria-label` is treated the same way.
   */
  label?: string
}

/**
 * LiveDot — a small status dot that breathes while something is live
 * (recording, checking, on a call).
 *
 * While `live`, a halo behind the dot swells and fades; under
 * `prefers-reduced-motion` it holds still as a soft ring. Decorative by
 * default; pass `label` when no adjacent text explains it. State, ARIA and
 * styles come from the headless `@refraction-ui/live-dot` core.
 */
export const LiveDot = React.forwardRef<HTMLSpanElement, LiveDotProps>(
  function LiveDot(
    {
      live,
      color,
      size,
      label,
      'aria-label': ariaLabel,
      className,
      style,
      ...props
    },
    ref,
  ) {
    const api = createLiveDot({ live, color, size, label: label ?? ariaLabel })

    return (
      <span
        ref={ref}
        className={cn(liveDotVariants({ size: api.size.variant }), className)}
        style={{ ...api.style, ...style }}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {api.live && (
          <span
            data-live-dot-halo=""
            className={liveDotHaloVariants({ color: api.color })}
          />
        )}
        <span
          data-live-dot-core=""
          className={liveDotCoreVariants({ color: api.color })}
        />
      </span>
    )
  },
)
