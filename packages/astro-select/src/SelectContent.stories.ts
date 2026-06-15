import Component from './SelectContent.astro'

const meta = {
  title: 'Astro/SelectContent',
  component: Component,
  argTypes: {
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    default: '<span>default content</span>',
  }
}
