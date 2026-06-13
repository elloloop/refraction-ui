'use client'

import * as React from 'react'
import { GraphView } from '@refraction-ui/react-graph-view'
import type { GraphNode, GraphEdge } from '@refraction-ui/react-graph-view'

interface GraphViewExamplesProps {
  section: 'knowledge-map' | 'node-states' | 'dependency-graph'
}

// ── Knowledge map (mastery + highlight, with legend) ─────────────────────────
const knowledgeMapNodes: GraphNode[] = [
  { id: 'arrays', x: 100, y: 80, label: 'Arrays', state: 'mastered' },
  { id: 'linked-lists', x: 280, y: 80, label: 'Linked Lists', state: 'mastered' },
  { id: 'sorting', x: 100, y: 200, label: 'Sorting', state: 'in-progress' },
  { id: 'trees', x: 280, y: 200, label: 'Trees', state: 'in-progress' },
  { id: 'graphs', x: 190, y: 320, label: 'Graphs', state: 'not-started' },
  { id: 'dp', x: 380, y: 320, label: 'Dynamic Programming', state: 'highlight' },
]

const knowledgeMapEdges: GraphEdge[] = [
  { id: 'e1', source: 'arrays', target: 'sorting' },
  { id: 'e2', source: 'linked-lists', target: 'trees' },
  { id: 'e3', source: 'sorting', target: 'graphs' },
  { id: 'e4', source: 'trees', target: 'graphs' },
  { id: 'e5', source: 'trees', target: 'dp' },
]

// ── Node states example (one per state, no edges) ─────────────────────────────
const stateNodes: GraphNode[] = [
  { id: 's1', x: 80, y: 80, label: 'Mastered', state: 'mastered' },
  { id: 's2', x: 220, y: 80, label: 'In Progress', state: 'in-progress' },
  { id: 's3', x: 360, y: 80, label: 'Not Started', state: 'not-started' },
  { id: 's4', x: 500, y: 80, label: 'Highlight', state: 'highlight' },
]

// ── Dependency graph (software modules) ──────────────────────────────────────
const depNodes: GraphNode[] = [
  { id: 'core', x: 200, y: 60, label: 'core', state: 'mastered' },
  { id: 'shared', x: 200, y: 180, label: 'shared', state: 'mastered' },
  { id: 'react-core', x: 80, y: 300, label: 'react-core', state: 'in-progress' },
  { id: 'astro-core', x: 320, y: 300, label: 'astro-core', state: 'not-started' },
  { id: 'react-meta', x: 80, y: 420, label: 'react-meta', state: 'highlight' },
  { id: 'astro-meta', x: 320, y: 420, label: 'astro-meta', state: 'not-started' },
]

const depEdges: GraphEdge[] = [
  { id: 'd1', source: 'core', target: 'shared' },
  { id: 'd2', source: 'shared', target: 'react-core' },
  { id: 'd3', source: 'shared', target: 'astro-core' },
  { id: 'd4', source: 'react-core', target: 'react-meta' },
  { id: 'd5', source: 'astro-core', target: 'astro-meta' },
]

export function GraphViewExamples({ section }: GraphViewExamplesProps) {
  if (section === 'knowledge-map') {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <GraphView
          nodes={knowledgeMapNodes}
          edges={knowledgeMapEdges}
          showLegend
          aria-label="Algorithm learning map"
          className="min-h-[420px]"
        />
      </div>
    )
  }

  if (section === 'node-states') {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <GraphView
          nodes={stateNodes}
          edges={[]}
          showLegend
          aria-label="Node state showcase"
          className="min-h-[200px]"
        />
      </div>
    )
  }

  if (section === 'dependency-graph') {
    return <DependencyGraphExample />
  }

  return null
}

function DependencyGraphExample() {
  const [clicked, setClicked] = React.useState<string | null>(null)
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <GraphView
        nodes={depNodes}
        edges={depEdges}
        showLegend
        onNodeClick={(n) => setClicked(n.label)}
        aria-label="Package dependency graph"
        className="min-h-[500px]"
      />
      {clicked && (
        <p className="text-sm text-muted-foreground">
          Last clicked: <strong>{clicked}</strong>
        </p>
      )}
    </div>
  )
}
