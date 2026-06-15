import Component from './TabsList.astro'

const meta = {
  title: 'Astro/TabsList',
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
