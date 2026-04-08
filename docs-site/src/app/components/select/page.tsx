import { SelectExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

const selectProps = [
  { name: 'value', type: 'string', description: 'Controlled selected value.' },
  { name: 'onValueChange', type: '(value: string) => void', description: 'Callback when selection changes.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the select.' },
  { name: 'placeholder', type: 'string', default: "'Select an option'", description: 'Placeholder text.' },
  { name: 'children', type: 'ReactNode', description: 'SelectTrigger + SelectContent.' },
]

const usageCode = `import { Select, SelectTrigger, SelectContent, SelectItem } from '@refraction-ui/react-select'

export function MyComponent() {
  const [value, setValue] = useState<string>()
  return (
    <Select value={value} onValueChange={setValue} placeholder="Pick a fruit...">
      <SelectTrigger>{value || 'Pick a fruit...'}</SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectContent>
    </Select>
  )
}`

export default function SelectPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Select</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A dropdown select with accessible keyboard and ARIA support. Compound component pattern with trigger, content, and items.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/select</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">Select with placeholder and pre-selected value.</p>
        <SelectExamples section="basic" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">States</h2>
        <p className="text-sm text-muted-foreground">Disabled state prevents interaction.</p>
        <SelectExamples section="states" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={selectProps} />
      </section>
    </div>
  )
}
