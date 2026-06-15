import Component from './Chart.astro'

const meta = {
  title: 'Astro/Charts',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    width: 100,
    height: 100,
    margin: undefined
  }
}
