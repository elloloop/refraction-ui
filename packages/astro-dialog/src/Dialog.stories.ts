import Component from './Dialog.astro'

const meta = {
  title: 'Astro/Dialog',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    defaultOpen: false,
    modal: false
  }
}
