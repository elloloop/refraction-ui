import Component from './Separator.astro'

const meta = {
  title: 'Astro/Separator',
  component: Component,
  argTypes: {
    orientation: { control: 'text' },
    label: { control: 'text' },
    decorative: { control: 'boolean' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    orientation: '',
    label: '',
    decorative: false,
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
