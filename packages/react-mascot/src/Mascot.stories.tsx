import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Mascot } from './mascot.js'

const meta: Meta<typeof Mascot> = {
  title: 'Marketing/Mascot',
  component: Mascot,
  argTypes: {
    mood: {
      control: 'select',
      options: ['happy', 'think', 'wave'],
      description: 'Emotion/mood of the mascot',
    },
    animation: {
      control: 'select',
      options: ['none', 'bounce', 'float'],
      description: 'Animation state of the mascot',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Predefined size of the mascot',
    },
    animate: {
      control: 'boolean',
      description: 'Master switch for animations',
    },
    animateBobbing: {
      control: 'boolean',
      description: 'Toggle breathing/bobbing animation',
    },
    animateBlinking: {
      control: 'boolean',
      description: 'Toggle blinking interval animation',
    },
    animateSprout: {
      control: 'boolean',
      description: 'Toggle sprout swaying animation',
    },
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'svg-img-alt', enabled: true }],
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof Mascot>

export const Default: Story = {
  args: {
    mood: 'happy',
    animation: 'none',
    size: 'md',
    animate: true,
  },
}

export const ThinkingFloating: Story = {
  args: {
    mood: 'think',
    animation: 'float',
    size: 'lg',
    animate: true,
  },
}

export const WavingBouncing: Story = {
  args: {
    mood: 'wave',
    animation: 'bounce',
    size: 'xl',
    animate: true,
  },
}

export const StaticMascot: Story = {
  args: {
    mood: 'happy',
    animation: 'none',
    size: 'md',
    animate: false,
  },
}
