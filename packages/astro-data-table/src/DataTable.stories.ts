import Component from './DataTable.astro'

const meta = {
  title: 'Astro/DataTable',
  component: Component,
}

export default meta

export const Default = {
  args: {
    columns: undefined,
    data: 'Example data',
    sortBy: 'Example sortBy',
    sortDir: undefined,
    emptyMessage: 'Example emptyMessage'
  }
}
