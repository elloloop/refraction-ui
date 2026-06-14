import * as React from 'react'
import {
  clampPercent,
  createMasteryBar,
  masteryBarVariants,
  masteryBarFillVariants,
  masteryBarLabelClass,
  masteryBarLeadingLabelClass,
  masteryBarHeaderClass,
  type MasteryBarSize,
} from '@refraction-ui/mastery-bar'
import { cn } from '@refraction-ui/shared'

export type { MasteryBarSize }

export interface MasteryBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content' | 'results'> {
  /** Progress value (0–100). Values outside this range are clamped. */
  value: number
  /** Label shown on the right side of the header row. */
  label?: string
  /** Label shown on the left side of the header row. */
  leadingLabel?: string
  /** Visual size of the track. */
  size?: MasteryBarSize
  /** Renders the fill at reduced opacity to indicate a muted/secondary state. */
  muted?: boolean
}

/**
 * MasteryBar — a labelled linear progress bar for skill/concept mastery.
 *
 * Renders `role="progressbar"` with aria-valuenow/min/max. Optionally renders
 * a header row with a leading label (left) and a trailing label (right). Logic
 * and styles come from the headless `@refraction-ui/mastery-bar` core.
 */
export const MasteryBar = React.forwardRef<HTMLDivElement, MasteryBarProps>(
  (
    {
      value,
      label,
      leadingLabel,
      size = 'md',
      muted = false,
      className,
      ...props
    },
    ref,
  ) => {
    const clamped = clampPercent(value)
    const { ariaProps, dataAttributes } = createMasteryBar({ value })
    const hasHeader = leadingLabel != null || label != null

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {hasHeader && (
          <div className={masteryBarHeaderClass}>
            {leadingLabel != null && (
              <span className={masteryBarLeadingLabelClass}>{leadingLabel}</span>
            )}
            {label != null && (
              <span className={masteryBarLabelClass}>{label}</span>
            )}
          </div>
        )}
        <div
          className={masteryBarVariants({ size })}
          {...ariaProps}
          {...dataAttributes}
        >
          <div
            className={masteryBarFillVariants({ muted: muted ? 'true' : 'false' })}
            style={{ width: `${clamped}%` }}
          />
        </div>
      </div>
    )
  },
)

MasteryBar.displayName = 'MasteryBar'
