import { cva } from '@refraction-ui/shared'

/** Row of pagination controls. */
export const paginationVariants = cva({
  base: 'flex items-center gap-1',
})

/**
 * A pagination button (prev / next / numbered page). The `state` variant
 * carries the current-page treatment so adapters never inline these classes.
 */
export const paginationItemVariants = cva({
  base: [
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-3',
    'text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  variants: {
    state: {
      current: 'border-primary bg-primary text-primary-foreground',
      default: 'border-border bg-background text-foreground hover:bg-muted',
    },
  },
  defaultVariants: {
    state: 'default',
  },
})

/** Ellipsis gap between page numbers (not interactive). */
export const paginationEllipsisClass =
  'inline-flex h-9 min-w-9 items-center justify-center text-sm text-muted-foreground'
