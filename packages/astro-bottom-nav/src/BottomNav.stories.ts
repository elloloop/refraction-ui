import Component from './BottomNav.astro'

const meta = {
  title: 'Astro/BottomNav',
  component: Component,
}

export default meta

export const Default = {
  args: {
    tabs: undefined,
    currentPath: 'Example currentPath'
  }
}
