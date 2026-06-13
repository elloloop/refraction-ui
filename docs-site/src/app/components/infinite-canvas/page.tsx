import { InfiniteCanvasExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const infiniteCanvasProps = [
  {
    name: 'zoom',
    type: 'number',
    description: 'Controlled zoom level (1 = 100 %).',
  },
  {
    name: 'x',
    type: 'number',
    description: 'Controlled pan offset on the x-axis (pixels).',
  },
  {
    name: 'y',
    type: 'number',
    description: 'Controlled pan offset on the y-axis (pixels).',
  },
  {
    name: 'pan',
    type: 'boolean',
    default: 'true',
    description: 'Enable pointer-drag-to-pan in uncontrolled mode.',
  },
  {
    name: 'minZoom',
    type: 'number',
    default: '0.25',
    description: 'Minimum zoom level.',
  },
  {
    name: 'maxZoom',
    type: 'number',
    default: '4',
    description: 'Maximum zoom level.',
  },
  {
    name: 'showGrid',
    type: 'boolean',
    default: 'false',
    description: 'Show a dot-grid background using the border semantic token.',
  },
  {
    name: 'showControls',
    type: 'boolean',
    default: 'false',
    description: 'Show zoom-controls overlay (+, −, fit).',
  },
  {
    name: 'onTransformChange',
    type: '(transform: CanvasTransform) => void',
    description: 'Called whenever the pan/zoom transform changes.',
  },
  {
    name: 'contentBounds',
    type: 'Bounds',
    description: 'Axis-aligned bounding box of canvas content used by the fit control.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes (typically w-full h-full).',
  },
]

const usageCode = `import { InfiniteCanvas } from '@refraction-ui/react'

export function MyBoard() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <InfiniteCanvas showGrid showControls className="w-full h-full">
        {/* render nodes with absolute positioning */}
        <div className="absolute top-8 left-8 rounded border p-4">Node A</div>
        <div className="absolute top-8 left-64 rounded border p-4">Node B</div>
      </InfiniteCanvas>
    </div>
  )
}`

export default function InfiniteCanvasPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Infinite Canvas</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A pan/zoom viewport foundation for whiteboard, system-design, and
          goal-graph surfaces. Renders a clipped container that applies a CSS
          transform to a content layer — other canvas components render into it
          with absolute positioning.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic with grid</h2>
        <p className="text-sm text-muted-foreground">
          An uncontrolled canvas with a dot-grid background. Scroll to zoom,
          drag to pan.
        </p>
        <InfiniteCanvasExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Zoom controls</h2>
        <p className="text-sm text-muted-foreground">
          Pass{' '}
          <code className="text-xs bg-muted px-1 rounded">showControls</code>{' '}
          to add an overlay with + / − / fit buttons.
        </p>
        <InfiniteCanvasExamples section="controls" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Fit to content</h2>
        <p className="text-sm text-muted-foreground">
          Provide{' '}
          <code className="text-xs bg-muted px-1 rounded">contentBounds</code>{' '}
          and the ⊞ button fits and centers the canvas on those bounds.
        </p>
        <InfiniteCanvasExamples section="fit" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro: use <InfiniteCanvas> from @refraction-ui/astro (SSR-only, no interactivity) -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={infiniteCanvasProps} />
      </section>
    </div>
  )
}
