import Component from './ThemeToggle.astro'

const meta = {
  title: 'Astro/ThemeToggle',
  component: Component,
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] },
    storageKey: { control: 'text' },
    attribute: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    variant: 'default',
    storageKey: '',
    attribute: '',
  },
}
