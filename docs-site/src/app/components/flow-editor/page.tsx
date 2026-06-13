import { FlowEditorExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const flowEditorProps = [
  {
    name: 'nodes',
    type: 'FlowNode[]',
    description: 'Array of nodes to render. Each node has id, x, y, label and optional width/height/selected.',
  },
  {
    name: 'edges',
    type: 'FlowEdge[]',
    description: 'Array of directed edges. Each edge has id, source node id, target node id, and optional label.',
  },
  {
    name: 'onNodeClick',
    type: '(id: string) => void',
    description: 'Called with the id of the node that was clicked.',
  },
  {
    name: 'onNodeMove',
    type: '(id: string, x: number, y: number) => void',
    description: 'Called when a node is dragged to a new position. Passes the node id and new canvas coordinates.',
  },
  {
    name: 'renderNode',
    type: '(node: FlowNode) => React.ReactNode',
    description: 'Override the content rendered inside a node box.',
  },
  {
    name: 'selectedId',
    type: 'string',
    description: 'Id of the currently selected node (controlled). Adds a ring to the matching node.',
  },
  {
    name: 'showGrid',
    type: 'boolean',
    default: 'true',
    description: 'Pass to InfiniteCanvas — shows the background dot/line grid.',
  },
  {
    name: 'showControls',
    type: 'boolean',
    default: 'true',
    description: 'Pass to InfiniteCanvas — shows zoom and pan control buttons.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the outer wrapper.',
  },
]

const usageCode = `import { FlowEditor } from '@refraction-ui/react'
import type { FlowNode, FlowEdge } from '@refraction-ui/react'

const nodes: FlowNode[] = [
  { id: 'a', x: 40,  y: 100, label: 'Service A' },
  { id: 'b', x: 260, y: 100, label: 'Service B' },
]

const edges: FlowEdge[] = [
  { id: 'e1', source: 'a', target: 'b', label: 'calls' },
]

export function MyDiagram() {
  const [selectedId, setSelectedId] = React.useState<string | undefined>()

  return (
    <FlowEditor
      nodes={nodes}
      edges={edges}
      selectedId={selectedId}
      onNodeClick={(id) => setSelectedId(id)}
      aria-label="Architecture diagram"
    />
  )
}`

export default function FlowEditorPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Flow Editor</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A pan/zoom node-and-edge diagram editor for architecture diagrams and
          decision trees. Renders inside InfiniteCanvas; edges are smooth cubic
          bezier SVG paths; nodes support click and drag callbacks.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Architecture diagram</h2>
        <p className="text-sm text-muted-foreground">
          Model system components and service boundaries. Click a node to select it.
        </p>
        <FlowEditorExamples section="architecture" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Decision tree</h2>
        <p className="text-sm text-muted-foreground">
          Branching logic flows with labelled edges (Yes/No, route names, etc.).
        </p>
        <FlowEditorExamples section="decision-tree" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Selected node</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">selectedId</code> or set{' '}
          <code className="text-xs bg-muted px-1 rounded">selected: true</code> on a node
          directly to show the selection ring.
        </p>
        <FlowEditorExamples section="selected-node" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro static render via FlowEditor.astro -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={flowEditorProps} />
      </section>
    </div>
  )
}
