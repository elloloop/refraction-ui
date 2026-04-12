import { CheckboxExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const checkboxProps = [
  { name: 'checked', type: "boolean | 'indeterminate'", default: 'false', description: 'Checked state of the checkbox.' },
  { name: 'onCheckedChange', type: "(checked: CheckedState) => void", description: 'Callback when state changes.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the checkbox.' },
  { name: 'size', type: "'sm' | 'default' | 'lg'", default: "'default'", description: 'Size of the checkbox.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { Checkbox } from '@refraction-ui/react-checkbox'

export function MyComponent() {
  const [checked, setChecked] = useState(false)
  return (
    <label className="flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={setChecked} />
      <span>Accept terms</span>
    </label>
  )
}`

export default function CheckboxPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Checkbox</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A checkbox with checked, unchecked, and indeterminate states. Accessible keyboard and ARIA support.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/checkbox</code> core.
        </p>
      </div>

      {/* Live Example — first */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">States</h2>
        <p className="text-sm text-muted-foreground">Unchecked, checked, indeterminate, and disabled states.</p>
        <CheckboxExamples section="states" />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-checkbox" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">Three sizes: small, default, and large.</p>
        <CheckboxExamples section="sizes" />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={checkboxProps} />
      </section>
    </div>
  )
}
