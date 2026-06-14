import Component from './Breadcrumbs.astro'

const meta = {
  title: 'Astro/Breadcrumbs',
  component: Component,
}

export default meta

export const Default = {
  args: {
    pathname: 'Example pathname',
    items: undefined,
    labels: 'Example labels',
    separator: 'Example separator',
    maxItems: 42
  }
}
