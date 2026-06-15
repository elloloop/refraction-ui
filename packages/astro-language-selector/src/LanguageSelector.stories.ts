import Component from './LanguageSelector.astro'

const meta = {
  title: 'Astro/LanguageSelector',
  component: Component,
}

export default meta

export const Default = {
  args: {
    value: 'en',
    options: [
      { label: 'English', value: 'en' },
      { label: 'Spanish', value: 'es' }
    ],
    multiple: false,
    placeholder: 'Select a language'
  }
}
