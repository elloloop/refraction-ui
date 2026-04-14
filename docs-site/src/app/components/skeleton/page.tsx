import { SkeletonExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const skeletonProps = [
  { name: 'shape', type: "'rectangle' | 'circle' | 'text'", description: 'Shape of the skeleton element.' },
  { name: 'width', type: 'string | number', description: 'Width of the skeleton.' },
  { name: 'height', type: 'string | number', description: 'Height of the skeleton.' },
  { name: 'animate', type: 'boolean', default: 'true', description: 'Whether to animate the pulse.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { Skeleton, SkeletonText } from '@refraction-ui/react-skeleton'

export function LoadingCard() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton shape="circle" width={48} height={48} />
      <SkeletonText lines={2} />
    </div>
  )
}`

export default function SkeletonPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Skeleton</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Placeholder loading elements with rectangle, circle, and text shapes. Includes a SkeletonText helper for multi-line blocks.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/skeleton</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Shapes</h2>
        <p className="text-sm text-muted-foreground">Rectangle, circle, and text-line shapes.</p>
        <SkeletonExamples section="shapes" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Compositions</h2>
        <p className="text-sm text-muted-foreground">Text blocks and card-style skeleton loading states.</p>
        <SkeletonExamples section="compositions" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-skeleton" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={skeletonProps} />
      </section>
    </div>
  )
}
