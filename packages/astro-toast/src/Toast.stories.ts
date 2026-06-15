import Component from './Toast.astro'

const meta = {
  title: 'Astro/Toast',
  component: Component,
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] },
    duration: { control: 'number' },
    dismissible: { control: 'boolean' },
    message: { control: 'text' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    variant: 'default',
    duration: 0,
    dismissible: false,
    message: '',
    default: '<span>default content</span>',
  }
}
