import Component from './StatusIndicator.astro'

const meta = {
  title: 'Astro/StatusIndicator',
  component: Component,
  argTypes: {
    type: { control: 'text' },
    label: { control: 'text' },
    pulse: { control: 'boolean' },
    showLabel: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    type: '',
    label: '',
    pulse: false,
    showLabel: false,
  },
}
