import { FloatingReactionsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const floatingReactionsProps = [
  {
    name: 'reactions',
    type: 'FloatingReaction[]',
    description:
      'Controlled list of active reactions. Each item has `id`, `emoji`, and optional `lane` (horizontal offset bucket 0..lanes-1).',
  },
  {
    name: 'lanes',
    type: 'number',
    default: '5',
    description: 'Total number of horizontal lane buckets used to spread reactions across the overlay.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the overlay container.',
  },
]

const usageCode = `import {
  FloatingReactions,
  useFloatingReactions,
} from '@refraction-ui/react'

export function MeetingOverlay() {
  const { reactions, emit } = useFloatingReactions()

  return (
    <div className="relative w-full h-64 bg-muted rounded-xl overflow-hidden">
      {/* Your video / content here */}
      <FloatingReactions reactions={reactions} lanes={5} />
      <button
        className="absolute bottom-4 right-4"
        onClick={() => emit('👋', { lane: 2 })}
      >
        Wave
      </button>
    </div>
  )
}`

export default function FloatingReactionsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Floating Reactions</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A transient emoji-burst overlay for meeting and live surfaces. Reactions
          float upward and fade — distinct from the static{' '}
          <code className="text-sm bg-muted px-1 rounded">ReactionBar</code> that
          shows persistent counts.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Static burst</h2>
        <p className="text-sm text-muted-foreground">
          A fixed set of reactions rendered at SSR time — useful for previews or
          server-rendered snapshots of a burst moment.
        </p>
        <FloatingReactionsExamples section="static" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Lanes</h2>
        <p className="text-sm text-muted-foreground">
          Reactions spread across horizontal lanes so simultaneous emojis don't
          stack. Lane 0 is far-left, lane N-1 is far-right.
        </p>
        <FloatingReactionsExamples section="lanes" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Interactive</h2>
        <p className="text-sm text-muted-foreground">
          Use <code className="text-xs bg-muted px-1 rounded">useFloatingReactions()</code> to
          emit reactions with automatic expiry after{' '}
          <code className="text-xs bg-muted px-1 rounded">REACTION_LIFETIME_MS</code> (3 s).
        </p>
        <FloatingReactionsExamples section="interactive" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- FloatingReactions is a React-managed overlay; use the React adapter for animated usage. -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={floatingReactionsProps} />
      </section>
    </div>
  )
}
