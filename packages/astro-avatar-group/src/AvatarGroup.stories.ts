import Component from './AvatarGroup.astro'

const meta = {
  title: 'Astro/AvatarGroup',
  component: Component,
}

export default meta

export const Default = {
  args: {
    users: [
      { name: 'Alice', src: 'https://example.com/alice.jpg' },
      { name: 'Bob', src: 'https://example.com/bob.jpg' }
    ],
    max: 3,
    size: 'md'
  }
}
