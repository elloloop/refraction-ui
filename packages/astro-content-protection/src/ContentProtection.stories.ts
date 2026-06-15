import Component from './ContentProtection.astro'

const meta = {
  title: 'Astro/ContentProtection',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    enabled: false,
    disableCopy: false,
    disableContextMenu: false,
    watermarkText: 'Example watermarkText'
  }
}
