import Component from './DropdownMenu.astro'

const meta = {
  title: 'Astro/DropdownMenu',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    defaultOpen: false
  }
}
