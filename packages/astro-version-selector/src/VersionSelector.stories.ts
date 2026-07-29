import Component from './VersionSelector.astro'

const meta = {
  title: 'Astro/VersionSelector',
  component: Component,
  argTypes: {
    value: { control: 'text' },
    versions: { control: 'object' },
    placeholder: { control: 'text' },
  },
}

export default meta

// Versions must match the headless core's VersionOption shape
// ({ value, label, isLatest? }) — see
// packages/version-selector/src/version-selector.ts.
export const Default = {
  args: {
    value: '3.0.0',
    versions: [
      { value: '3.0.0', label: 'v3.0.0', isLatest: true },
      { value: '2.5.0', label: 'v2.5.0' },
      { value: '2.0.0', label: 'v2.0.0' },
      { value: '1.0.0', label: 'v1.0.0' },
    ],
    placeholder: 'Select version...',
  }
}
