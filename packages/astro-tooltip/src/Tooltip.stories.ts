import Component from './Tooltip.astro'

const meta = {
  title: 'Astro/Tooltip',
  component: Component,
  argTypes: {
    delayDuration: { control: 'number' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    delayDuration: 0,
    default: '<span>default content</span>',
  }
}
