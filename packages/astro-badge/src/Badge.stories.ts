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
  }
}
