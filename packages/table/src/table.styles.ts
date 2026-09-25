import { cva } from '@refraction-ui/shared'

/** Scroll container: a wide table scrolls inside it instead of the page. */
export const tableContainerClass = 'relative w-full overflow-x-auto'

/** The `<table>`. `fixed` pins column widths to the header row. */
export const tableRootVariants = cva({
  base: 'w-full caption-bottom border-collapse text-sm',
  variants: {
    fixed: {
      true: 'table-fixed',
      false: '',
    },
  },
  defaultVariants: {
    fixed: 'false',
  },
})

/** Caption under the table. */
export const tableCaptionClass = 'mt-2 text-xs text-muted-foreground'

/** Body rows: a hairline between rows, none after the last. */
export const tableRowClass = 'border-b border-border-subtle last:border-b-0'

const align = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
}

/** Header cell: subtle surface, rule under it. */
export const tableHeadVariants = cva({
  base: 'border-b border-border-subtle bg-surface-subtle align-middle',
  variants: {
    align,
    tone: {
      default: 'text-xs font-medium text-muted-foreground',
      eyebrow: 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
    },
    density: {
      compact: 'h-8 px-2',
      default: 'h-9 px-3',
    },
  },
  defaultVariants: {
    align: 'start',
    tone: 'default',
    density: 'default',
  },
})

/** Data cell. */
export const tableCellVariants = cva({
  base: 'align-middle',
  variants: {
    align,
    density: {
      compact: 'px-2 py-1.5',
      default: 'px-3 py-2.5',
    },
    numeric: {
      true: 'tabular-nums whitespace-nowrap',
      false: '',
    },
  },
  defaultVariants: {
    align: 'start',
    density: 'default',
    numeric: 'false',
  },
})
