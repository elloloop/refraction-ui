import Component from './Accordion.astro'

const meta = {
  title: 'Astro/Accordion',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    variant: 'default',
    size: 'default',
    loading: false,
    disabled: false
  }
}
