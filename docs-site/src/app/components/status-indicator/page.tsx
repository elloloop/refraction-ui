import { StatusIndicatorExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const statusProps = [
  {
    name: 'type',
    type: "'success' | 'error' | 'warning' | 'info' | 'pending' | 'neutral'",
    description: 'Status kind. Drives the dot color and the derived aria-label.',
  },
  {
    name: 'label',
    type: 'string',
    description: 'Explicit text label. Takes precedence over children.',
  },
  {
    name: 'children',
    type: 'ReactNode',
    description:
      'Composable label content. Used when `label` is omitted (issue #200). String children also derive the aria-label.',
  },
  {
    name: 'pulse',
    type: 'boolean',
    default: "type === 'pending'",
    description: 'Animated pulse ring. Defaults on for `pending`.',
  },
  {
    name: 'showLabel',
    type: 'boolean',
    default: 'true',
    description:
      'Render the visible label span. Set to `false` for dot-only mode — the aria-label is still announced.',
  },
  { name: 'className', type: 'string', description: 'Additional CSS classes on the wrapper.' },
]

const usageCode = `import { StatusIndicator } from '@refraction-ui/react'

export function ConnectionRows() {
  return (
    <div className="space-y-2">
      {/* Explicit label */}
      <StatusIndicator type="success" label="Operational" pulse />

      {/* Composable children — matches the rest of refraction-ui (Card / Dialog / Callout) */}
      <StatusIndicator type="success">Microphone · Built-in · ready</StatusIndicator>

      {/* Dot only — aria-label still announces */}
      <StatusIndicator type="error" label="API offline" showLabel={false} />
    </div>
  )
}`

export default function StatusIndicatorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Status Indicator</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Colored status dots with labels and optional pulse animation for system-status displays.
          Uses the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">
            @refraction-ui/status-indicator
          </code>{' '}
          core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">
          Six status types — pulse is on by default for{' '}
          <code className="text-xs bg-muted px-1 rounded">pending</code>.
        </p>
        <StatusIndicatorExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Composable label</h2>
        <p className="text-sm text-muted-foreground">
          When <code className="text-xs bg-muted px-1 rounded">label</code> is omitted, children
          become the visible label. String children also derive the{' '}
          <code className="text-xs bg-muted px-1 rounded">aria-label</code>.
        </p>
        <StatusIndicatorExamples section="children" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Dot only</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">showLabel={'{false}'}</code> hides the
          visible label but keeps the aria-label — useful in dense tables.
        </p>
        <StatusIndicatorExamples section="show-label" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-status-indicator" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock
          frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={statusProps} />
      </section>
    </div>
  )
}
