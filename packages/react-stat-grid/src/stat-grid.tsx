import * as React from 'react'
import {
  createStatGrid,
  statColumns,
  statColumnsKey,
  statGridVariants,
  statItemVariants,
  statValueVariants,
  statLabelVariants,
  statDescriptionClass,
  type StatTone,
  type StatGridVariant,
  type StatGridLayout,
  type StatGridColumns,
} from '@refraction-ui/stat-grid'
import { cn, type DataAttributes } from '@refraction-ui/shared'

export type { StatItem, StatTone, StatGridVariant, StatGridLayout, StatGridColumns } from '@refraction-ui/stat-grid'

export interface StatGridItem {
  /** The primary value displayed prominently. Allows rich content in React. */
  value: React.ReactNode
  /** The descriptive label. */
  label: React.ReactNode
  /** Stable key; defaults to the index. */
  id?: string
  /** Optional line explaining the figure (how it was computed, a delta). */
  description?: React.ReactNode
  /** Colour of the value. Defaults to `default`. */
  tone?: StatTone
  /** Extra attributes for this item's element (`data-*`, `aria-*`, `title`, className). */
  props?: React.HTMLAttributes<HTMLDivElement> & DataAttributes
}

export interface StatGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  /** The stat items to display in the grid. */
  items: StatGridItem[]
  /**
   * Maximum columns (reflows to fewer on narrow screens), or `auto` to fit as
   * many ~12rem items as the width allows. Defaults to
   * `statColumns(items.length)`: 1 → 1, 2 → 2, 3+ → 3.
   */
  columns?: StatGridColumns
  /** `plain` marketing callouts (default) or bordered `card` KPIs. */
  variant?: StatGridVariant
  /** `value-first` (default) or `label-first` (dashboard KPI order). */
  layout?: StatGridLayout
}

/**
 * StatGrid — a responsive grid of stats: marketing callouts (`plain`) or
 * dashboard KPI cards (`card`), value- or label-first, with an optional
 * description and a tone per item. Uses `role="list"` / `role="listitem"`.
 */
export const StatGrid = React.forwardRef<HTMLDivElement, StatGridProps>(
  function StatGrid(
    { items, columns, variant = 'plain', layout = 'value-first', className, ...props },
    ref,
  ) {
    const cols = statColumnsKey(columns ?? statColumns(items.length))
    const { ariaProps, dataAttributes } = createStatGrid()

    return (
      <div
        ref={ref}
        className={cn(statGridVariants({ columns: cols, variant }), className)}
        data-variant={variant}
        data-layout={layout}
        {...ariaProps}
        {...dataAttributes}
        {...props}
      >
        {items.map((item, index) => {
          const { className: itemClassName, ...itemProps } = item.props ?? {}
          const label = <span className={statLabelVariants({ layout })}>{item.label}</span>
          return (
            <div
              key={item.id ?? index}
              role="listitem"
              className={cn(statItemVariants({ variant }), itemClassName)}
              data-tone={item.tone ?? 'default'}
              {...itemProps}
            >
              {layout === 'label-first' && label}
              <span className={statValueVariants({ variant, tone: item.tone ?? 'default' })}>{item.value}</span>
              {layout === 'value-first' && label}
              {item.description != null && <span className={statDescriptionClass}>{item.description}</span>}
            </div>
          )
        })}
      </div>
    )
  },
)
