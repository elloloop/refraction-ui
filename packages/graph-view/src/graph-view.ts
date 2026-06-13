/** Visual mastery state of a node in the knowledge graph. */
export type GraphNodeState = 'mastered' | 'in-progress' | 'not-started' | 'highlight'

/** A concept node in the knowledge / dependency graph. */
export interface GraphNode {
  /** Unique identifier. */
  id: string
  /** X position in the graph canvas (pixels). */
  x: number
  /** Y position in the graph canvas (pixels). */
  y: number
  /** Human-readable label shown in the node chip. */
  label: string
  /** Visual mastery state. Defaults to `'not-started'`. */
  state?: GraphNodeState
}

/** A directed edge connecting two nodes. */
export interface GraphEdge {
  /** Unique identifier. */
  id: string
  /** ID of the source node. */
  source: string
  /** ID of the target node. */
  target: string
}

/** Axis-aligned bounding box of a set of nodes. */
export interface GraphBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

/** Per-state counts returned by {@link summarizeStates}. */
export type GraphStateSummary = Record<GraphNodeState, number>

export interface GraphViewAPI {
  /** ARIA/role attributes to spread on the graph container. */
  ariaProps: { role: string; 'aria-label': string }
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build framework-agnostic container props for a GraphView.
 *
 * The graph is a read-only knowledge / dependency visualisation. It uses
 * `role="group"` (not `role="img"`) so that interactive node chips inside it
 * remain in the accessibility tree and keyboard reachable.
 */
export function createGraphView(): GraphViewAPI {
  return {
    ariaProps: {
      role: 'group',
      'aria-label': 'Knowledge graph',
    },
    dataAttributes: {},
  }
}

/**
 * Look up a node by id. Returns `undefined` when not found.
 */
export function nodeById(nodes: GraphNode[], id: string): GraphNode | undefined {
  return nodes.find((n) => n.id === id)
}

/**
 * Build an SVG cubic-bezier path `d` string between two node positions.
 *
 * The control points bend the curve vertically so edges arc gracefully between
 * horizontally or vertically offset nodes. Works for any pair of positions.
 */
export function graphEdgePath(source: GraphNode, target: GraphNode): string {
  const sx = source.x
  const sy = source.y
  const tx = target.x
  const ty = target.y

  // Control-point offset: half the vertical distance, minimum 40px.
  const dy = Math.abs(ty - sy)
  const offset = Math.max(dy * 0.5, 40)

  return `M ${sx} ${sy} C ${sx} ${sy + offset}, ${tx} ${ty - offset}, ${tx} ${ty}`
}

/**
 * Compute the axis-aligned bounding box of a set of nodes.
 *
 * Returns zero-area bounds centred at the origin when the array is empty.
 */
export function graphBounds(nodes: GraphNode[]): GraphBounds {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 }
  }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const n of nodes) {
    if (n.x < minX) minX = n.x
    if (n.y < minY) minY = n.y
    if (n.x > maxX) maxX = n.x
    if (n.y > maxY) maxY = n.y
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY }
}

/**
 * Count nodes per mastery state.
 *
 * Nodes without an explicit `state` are counted as `'not-started'`.
 */
export function summarizeStates(nodes: GraphNode[]): GraphStateSummary {
  const counts: GraphStateSummary = {
    mastered: 0,
    'in-progress': 0,
    'not-started': 0,
    highlight: 0,
  }
  for (const n of nodes) {
    const s: GraphNodeState = n.state ?? 'not-started'
    counts[s] += 1
  }
  return counts
}
