import Component from './Pagination.astro'

const meta = {
  title: 'Astro/Pagination',
  component: Component,
  argTypes: {
    page: { control: 'number' },
    totalPages: { control: 'number' },
    siblingCount: { control: 'number' },
    disabled: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    page: 5,
    totalPages: 20,
    siblingCount: 1,
  },
}
