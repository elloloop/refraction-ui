import { ProgressDisplayExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const progressProps = [
  { name: 'stats (StatsGrid)', type: 'StatCardData[]', description: 'Array of { label, value, color?, icon? }.' },
  { name: 'value (ProgressBar)', type: 'number', description: 'Current progress value.' },
  { name: 'max (ProgressBar)', type: 'number', default: '100', description: 'Maximum value.' },
  { name: 'size (ProgressBar)', type: "'sm' | 'md' | 'lg'", description: 'Size of the progress bar.' },
  { name: 'badges (BadgeDisplay)', type: 'BadgeData[]', description: 'Array of { name, icon, isUnlocked }.' },
]

const usageCode = `import { StatsGrid, ProgressBar, BadgeDisplay } from '@refraction-ui/react-progress-display'

export function Dashboard() {
  return (
    <div>
      <StatsGrid stats={[{ label: 'Users', value: '1,234', color: 'primary' }]} />
      <ProgressBar value={75} />
      <BadgeDisplay badges={[{ name: 'Pioneer', icon: '🌟', isUnlocked: true }]} />
    </div>
  )
}`

export default function ProgressDisplayPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Progress Display</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Stats grid, progress bar, and badge display components for dashboards and data visualization.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/progress-display</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Stats cards, progress bars with sizes, and achievement badges.</p>
        <ProgressDisplayExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-progress-display" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={progressProps} />
      </section>
    </div>
  )
}
