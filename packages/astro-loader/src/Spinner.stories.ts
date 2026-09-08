import Component from './Spinner.astro'

const meta = {
  title: 'Astro/Spinner',
  component: Component,
  argTypes: {
    variant: { control: 'select', options: ['ring', 'dots', 'bars', 'orbit', 'ripple'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    tone: { control: 'select', options: ['primary', 'tertiary', 'muted', 'inverse', 'current'] },
  },
}

export default meta

export const Default = {
  args: { variant: 'ring', size: 'lg', tone: 'primary', label: 'Loading' },
}

export const Dots = {
  args: { variant: 'dots', size: 'lg' },
}
