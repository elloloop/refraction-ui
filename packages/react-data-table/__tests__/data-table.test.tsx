import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import { DataTable } from '../src/DataTable.js'
import type { ColumnDef } from '@refraction-ui/data-table'

beforeEach(() => {
  resetIdCounter()
})

interface TestRow {
  name: string
  age: number
}

const columns: ColumnDef<TestRow>[] = [
  { id: 'name', header: 'Name', accessor: (r) => r.name, sortable: true, filterable: true },
  { id: 'age', header: 'Age', accessor: (r) => r.age, sortable: true },
]

const data: TestRow[] = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
]

describe('DataTable (React SSR)', () => {
  it('renders a table element with role', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data }),
    )
    expect(html).toContain('<table')
    expect(html).toContain('role="table"')
  })

  it('renders column headers', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data }),
    )
    expect(html).toContain('Name')
    expect(html).toContain('Age')
    expect(html).toContain('role="columnheader"')
  })

  it('renders data rows', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data }),
    )
    expect(html).toContain('Alice')
    expect(html).toContain('30')
    expect(html).toContain('Bob')
    expect(html).toContain('25')
  })

  it('renders sorted data with aria-sort', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data, sortBy: 'name', sortDir: 'asc' }),
    )
    expect(html).toContain('aria-sort="ascending"')
  })

  it('renders descending sort indicator', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data, sortBy: 'name', sortDir: 'desc' }),
    )
    expect(html).toContain('aria-sort="descending"')
  })

  it('renders filter inputs for filterable columns', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data }),
    )
    expect(html).toContain('Filter Name')
    // Age is not filterable, so only name filter should exist
    expect(html).not.toContain('Filter Age')
  })

  it('renders empty state when no data', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data: [] }),
    )
    expect(html).toContain('No data available')
  })

  it('renders custom empty message', () => {
    const html = renderToString(
      React.createElement(DataTable, {
        columns,
        data: [],
        emptyMessage: 'Nothing here',
      }),
    )
    expect(html).toContain('Nothing here')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data, className: 'my-table' }),
    )
    expect(html).toContain('my-table')
  })

  it('renders cell role attributes', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data }),
    )
    expect(html).toContain('role="cell"')
    expect(html).toContain('data-column="name"')
    expect(html).toContain('data-column="age"')
  })

  it('renders row role attributes', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data }),
    )
    expect(html).toContain('role="row"')
    expect(html).toContain('data-row-index="0"')
    expect(html).toContain('data-row-index="1"')
  })

  it('applies tableVariants styles', () => {
    const html = renderToString(
      React.createElement(DataTable, { columns, data }),
    )
    expect(html).toContain('w-full')
    expect(html).toContain('text-sm')
  })

  it('renders with pre-applied filters', () => {
    const html = renderToString(
      React.createElement(DataTable, {
        columns,
        data,
        filters: { name: 'Alice' },
      }),
    )
    expect(html).toContain('Alice')
    expect(html).not.toContain('Bob')
  })
})
