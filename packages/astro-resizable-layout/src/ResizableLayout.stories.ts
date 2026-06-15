import Component from './ResizableLayout.astro'

const meta = {
  title: 'Astro/ResizableLayout',
  component: Component,
  argTypes: {
    orientation: { control: 'text' },
    defaultSizes: { control: 'number' },
    minSizes: { control: 'number' },
    maxSizes: { control: 'number' },
    persistKey: { control: 'text' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    orientation: '',
    defaultSizes: 0,
    minSizes: 0,
    maxSizes: 0,
    persistKey: '',
    default: '<span>default content</span>',
  }
}
