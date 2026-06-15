import Component from './DataTable.astro'

const meta = {
  title: 'Astro/DataTable',
  component: Component,
}

export default meta

export const Default = {
  args: {
    columns: [
      { key: 'id', title: 'ID' },
      { key: 'name', title: 'Name' }
    ],
    data: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ],
    sortBy: 'id',
    sortDir: 'asc',
    emptyMessage: 'No data found'
  }
}
