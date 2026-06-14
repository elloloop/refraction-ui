import { StatGridExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const statGridProps = [
  {
    name: 'items',
    type: '{ value: React.ReactNode; label: React.ReactNode }[]',
    description: 'The stat callouts to display. Each item has a value (large, bold) and a label (small, muted).',
  },
  {
    name: 'columns',
    type: 'number',
    description:
      'Override the number of grid columns. Defaults to statColumns(items.length): 1 → 1, 2 → 2, 3+ → 3.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the grid container.',
  },
]

const usageCode = `import { StatGrid } from '@refraction-ui/react'

export function HeroStats() {
  return (
    <StatGrid
      items={[
        { value: '10k+', label: 'Active users worldwide' },
        { value: '$4.2M', label: 'Revenue generated for customers' },
        { value: '99.9%', label: 'Uptime SLA across all regions' },
      ]}
    />
  )
}`

export default function StatGridPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Stat Grid</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A marketing-style grid of stat callouts — each showing a large bold value and a
          small muted label. Column count auto-scales with item count (capped at 3) or can
          be set explicitly.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Three stats</h2>
        <p className="text-sm text-muted-foreground">
          The default layout: three items produce three equal columns.
        </p>
        <StatGridExamples section="three-stats" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Two stats</h2>
        <p className="text-sm text-muted-foreground">
          Two items automatically produce two columns — no override needed.
        </p>
        <StatGridExamples section="two-stats" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Custom columns</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">columns</code> to override the
          auto-computed column count — here four items in two columns.
        </p>
        <StatGridExamples section="custom-columns" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={statGridProps} />
      </section>
    </div>
  )
}
