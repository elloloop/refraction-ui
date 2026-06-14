import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from '@refraction-ui/react-data-table'

const sampleData = [
  { id: 1, name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
  { id: 2, name: 'Bob Smith', role: 'Designer', status: 'Active' },
  { id: 3, name: 'Carol White', role: 'PM', status: 'Inactive' },
  { id: 4, name: 'Dave Brown', role: 'Engineer', status: 'Active' },
]

const meta: Meta<typeof DataTable> = {
  title: 'Components/DataTable',
  component: DataTable,
  argTypes: {},
  args: {
    data: sampleData,
    columns: [
      { id: 'name', header: 'Name', accessor: (row: any) => row.name, sortable: true, filterable: true },
      { id: 'role', header: 'Role', accessor: (row: any) => row.role, sortable: true },
      { id: 'status', header: 'Status', accessor: (row: any) => row.status, sortable: true },
    ]
  }
}

export default meta

type Story = StoryObj<typeof DataTable>

export const Default: Story = {
  render: (args) => (
    <DataTable {...args} />
  ),
}
