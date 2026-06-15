import Component from './Tabs.astro'

const meta = {
  title: 'Astro/Tabs',
  component: Component,
  argTypes: {
    defaultValue: { control: 'text' },
    orientation: { control: 'text' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    defaultValue: '',
    orientation: '',
    default: '<span>default content</span>',
  }
}
