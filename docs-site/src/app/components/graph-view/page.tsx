import { GraphViewExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const graphViewProps = [
  {
    name: 'nodes',
    type: 'GraphNode[]',
    description:
      'Array of concept / module nodes. Each node has `id`, `x`, `y`, `label`, and an optional `state`.',
  },
  {
    name: 'edges',
    type: 'GraphEdge[]',
    description: 'Directed edges connecting nodes by `source` and `target` IDs.',
  },
  {
    name: 'onNodeClick',
    type: '(node: GraphNode) => void',
    description:
      'Optional click handler. When provided the node chips become interactive buttons.',
  },
  {
    name: 'showLegend',
    type: 'boolean',
    default: 'false',
    description: 'Render a legend showing per-state node counts.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the outer container.',
  },
]

const usageCode = `import { GraphView } from '@refraction-ui/react'
import type { GraphNode, GraphEdge } from '@refraction-ui/react'

const nodes: GraphNode[] = [
  { id: 'a', x: 100, y: 80,  label: 'Arrays',  state: 'mastered' },
  { id: 'b', x: 100, y: 200, label: 'Sorting',  state: 'in-progress' },
  { id: 'c', x: 100, y: 320, label: 'Graphs',   state: 'not-started' },
]

const edges: GraphEdge[] = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'b', target: 'c' },
]

export function KnowledgeMap() {
  return (
    <GraphView
      nodes={nodes}
      edges={edges}
      showLegend
      aria-label="Learning path"
      className="min-h-[400px]"
    />
  )
}`

export default function GraphViewPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Graph View</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A read-only knowledge and dependency graph rendered inside an InfiniteCanvas
          (pan + zoom). Concept nodes are coloured by mastery state; edges are smooth
          SVG curves. Designed for goal graphs, learning maps, and package dependency
          visualisations.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Knowledge map</h2>
        <p className="text-sm text-muted-foreground">
          A typical algorithm learning map with all four mastery states and an
          auto-generated legend. Pan and zoom with the InfiniteCanvas controls.
        </p>
        <GraphViewExamples section="knowledge-map" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Node states + legend</h2>
        <p className="text-sm text-muted-foreground">
          The four node states:{' '}
          <code className="text-xs bg-muted px-1 rounded">mastered</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">in-progress</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">not-started</code>, and{' '}
          <code className="text-xs bg-muted px-1 rounded">highlight</code>. The
          legend is driven by{' '}
          <code className="text-xs bg-muted px-1 rounded">showLegend</code>.
        </p>
        <GraphViewExamples section="node-states" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Dependency graph</h2>
        <p className="text-sm text-muted-foreground">
          Package dependency graph with an <code className="text-xs bg-muted px-1 rounded">onNodeClick</code>{' '}
          handler. When a handler is provided the node chips become focusable
          buttons — click any node to see its label below.
        </p>
        <GraphViewExamples section="dependency-graph" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro SSR static graph via GraphView.astro -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={graphViewProps} />
      </section>
    </div>
  )
}
