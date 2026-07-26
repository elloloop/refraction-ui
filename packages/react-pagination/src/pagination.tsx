import * as React from 'react'
import { cn } from '@refraction-ui/shared'
import {
  createPagination,
  paginationVariants,
  paginationItemVariants,
  paginationEllipsisClass,
} from '@refraction-ui/pagination'

export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current page, 1-based (controlled). Pair with `onPageChange`. */
  page?: number
  /** Initial page for uncontrolled usage (default 1). */
  defaultPage?: number
  /** Total number of pages (default 1). */
  totalPages?: number
  /** Pages shown on each side of the current page (default 1). */
  siblingCount?: number
  /** Called with the target page when a control is activated. */
  onPageChange?: (page: number) => void
  /** Disables every control. */
  disabled?: boolean
}

/**
 * Pagination — page navigation with a windowed page range and ellipses.
 *
 * Renders `role="navigation"` with previous/next controls and numbered page
 * buttons (`aria-current="page"` on the current page). Range computation,
 * clamping, edge semantics, and ARIA come from the headless
 * `@refraction-ui/pagination` core. Pass `children` to render fully custom
 * controls instead of the generated ones.
 */
export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      className,
      page: controlledPage,
      defaultPage,
      totalPages = 1,
      siblingCount = 1,
      onPageChange,
      disabled = false,
      children,
      ...props
    },
    ref,
  ) => {
    const isControlled = controlledPage !== undefined
    const [internalPage, setInternalPage] = React.useState(defaultPage ?? 1)

    const api = createPagination({
      page: isControlled ? controlledPage : internalPage,
      totalPages,
      siblingCount,
    })

    const goTo = (target: number) => {
      if (disabled || target === api.page) return
      if (!isControlled) setInternalPage(target)
      onPageChange?.(target)
    }

    return (
      <div
        ref={ref}
        className={cn(paginationVariants(), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        {children ?? (
          <>
            <button
              type="button"
              {...api.getPreviousAria()}
              disabled={disabled || !api.canGoPrevious}
              className={paginationItemVariants()}
              onClick={() => goTo(api.previousPage)}
            >
              Previous
            </button>
            {api.items.map((item) =>
              item.type === 'ellipsis' ? (
                <span
                  key={`ellipsis-${item.id}`}
                  aria-hidden="true"
                  className={paginationEllipsisClass}
                >
                  …
                </span>
              ) : (
                <button
                  key={item.page}
                  type="button"
                  {...api.getPageAria(item.page)}
                  disabled={disabled}
                  data-state={item.page === api.page ? 'current' : 'default'}
                  className={paginationItemVariants({
                    state: item.page === api.page ? 'current' : 'default',
                  })}
                  onClick={() => goTo(item.page)}
                >
                  {item.page}
                </button>
              ),
            )}
            <button
              type="button"
              {...api.getNextAria()}
              disabled={disabled || !api.canGoNext}
              className={paginationItemVariants()}
              onClick={() => goTo(api.nextPage)}
            >
              Next
            </button>
          </>
        )}
      </div>
    )
  },
)
Pagination.displayName = 'Pagination'
