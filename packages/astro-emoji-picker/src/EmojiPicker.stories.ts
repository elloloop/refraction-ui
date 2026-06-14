import Component from './EmojiPicker.astro'

const meta = {
  title: 'Astro/EmojiPicker',
  component: Component,
}

export default meta

export const Default = {
  args: {
    category: undefined
  }
}
