import Component from './SkeletonText.astro'

const meta = {
  title: 'Astro/SkeletonText',
  component: Component,
  argTypes: {
    lines: { control: 'number' },
    animate: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    lines: 0,
    animate: false,
  },
}
