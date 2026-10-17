import Component from './AvatarGroup.astro'

const meta = {
  title: 'Astro/AvatarGroup',
  component: Component,
  argTypes: {
    max: { control: 'number' },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    overflowButton: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    users: [
      { id: '1', name: 'Alice Johnson' },
      { id: '2', name: 'Bob Smith' },
      { id: '3', name: 'Carol White' },
      { id: '4', name: 'Dave Brown' },
    ],
    max: 3,
    size: 'md',
  },
}

/**
 * Presence dots over the edge, a photo that fails to load (its initials stay)
 * and a "+N" button.
 */
export const PresenceAndOverflow = {
  args: {
    users: [
      { id: '1', name: 'Ada Lovelace', status: 'online' },
      { id: '2', name: 'Grace Hopper', src: '/missing-avatar.png', status: 'away' },
      { id: '3', name: 'Alan Turing', status: 'busy' },
      { id: '4', name: 'Katherine Johnson', status: 'dnd' },
      { id: '5', name: 'Edsger Dijkstra' },
    ],
    max: 4,
    size: 'lg',
    overflowButton: true,
  },
}
