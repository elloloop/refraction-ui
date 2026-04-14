import { BadgeExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const badgeProps = [
  { name: 'variant', type: "'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'", default: "'default'", description: 'Visual style of the badge.' },
  { name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Size of the badge.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes to apply.' },
]

const usageCode = `import { Badge } from '@refraction-ui/react'

export function StatusIndicators() {
  return (
    <div className="flex gap-2">
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="destructive">Error</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  )
}`

export default function BadgePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Badge</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A status badge with 7 variants and 2 sizes. Semantic variants automatically get a <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">role=&quot;status&quot;</code> for accessibility.
        </p>
      </div>

      {/* Live Example — first */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Variants</h2>
        <p className="text-sm text-muted-foreground">Seven visual variants for different semantic meanings.</p>
        <BadgeExamples section="variants" />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-badge" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">Two sizes: small for inline use, medium (default) for standalone.</p>
        <BadgeExamples section="sizes" />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={badgeProps} />
      </section>
    </div>
  )
}
