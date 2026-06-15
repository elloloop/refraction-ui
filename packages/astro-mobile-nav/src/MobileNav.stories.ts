import Component from './MobileNav.astro'

const meta = {
  title: 'Astro/MobileNav',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    defaultOpen: false
  }
}
