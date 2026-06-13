'use client'

import * as React from 'react'
import { FlowEditor } from '@refraction-ui/react-flow-editor'
import type { FlowNode, FlowEdge } from '@refraction-ui/react-flow-editor'

interface FlowEditorExamplesProps {
  section: 'architecture' | 'decision-tree' | 'selected-node'
}

export function FlowEditorExamples({ section }: FlowEditorExamplesProps) {
  if (section === 'architecture') {
    return <ArchitectureExample />
  }
  if (section === 'decision-tree') {
    return <DecisionTreeExample />
  }
  if (section === 'selected-node') {
    return <SelectedNodeExample />
  }
  return null
}

const ARCH_NODES: FlowNode[] = [
  { id: 'client', x: 20, y: 120, label: 'Client' },
  { id: 'api', x: 240, y: 120, label: 'API Gateway' },
  { id: 'auth', x: 460, y: 40, label: 'Auth Service' },
  { id: 'db', x: 460, y: 200, label: 'Database' },
]

const ARCH_EDGES: FlowEdge[] = [
  { id: 'e1', source: 'client', target: 'api', label: 'HTTPS' },
  { id: 'e2', source: 'api', target: 'auth', label: 'verify' },
  { id: 'e3', source: 'api', target: 'db', label: 'query' },
]

function ArchitectureExample() {
  const [selectedId, setSelectedId] = React.useState<string | undefined>()
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <FlowEditor
        nodes={ARCH_NODES}
        edges={ARCH_EDGES}
        selectedId={selectedId}
        onNodeClick={(id) => setSelectedId((prev) => (prev === id ? undefined : id))}
        aria-label="System architecture diagram"
      />
      {selectedId && (
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{selectedId}</span>
        </p>
      )}
    </div>
  )
}

const DECISION_NODES: FlowNode[] = [
  { id: 'start', x: 160, y: 20, label: 'Start' },
  { id: 'q1', x: 100, y: 120, label: 'Logged in?' },
  { id: 'login', x: 20, y: 220, label: 'Show Login' },
  { id: 'dash', x: 200, y: 220, label: 'Show Dashboard' },
]

const DECISION_EDGES: FlowEdge[] = [
  { id: 'e1', source: 'start', target: 'q1' },
  { id: 'e2', source: 'q1', target: 'login', label: 'No' },
  { id: 'e3', source: 'q1', target: 'dash', label: 'Yes' },
]

function DecisionTreeExample() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <FlowEditor
        nodes={DECISION_NODES}
        edges={DECISION_EDGES}
        showControls={false}
        aria-label="Decision tree"
      />
    </div>
  )
}

const SELECTED_NODES: FlowNode[] = [
  { id: 'a', x: 40, y: 100, label: 'Node A' },
  { id: 'b', x: 260, y: 100, label: 'Node B', selected: true },
  { id: 'c', x: 480, y: 100, label: 'Node C' },
]

const SELECTED_EDGES: FlowEdge[] = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'b', target: 'c' },
]

function SelectedNodeExample() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <p className="text-xs text-muted-foreground">
        Node B is pre-selected via the <code className="bg-muted px-1 rounded">selected</code> property.
      </p>
      <FlowEditor
        nodes={SELECTED_NODES}
        edges={SELECTED_EDGES}
        aria-label="Selected node demo"
      />
    </div>
  )
}
