import { ResizableLayoutExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const layoutProps = [
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Whether panes are arranged in a row or a column.',
  },
  {
    name: 'defaultSizes',
    type: 'number[]',
    default: '[50, 50]',
    description: 'Initial size of each pane, as a percentage. Length must match the pane count.',
  },
  {
    name: 'minSizes',
    type: 'number[]',
    description: 'Minimum percentage each pane may shrink to while dragging.',
  },
  {
    name: 'maxSizes',
    type: 'number[]',
    description: 'Maximum percentage each pane may grow to while dragging.',
  },
  {
    name: 'persistKey',
    type: 'string',
    description: 'localStorage key to persist sizes across reloads.',
  },
  {
    name: 'onSizesChange',
    type: '(sizes: number[]) => void',
    description: 'Called with the new size array whenever a divider is dragged.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the container.',
  },
]

const paneProps = [
  {
    name: 'index',
    type: 'number',
    description: 'Zero-based position of the pane in the layout. Required.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the pane.',
  },
]

const dividerProps = [
  {
    name: 'index',
    type: 'number',
    description: 'Index of the divider, sitting between pane[index] and pane[index + 1]. Required.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the draggable handle.',
  },
]

const usageCode = `import {
  ResizableLayout,
  ResizablePane,
  ResizableDivider,
} from '@refraction-ui/react'

export function MyComponent() {
  return (
    <ResizableLayout defaultSizes={[40, 60]} minSizes={[20, 20]} className="h-56">
      <ResizablePane index={0}>Sidebar</ResizablePane>
      <ResizableDivider index={0} className="w-1.5 cursor-col-resize bg-border" />
      <ResizablePane index={1}>Content</ResizablePane>
    </ResizableLayout>
  )
}`

export default function ResizableLayoutPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Resizable Layout</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A flex container of panes separated by draggable dividers, using pointer events for
          mouse and touch. Built on the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/resizable-layout</code> core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Horizontal</h2>
        <p className="text-sm text-muted-foreground">
          Drag the divider to resize. Each pane is addressed by its{' '}
          <code className="text-xs bg-muted px-1 rounded">index</code>, and the divider sits between two panes.
        </p>
        <ResizableLayoutExamples section="horizontal" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-resizable-layout" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Vertical</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">orientation=&quot;vertical&quot;</code> to stack panes and drag vertically.
        </p>
        <ResizableLayoutExamples section="vertical" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Multiple panes &amp; persistence</h2>
        <p className="text-sm text-muted-foreground">
          Add more panes and dividers, and pass <code className="text-xs bg-muted px-1 rounded">persistKey</code> to remember
          sizes across reloads via localStorage.
        </p>
        <ResizableLayoutExamples section="persisted" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ResizableLayout props</h2>
        <PropsTable props={layoutProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ResizablePane props</h2>
        <PropsTable props={paneProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ResizableDivider props</h2>
        <PropsTable props={dividerProps} />
      </section>
    </div>
  )
}
