import { TooltipExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const tooltipProps = [
  { name: 'open', type: 'boolean', description: 'Controlled open state.' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Callback on open change.' },
  { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", description: 'Tooltip placement.' },
  { name: 'delayDuration', type: 'number', default: '300', description: 'Delay in ms before showing.' },
  { name: 'children', type: 'ReactNode', description: 'TooltipTrigger + TooltipContent.' },
]

const usageCode = `import { Tooltip, TooltipTrigger, TooltipContent } from '@refraction-ui/react-tooltip'

export function MyComponent() {
  return (
    <Tooltip>
      <TooltipTrigger>
        <button>Hover me</button>
      </TooltipTrigger>
      <TooltipContent>Helpful tooltip text</TooltipContent>
    </Tooltip>
  )
}`

export default function TooltipPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tooltip</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A hover-triggered tooltip with configurable delay, placement, and portal rendering.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/tooltip</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Hover over the buttons to see tooltips with different delay durations.</p>
        <TooltipExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-tooltip" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={tooltipProps} />
      </section>
    </div>
  )
}
