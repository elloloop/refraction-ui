import Component from './SelectTrigger.astro'

const meta = {
  title: 'Astro/SelectTrigger',
  component: Component,
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon'] },
    placeholder: { control: 'text' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    size: 'default',
    placeholder: '',
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
