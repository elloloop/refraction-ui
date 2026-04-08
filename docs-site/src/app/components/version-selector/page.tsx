import { VersionSelectorExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

const versionProps = [
  { name: 'value', type: 'string', description: 'Selected version value.' },
  { name: 'onValueChange', type: '(value: string) => void', description: 'Callback when version changes.' },
  { name: 'versions', type: 'VersionOption[]', description: 'Array of { value, label, isLatest? }.' },
  { name: 'placeholder', type: 'string', default: "'Select version...'", description: 'Placeholder text.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { VersionSelector } from '@refraction-ui/react-version-selector'

export function MyComponent() {
  const [version, setVersion] = useState('3.0.0')
  return (
    <VersionSelector
      value={version}
      onValueChange={setVersion}
      versions={[
        { value: '3.0.0', label: 'v3.0.0', isLatest: true },
        { value: '2.0.0', label: 'v2.0.0' },
      ]}
    />
  )
}`

export default function VersionSelectorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Version Selector</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A dropdown for selecting software versions with a "Latest" badge indicator.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/version-selector</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Version dropdown with latest badge.</p>
        <VersionSelectorExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={versionProps} />
      </section>
    </div>
  )
}
