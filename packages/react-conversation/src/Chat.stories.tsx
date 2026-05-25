import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Chat } from './chat.js'
import { useConversation } from './use-conversation.js'
import type { SlashCommand, Mention } from './composer.js'
import type { ChatMessage, ChatTransport, ConversationConfig, ThreadingMode } from '@refraction-ui/conversation'

const me = { id: 'me', name: 'You' }
const bot = { id: 'assistant', name: 'Assistant', avatarUrl: undefined }

const slashCommands: SlashCommand[] = [
  { id: 'code', label: '/code', description: 'Insert a code block', insertText: '```\n\n```' },
  { id: 'shrug', label: '/shrug', description: 'Append ¯\\_(ツ)_/¯', insertText: '¯\\_(ツ)_/¯' },
  { id: 'image', label: '/image', description: 'Insert an image', insertText: '![alt](url)' },
  { id: 'clear', label: '/clear', description: 'Start a new conversation' },
]

const mentions: Mention[] = [
  { id: 'alice', label: 'Alice' },
  { id: 'bob', label: 'Bob' },
  { id: 'carol', label: 'Carol' },
  { id: 'assistant', label: 'Assistant' },
]

/** A mock backend that streams a markdown reply (with code + a gif) token by token. */
const streamingTransport: ChatTransport = {
  name: 'mock',
  async *send({ message }) {
    const reply = [
      `Great question about **"${message.content.slice(0, 40)}"**! Here's a quick example:`,
      '',
      '```ts',
      "const greet = (name: string) => `hello, ${name}`",
      "console.log(greet('world'))",
      '```',
      '',
      'And because everything is better with a gif:',
      '',
      '![celebration](https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif)',
    ].join('\n')
    // stream word-by-word
    const tokens = reply.split(/(\s+)/)
    for (const t of tokens) {
      await new Promise((r) => setTimeout(r, 25))
      yield { delta: t }
    }
  },
}

function seed(): ConversationConfig {
  const t = (min: number) => new Date(Date.now() - min * 60_000)
  const root: ChatMessage = {
    id: 'm1',
    conversationId: 'c1',
    role: 'user',
    author: me,
    content: 'Can you show me how to render **markdown**, `code`, and gifs in a message?',
    timestamp: t(8),
    status: 'sent',
    reactions: [{ emoji: '👍', count: 2, userReacted: false }],
  }
  const answer: ChatMessage = {
    id: 'm2',
    conversationId: 'c1',
    role: 'assistant',
    author: bot,
    content: [
      'Absolutely. Messages are markdown, so you get headings, lists, and fenced code:',
      '',
      '```js',
      "function add(a, b) { return a + b }",
      '```',
      '',
      '- bullet one',
      '- bullet two',
    ].join('\n'),
    timestamp: t(7),
    status: 'sent',
    reactions: [
      { emoji: '🎉', count: 1, userReacted: true },
      { emoji: '❤️', count: 3, userReacted: false },
    ],
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
    conversations: [
      { id: 'c1', title: 'Rendering rich content', createdAt: t(10), updatedAt: t(6) },
      { id: 'c2', title: 'Yesterday’s brainstorm', createdAt: t(2000), updatedAt: t(1500) },
    ],
    messages: { c1: [root, answer, reply], c2: [] },
  }
}

function Demo({
  threadingMode,
  showConversationList = true,
  empty = false,
}: {
  threadingMode?: ThreadingMode
  showConversationList?: boolean
  empty?: boolean
}) {
  const conversation = useConversation(
    empty ? { currentUser: me, assistant: bot, transport: streamingTransport, threadingMode } : { ...seed(), threadingMode },
  )
  return (
    <div style={{ height: '640px', padding: '1rem' }}>
      <Chat
        conversation={conversation}
        currentUserId="me"
        showConversationList={showConversationList}
        slashCommands={slashCommands}
        mentions={mentions}
        onSlashCommand={(cmd) => cmd.id === 'clear' && conversation.newConversation()}
      />
    </div>
  )
}

const meta: Meta = {
  title: 'Conversation/Chat',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

/** Default: inline threading — replies appear in the timeline, quoting their parent. */
export const InlineThreading: Story = {
  render: () => <Demo threadingMode="inline" />,
}

/** Panel threading (Slack-style) — only roots show in the timeline; replies live in the panel. */
export const PanelThreading: Story = {
  render: () => <Demo threadingMode="panel" />,
}

/** No conversation sidebar — a single-conversation embed. */
export const NoSidebar: Story = {
  render: () => <Demo threadingMode="inline" showConversationList={false} />,
}

/** Empty state with a live streaming transport — type to see streaming + the typing indicator. */
export const Empty: Story = {
  render: () => <Demo empty />,
}
