import { ThreadViewExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const threadViewProps = [
  {
    name: 'messages',
    type: 'MessageData[]',
    description:
      'The thread to render. Each message carries an author, content, timestamp, and optional reactions, replies, attachments, and edited flag.',
  },
  {
    name: 'currentUserId',
    type: 'string',
    description: "Id of the viewing user, used for ARIA labelling and ownership cues.",
  },
  {
    name: 'onReply',
    type: '(messageId: string, content: string) => void',
    description: 'Called when the user submits a reply to a message.',
  },
  {
    name: 'onReact',
    type: '(messageId: string, emoji: string) => void',
    description: 'Called when the user toggles a reaction on a message.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the thread container.',
  },
]

const usageCode = `import { ThreadView, type MessageData } from '@refraction-ui/react'

const messages: MessageData[] = [
  {
    id: 'm1',
    author: { id: 'u1', name: 'Alice' },
    content: 'Shipping the new thread view today 🚀',
    timestamp: new Date(),
    reactions: [{ emoji: '🚀', count: 3, userReacted: true }],
  },
]

export function Conversation() {
  return (
    <ThreadView
      messages={messages}
      currentUserId="u1"
      onReact={(id, emoji) => toggleReaction(id, emoji)}
      onReply={(id, content) => sendReply(id, content)}
    />
  )
}`

export default function ThreadViewPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Thread View</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A conversation thread that renders messages with avatars, relative timestamps, reactions,
          reply indicators, and attachments. Backed by the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/thread-view</code> core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Default</h2>
        <p className="text-sm text-muted-foreground">
          A thread with a reaction, a nested reply count, an edited message, and an attachment.
        </p>
        <ThreadViewExamples section="default" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-thread-view" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={threadViewProps} />
      </section>
    </div>
  )
}
