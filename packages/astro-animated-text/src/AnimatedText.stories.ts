import Component from './AnimatedText.astro'

const meta = {
  title: 'Astro/AnimatedText',
  component: Component,
}

export default meta

export const Default = {
  args: {
    words: ['Item 1', 'Item 2'],
    interval: 42,
    transitionDuration: 42
  }
}
