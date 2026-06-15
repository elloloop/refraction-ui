import Component from './SearchBar.astro'

const meta = {
  title: 'Astro/SearchBar',
  component: Component,
  argTypes: {
    placeholder: { control: 'text' },
    loading: { control: 'boolean' },
    debounceMs: { control: 'number' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    placeholder: '',
    loading: false,
    debounceMs: 0,
    default: '<span>default content</span>',
  }
}
