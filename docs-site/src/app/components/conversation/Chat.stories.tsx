import type { Meta, StoryObj } from '@storybook/react'
import {
  Chat,
  useConversation,
  type ChatMessage,
  type ChatTransport,
  type ConversationConfig,
} from '@refraction-ui/react-conversation'

const meta: Meta<typeof Chat> = {
  title: 'Chat & AI/Chat',
  component: Chat,
  argTypes: {},
}

export default meta

type Story = StoryObj<typeof Chat>

const me = { id: 'me', name: 'You' }
const bot = { id: 'assistant', name: 'Assistant' }

const streamingTransport: ChatTransport = {
  name: 'mock',
  async *send({ message }) {
    const reply = [
      `Sure — here's an example for **"${message.content.slice(0, 40)}"**:`,
      '',
      '```ts',
      "const greet = (name: string) => `hello, ${name}`",
      "console.log(greet('world'))",
      '```',
      '',
      'And a gif, because why not:',
      '',
      '![celebration](https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif)',
    ].join('\n')
    for (const token of reply.split(/(\s+)/)) {
      await new Promise((r) => setTimeout(r, 25))
      yield { delta: token }
    }
  },
}

function seed(): ConversationConfig {
  // Fixed timestamps — deterministic rendering (matches examples.tsx).
  const t = (min: number) => new Date(Date.UTC(2026, 0, 15, 12, 0, 0) - min * 60_000)
  const root: ChatMessage = {
    id: 'm1',
    conversationId: 'c1',
    role: 'user',
    author: me,
    content: 'How do I render **markdown**, `code`, and gifs in a message?',
    timestamp: t(8),
    status: 'sent',
    reactions: [{ emoji: '👍', count: 2, userReacted: false }],
  }
  const answer: ChatMessage = {
    id: 'm2',
    conversationId: 'c1',
    role: 'assistant',
    author: bot,
    content: ['Messages are markdown, so you get code fences:', '', '```js', 'function add(a, b) { return a + b }', '```'].join('\n'),
    timestamp: t(7),
    status: 'sent',
    reactions: [{ emoji: '🎉', count: 1, userReacted: true }],
  }
  const reply: ChatMessage = {
    id: 'm3',
    conversationId: 'c1',
    role: 'user',
    author: me,
    content: 'Perfect — and this is a reply in the thread.',
    timestamp: t(6),
    status: 'sent',
    parentId: 'm2',
  }
  return {
    currentUser: me,
    assistant: bot,
    transport: streamingTransport,
    activeConversationId: 'c1',
    conversations: [{ id: 'c1', title: 'Rendering rich content', createdAt: t(10), updatedAt: t(6) }],
    messages: { c1: [root, answer, reply] },
  }
}

export const Default: Story = {
  render: (args) => {
    const conversation = useConversation({ ...seed(), threadingMode: 'inline' })
    return (
      <div className="h-[560px]">
        <Chat {...args} conversation={conversation} currentUserId="me" />
      </div>
    )
  },
}

export const PanelThreading: Story = {
  render: (args) => {
    const conversation = useConversation({ ...seed(), threadingMode: 'panel' })
    return (
      <div className="h-[560px]">
        <Chat {...args} conversation={conversation} currentUserId="me" />
      </div>
    )
  },
}
