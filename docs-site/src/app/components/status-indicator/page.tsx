import { StatusIndicatorExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
const statusProps = [
  { name: 'status', type: "'success' | 'warning' | 'error' | 'info' | 'neutral'", description: 'Status type with corresponding color.' },
  { name: 'label', type: 'string', description: 'Status label text.' },
  { name: 'pulse', type: 'boolean', default: 'false', description: 'Enable pulse animation.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { StatusIndicator } from '@refraction-ui/react-status-indicator'
export function MyComponent() {
  return <StatusIndicator status="success" label="Operational" pulse />
}`
export default function StatusIndicatorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Status Indicator</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Colored status dots with labels and optional pulse animation for system status displays.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/status-indicator</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Five status types with colors and optional pulse.</p>
        <StatusIndicatorExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock code={usageCode} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={statusProps} /></section>
    </div>
  )
}
