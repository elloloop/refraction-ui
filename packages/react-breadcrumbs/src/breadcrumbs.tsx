import * as React from 'react'
import {
  createBreadcrumbs,
  breadcrumbsVariants,
  breadcrumbItemVariants,
  breadcrumbSeparatorStyles,
  type BreadcrumbItem,
} from '@refraction-ui/breadcrumbs'
import { cn } from '@refraction-ui/shared'

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  /** Current pathname to auto-generate breadcrumbs from */
  pathname?: string
  /** Manual breadcrumb items (overrides pathname) */
  items?: BreadcrumbItem[]
  /** Custom label map for pathname segments */
  labels?: Record<string, string>
  /** Separator character. Default: '/' */
  separator?: string
  /** Max items before truncation */
  maxItems?: number
}

/**
 * Breadcrumbs component — renders a breadcrumb navigation trail.
 *
 * Uses the headless @refraction-ui/breadcrumbs core for state and ARIA attributes.
 */
export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  (
    {
      pathname,
      items,
      labels,
      separator,
      maxItems,
      className,
      ...props
    },
    ref,
  ) => {
    const api = createBreadcrumbs({ pathname, items, labels, separator, maxItems })
    const classes = cn(breadcrumbsVariants(), className)

    return (
      <nav ref={ref} className={classes} {...api.ariaProps} {...props}>
        <ol className="flex items-center gap-1.5">
          {api.items.map((item, index) => {
            const isLast = api.isLast(index)
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span className={breadcrumbSeparatorStyles} aria-hidden="true">
                    {api.separator}
                  </span>
                )}
                {item.href && !isLast ? (
                  <a
                    href={item.href}
                    className={breadcrumbItemVariants({ active: 'false' })}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    className={breadcrumbItemVariants({
                      active: isLast ? 'true' : 'false',
                    })}
                    {...api.itemAriaProps(index)}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  },
)

Breadcrumbs.displayName = 'Breadcrumbs'
