import Component from './KeyboardShortcut.astro'

const meta = {
  title: 'Astro/KeyboardShortcut',
  component: Component,
}

export default meta

export const Default = {
  args: {
    keys: ['Item 1', 'Item 2'],
    enabled: false,
    preventDefault: false
  }
}
