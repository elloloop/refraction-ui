import type { Meta, StoryObj } from '@storybook/react'
import { ReactionBar } from '@refraction-ui/react-reaction-bar'
import { ReactionBarExamples } from './examples'

const meta: Meta<typeof ReactionBar> = {
  title: 'Data Display/ReactionBar',
  component: ReactionBar,
}
export default meta
type Story = StoryObj<typeof ReactionBar>

export const Default: Story = {
  render: () => <ReactionBarExamples section="basic" />,
}

/**
 * Labels and who reacted (hover or Tab to a pill), a "+N" overflow past
 * three, and an add button that opens an EmojiPicker: the docs-site example.
 */
export const WorkChat: Story = {
  render: () => <ReactionBarExamples section="work-chat" />,
}

export const WithoutAddButton: Story = {
  render: () => (
    <ReactionBar
      showAddButton={false}
      reactions={[
        { emoji: '🚀', count: 12, userReacted: true },
        { emoji: '👀', count: 4, userReacted: false },
      ]}
    />
  ),
}
