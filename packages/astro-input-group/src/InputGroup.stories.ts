import Component from './InputGroup.astro'

const meta = {
  title: 'Astro/InputGroup',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    orientation: 'default'
  }
}
