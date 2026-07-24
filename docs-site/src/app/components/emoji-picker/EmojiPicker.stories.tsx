import type { Meta, StoryObj } from '@storybook/react'
import { EmojiPicker } from '@refraction-ui/react-emoji-picker'

const meta: Meta<typeof EmojiPicker> = {
  title: 'Utilities/EmojiPicker',
  component: EmojiPicker,
  parameters: {
    layout: 'centered',
  },
  args: {
  },
  argTypes: {
    onSelect: { action: 'selected' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
