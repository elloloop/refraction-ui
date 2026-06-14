import Component from './SocialAuthButton.astro'

const meta = {
  title: 'Astro/SocialAuthButton',
  component: Component,
  argTypes: {
    provider: { control: 'text' },
    lastUsed: { control: 'boolean' },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta

export const Default = {
  args: {
    provider: '',
    lastUsed: false,
    loading: false,
    disabled: false,
  },
}
