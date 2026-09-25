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

describe('DataTable cell renderers, alignment and row actions (SSR)', () => {
  interface Order { id: string; customer: string; total: number }
  const orders: Order[] = [
    { id: 'o-1', customer: 'Ada', total: 1200 },
    { id: 'o-2', customer: 'Alan', total: 84 },
  ]
  const render = (props: Partial<React.ComponentProps<typeof DataTable<Order>>> = {}) =>
    renderToString(
      React.createElement(DataTable<Order>, {
        columns: [
          { id: 'customer', header: 'Customer', accessor: (r) => r.customer, sortable: true, cell: (r) => React.createElement('a', { href: `/c/${r.id}` }, r.customer) },
          { id: 'total', header: 'Total', accessor: (r) => r.total, numeric: true, cell: (r) => `$${r.total}` },
          { id: 'actions', header: React.createElement('span', { className: 'sr-only' }, 'Actions'), cell: () => React.createElement('button', { type: 'button' }, 'View'), align: 'center' },
        ],
        data: orders,
        ...props,
      }),
    )

  it('renders ReactNode cells and headers', () => {
    const html = render()
    expect(html).toContain('<a href="/c/o-1">Ada</a>')
    expect(html).toContain('$1200')
    expect(html).toContain('<span class="sr-only">Actions</span>')
    expect(html).toContain('>View</button>')
  })

  it('aligns numeric columns to the end with tabular figures, and honours align', () => {
    const html = render()
    expect(html).toContain('text-end')
    expect(html).toContain('tabular-nums')
    expect(html).toContain('text-center')
  })

  it('makes sortable headers keyboard-reachable buttons', () => {
    expect(render()).toMatch(/<th[^>]*><button type="button"[^>]*>Customer/)
  })

  it('makes rows focusable only with a row action, and passes row props', () => {
    expect(render()).not.toContain('tabindex="0"')
    const html = render({ onRowClick: () => {}, getRowProps: (r) => ({ 'data-order': r.id } as React.HTMLAttributes<HTMLTableRowElement>) })
    expect((html.match(/tabindex="0"/g) ?? []).length).toBe(2)
    expect(html).toContain('data-order="o-2"')
    expect(html).toContain('cursor-pointer')
  })

  it('renders a caption and passes table attributes', () => {
    const html = render({ caption: 'Recent orders', 'aria-label': 'Orders' })
    expect(html).toContain('Recent orders</caption>')
    expect(html).toContain('aria-label="Orders"')
  })
})
