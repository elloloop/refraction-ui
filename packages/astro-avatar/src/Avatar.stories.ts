import Component from './Avatar.astro'

const meta = {
  title: 'Astro/Avatar',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    size: 'default'
  }
}
