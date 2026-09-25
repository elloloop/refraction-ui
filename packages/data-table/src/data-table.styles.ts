import { cva } from '@refraction-ui/shared'

export const tableVariants = cva({
  base: 'w-full caption-bottom text-sm border-collapse',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const headerVariants = cva({
  base: 'h-10 px-2 text-left align-middle font-medium text-muted-foreground border-b',
  variants: {
    sortable: {
      true: 'cursor-pointer select-none hover:text-foreground',
      false: '',
    },
  },
  defaultVariants: {
    sortable: 'false',
  },
})

export const cellVariants = cva({
  base: 'p-2 align-middle border-b',
  variants: {
    size: {
      sm: 'p-1',
      md: 'p-2',
      lg: 'p-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const rowVariants = cva({
  base: 'border-b transition-colors hover:bg-muted/50',
  variants: {
    selected: {
      true: 'bg-muted',
      false: '',
    },
  },
  defaultVariants: {
    selected: 'false',
  },
})

/** Logical text alignment per column alignment. */
export const dataTableAlignClass = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
} as const

/** Numeric cells: tabular figures, no wrapping. */
export const dataTableNumericClass = 'tabular-nums whitespace-nowrap'

/** Button inside a sortable header: the keyboard-reachable sort control. */
export const dataTableSortButtonClass =
  'inline-flex items-center gap-1 rounded-sm font-inherit text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** Rows with a row action: pointer + keyboard focus ring. */
export const dataTableActionRowClass =
  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
