import Component from './Carousel.astro'

const meta = {
  title: 'Astro/Carousel',
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
