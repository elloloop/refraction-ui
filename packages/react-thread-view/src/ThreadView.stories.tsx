import type { Meta, StoryObj } from '@storybook/react'
import { ThreadView } from './thread-view.js'
import type { MessageData } from '@refraction-ui/thread-view'

const messages: MessageData[] = [
  {
    id: 'm1',
    author: { id: 'u1', name: 'Alice' },
    content: 'Hey team — shipping the new thread view today 🚀',
    timestamp: new Date(Date.now() - 9 * 60_000),
    reactions: [{ emoji: '🚀', count: 3, userReacted: true }],
  },
  {
    id: 'm2',
    author: { id: 'u2', name: 'Bob' },
    content: 'Nice! Does it support reactions and replies?',
    timestamp: new Date(Date.now() - 7 * 60_000),
    replies: [
      {
        id: 'r1',
        author: { id: 'u1', name: 'Alice' },
        content: 'Yep — both, plus attachments.',
        timestamp: new Date(Date.now() - 6 * 60_000),
      },
    ],
  },
  {
    id: 'm3',
    author: { id: 'u1', name: 'Alice' },
    content: 'Here is the spec.',
    timestamp: new Date(Date.now() - 5 * 60_000),
    edited: true,
    attachments: [{ id: 'a1', name: 'thread-view-spec.pdf', url: '#', type: 'application/pdf' }],
  },
]

const meta: Meta<typeof ThreadView> = {
  title: 'Thread View/ThreadView',
  component: ThreadView,
  parameters: { layout: 'padded' },
}
export default meta

type Story = StoryObj<typeof ThreadView>

export const Default: Story = {
  args: { messages, currentUserId: 'u1' },
}
