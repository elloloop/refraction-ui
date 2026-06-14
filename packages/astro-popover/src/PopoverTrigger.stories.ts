import Component from './PopoverTrigger.astro'

const meta = {
  title: 'Astro/PopoverTrigger',
  component: Component,
  argTypes: {
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
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
