import { CodeEditorExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const codeEditorProps = [
  { name: 'value', type: 'string', description: 'Code content.' },
  { name: 'onChange', type: '(value: string) => void', description: 'Callback when code changes.' },
  { name: 'language', type: 'string', description: 'Syntax highlighting language.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { CodeEditor } from '@refraction-ui/react-code-editor'
export function MyComponent() {
  const [code, setCode] = useState('const x = 1')
  return <CodeEditor value={code} onChange={setCode} language="javascript" />
}`
export default function CodeEditorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Code Editor</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A code editor with syntax highlighting and editing support.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/code-editor</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Editable code with syntax highlighting.</p>
        <CodeEditorExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-code-editor" />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={codeEditorProps} /></section>
    </div>
  )
}
