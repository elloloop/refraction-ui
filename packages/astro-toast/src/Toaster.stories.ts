import Component from './Toaster.astro'

const meta = {
  title: 'Astro/Toaster',
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
