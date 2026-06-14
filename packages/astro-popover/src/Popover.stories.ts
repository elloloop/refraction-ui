import Component from './Popover.astro'

const meta = {
  title: 'Astro/Popover',
  component: Component,
  argTypes: {
    defaultOpen: { control: 'boolean' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    defaultOpen: false,
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
