import Component from './SegmentedControlItem.astro'

const meta = {
  title: 'Astro/SegmentedControlItem',
  component: Component,
  argTypes: {
    value: { control: 'text' },
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    value: '',
    size: 'default',
    checked: false,
    disabled: false,
    default: '<span>default content</span>',
  }
}
