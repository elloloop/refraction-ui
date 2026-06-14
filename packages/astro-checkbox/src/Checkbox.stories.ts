import Component from './Checkbox.astro'

const meta = {
  title: 'Astro/Checkbox',
  component: Component,
}

export default meta

export const Default = {
  args: {
    checked: undefined,
    disabled: false,
    size: 'default',
    name: 'Example name',
    value: 'Example value'
  }
}
