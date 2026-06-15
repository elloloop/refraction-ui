import Component from './SocialAuthRow.astro'

const meta = {
  title: 'Astro/SocialAuthRow',
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
