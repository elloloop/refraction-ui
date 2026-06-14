import Component from './Bars.astro'

const meta = {
  title: 'Astro/Charts',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    width: 100,
    height: 100,
    margin: undefined
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
