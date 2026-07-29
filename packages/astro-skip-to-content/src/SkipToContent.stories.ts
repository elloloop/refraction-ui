import Component from './SkipToContent.astro'

const meta = {
  title: 'Astro/SkipToContent',
  component: Component,
  argTypes: {
    targetId: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    default: 'Skip to content',
    targetId: 'main-content',
  },
}
