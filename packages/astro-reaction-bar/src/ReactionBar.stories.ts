import Component from './ReactionBar.astro'

const meta = {
  title: 'Astro/ReactionBar',
  component: Component,
  argTypes: {
    reactions: { control: 'text' },
    showAddButton: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    reactions: '',
    showAddButton: false,
  },
}
