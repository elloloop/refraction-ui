import Badge from './Badge.astro'

const meta = {
  title: 'Astro/Badge',
  component: Badge,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    variant: 'default',
    size: 'default'
  },
  render: (args) => {
    const { default: slotContent, ...rest } = args;
    const propsStr = Object.entries(rest)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => typeof v === 'boolean' ? (v ? k : '') : `${k}="${v}"`)
      .join(' ');
    return {
      components: { Badge },
      template: `<Badge ${propsStr}>${slotContent}</Badge>`
    };
  }
}
