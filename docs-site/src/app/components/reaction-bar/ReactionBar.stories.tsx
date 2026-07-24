import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import {
  ReactionBar,
  type Reaction,
} from '@refraction-ui/react-reaction-bar'

// Composed directly from the adapter: the docs-site example predates the
// current `userReacted`/`onToggle` API and no longer typechecks against it.
const meta: Meta<typeof ReactionBar> = {
  title: 'Components/ReactionBar',
  component: ReactionBar,
}
export default meta
type Story = StoryObj<typeof ReactionBar>

const initialReactions: Reaction[] = [
  { emoji: '👍', count: 5, userReacted: false },
  { emoji: '❤️', count: 3, userReacted: true },
  { emoji: '🎉', count: 1, userReacted: false },
]

function InteractiveDemo() {
  const [reactions, setReactions] = useState(initialReactions)
  return (
    <ReactionBar
      reactions={reactions}
      onToggle={(emoji) => {
        setReactions((prev) =>
          prev.map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  count: r.userReacted ? r.count - 1 : r.count + 1,
                  userReacted: !r.userReacted,
                }
              : r,
          ),
        )
      }}
    />
  )
}

export const Default: Story = {
  render: () => <InteractiveDemo />,
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
