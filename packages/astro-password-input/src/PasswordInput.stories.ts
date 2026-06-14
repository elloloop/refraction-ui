import Component from './PasswordInput.astro'

const meta = {
  title: 'Astro/PasswordInput',
  component: Component,
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    validationState: { control: 'text' },
    revealLabel: { control: 'text' },
    hideLabel: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    size: 'default',
    disabled: false,
    readonly: false,
    required: false,
    validationState: '',
    revealLabel: '',
    hideLabel: '',
  },
}
