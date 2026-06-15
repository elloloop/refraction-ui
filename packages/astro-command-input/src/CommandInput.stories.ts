import Component from './CommandInput.astro'

const meta = {
  title: 'Astro/CommandInput',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>'
  }
}
