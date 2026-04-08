import { CollapsibleExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const collapsibleProps = [
  { name: 'open', type: 'boolean', description: 'Controlled open state.' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state (uncontrolled).' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Callback when open state changes.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the collapsible.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@refraction-ui/react-collapsible'

export function MyComponent() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Toggle content</CollapsibleTrigger>
      <CollapsibleContent>
        <p>Hidden content revealed on click.</p>
      </CollapsibleContent>
    </Collapsible>
  )
}`

export default function CollapsiblePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Collapsible</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A compound component for toggling content visibility. Supports controlled and uncontrolled modes.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/collapsible</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Click the trigger to toggle content. The second section starts open by default.</p>
        <CollapsibleExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-collapsible" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={collapsibleProps} />
      </section>
    </div>
  )
}
