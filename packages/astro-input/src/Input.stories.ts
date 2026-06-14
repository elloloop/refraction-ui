import Component from './Input.astro'

const meta = {
  title: 'Astro/Input',
  component: Component,
}

export default meta

export const Default = {
  args: {
    type: 'Example type',
    size: 'default',
    disabled: false,
    readonly: false,
    required: false,
    'aria-invalid': false,
    validationState: undefined
  }
}
