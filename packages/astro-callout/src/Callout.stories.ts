import Component from './Callout.astro'

const meta = {
  title: 'Astro/Callout',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    variant: undefined
  }
}
