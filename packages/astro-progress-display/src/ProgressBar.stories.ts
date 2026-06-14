import Component from './ProgressBar.astro'

const meta = {
  title: 'Astro/ProgressBar',
  component: Component,
  argTypes: {
    value: { control: 'number' },
    max: { control: 'number' },
    size: { control: 'select', options: ['sm', 'default', 'lg', 'icon'] },
  },
}

export default meta

export const Default = {
  args: {
    value: 0,
    max: 0,
    size: 'default',
  },
}
