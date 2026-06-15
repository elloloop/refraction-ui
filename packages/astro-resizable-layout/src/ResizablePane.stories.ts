import Component from './ResizablePane.astro'

const meta = {
  title: 'Astro/ResizablePane',
  component: Component,
  argTypes: {
    index: { control: 'number' },
    orientation: { control: 'text' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    index: 0,
    orientation: '',
    default: '<span>default content</span>',
  }
}
