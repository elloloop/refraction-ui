import Component from './Stagger.astro'

const meta = {
  title: 'Astro/Stagger',
  component: Component,
  argTypes: {
    layout: { control: 'select', options: ['stack', 'grid', 'inline', 'none'] },
    pattern: { control: 'select', options: ['page-in', 'side-next', 'handoff', 'celebrate'] },
  },
}

export default meta

export const Grid = {
  args: { layout: 'grid', pattern: 'page-in' },
}
