import Component from './InlineEditor.astro'

const meta = {
  title: 'Astro/InlineEditor',
  component: Component,
}

export default meta

export const Default = {
  args: {
    value: 'Example value'
  }
}
