import Component from './ThemeScript.astro'

const meta = {
  title: 'Astro/ThemeScript',
  component: Component,
  argTypes: {
    storageKey: { control: 'text' },
    attribute: { control: 'text' },
    defaultMode: { control: 'text' },
    enableSystem: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    storageKey: '',
    attribute: '',
    defaultMode: '',
    enableSystem: false,
  },
}
