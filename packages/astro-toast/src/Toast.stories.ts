import Component from './Toast.astro'

const meta = {
  title: 'Astro/Toast',
  component: Component,
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'error', 'warning'] },
    duration: { control: 'number' },
    dismissible: { control: 'boolean' },
    message: { control: 'text' },
    title: { control: 'text' },
    actionLabel: { control: 'text' },
    dismissLabel: { control: 'text' },
    default: { control: 'text' },
  },
}

export default meta

export const Default = {
  args: {
    variant: 'default',
    duration: 0,
    dismissible: false,
    message: '',
    default: '<span>default content</span>',
  }
}

export const TitleAndAction = {
  args: {
    variant: 'success',
    duration: 0,
    dismissible: true,
    title: 'Draft deleted',
    message: 'It is no longer in your drafts.',
    actionLabel: 'Undo',
  }
}
