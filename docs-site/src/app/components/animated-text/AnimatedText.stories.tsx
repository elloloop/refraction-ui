import type { Meta, StoryObj } from '@storybook/react'
import { AnimatedText, TypewriterText } from '@refraction-ui/react-animated-text'

const meta: Meta<typeof AnimatedText> = {
  title: 'Utilities/AnimatedText',
  component: AnimatedText,
}
export default meta

export const Default: StoryObj<typeof AnimatedText> = {
  args: {
    words: ['innovative', 'beautiful', 'accessible', 'fast'],
    className: 'text-2xl font-bold',
  },
  render: (args) => <AnimatedText {...args} />
}

export const Typewriter: StoryObj<typeof TypewriterText> = {
  args: {
    text: 'Hello, welcome to Refraction UI!',
    className: 'text-lg',
  },
  render: (args) => <TypewriterText {...args} />
}
