import Component from './DataTable.astro'

const meta = {
  title: 'Astro/DataTable',
  component: Component,
}

export default meta

// Columns must match the headless core's ColumnDef shape
// ({ id, header, accessor, sortable?, filterable? }) — see
// packages/data-table/src/data-table.ts.
export const Default = {
  args: {
    columns: [
      { id: 'name', header: 'Name', accessor: (row) => row.name, sortable: true, filterable: true },
      { id: 'role', header: 'Role', accessor: (row) => row.role, sortable: true },
      { id: 'status', header: 'Status', accessor: (row) => row.status, sortable: true }
    ],
    data: [
      { name: 'Alice', role: 'Engineer', status: 'Active' },
      { name: 'Bob', role: 'Designer', status: 'Away' }
    ],
    sortBy: 'name',
    sortDir: 'asc',
    emptyMessage: 'No data found'
  }
}
