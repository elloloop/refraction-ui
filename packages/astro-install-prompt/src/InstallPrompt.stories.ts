import Component from './InstallPrompt.astro'

const meta = {
  title: 'Astro/InstallPrompt',
  component: Component,
}

export default meta

export const Default = {
  args: {
    delay: 42,
    storageKey: 'Example storageKey',
    installLabel: 'Example installLabel',
    dismissLabel: 'Example dismissLabel',
    message: 'Example message'
  }
}
