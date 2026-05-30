import { ConversationExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const chatProps = [
  { name: 'conversation', type: 'UseConversationResult', description: 'The store + bound actions returned by useConversation().' },
  { name: 'showConversationList', type: 'boolean', description: 'Show the conversation-list sidebar. Default true.' },
  { name: 'showModeToggle', type: 'boolean', description: 'Show the inline/panel threading toggle in the header. Default true.' },
  { name: 'placeholder', type: 'string', description: 'Composer placeholder text.' },
  { name: 'currentUserId', type: 'string', description: 'Local user id — controls which messages are editable/deletable.' },
  { name: 'emptyState', type: 'ReactNode', description: 'Rendered when the active conversation has no messages.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { useConversation, Chat, type ChatTransport } from '@refraction-ui/react-conversation'

// Your backend, behind the transport contract — nothing else knows about it:
const transport: ChatTransport = {
  name: 'my-api',
  async *send({ message, history, signal }) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
      signal,
    })
    const reader = res.body!.getReader()
    const dec = new TextDecoder()
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      yield { delta: dec.decode(value) } // streams token-by-token into the UI
    }
  },
}

export function MyChat() {
  const conversation = useConversation({ transport })
  return <Chat conversation={conversation} />
}`

export default function ConversationPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Chat</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A full chat UI with conversations and reply-threads. Backend-agnostic — the wire is a{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">ChatTransport</code> you supply
          (SSE / WebSocket / fetch); nothing about your backend leaks into the UI. Two threading modes, reactions,
          edit/delete, streaming, and rich content (markdown, code, gifs) via the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/conversation</code> core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">
          Toggle the threading mode and send a message to see streaming, markdown/code/gif rendering, reactions, and
          the thread panel.
        </p>
        <ConversationExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro: import { Chat } from "@refraction-ui/astro" and wire rfr:* events -->' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={chatProps} />
      </section>
    </div>
  )
}
