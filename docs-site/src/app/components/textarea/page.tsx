import { TextareaExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const textareaProps = [
  { name: 'size', type: "'sm' | 'default' | 'lg'", default: "'default'", description: 'Size of the textarea.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the textarea.' },
  { name: 'readOnly', type: 'boolean', default: 'false', description: 'Makes the textarea read-only.' },
  { name: 'maxRows', type: 'number', description: 'Maximum number of visible rows.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes to apply.' },
]

const usageCode = `import { Textarea } from '@refraction-ui/react-textarea'

export function MyComponent() {
  return (
    <div className="space-y-4">
      <Textarea placeholder="Enter your message..." />
      <Textarea size="lg" rows={5} />
      <Textarea disabled placeholder="Disabled" />
    </div>
  )
}`

export default function TextareaPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Textarea</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A multi-line text input with size variants, placeholder, and disabled/read-only states.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/textarea</code> core.
        </p>
      </div>

      {/* Live Example — first */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">Three size variants for different contexts.</p>
        <TextareaExamples section="sizes" />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-textarea" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      <div className="h-px bg-border" />

      {/* States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">States</h2>
        <p className="text-sm text-muted-foreground">Placeholder, disabled, and read-only states.</p>
        <TextareaExamples section="states" />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={textareaProps} />
      </section>
    </div>
  )
}
