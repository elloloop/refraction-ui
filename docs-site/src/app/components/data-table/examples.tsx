'use client'

import * as React from 'react'
import { DataTable } from '@refraction-ui/react-data-table'

interface DataTableExamplesProps {
  section: 'basic' | 'rich'
}

const orders = [
  { id: 'o-1001', customer: 'Ada Lovelace', items: 3, total: 1200 },
  { id: 'o-1002', customer: 'Alan Turing', items: 1, total: 84.5 },
  { id: 'o-1003', customer: 'Grace Hopper', items: 7, total: 312 },
]

function RichExample() {
  const [opened, setOpened] = React.useState<string | null>(null)
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-3">
      <DataTable
        aria-label="Orders"
        caption="Click a row, or focus it and press Enter."
        getRowKey={(row) => row.id}
        onRowClick={(row) => setOpened(row.customer)}
        columns={[
          { id: 'customer', header: 'Customer', accessor: (row) => row.customer, sortable: true,
            cell: (row) => <span className="font-medium">{row.customer}</span> },
          { id: 'items', header: 'Items', accessor: (row) => row.items, numeric: true, sortable: true },
          { id: 'total', header: 'Total', accessor: (row) => row.total, numeric: true, sortable: true,
            cell: (row) => `$${row.total.toFixed(2)}` },
        ]}
        data={orders}
      />
      <p className="text-sm text-muted-foreground">Opened: {opened ?? 'none'}</p>
    </div>
  )
}

const sampleData = [
  { id: 1, name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
  { id: 2, name: 'Bob Smith', role: 'Designer', status: 'Active' },
  { id: 3, name: 'Carol White', role: 'PM', status: 'Inactive' },
  { id: 4, name: 'Dave Brown', role: 'Engineer', status: 'Active' },
]

export function DataTableExamples({ section }: DataTableExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <DataTable
          columns={[
            { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true, filterable: true },
            { id: 'role', header: 'Role', accessor: (row) => row.role, sortable: true },
            { id: 'status', header: 'Status', accessor: (row) => row.status, sortable: true },
          ]}
          data={sampleData}
        />
      </div>
    )
  }

  if (section === 'rich') return <RichExample />

  return null
}
