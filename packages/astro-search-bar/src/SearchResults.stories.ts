import Component from './SearchResults.astro'

const meta = {
  title: 'Astro/SearchResults',
  component: Component,
  argTypes: {
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    default: '<span>default content</span>',
  }
}
