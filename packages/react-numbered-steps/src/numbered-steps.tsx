import * as React from 'react'
import {
  createNumberedSteps,
  padOrdinal,
  stepColumns,
  numberedStepsVariants,
  numberedStepsItemClass,
  numberedStepsOrdinalClass,
  numberedStepsTitleClass,
  numberedStepsBodyClass,
  type NumberedStepItem,
} from '@refraction-ui/numbered-steps'
import { cn } from '@refraction-ui/shared'

export type { NumberedStepItem }

export interface NumberedStepsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color' | 'content'> {
  /** The step items to display (3–5 recommended). */
  items: NumberedStepItem[]
  /**
   * Override the number of grid columns. Defaults to clamping item count to
   * 2–5 via `stepColumns`.
   */
  columns?: number
}

/**
 * NumberedSteps — a static how-it-works step grid.
 *
 * Renders a CSS grid of step cards, each with a zero-padded ordinal badge
 * (01, 02…), a title, and body copy. Not a stateful stepper — use the `Steps`
 * component for that. Exposes `role="list"` semantics with each card as
 * `role="listitem"`.
 */
export const NumberedSteps = React.forwardRef<
  HTMLDivElement,
  NumberedStepsProps
>(({ items, columns, className, ...props }, ref) => {
  const cols = columns ?? stepColumns(items.length)
  const { ariaProps, dataAttributes } = createNumberedSteps()

  return (
    <div
      ref={ref}
      className={cn(numberedStepsVariants(), className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      {...ariaProps}
      {...dataAttributes}
      {...props}
    >
      {items.map((item, index) => (
        <div key={index} role="listitem" className={numberedStepsItemClass}>
          <span className={numberedStepsOrdinalClass}>
            {padOrdinal(index + 1)}
          </span>
          <p className={numberedStepsTitleClass}>{item.title}</p>
          <p className={numberedStepsBodyClass}>{item.body}</p>
        </div>
      ))}
    </div>
  )
})

NumberedSteps.displayName = 'NumberedSteps'
