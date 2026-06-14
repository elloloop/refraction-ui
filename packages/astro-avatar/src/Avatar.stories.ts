import Component from './Avatar.astro'

const meta = {
  title: 'Astro/Avatar',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    size: 'default'
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
