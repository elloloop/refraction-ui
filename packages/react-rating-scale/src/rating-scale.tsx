import * as React from 'react'
import {
  createRatingScale,
  resolveRatingPoints,
  getNextRatingIndex,
  ratingScaleVariants,
  ratingScaleTrackClass,
  ratingScaleItemVariants,
  ratingScaleLabelClass,
  type RatingScaleSize,
  type RatingScalePoint,
} from '@refraction-ui/rating-scale'
import { cn } from '@refraction-ui/shared'

export type { RatingScaleSize, RatingScalePoint }

export interface RatingScaleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Controlled selected value. */
  value?: number
  /** Initial value for uncontrolled usage. */
  defaultValue?: number
  /** Called with the newly selected value. */
  onValueChange?: (value: number) => void
  /** Number of points (1..count). Ignored when `points` is provided. */
  count?: number
  /** Explicit points with accessible labels. */
  points?: RatingScalePoint[]
  /** Label shown before the scale (the low end). */
  minLabel?: React.ReactNode
  /** Label shown after the scale (the high end). */
  maxLabel?: React.ReactNode
  /** Visual size. */
  size?: RatingScaleSize
  /** Disables the whole scale. */
  disabled?: boolean
  /** Accessible name for the group. */
  'aria-label'?: string
}

/**
 * RatingScale — a single-select ordinal rating / Likert control.
 *
 * Renders `role="radiogroup"`; each point is a `role="radio"` button with
 * roving tabindex and arrow/Home/End keyboard navigation (clamped at the
 * ends — ordinal scales don't wrap). Supports controlled (`value`) and
 * uncontrolled (`defaultValue`) usage. Logic, point resolution, and styles
 * come from the headless `@refraction-ui/rating-scale` core.
 */
export const RatingScale = React.forwardRef<HTMLDivElement, RatingScaleProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      count = 5,
      points,
      minLabel,
      maxLabel,
      size = 'md',
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const resolved = React.useMemo(
      () => resolveRatingPoints(points, count),
      [points, count],
    )
    const isControlled = valueProp !== undefined
    const [internal, setInternal] = React.useState<number | undefined>(
      defaultValue,
    )
    const value = isControlled ? valueProp : internal

    const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([])

    const select = React.useCallback(
      (next: number) => {
        if (!isControlled) setInternal(next)
        onValueChange?.(next)
      },
      [isControlled, onValueChange],
    )

    const selectedIndex = resolved.findIndex((p) => p.value === value)
    // First point is tabbable when nothing is selected (roving tabindex).
    const tabbableIndex = selectedIndex === -1 ? 0 : selectedIndex

    const handleKeyDown = (
      event: React.KeyboardEvent<HTMLButtonElement>,
      index: number,
    ) => {
      const target = getNextRatingIndex(index, event.key, resolved.length)
      if (target !== index) {
        event.preventDefault()
        select(resolved[target].value)
        btnRefs.current[target]?.focus()
      }
    }

    const api = createRatingScale({ value, size })

    return (
      <div
        ref={ref}
        className={cn(ratingScaleVariants({ size }), className)}
        aria-disabled={disabled || undefined}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {minLabel != null && (
          <span className={ratingScaleLabelClass}>{minLabel}</span>
        )}
        <div className={ratingScaleTrackClass}>
          {resolved.map((point, index) => {
            const checked = point.value === value
            return (
              <button
                key={point.value}
                ref={(node) => {
                  btnRefs.current[index] = node
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={point.label ?? String(point.value)}
                tabIndex={index === tabbableIndex ? 0 : -1}
                disabled={disabled}
                data-state={checked ? 'checked' : 'unchecked'}
                className={ratingScaleItemVariants({
                  size,
                  state: checked ? 'checked' : 'unchecked',
                })}
                onClick={() => select(point.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {point.label ?? point.value}
              </button>
            )
          })}
        </div>
        {maxLabel != null && (
          <span className={ratingScaleLabelClass}>{maxLabel}</span>
        )}
      </div>
    )
  },
)

RatingScale.displayName = 'RatingScale'
