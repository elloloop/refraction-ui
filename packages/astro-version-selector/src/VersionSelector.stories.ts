import Component from './VersionSelector.astro'

const meta = {
  title: 'Astro/VersionSelector',
  component: Component,
  argTypes: {
    value: { control: 'text' },
    versions: { control: 'text' },
    placeholder: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    value: '',
    versions: '',
    placeholder: '',
  },
}
