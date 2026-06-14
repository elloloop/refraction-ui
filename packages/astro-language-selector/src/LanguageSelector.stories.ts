import Component from './LanguageSelector.astro'

const meta = {
  title: 'Astro/LanguageSelector',
  component: Component,
}

export default meta

export const Default = {
  args: {
    value: ['Item 1', 'Item 2'],
    options: undefined,
    multiple: false,
    placeholder: 'Example placeholder'
  }
}
