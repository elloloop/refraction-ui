import Component from './LocationSelector.astro'

const meta = {
  title: 'Astro/LocationSelector',
  component: Component,
}

export default meta

export const Default = {
  args: {
    defaultCountry: 'Example defaultCountry',
    defaultLanguage: 'Example defaultLanguage'
  }
}
