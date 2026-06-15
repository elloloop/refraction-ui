import Component from './CardGrid.astro'

const meta = {
  title: 'Astro/CardGrid',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>'
  }
}
