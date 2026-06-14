import Component from './StatsGrid.astro'

const meta = {
  title: 'Astro/StatsGrid',
  component: Component,
  argTypes: {
    stats: { control: 'text' },
    badges: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    stats: '',
    badges: '',
  },
}
