import { MiniMapExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const miniMapProps = [
  {
    name: 'items',
    type: 'MiniMapItem[]',
    description:
      'Items to render as dots. Each item has `id`, `x`, `y`, and optional `width`/`height` in world coordinates.',
  },
  {
    name: 'viewport',
    type: 'Rect',
    description:
      'Current viewport in world coordinates `{ x, y, width, height }`. When provided, renders a viewport indicator rectangle.',
  },
  {
    name: 'width',
    type: 'number',
    default: '200',
    description: 'Width of the minimap box in px.',
  },
  {
    name: 'height',
    type: 'number',
    default: '140',
    description: 'Height of the minimap box in px.',
  },
  {
    name: 'padding',
    type: 'number',
    default: '8',
    description: 'Inset padding in px applied to all sides before fitting content.',
  },
  {
    name: 'onViewportChange',
    type: '(center: { x: number; y: number }) => void',
    description:
      'If provided, the minimap becomes interactive — click or drag to emit the new world-space center for the viewport.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the minimap container.',
  },
]

const usageCode = `import { MiniMap } from '@refraction-ui/react'
import { useState } from 'react'

const items = [
  { id: 'node-1', x: 0, y: 0, width: 120, height: 80 },
  { id: 'node-2', x: 300, y: 150, width: 100, height: 60 },
]

export function Editor() {
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 400, height: 300 })

  return (
    <MiniMap
      items={items}
      viewport={viewport}
      onViewportChange={({ x, y }) =>
        setViewport((v) => ({ ...v, x: x - v.width / 2, y: y - v.height / 2 }))
      }
    />
  )
}`

export default function MiniMapPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Mini Map</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A canvas/editor overview map — renders items as positioned dots and an
          optional draggable viewport indicator rectangle. Inspired by IDE minimaps
          and goal-graph overviews.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic overview</h2>
        <p className="text-sm text-muted-foreground">
          Pass an array of world-space items. The minimap auto-fits all of them
          into its box with uniform scaling.
        </p>
        <MiniMapExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With viewport</h2>
        <p className="text-sm text-muted-foreground">
          Add a{' '}
          <code className="text-xs bg-muted px-1 rounded">viewport</code> prop
          to display a semi-transparent indicator rectangle showing the current
          visible region.
        </p>
        <MiniMapExamples section="viewport" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Interactive</h2>
        <p className="text-sm text-muted-foreground">
          Provide{' '}
          <code className="text-xs bg-muted px-1 rounded">onViewportChange</code>{' '}
          to allow clicking or dragging to pan the viewport. The callback
          receives the new world-space center point.
        </p>
        <MiniMapExamples section="interactive" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={miniMapProps} />
      </section>
    </div>
  )
}
