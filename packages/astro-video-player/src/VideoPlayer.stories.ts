import Component from './VideoPlayer.astro'

const meta = {
  title: 'Astro/VideoPlayer',
  component: Component,
  argTypes: {
    src: { control: 'text' },
    poster: { control: 'text' },
    autoplay: { control: 'boolean' },
    muted: { control: 'boolean' },
    controls: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    src: '',
    poster: '',
    autoplay: false,
    muted: false,
    controls: false,
  },
}
