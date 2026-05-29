'use client'

import { useState } from 'react'
import {
  Chat,
  useConversation,
  type ChatMessage,
  type ChatTransport,
  type ConversationConfig,
  type ThreadingMode,
} from '@refraction-ui/react-conversation'

interface ConversationExamplesProps {
  section: 'basic'
}

const me = { id: 'me', name: 'You' }
const bot = { id: 'assistant', name: 'Assistant' }

/** Mock backend: streams a markdown reply (with code + a gif) token by token. */
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
  const t = (min: number) => new Date(Date.now() - min * 60_000)
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

function ChatDemo({ threadingMode }: { threadingMode: ThreadingMode }) {
  const conversation = useConversation({ ...seed(), threadingMode })
  return (
    <div className="h-[560px]">
      <Chat conversation={conversation} currentUserId="me" />
    </div>
  )
}

export function ConversationExamples({ section }: ConversationExamplesProps) {
  const [mode, setMode] = useState<ThreadingMode>('inline')
  if (section !== 'basic') return null
  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-md bg-muted p-0.5 text-sm" role="group" aria-label="Threading mode">
        {(['inline', 'panel'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded px-3 py-1 ${mode === m ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            {m === 'inline' ? 'Inline threading' : 'Panel (Slack-style)'}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        {/* key forces a fresh store when the mode toggles */}
        <ChatDemo key={mode} threadingMode={mode} />
      </div>
      <p className="text-xs text-muted-foreground">
        Type a message to watch the mock transport stream a reply. In inline mode, replies quote their parent and open the
        thread panel; in panel mode, only roots show with a “N replies” opener.
      </p>
    </div>
  )
}
