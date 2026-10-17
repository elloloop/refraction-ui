import Component from './ReactionBar.astro'

const meta = {
  title: 'Astro/ReactionBar',
  component: Component,
  argTypes: {
    reactions: { control: 'object' },
    showAddButton: { control: 'boolean' },
    maxVisible: { control: 'number' },
  },
}

export default meta

export const Default = {
  args: {
    reactions: [
      { emoji: '👍', count: 5, userReacted: false },
      { emoji: '❤️', count: 3, userReacted: true },
      { emoji: '🎉', count: 1, userReacted: false },
    ],
    showAddButton: true,
  },
}

/** Labels, who reacted (hover or focus a pill) and an overflow past three. */
export const WorkChat = {
  args: {
    reactions: [
      {
        emoji: '👍',
        label: 'Agree',
        count: 5,
        userReacted: true,
        reactors: ['You', 'Dev Patel'],
      },
      { emoji: '👀', label: 'Looking', count: 2, userReacted: false, reactors: ['Ana', 'Sam'] },
      { emoji: '🎉', label: 'Celebrate', count: 1, userReacted: false, reactors: ['Kim'] },
      { emoji: '🚀', label: 'Ship it', count: 3, userReacted: false, reactors: ['Lee', 'Ana', 'Dev Patel'] },
      { emoji: '✅', label: 'Done', count: 1, userReacted: false, reactors: ['Someone who left'] },
    ],
    maxVisible: 3,
    showAddButton: true,
  },
}
