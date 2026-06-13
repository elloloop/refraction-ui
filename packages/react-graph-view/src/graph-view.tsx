import * as React from 'react'
import { InfiniteCanvas } from '@refraction-ui/react-infinite-canvas'
import {
  createGraphView,
  graphEdgePath,
  nodeById,
  summarizeStates,
  graphNodeVariants,
  graphNodeLabelClass,
  graphEdgeClass,
  graphLegendChipVariants,
  graphViewVariants,
  type GraphNode,
  type GraphEdge,
  type GraphNodeState,
} from '@refraction-ui/graph-view'
import { cn } from '@refraction-ui/shared'

export type { GraphNode, GraphEdge, GraphNodeState }

/** Labels shown in the legend for each mastery state. */
const STATE_LABELS: Record<GraphNodeState, string> = {
  mastered: 'Mastered',
  'in-progress': 'In Progress',
  'not-started': 'Not Started',
  highlight: 'Highlight',
}

/** Order in which legend states are rendered. */
const LEGEND_ORDER: GraphNodeState[] = ['mastered', 'in-progress', 'not-started', 'highlight']

export interface GraphViewProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect' | 'color' | 'content' | 'results'> {
  /** Nodes to render. */
  nodes: GraphNode[]
  /** Directed edges connecting nodes. */
  edges: GraphEdge[]
  /** Called when a node chip is clicked (read-only — no selection state). */
  onNodeClick?: (node: GraphNode) => void
  /** Show a legend summarising mastery-state counts. */
  showLegend?: boolean
}

/**
 * GraphView — a read-only knowledge / dependency graph rendered inside an
 * InfiniteCanvas (pan + zoom). Concept nodes are coloured by mastery state;
 * edges are SVG curves. An optional legend shows per-state node counts.
 *
 * The component is intentionally read-only: clicking a node fires `onNodeClick`
 * but never mutates the `nodes` array — the caller owns the data.
 */
export const GraphView = React.forwardRef<HTMLDivElement, GraphViewProps>(
  ({ nodes, edges, onNodeClick, showLegend = false, className, ...props }, ref) => {
    const api = createGraphView()
    const summary = React.useMemo(() => summarizeStates(nodes), [nodes])

    // Build a lookup map for resolving edge endpoints.
    const nodeMap = React.useMemo(() => {
      const m = new Map<string, GraphNode>()
      for (const n of nodes) m.set(n.id, n)
      return m
    }, [nodes])

    // Estimate SVG viewport from node extents (with padding).
    const padding = 80
    const xs = nodes.map((n) => n.x)
    const ys = nodes.map((n) => n.y)
    const svgWidth = nodes.length === 0 ? 400 : Math.max(...xs) + padding * 2
    const svgHeight = nodes.length === 0 ? 300 : Math.max(...ys) + padding * 2

    return (
      <div
        ref={ref}
        className={cn(graphViewVariants(), className)}
        {...api.ariaProps}
        {...api.dataAttributes}
        {...props}
      >
        <InfiniteCanvas showGrid showControls>
          {/* SVG layer for edges */}
          <svg
            width={svgWidth}
            height={svgHeight}
            aria-hidden="true"
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          >
            {edges.map((edge) => {
              const source = nodeMap.get(edge.source) ?? nodeById(nodes, edge.source)
              const target = nodeMap.get(edge.target) ?? nodeById(nodes, edge.target)
              if (!source || !target) return null
              return (
                <path
                  key={edge.id}
                  d={graphEdgePath(source, target)}
                  className={graphEdgeClass}
                />
              )
            })}
          </svg>

          {/* Node chips positioned absolutely */}
          {nodes.map((node) => {
            const state: GraphNodeState = node.state ?? 'not-started'
            const interactive = onNodeClick !== undefined
            return (
              <button
                key={node.id}
                type="button"
                aria-label={node.label}
                data-state={state}
                className={cn(
                  graphNodeVariants({ state, interactive: interactive ? 'true' : 'false' }),
                )}
                style={{ left: node.x, top: node.y }}
                onClick={onNodeClick ? () => onNodeClick(node) : undefined}
              >
                <span className={graphNodeLabelClass}>{node.label}</span>
              </button>
            )
          })}
        </InfiniteCanvas>

        {/* Optional legend */}
        {showLegend && (
          <div
            role="list"
            aria-label="Graph legend"
            className="absolute bottom-3 left-3 flex flex-wrap gap-1.5"
          >
            {LEGEND_ORDER.filter((s) => summary[s] > 0).map((s) => (
              <span
                key={s}
                role="listitem"
                className={graphLegendChipVariants({ state: s })}
              >
                {STATE_LABELS[s]}
                <span className="opacity-70">{summary[s]}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    )
  },
)

GraphView.displayName = 'GraphView'
