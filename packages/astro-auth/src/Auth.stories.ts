import Component from './AuthGuard.astro'

const meta = {
  title: 'Astro/Auth',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    roles: ['Item 1', 'Item 2'],
    redirectTo: 'Example redirectTo',
    provider: undefined
  }
}
