import Component from './LoadingOverlay.astro'

const meta = {
  title: 'Astro/LoadingOverlay',
  component: Component,
  argTypes: {
    scope: { control: 'select', options: ['fullscreen', 'contain'] },
    blur: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: { scope: 'fullscreen', blur: true, message: 'Refreshing your lessons' },
}
