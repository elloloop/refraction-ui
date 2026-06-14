import Component from './BadgeDisplay.astro'

const meta = {
  title: 'Astro/BadgeDisplay',
  component: Component,
  argTypes: {
    badges: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    badges: '',
  },
}
