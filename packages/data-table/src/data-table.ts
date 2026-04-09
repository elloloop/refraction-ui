import type { AccessibilityProps } from '@elloloop/shared'

export interface ColumnDef<T = Record<string, unknown>> {
  /** Unique column identifier */
  id: string
  /** Column header text */
  header: string
  /** Accessor function to get cell value from row */
  accessor: (row: T) => unknown
  /** Whether this column is sortable */
  sortable?: boolean
  /** Whether this column is filterable */
  filterable?: boolean
}

export type SortDirection = 'asc' | 'desc'

export interface DataTableProps<T = Record<string, unknown>> {
  /** Column definitions */
  columns: ColumnDef<T>[]
  /** Data rows */
  data: T[]
  /** Current sort column */
  sortBy?: string
  /** Current sort direction */
  sortDir?: SortDirection
  /** Callback when sort changes */
  onSort?: (columnId: string, direction: SortDirection) => void
  /** Active filters: columnId -> filter value */
  filters?: Record<string, string>
}

export interface DataTableState<T = Record<string, unknown>> {
  sortedData: T[]
  sortBy: string | null
  sortDir: SortDirection
  filters: Record<string, string>
}

export interface DataTableAPI<T = Record<string, unknown>> {
  /** Current table state */
  state: DataTableState<T>
  /** Toggle sort for a column */
  sort(columnId: string): void
  /** Set a filter value for a column */
  setFilter(columnId: string, value: string): void
  /** Get ARIA and role props for a header cell */
  getHeaderProps(col: ColumnDef<T>): Partial<AccessibilityProps> & Record<string, unknown>
  /** Get props for a data cell */
  getCellProps(col: ColumnDef<T>, row: T): Record<string, unknown>
  /** Get props for a data row */
  getRowProps(row: T, index: number): Record<string, unknown>
}

export function createDataTable<T = Record<string, unknown>>(
  props: DataTableProps<T>,
): DataTableAPI<T> {
  const {
    columns,
    data,
    sortBy: initialSortBy,
    sortDir: initialSortDir = 'asc',
    onSort,
    filters: initialFilters,
  } = props

  let sortBy: string | null = initialSortBy ?? null
  let sortDir: SortDirection = initialSortDir
  let filters: Record<string, string> = { ...(initialFilters ?? {}) }

  function getFilteredData(): T[] {
    let result = [...data]

    for (const [columnId, filterValue] of Object.entries(filters)) {
      if (!filterValue) continue
      const col = columns.find((c) => c.id === columnId)
      if (!col) continue
      const lowerFilter = filterValue.toLowerCase()
      result = result.filter((row) => {
        const cellValue = col.accessor(row)
        return String(cellValue ?? '').toLowerCase().includes(lowerFilter)
      })
    }

    return result
  }

  function getSortedData(): T[] {
    const filtered = getFilteredData()

    if (!sortBy) return filtered

    const col = columns.find((c) => c.id === sortBy)
    if (!col) return filtered

    return [...filtered].sort((a, b) => {
      const aVal = col.accessor(a)
      const bVal = col.accessor(b)
      const aStr = String(aVal ?? '')
      const bStr = String(bVal ?? '')

      const cmp = aStr.localeCompare(bStr, undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  function sort(columnId: string): void {
    const col = columns.find((c) => c.id === columnId)
    if (!col?.sortable) return

    if (sortBy === columnId) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy = columnId
      sortDir = 'asc'
    }

    onSort?.(sortBy, sortDir)
  }

  function setFilter(columnId: string, value: string): void {
    filters = { ...filters, [columnId]: value }
  }

  function getHeaderProps(
    col: ColumnDef<T>,
  ): Partial<AccessibilityProps> & Record<string, unknown> {
    const props: Partial<AccessibilityProps> & Record<string, unknown> = {
      role: 'columnheader',
    }

    if (col.sortable) {
      if (sortBy === col.id) {
        props['aria-sort'] = sortDir === 'asc' ? 'ascending' : 'descending'
      } else {
        props['aria-sort'] = 'none'
      }
    }

    return props
  }

  function getCellProps(
    col: ColumnDef<T>,
    _row: T,
  ): Record<string, unknown> {
    return {
      role: 'cell',
      'data-column': col.id,
    }
  }

  function getRowProps(_row: T, index: number): Record<string, unknown> {
    return {
      role: 'row',
      'data-row-index': index,
    }
  }

  return {
    get state(): DataTableState<T> {
      return {
        get sortedData() {
          return getSortedData()
        },
        get sortBy() {
          return sortBy
        },
        get sortDir() {
          return sortDir
        },
        get filters() {
          return { ...filters }
        },
      }
    },
    sort,
    setFilter,
    getHeaderProps,
    getCellProps,
    getRowProps,
  }
}
