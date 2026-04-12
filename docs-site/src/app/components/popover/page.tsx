import { PopoverExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const popoverProps = [
  { name: 'open', type: 'boolean', description: 'Controlled open state.' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Callback on open change.' },
  { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", description: 'Preferred placement side.' },
  { name: 'children', type: 'ReactNode', description: 'PopoverTrigger + PopoverContent.' },
]

const usageCode = `import { Popover, PopoverTrigger, PopoverContent } from '@refraction-ui/react-popover'

export function MyComponent() {
  return (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>
        <p>Popover content here</p>
      </PopoverContent>
    </Popover>
  )
}`

export default function PopoverPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Popover</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A popup content panel triggered by a button. Supports placement, controlled/uncontrolled modes, and portal rendering.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/popover</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Click the trigger to open the popover content panel.</p>
        <PopoverExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-popover" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={popoverProps} />
      </section>
    </div>
  )
}
