import Component from './AvatarGroup.astro'

const meta = {
  title: 'Astro/AvatarGroup',
  component: Component,
}

export default meta

export const Default = {
  args: {
    users: undefined,
    max: 42,
    size: 'default'
  }
}
