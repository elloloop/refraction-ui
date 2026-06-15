import Component from './SelectItem.astro'

const meta = {
  title: 'Astro/SelectItem',
  component: Component,
  argTypes: {
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    selected: { control: 'boolean' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    value: '',
    disabled: false,
    selected: false,
    default: '<span>default content</span>',
  }
}
