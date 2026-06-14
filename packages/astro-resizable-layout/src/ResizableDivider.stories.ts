import Component from './ResizableDivider.astro'

const meta = {
  title: 'Astro/ResizableDivider',
  component: Component,
  argTypes: {
    index: { control: 'number' },
    orientation: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    index: 0,
    orientation: '',
  },
}
