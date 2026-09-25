import * as React from 'react'
import {
  createTable,
  tableContainerClass,
  tableRootVariants,
  tableCaptionClass,
  tableRowClass,
  tableHeadVariants,
  tableCellVariants,
  type TableAlign,
  type TableDensity,
  type TableHeadTone,
} from '@refraction-ui/table'
import { cn } from '@refraction-ui/shared'

export type { TableAlign, TableDensity, TableHeadTone }

interface TableContextValue {
  density: TableDensity
  headTone: TableHeadTone
}

const TableContext = React.createContext<TableContextValue>({ density: 'default', headTone: 'default' })

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Cell padding for every cell. Defaults to `default`. */
  density?: TableDensity
  /** Look of every header cell. Defaults to `default`. */
  headTone?: TableHeadTone
  /** Fixed layout: column widths come from the header row. */
  fixed?: boolean
  /** Class for the horizontal scroll container around the table. */
  containerClassName?: string
}

/**
 * Table — composable, semantic table primitives for cells that hold
 * components (badges, buttons, links). The parts map one-to-one to the HTML
 * table elements. For a data-driven table with sorting/filtering use DataTable.
 */
export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  { density = 'default', headTone = 'default', fixed = false, containerClassName, className, ...props },
  ref,
) {
  const ctx = React.useMemo(() => ({ density, headTone }), [density, headTone])
  const { dataAttributes } = createTable({ density, headTone })
  return (
    <TableContext.Provider value={ctx}>
      <div className={cn(tableContainerClass, containerClassName)} data-slot="table-container">
        <table
          ref={ref}
          className={cn(tableRootVariants({ fixed: fixed ? 'true' : 'false' }), className)}
          {...dataAttributes}
          {...props}
        />
      </div>
    </TableContext.Provider>
  )
})

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader(props, ref) {
    return <thead ref={ref} data-slot="table-header" {...props} />
  },
)

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody(props, ref) {
    return <tbody ref={ref} data-slot="table-body" {...props} />
  },
)

export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({ className, ...props }, ref) {
    return <tr ref={ref} className={cn(tableRowClass, className)} data-slot="table-row" {...props} />
  },
)

export interface TableHeadProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Horizontal alignment. Defaults to `start`. */
  align?: TableAlign
}

/** Header cell. `scope` defaults to `col`. */
export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { align, scope = 'col', className, ...props },
  ref,
) {
  const { density, headTone } = React.useContext(TableContext)
  return (
    <th
      ref={ref}
      scope={scope}
      className={cn(tableHeadVariants({ align, density, tone: headTone }), className)}
      data-slot="table-head"
      {...props}
    />
  )
})

export interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  /** Horizontal alignment. Defaults to `start`. */
  align?: TableAlign
  /** Tabular figures, no wrapping — for numbers. */
  numeric?: boolean
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align, numeric = false, className, ...props },
  ref,
) {
  const { density } = React.useContext(TableContext)
  return (
    <td
      ref={ref}
      className={cn(tableCellVariants({ align, density, numeric: numeric ? 'true' : 'false' }), className)}
      data-slot="table-cell"
      {...props}
    />
  )
})

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  function TableCaption({ className, ...props }, ref) {
    return <caption ref={ref} className={cn(tableCaptionClass, className)} data-slot="table-caption" {...props} />
  },
)
