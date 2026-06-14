import Component from './RadioItem.astro'

const meta = {
  title: 'Astro/RadioItem',
  component: Component,
  argTypes: {
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    checked: { control: 'boolean' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    value: '',
    disabled: false,
    checked: false,
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
