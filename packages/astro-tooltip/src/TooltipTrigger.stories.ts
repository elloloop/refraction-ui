import Component from './TooltipTrigger.astro'

const meta = {
  title: 'Astro/TooltipTrigger',
  component: Component,
  argTypes: {
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    default: '<span>default content</span>',
  }
}
