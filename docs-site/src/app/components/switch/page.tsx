import { SwitchExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const switchProps = [
  { name: 'checked', type: 'boolean', default: 'false', description: 'Whether the switch is on.' },
  { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Callback when toggled.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the switch.' },
  { name: 'size', type: "'sm' | 'default' | 'lg'", default: "'default'", description: 'Size of the switch.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { Switch } from '@refraction-ui/react-switch'

export function MyComponent() {
  const [enabled, setEnabled] = useState(false)
  return <Switch checked={enabled} onCheckedChange={setEnabled} />
}`

export default function SwitchPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Switch</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A toggle switch with accessible keyboard and ARIA support. Three sizes and disabled state.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/switch</code> core.
        </p>
      </div>

      {/* Live Example — first */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">Three sizes: small, default, and large.</p>
        <SwitchExamples section="sizes" />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-switch" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      {/* States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">States</h2>
        <p className="text-sm text-muted-foreground">On/off and disabled states.</p>
        <SwitchExamples section="states" />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={switchProps} />
      </section>
    </div>
  )
}
