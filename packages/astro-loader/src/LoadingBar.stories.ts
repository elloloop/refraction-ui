import Component from './LoadingBar.astro'

const meta = {
  title: 'Astro/LoadingBar',
  component: Component,
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    placement: { control: 'select', options: ['inline', 'fixed'] },
  },
}

export default meta

export const Indeterminate = {
  args: { placement: 'inline', label: 'Loading' },
}

export const Determinate = {
  args: { value: 45, thickness: 6, label: 'Upload' },
}
