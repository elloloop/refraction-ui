import { SlideViewerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const slideProps = [
  { name: 'slides', type: 'SlideData[]', description: 'Array of { id, title, content, type }.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { SlideViewer } from '@refraction-ui/react-slide-viewer'
export function MyComponent() {
  return (
    <SlideViewer slides={[
      { id: '1', title: 'Slide 1', content: 'Content', type: 'text' },
    ]} />
  )
}`
export default function SlideViewerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Slide Viewer</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A slide presentation viewer with navigation controls and progress indicator.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/slide-viewer</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Navigate through slides with arrow controls.</p>
        <SlideViewerExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-slide-viewer" />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock code={usageCode} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={slideProps} /></section>
    </div>
  )
}
