import { CardGridExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const cardGridProps = [
  {
    name: 'columns',
    type: 'number',
    default: '3',
    description:
      'Number of columns. Exposed via `data-*` attributes from the headless core; pair it with your own Tailwind grid classes for layout.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply — this is where you set the grid template.',
  },
]

const usageCode = `import { CardGrid } from '@refraction-ui/react'

export function MyComponent() {
  return (
    <CardGrid
      columns={3}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div className="rounded-lg border p-5">Analytics</div>
      <div className="rounded-lg border p-5">Automation</div>
      <div className="rounded-lg border p-5">Integrations</div>
    </CardGrid>
  )
}`

export default function CardGridPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Card Grid</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A thin layout container for arranging cards into responsive columns. Uses the
          headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/card-grid</code> core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Three columns</h2>
        <p className="text-sm text-muted-foreground">
          A standard three-column grid that collapses gracefully on smaller screens.
        </p>
        <CardGridExamples section="columns-three" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-card-grid" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Two columns</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">columns={'{2}'}</code> and adjust
          your grid classes for a wider, denser layout.
        </p>
        <CardGridExamples section="columns-two" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={cardGridProps} />
      </section>
    </div>
  )
}
