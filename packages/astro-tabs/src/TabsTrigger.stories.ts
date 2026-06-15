import Component from './TabsTrigger.astro'

const meta = {
  title: 'Astro/TabsTrigger',
  component: Component,
  argTypes: {
    value: { control: 'text' },
    isActive: { control: 'boolean' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    value: '',
    isActive: false,
    default: '<span>default content</span>',
  }
}
