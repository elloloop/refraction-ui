import Component from './Select.astro'

const meta = {
  title: 'Astro/Select',
  component: Component,
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    name: { control: 'text' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    value: '',
    placeholder: '',
    disabled: false,
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
