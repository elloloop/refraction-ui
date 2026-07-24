'use client'

import { ThreadView, type MessageData } from '@refraction-ui/react-thread-view'

// Fixed timestamps — Date.now() would render different text during SSR and
// hydration (React hydration mismatch on the docs page).
const base = Date.UTC(2026, 0, 15, 12, 0, 0)

const messages: MessageData[] = [
  {
    id: 'm1',
    author: { id: 'u1', name: 'Alice' },
    content: 'Hey team — shipping the new thread view today 🚀',
    timestamp: new Date(base - 9 * 60_000),
    reactions: [{ emoji: '🚀', count: 3, userReacted: true }],
  },
  {
    id: 'm2',
    author: { id: 'u2', name: 'Bob' },
    content: 'Nice! Does it support reactions and replies?',
    timestamp: new Date(base - 7 * 60_000),
    replies: [
      {
        id: 'r1',
        author: { id: 'u1', name: 'Alice' },
        content: 'Yep — both, plus attachments.',
        timestamp: new Date(base - 6 * 60_000),
      },
    ],
  },
  {
    id: 'm3',
    author: { id: 'u1', name: 'Alice' },
    content: 'Here is the spec.',
    timestamp: new Date(base - 5 * 60_000),
    edited: true,
    attachments: [
      { id: 'a1', name: 'thread-view-spec.pdf', url: '#', type: 'application/pdf' },
    ],
  },
]

interface ThreadViewExamplesProps {
  section: 'default'
}

export function ThreadViewExamples({ section }: ThreadViewExamplesProps) {
  if (section === 'default') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <ThreadView
          messages={messages}
          currentUserId="u1"
          onReact={(id: string, emoji: string) => console.log('react', id, emoji)}
          onReply={(id: string, content: string) => console.log('reply', id, content)}
        />
      </div>
    )
  }

  return null
}
