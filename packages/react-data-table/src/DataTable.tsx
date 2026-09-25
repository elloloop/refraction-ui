import * as React from 'react'
import {
  createDataTable,
  tableVariants,
  headerVariants,
  cellVariants,
  rowVariants,
  resolveColumnAlign,
  getColumnValue,
  resolveRowKey,
  dataTableAlignClass,
  dataTableNumericClass,
  dataTableSortButtonClass,
  dataTableActionRowClass,
  type ColumnDef,
  type SortDirection,
} from '@refraction-ui/data-table'
import { cn, type DataAttributes } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Column definition (React): header and cell may be any ReactNode
// ---------------------------------------------------------------------------

export interface DataTableColumn<T = Record<string, unknown>>
  extends Omit<ColumnDef<T>, 'header' | 'cell'> {
  /** Header content. A string is also used for the filter input's label. */
  header: React.ReactNode
  /** Render the cell. Defaults to `String(accessor(row))`. */
  cell?: (row: T, index: number) => React.ReactNode
}

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------

export interface DataTableProps<T = Record<string, unknown>>
  extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'children'> {
  columns: DataTableColumn<T>[]
  data: T[]
  sortBy?: string
  sortDir?: SortDirection
  onSort?: (columnId: string, direction: SortDirection) => void
  filters?: Record<string, string>
  emptyMessage?: React.ReactNode
  /** Stable key per row. Defaults to the row index — pass one when rows can reorder. */
  getRowKey?: (row: T, index: number) => string | number
  /** Extra attributes for a row (`data-*`, `aria-*`, className, handlers). */
  getRowProps?: (row: T, index: number) => React.HTMLAttributes<HTMLTableRowElement> & DataAttributes
  /**
   * Row action. Makes each row focusable (Tab) and activatable with click,
   * Enter or Space. Keep a real link/button in the row too when the action
   * needs an accessible name beyond the row's text.
   */
  onRowClick?: (row: T, index: number) => void
  /** Table caption (rendered as `<caption>`). */
  caption?: React.ReactNode
  /** Class for the horizontal scroll wrapper. */
  wrapperClassName?: string
}

const ACTIVATION_KEYS = new Set(['Enter', ' '])

function filterLabel(header: React.ReactNode, id: string): string {
  return typeof header === 'string' || typeof header === 'number' ? String(header) : id
}

export function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  sortBy: controlledSortBy,
  sortDir: controlledSortDir = 'asc',
  onSort,
  filters: controlledFilters,
  className,
  emptyMessage = 'No data available',
  getRowKey,
  getRowProps,
  onRowClick,
  caption,
  wrapperClassName,
  ...tableProps
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = React.useState<string | null>(controlledSortBy ?? null)
  const [sortDir, setSortDir] = React.useState<SortDirection>(controlledSortDir)
  const [filters, setFilters] = React.useState<Record<string, string>>(controlledFilters ?? {})

  const api = React.useMemo(
    () =>
      createDataTable<T>({
        // The core only reads id/accessor/sortable/filterable; header and cell
        // are rendered here.
        columns: columns as unknown as ColumnDef<T>[],
        data,
        sortBy: sortBy ?? undefined,
        sortDir,
        onSort,
        filters,
      }),
    [columns, data, sortBy, sortDir, onSort, filters],
  )

  const handleSort = (columnId: string) => {
    const col = columns.find((c) => c.id === columnId)
    if (!col?.sortable) return
    const newDir: SortDirection = sortBy === columnId && sortDir === 'asc' ? 'desc' : 'asc'
    setSortBy(columnId)
    setSortDir(newDir)
    onSort?.(columnId, newDir)
  }

  const handleFilter = (columnId: string, value: string) => {
    setFilters((prev) => ({ ...prev, [columnId]: value }))
  }

  const rows = api.state.sortedData
  const hasFilterable = columns.some((c) => c.filterable)

  const rowElementProps = (
    row: T,
    index: number,
  ): React.HTMLAttributes<HTMLTableRowElement> & DataAttributes => {
    const extra = getRowProps?.(row, index) ?? {}
    if (!onRowClick) return extra
    return {
      tabIndex: 0,
      ...extra,
      className: cn(dataTableActionRowClass, extra.className),
      onClick: (e) => {
        extra.onClick?.(e)
        if (!e.defaultPrevented) onRowClick(row, index)
      },
      onKeyDown: (e) => {
        extra.onKeyDown?.(e)
        // Only when the row itself is focused — not a control inside it.
        if (e.defaultPrevented || e.target !== e.currentTarget || !ACTIVATION_KEYS.has(e.key)) return
        e.preventDefault()
        onRowClick(row, index)
      },
    }
  }

  return (
    <div className={cn('relative w-full overflow-auto', wrapperClassName)}>
      <table className={cn(tableVariants(), className)} role="table" {...tableProps}>
        {caption != null && <caption className="mt-2 caption-bottom text-xs text-muted-foreground">{caption}</caption>}
        <thead>
          <tr role="row">
            {columns.map((col) => {
              const headerProps = api.getHeaderProps(col as unknown as ColumnDef<T>)
              const align = resolveColumnAlign(col)
              const indicator =
                col.sortable && sortBy === col.id ? (
                  <span aria-hidden="true">{sortDir === 'asc' ? '↑' : '↓'}</span>
                ) : null
              return (
                <th
                  key={col.id}
                  {...headerProps}
                  className={cn(
                    headerVariants({ sortable: col.sortable ? 'true' : 'false' }),
                    dataTableAlignClass[align],
                    col.headerClassName,
                  )}
                >
                  {col.sortable ? (
                    <button type="button" className={dataTableSortButtonClass} onClick={() => handleSort(col.id)}>
                      {col.header}
                      {indicator}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              )
            })}
          </tr>
          {hasFilterable && (
            <tr role="row" data-filter-row="true">
              {columns.map((col) => (
                <th key={`filter-${col.id}`}>
                  {col.filterable ? (
                    <input
                      type="text"
                      aria-label={`Filter ${filterLabel(col.header, col.id)}`}
                      value={filters[col.id] ?? ''}
                      onChange={(e) => handleFilter(col.id, e.target.value)}
                      placeholder="Filter..."
                    />
                  ) : null}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr role="row">
              <td colSpan={columns.length} className="text-center p-4 text-muted-foreground" role="cell">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => {
              const rowProps = rowElementProps(row, rowIndex)
              return (
              <tr
                key={resolveRowKey(row, rowIndex, getRowKey)}
                {...api.getRowProps(row, rowIndex)}
                {...rowProps}
                className={cn(rowVariants(), rowProps.className)}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    {...api.getCellProps(col as unknown as ColumnDef<T>, row)}
                    className={cn(
                      cellVariants(),
                      dataTableAlignClass[resolveColumnAlign(col)],
                      col.numeric && dataTableNumericClass,
                      col.className,
                    )}
                  >
                    {col.cell ? col.cell(row, rowIndex) : String(getColumnValue(col, row) ?? '')}
                  </td>
                ))}
              </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
