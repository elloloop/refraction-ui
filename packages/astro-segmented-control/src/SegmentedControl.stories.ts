import Component from './SegmentedControl.astro'

const meta = {
  title: 'Astro/SegmentedControl',
  component: Component,
  argTypes: {
    value: { control: 'text' },
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon'] },
    name: { control: 'text' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    value: '',
    size: 'default',
    name: '',
    default: '<span>default content</span>',
  },
  render: (args: any) => {
    const { default: defaultSlot, ...props } = args;
    return {
      Component,
      props,
      slots: { default: defaultSlot },
    };
  },
}
