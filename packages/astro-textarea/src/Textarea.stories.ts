import Component from './Textarea.astro'

const meta = {
  title: 'Astro/Textarea',
  component: Component,
  argTypes: {
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
    readonly: { control: 'boolean' },
    required: { control: 'boolean' },
    rows: { control: 'number' },
    maxRows: { control: 'number' },
    'aria-invalid': { control: 'boolean' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    size: 'default',
    disabled: false,
    readonly: false,
    required: false,
    rows: 0,
    maxRows: 0,
    'aria-invalid': false,
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
