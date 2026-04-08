import * as React from 'react'
import {
  createDataTable,
  tableVariants,
  headerVariants,
  cellVariants,
  rowVariants,
  type ColumnDef,
  type SortDirection,
  type DataTableProps as CoreProps,
} from '@refraction-ui/data-table'
import { cn } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// DataTable
// ---------------------------------------------------------------------------

export interface DataTableProps<T = Record<string, unknown>> {
  columns: ColumnDef<T>[]
  data: T[]
  sortBy?: string
  sortDir?: SortDirection
  onSort?: (columnId: string, direction: SortDirection) => void
  filters?: Record<string, string>
  className?: string
  emptyMessage?: string
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
}: DataTableProps<T>) {
  const [sortBy, setSortBy] = React.useState<string | null>(controlledSortBy ?? null)
  const [sortDir, setSortDir] = React.useState<SortDirection>(controlledSortDir)
  const [filters, setFilters] = React.useState<Record<string, string>>(controlledFilters ?? {})

  const api = React.useMemo(
    () =>
      createDataTable<T>({
        columns,
        data,
        sortBy: sortBy ?? undefined,
        sortDir,
        onSort,
        filters,
      }),
    [columns, data, sortBy, sortDir, onSort, filters],
  )

  const handleSort = React.useCallback(
    (columnId: string) => {
      const col = columns.find((c) => c.id === columnId)
      if (!col?.sortable) return

      let newDir: SortDirection = 'asc'
      if (sortBy === columnId) {
        newDir = sortDir === 'asc' ? 'desc' : 'asc'
      }

      setSortBy(columnId)
      setSortDir(newDir)
      onSort?.(columnId, newDir)
    },
    [columns, sortBy, sortDir, onSort],
  )

  const handleFilter = React.useCallback(
    (columnId: string, value: string) => {
      setFilters((prev) => ({ ...prev, [columnId]: value }))
    },
    [],
  )

  const sortedData = api.state.sortedData
  const hasFilterable = columns.some((c) => c.filterable)

  return React.createElement(
    'table',
    {
      className: cn(tableVariants(), className),
      role: 'table',
    },
    // thead
    React.createElement(
      'thead',
      null,
      // Header row
      React.createElement(
        'tr',
        { role: 'row' },
        ...columns.map((col) => {
          const headerProps = api.getHeaderProps(col)
          return React.createElement(
            'th',
            {
              key: col.id,
              ...headerProps,
              className: headerVariants({ sortable: col.sortable ? 'true' : 'false' }),
              onClick: col.sortable ? () => handleSort(col.id) : undefined,
            },
            col.header,
            col.sortable && sortBy === col.id
              ? React.createElement('span', { 'aria-hidden': true }, sortDir === 'asc' ? ' \u2191' : ' \u2193')
              : null,
          )
        }),
      ),
      // Filter row
      hasFilterable
        ? React.createElement(
            'tr',
            { role: 'row', 'data-filter-row': 'true' },
            ...columns.map((col) =>
              React.createElement(
                'th',
                { key: `filter-${col.id}` },
                col.filterable
                  ? React.createElement('input', {
                      type: 'text',
                      'aria-label': `Filter ${col.header}`,
                      value: filters[col.id] ?? '',
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                        handleFilter(col.id, e.target.value),
                      placeholder: `Filter...`,
                    })
                  : null,
              ),
            ),
          )
        : null,
    ),
    // tbody
    React.createElement(
      'tbody',
      null,
      sortedData.length === 0
        ? React.createElement(
            'tr',
            { role: 'row' },
            React.createElement(
              'td',
              {
                colSpan: columns.length,
                className: 'text-center p-4 text-muted-foreground',
                role: 'cell',
              },
              emptyMessage,
            ),
          )
        : sortedData.map((row, rowIndex) =>
            React.createElement(
              'tr',
              {
                key: rowIndex,
                ...api.getRowProps(row, rowIndex),
                className: rowVariants(),
              },
              ...columns.map((col) =>
                React.createElement(
                  'td',
                  {
                    key: col.id,
                    ...api.getCellProps(col, row),
                    className: cellVariants(),
                  },
                  String(col.accessor(row) ?? ''),
                ),
              ),
            ),
          ),
    ),
  )
}

DataTable.displayName = 'DataTable'
