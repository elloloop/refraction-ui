import Component from './Footer.astro'

const meta = {
  title: 'Astro/Footer',
  component: Component,
}

export default meta

export const Default = {
  args: {
    copyright: 'Example copyright',
    socialLinks: undefined,
    columns: undefined
  }
}
