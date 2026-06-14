import Component from './ThreadView.astro'

const meta = {
  title: 'Astro/ThreadView',
  component: Component,
  argTypes: {
    messages: { control: 'text' },
    currentUserId: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    messages: '',
    currentUserId: '',
  },
}
