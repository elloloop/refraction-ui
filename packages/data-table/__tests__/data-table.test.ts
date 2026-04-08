import { describe, it, expect, vi } from 'vitest'
import {
  createDataTable,
  tableVariants,
  headerVariants,
  cellVariants,
  rowVariants,
  type ColumnDef,
} from '../src/index.js'

interface TestRow {
  name: string
  age: number
  city: string
}

const columns: ColumnDef<TestRow>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name, sortable: true, filterable: true },
  { id: 'age', header: 'Age', accessor: (r) => r.age, sortable: true },
  { id: 'city', header: 'City', accessor: (r) => r.city, filterable: true },
]

const data: TestRow[] = [
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' },
  { name: 'Charlie', age: 35, city: 'NYC' },
]

describe('createDataTable', () => {
  it('returns all data by default (no sort, no filter)', () => {
    const api = createDataTable({ columns, data })
    expect(api.state.sortedData).toHaveLength(3)
    expect(api.state.sortBy).toBeNull()
    expect(api.state.sortDir).toBe('asc')
  })

  it('returns empty filters by default', () => {
    const api = createDataTable({ columns, data })
    expect(api.state.filters).toEqual({})
  })
})

describe('sorting', () => {
  it('sorts ascending by name', () => {
    const api = createDataTable({ columns, data, sortBy: 'name', sortDir: 'asc' })
    const names = api.state.sortedData.map((r) => r.name)
    expect(names).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('sorts descending by name', () => {
    const api = createDataTable({ columns, data, sortBy: 'name', sortDir: 'desc' })
    const names = api.state.sortedData.map((r) => r.name)
    expect(names).toEqual(['Charlie', 'Bob', 'Alice'])
  })

  it('sorts numerically by age', () => {
    const api = createDataTable({ columns, data, sortBy: 'age', sortDir: 'asc' })
    const ages = api.state.sortedData.map((r) => r.age)
    expect(ages).toEqual([25, 30, 35])
  })

  it('toggles sort direction when sorting same column', () => {
    const onSort = vi.fn()
    const api = createDataTable({ columns, data, onSort })
    api.sort('name')
    expect(onSort).toHaveBeenCalledWith('name', 'asc')
    api.sort('name')
    expect(onSort).toHaveBeenCalledWith('name', 'desc')
  })

  it('resets to asc when sorting a new column', () => {
    const onSort = vi.fn()
    const api = createDataTable({ columns, data, onSort })
    api.sort('name')
    api.sort('name') // now desc
    api.sort('age')  // should reset to asc
    expect(onSort).toHaveBeenLastCalledWith('age', 'asc')
  })

  it('ignores sort on non-sortable column', () => {
    const onSort = vi.fn()
    const api = createDataTable({ columns, data, onSort })
    api.sort('city') // city is not sortable
    expect(onSort).not.toHaveBeenCalled()
  })
})

describe('filtering', () => {
  it('filters by column value', () => {
    const api = createDataTable({ columns, data })
    api.setFilter('city', 'NYC')
    const cities = api.state.sortedData.map((r) => r.city)
    expect(cities).toEqual(['NYC', 'NYC'])
  })

  it('filters case-insensitively', () => {
    const api = createDataTable({ columns, data })
    api.setFilter('name', 'alice')
    expect(api.state.sortedData).toHaveLength(1)
    expect(api.state.sortedData[0].name).toBe('Alice')
  })

  it('clears filter when empty string', () => {
    const api = createDataTable({ columns, data })
    api.setFilter('city', 'NYC')
    expect(api.state.sortedData).toHaveLength(2)
    api.setFilter('city', '')
    expect(api.state.sortedData).toHaveLength(3)
  })

  it('supports initial filters', () => {
    const api = createDataTable({ columns, data, filters: { name: 'Bob' } })
    expect(api.state.sortedData).toHaveLength(1)
    expect(api.state.sortedData[0].name).toBe('Bob')
  })

  it('combines filter and sort', () => {
    const api = createDataTable({ columns, data, sortBy: 'name', sortDir: 'desc' })
    api.setFilter('city', 'NYC')
    const names = api.state.sortedData.map((r) => r.name)
    expect(names).toEqual(['Charlie', 'Alice'])
  })
})

describe('aria-sort', () => {
  it('returns aria-sort ascending for sorted column', () => {
    const api = createDataTable({ columns, data, sortBy: 'name', sortDir: 'asc' })
    const props = api.getHeaderProps(columns[0])
    expect(props['aria-sort']).toBe('ascending')
  })

  it('returns aria-sort descending for sorted column', () => {
    const api = createDataTable({ columns, data, sortBy: 'name', sortDir: 'desc' })
    const props = api.getHeaderProps(columns[0])
    expect(props['aria-sort']).toBe('descending')
  })

  it('returns aria-sort none for unsorted sortable column', () => {
    const api = createDataTable({ columns, data })
    const props = api.getHeaderProps(columns[0]) // name is sortable
    expect(props['aria-sort']).toBe('none')
  })

  it('does not return aria-sort for non-sortable column', () => {
    const api = createDataTable({ columns, data })
    const props = api.getHeaderProps(columns[2]) // city is not sortable
    expect(props['aria-sort']).toBeUndefined()
  })

  it('provides columnheader role', () => {
    const api = createDataTable({ columns, data })
    const props = api.getHeaderProps(columns[0])
    expect(props.role).toBe('columnheader')
  })
})

describe('getCellProps and getRowProps', () => {
  it('getCellProps returns cell role and data-column', () => {
    const api = createDataTable({ columns, data })
    const props = api.getCellProps(columns[0], data[0])
    expect(props.role).toBe('cell')
    expect(props['data-column']).toBe('name')
  })

  it('getRowProps returns row role and data-row-index', () => {
    const api = createDataTable({ columns, data })
    const props = api.getRowProps(data[0], 0)
    expect(props.role).toBe('row')
    expect(props['data-row-index']).toBe(0)
  })
})

describe('data table styles', () => {
  it('exports table variants', () => {
    const classes = tableVariants()
    expect(classes).toContain('w-full')
    expect(classes).toContain('text-sm')
  })

  it('exports header variants with sortable', () => {
    const sortable = headerVariants({ sortable: 'true' })
    expect(sortable).toContain('cursor-pointer')
    const notSortable = headerVariants({ sortable: 'false' })
    expect(notSortable).not.toContain('cursor-pointer')
  })

  it('exports cell variants', () => {
    const classes = cellVariants()
    expect(classes).toContain('p-2')
  })

  it('exports row variants', () => {
    const classes = rowVariants()
    expect(classes).toContain('border-b')
  })
})

// ── Additional tests ──

describe('sorting - toggle ascending then descending', () => {
  it('first sort is ascending, second is descending', () => {
    const onSort = vi.fn()
    const api = createDataTable({ columns, data, onSort })
    api.sort('name')
    expect(onSort).toHaveBeenCalledWith('name', 'asc')
    expect(api.state.sortDir).toBe('asc')

    api.sort('name')
    expect(onSort).toHaveBeenCalledWith('name', 'desc')
    expect(api.state.sortDir).toBe('desc')
  })

  it('third sort on same column returns to ascending', () => {
    const onSort = vi.fn()
    const api = createDataTable({ columns, data, onSort })
    api.sort('name')  // asc
    api.sort('name')  // desc
    api.sort('name')  // asc
    expect(onSort).toHaveBeenLastCalledWith('name', 'asc')
  })

  it('sort direction reflects in sortedData order', () => {
    const api = createDataTable({ columns, data })
    api.sort('age')
    const asc = api.state.sortedData.map((r) => r.age)
    expect(asc).toEqual([25, 30, 35])

    api.sort('age')
    const desc = api.state.sortedData.map((r) => r.age)
    expect(desc).toEqual([35, 30, 25])
  })
})

describe('filtering - case insensitive', () => {
  it('filter value is case insensitive', () => {
    const api = createDataTable({ columns, data })
    api.setFilter('name', 'ALICE')
    expect(api.state.sortedData).toHaveLength(1)
    expect(api.state.sortedData[0].name).toBe('Alice')
  })

  it('filter matches partial strings case insensitively', () => {
    const api = createDataTable({ columns, data })
    api.setFilter('name', 'LI')
    // Matches "Alice" and "Charlie" (both contain "li")
    expect(api.state.sortedData).toHaveLength(2)
  })
})

describe('filtering - multiple column filters', () => {
  it('two filters combine with AND logic', () => {
    const api = createDataTable({ columns, data })
    api.setFilter('city', 'NYC')
    api.setFilter('name', 'Alice')
    expect(api.state.sortedData).toHaveLength(1)
    expect(api.state.sortedData[0]).toEqual({ name: 'Alice', age: 30, city: 'NYC' })
  })

  it('contradictory filters produce empty results', () => {
    const api = createDataTable({ columns, data })
    api.setFilter('city', 'NYC')
    api.setFilter('name', 'Bob') // Bob is in LA, not NYC
    expect(api.state.sortedData).toHaveLength(0)
  })

  it('clearing one filter while keeping another works', () => {
    const api = createDataTable({ columns, data })
    api.setFilter('city', 'NYC')
    api.setFilter('name', 'Alice')
    expect(api.state.sortedData).toHaveLength(1)
    api.setFilter('name', '')
    expect(api.state.sortedData).toHaveLength(2) // both NYC rows
  })
})

describe('empty data', () => {
  it('handles empty data array', () => {
    const api = createDataTable({ columns, data: [] })
    expect(api.state.sortedData).toHaveLength(0)
  })

  it('sorting empty data does not throw', () => {
    const api = createDataTable({ columns, data: [] })
    api.sort('name')
    expect(api.state.sortedData).toHaveLength(0)
  })

  it('filtering empty data does not throw', () => {
    const api = createDataTable({ columns, data: [] })
    api.setFilter('name', 'test')
    expect(api.state.sortedData).toHaveLength(0)
  })
})

describe('aria-sort values', () => {
  it('aria-sort is ascending when sorted asc', () => {
    const api = createDataTable({ columns, data, sortBy: 'name', sortDir: 'asc' })
    expect(api.getHeaderProps(columns[0])['aria-sort']).toBe('ascending')
  })

  it('aria-sort is descending when sorted desc', () => {
    const api = createDataTable({ columns, data, sortBy: 'name', sortDir: 'desc' })
    expect(api.getHeaderProps(columns[0])['aria-sort']).toBe('descending')
  })

  it('aria-sort is none for unsorted but sortable column', () => {
    const api = createDataTable({ columns, data, sortBy: 'name', sortDir: 'asc' })
    // age column is sortable but not the current sort column
    expect(api.getHeaderProps(columns[1])['aria-sort']).toBe('none')
  })

  it('aria-sort is undefined for non-sortable column', () => {
    const api = createDataTable({ columns, data })
    // city column is filterable but not sortable
    expect(api.getHeaderProps(columns[2])['aria-sort']).toBeUndefined()
  })

  it('aria-sort updates after toggling sort', () => {
    const api = createDataTable({ columns, data })
    api.sort('name')
    expect(api.getHeaderProps(columns[0])['aria-sort']).toBe('ascending')
    api.sort('name')
    expect(api.getHeaderProps(columns[0])['aria-sort']).toBe('descending')
  })
})

describe('getRowProps - additional', () => {
  it('row index corresponds to position in data', () => {
    const api = createDataTable({ columns, data })
    expect(api.getRowProps(data[0], 0)['data-row-index']).toBe(0)
    expect(api.getRowProps(data[1], 1)['data-row-index']).toBe(1)
    expect(api.getRowProps(data[2], 2)['data-row-index']).toBe(2)
  })
})

describe('getCellProps - additional', () => {
  it('data-column matches column id for each column', () => {
    const api = createDataTable({ columns, data })
    expect(api.getCellProps(columns[0], data[0])['data-column']).toBe('name')
    expect(api.getCellProps(columns[1], data[0])['data-column']).toBe('age')
    expect(api.getCellProps(columns[2], data[0])['data-column']).toBe('city')
  })
})

describe('state - filters tracking', () => {
  it('state.filters reflects current filter state', () => {
    const api = createDataTable({ columns, data })
    api.setFilter('name', 'Bob')
    expect(api.state.filters).toEqual({ name: 'Bob' })
    api.setFilter('city', 'LA')
    expect(api.state.filters).toEqual({ name: 'Bob', city: 'LA' })
  })

  it('state.sortBy reflects current sort column', () => {
    const api = createDataTable({ columns, data })
    expect(api.state.sortBy).toBeNull()
    api.sort('name')
    expect(api.state.sortBy).toBe('name')
  })
})
