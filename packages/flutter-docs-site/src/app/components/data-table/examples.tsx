'use client'

import { DataTable } from '@refraction-ui/react-data-table'

interface DataTableExamplesProps {
  section: 'basic'
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

  return null
}
