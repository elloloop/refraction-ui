import Component from './TooltipContent.astro'

const meta = {
  title: 'Astro/TooltipContent',
  component: Component,
  argTypes: {
    side: { control: 'text' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    side: '',
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
