import Component from './CodeBlock.astro'

const meta = {
  title: 'Astro/CodeBlock',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>'
  }
}
