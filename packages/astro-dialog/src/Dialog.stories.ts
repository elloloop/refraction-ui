import Component from './Dialog.astro'

const meta = {
  title: 'Astro/Dialog',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    defaultOpen: false,
    modal: false
  },
  render: (args) => {
    const { default: slotContent, ...rest } = args;
    const propsStr = Object.entries(rest)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => typeof v === 'boolean' ? (v ? k : '') : `${k}="${v}"`)
      .join(' ');
    return {
      components: { Component },
      template: `<Component ${propsStr}>${slotContent}</Component>`
    };
  }
}
