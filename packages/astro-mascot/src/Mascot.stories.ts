import Component from './Mascot.astro'

const meta = {
  title: 'Astro/Mascot',
  component: Component,
  argTypes: {
    mood: {
      control: 'select',
      options: ['happy', 'think', 'wave'],
    },
    animation: {
      control: 'select',
      options: ['none', 'bounce', 'float'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
}

export default meta

export const Default = {
  args: {
    mood: 'happy',
    animation: 'none',
    size: 'md',
  },
}

export const ThinkingFloating = {
  args: {
    mood: 'think',
    animation: 'float',
    size: 'lg',
  },
}

export const WavingBouncing = {
  args: {
    mood: 'wave',
    animation: 'bounce',
    size: 'md',
  },
}
