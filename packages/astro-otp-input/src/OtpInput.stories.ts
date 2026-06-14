import Component from './OtpInput.astro'

const meta = {
  title: 'Astro/OtpInput',
  component: Component,
  argTypes: {
    length: { control: 'number' },
    value: { control: 'text' },
    autoFocus: { control: 'boolean' },
    type: { control: 'text' },
    disabled: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon'] },
    name: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    length: 0,
    value: '',
    autoFocus: false,
    type: '',
    disabled: false,
    size: 'default',
    name: '',
  },
}
