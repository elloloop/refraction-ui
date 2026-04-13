import { BreadcrumbsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const breadcrumbsProps = [
  { name: 'pathname', type: 'string', description: 'Auto-generate breadcrumbs from this pathname.' },
  { name: 'items', type: 'BreadcrumbItem[]', description: 'Manual breadcrumb items (overrides pathname).' },
  { name: 'labels', type: 'Record<string, string>', description: 'Custom label map for pathname segments.' },
  { name: 'separator', type: 'string', default: "'/'", description: 'Separator character between items.' },
  { name: 'maxItems', type: 'number', description: 'Max items before truncation.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { Breadcrumbs } from '@refraction-ui/react-breadcrumbs'

export function MyComponent() {
  return <Breadcrumbs pathname="/docs/components/button" />
}`

export default function BreadcrumbsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Breadcrumbs</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A breadcrumb navigation trail. Auto-generated from pathname or manually specified items.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/breadcrumbs</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Auto-generated, custom labels, and manual breadcrumbs.</p>
        <BreadcrumbsExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-breadcrumbs" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={breadcrumbsProps} />
      </section>
    </div>
  )
}
