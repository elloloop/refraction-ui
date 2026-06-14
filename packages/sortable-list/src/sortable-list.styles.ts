import { cva } from '@refraction-ui/shared'

/** The outer list container. */
export const sortableListVariants = cva({
  base: 'flex flex-col gap-1 w-full',
  variants: {
    disabled: {
      true: 'opacity-50 pointer-events-none',
      false: '',
    },
  },
  defaultVariants: {
    disabled: 'false',
  },
})

/**
 * A single row in the list. The `dragging` variant visually lifts the row
 * while it is being dragged.
 */
export const sortableListRowVariants = cva({
  base: [
    'flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2',
    'transition-opacity',
  ].join(' '),
  variants: {
    dragging: {
      true: 'opacity-50 ring-2 ring-ring',
      false: '',
    },
  },
  defaultVariants: {
    dragging: 'false',
  },
})

/** The drag-grip handle button/icon area. */
export const sortableListGripClass =
  'cursor-grab text-muted-foreground shrink-0 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded'

/** Wraps the caller-supplied row content (fills remaining space). */
export const sortableListContentClass = 'flex-1 min-w-0'
