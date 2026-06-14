import Component from './PresenceIndicator.astro'

const meta = {
  title: 'Astro/PresenceIndicator',
  component: Component,
  argTypes: {
    status: { control: 'text' },
    showLabel: { control: 'boolean' },
    label: { control: 'text' },
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon'] },
  },
}

export default meta

export const Default = {
  args: {
    status: '',
    showLabel: false,
    label: '',
    size: 'default',
  },
}
