import Component from './TabsContent.astro'

const meta = {
  title: 'Astro/TabsContent',
  component: Component,
  argTypes: {
    value: { control: 'text' },
    isActive: { control: 'boolean' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    value: '',
    isActive: false,
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
