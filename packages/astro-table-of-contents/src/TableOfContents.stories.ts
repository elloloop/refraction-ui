import Component from './TableOfContents.astro'

const meta = {
  title: 'Astro/TableOfContents',
  component: Component,
  argTypes: {
    selectors: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    selectors: '',
  },
}
