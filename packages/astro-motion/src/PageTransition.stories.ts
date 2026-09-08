import Component from './PageTransition.astro'

const meta = {
  title: 'Astro/PageTransition',
  component: Component,
  argTypes: {
    direction: { control: 'select', options: ['forward', 'back'] },
    axis: { control: 'select', options: ['vertical', 'horizontal'] },
  },
}

export default meta

export const Forward = {
  args: { direction: 'forward', axis: 'vertical' },
}
