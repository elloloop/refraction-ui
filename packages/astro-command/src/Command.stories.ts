import Component from './Command.astro'

const meta = {
  title: 'Astro/Command',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    open: false
  }
}
