import { InlineEditorExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

const inlineEditorProps = [
  { name: 'value', type: 'string', description: 'Content value.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Callback when content changes.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { InlineEditor } from '@refraction-ui/react-inline-editor'

export function MyComponent() {
  const [text, setText] = useState('Edit me')
  return <InlineEditor value={text} onChange={setText} />
}`

export default function InlineEditorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Inline Editor</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          An inline view/edit toggle component for editing text content in place.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/inline-editor</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Click to toggle between view and edit mode.</p>
        <InlineEditorExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={inlineEditorProps} />
      </section>
    </div>
  )
}
