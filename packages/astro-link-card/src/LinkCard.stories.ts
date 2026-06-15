import Component from './LinkCard.astro'

const meta = {
  title: 'Astro/LinkCard',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>'
  }
}
