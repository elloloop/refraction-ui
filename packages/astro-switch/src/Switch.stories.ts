import Component from './Switch.astro'

const meta = {
  title: 'Astro/Switch',
  component: Component,
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon'] },
    name: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    checked: false,
    disabled: false,
    size: 'default',
    name: '',
  },
}
