import Component from './Card.astro'

const meta = {
  title: 'Astro/Card',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    padding: undefined
  }
}
