import { PresenceIndicatorExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const presenceProps = [
  { name: 'status', type: "'online' | 'away' | 'busy' | 'offline'", description: 'Current presence status.' },
  { name: 'showLabel', type: 'boolean', default: 'false', description: 'Show status label text.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { PresenceIndicator } from '@refraction-ui/react-presence-indicator'
export function MyComponent() {
  return <PresenceIndicator status="online" showLabel />
}`
export default function PresenceIndicatorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Presence Indicator</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Colored status dots showing online, away, busy, or offline presence.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/presence-indicator</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Four presence states with optional labels.</p>
        <PresenceIndicatorExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-presence-indicator" />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={presenceProps} /></section>
    </div>
  )
}
