import Component from './Button.astro'

const meta = {
  title: 'Astro/Button',
  component: Component,
}

export default meta

export const Default = {
  args: {
    default: '<span>Default Slot Content</span>',
    variant: 'default',
    size: 'default',
    loading: false,
    disabled: false
  }
}

export const NamedIcon = {
  args: { size: 'icon', variant: 'ghost', 'aria-label': 'Dictate', default: '<svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"><path d="M12 2v16" stroke="currentColor" /></svg>' },
}
