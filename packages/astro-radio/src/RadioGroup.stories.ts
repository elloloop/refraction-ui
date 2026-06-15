import Component from './RadioGroup.astro'

const meta = {
  title: 'Astro/RadioGroup',
  component: Component,
  argTypes: {
    value: { control: 'text' },
    name: { control: 'text' },
    disabled: { control: 'boolean' },
    orientation: { control: 'text' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    value: '',
    name: '',
    disabled: false,
    orientation: '',
    default: '<span>default content</span>',
  }
}
