import Component from './Collapsible.astro'

const meta = {
  title: 'Astro/Collapsible',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    open: false,
    disabled: false
  }
}
