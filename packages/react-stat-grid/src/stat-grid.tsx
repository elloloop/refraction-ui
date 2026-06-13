import * as React from 'react'
import {
  createStatGrid,
  statColumns,
  statGridVariants,
  statItemClass,
  statValueClass,
  statLabelClass,
} from '@refraction-ui/stat-grid'
import { cn } from '@refraction-ui/shared'

export type { StatItem } from '@refraction-ui/stat-grid'

export interface StatGridItem {
  /** The primary value displayed prominently. Allows rich content in React. */
  value: React.ReactNode
  /** The descriptive label shown below the value. */
  label: React.ReactNode
}

export interface StatGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  /** The stat items to display in the grid. */
  items: StatGridItem[]
  /**
   * Number of columns. Defaults to `statColumns(items.length)`:
   * 1 item → 1, 2 items → 2, 3+ items → 3.
   */
  columns?: number
}

/**
 * StatGrid — a marketing-style grid of stat callouts.
 *
 * Each item shows a large bold value and a small muted label. The grid
 * automatically computes the column count from the number of items, or you can
 * override it with `columns`. Uses `role="list"` / `role="listitem"` for
 * accessible enumeration.
 */
export const StatGrid = React.forwardRef<HTMLDivElement, StatGridProps>(
  ({ items, columns, className, ...props }, ref) => {
    const cols = columns ?? statColumns(items.length)
    const { ariaProps, dataAttributes } = createStatGrid()

    return (
      <div
        ref={ref}
        className={cn(
          statGridVariants({ columns: String(cols) as '1' | '2' | '3' }),
          className,
        )}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        {...ariaProps}
        {...dataAttributes}
        {...props}
      >
        {items.map((item, index) => (
          <div key={index} role="listitem" className={statItemClass}>
            <span className={statValueClass}>{item.value}</span>
            <span className={statLabelClass}>{item.label}</span>
          </div>
        ))}
      </div>
    )
  },
)

StatGrid.displayName = 'StatGrid'
