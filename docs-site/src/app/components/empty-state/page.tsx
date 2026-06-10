import { EmptyStateExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const emptyStateProps = [
  {
    name: 'title',
    type: 'React.ReactNode',
    description: 'Primary heading (required).',
  },
  {
    name: 'description',
    type: 'React.ReactNode',
    description: 'Optional supporting copy. Supports rich children (e.g. an emphasized email).',
  },
  {
    name: 'icon',
    type: 'React.ReactNode',
    description: 'Optional icon rendered inside a tone-tinted rounded chip.',
  },
  {
    name: 'tone',
    type: "'neutral' | 'success' | 'warning' | 'danger'",
    default: "'neutral'",
    description: 'Tints the icon chip background and foreground.',
  },
  {
    name: 'actions',
    type: 'React.ReactNode',
    description: 'Optional action row, centered under the description.',
  },
  {
    name: 'bordered',
    type: 'boolean',
    default: 'false',
    description: 'Wraps the content in a rounded card surface with a border.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { EmptyState, ConfirmationCard } from '@refraction-ui/react-empty-state'

export function MyComponent() {
  return (
    <EmptyState
      icon={<InboxIcon />}
      title="No messages yet"
      description="When you receive messages, they'll show up here."
      actions={<button>Compose</button>}
    />
  )
}

// ConfirmationCard is EmptyState with bordered defaulting to true
export function CheckEmail() {
  return (
    <ConfirmationCard
      icon={<MailIcon />}
      tone="success"
      title="Check your email"
      description={<>We sent a sign-in link to <strong>jane@example.com</strong>.</>}
    />
  )
}`

export default function EmptyStatePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Empty State</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A centered column for empty/zero-result states and inline confirmations.
          Includes <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">ConfirmationCard</code>,
          a bordered preset for messages like &quot;Check your email&quot;.
        </p>
      </div>

      {/* Basic */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          An icon chip, title, description, and an optional action row.
        </p>
        <EmptyStateExamples section="basic" />
      </section>

      {/* Tones */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Tones</h2>
        <p className="text-sm text-muted-foreground">
          The <code className="text-xs bg-muted px-1 rounded">tone</code> prop tints the icon chip.
        </p>
        <EmptyStateExamples section="tones" />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-empty-state" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      {/* Confirmation */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Confirmation</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">ConfirmationCard</code> is{' '}
          <code className="text-xs bg-muted px-1 rounded">EmptyState</code> with{' '}
          <code className="text-xs bg-muted px-1 rounded">bordered</code> defaulting to true — ideal
          for a &quot;Check your email&quot; message after sending a magic link.
        </p>
        <EmptyStateExamples section="confirmation" />
      </section>

      {/* Bordered */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Bordered</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">bordered</code> to render the content
          on a card surface.
        </p>
        <EmptyStateExamples section="bordered" />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={emptyStateProps} />
      </section>
    </div>
  )
}
