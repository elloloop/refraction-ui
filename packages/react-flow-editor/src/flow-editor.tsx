import * as React from 'react'
import { InfiniteCanvas } from '@refraction-ui/react-infinite-canvas'
import {
  createFlowEditor,
  edgePath,
  nodeById,
  flowEditorVariants,
  flowNodeVariants,
  flowNodeLabelClass,
  flowEdgePathClass,
  flowEdgeLabelClass,
  type FlowNode,
  type FlowEdge,
} from '@refraction-ui/flow-editor'
import { cn } from '@refraction-ui/shared'

export type { FlowNode, FlowEdge }

export interface FlowEditorProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onSelect' | 'results' | 'color' | 'content'
  > {
  /** The nodes to render on the canvas. */
  nodes: FlowNode[]
  /** The directed edges connecting nodes. */
  edges: FlowEdge[]
  /** Called when a node is clicked; receives the node's id. */
  onNodeClick?: (id: string) => void
  /**
   * Called when a node has been dragged to a new position.
   * Receives the node id and the new (x, y) canvas coordinates.
   */
  onNodeMove?: (id: string, x: number, y: number) => void
  /** Override the rendering of individual node boxes. */
  renderNode?: (node: FlowNode) => React.ReactNode
  /** Id of the currently selected node (controlled). */
  selectedId?: string
  /** Whether to show the pan/zoom grid. */
  showGrid?: boolean
  /** Whether to show zoom/pan controls. */
  showControls?: boolean
}

/**
 * FlowEditor — a node-and-edge diagram editor.
 *
 * Renders inside `<InfiniteCanvas>` so the whole graph is pan/zoomable.
 * Edges are drawn as SVG cubic bezier paths behind the node boxes.
 * Node drag is kept deliberately simple (pointer events, no external dep).
 */
export const FlowEditor = React.forwardRef<HTMLDivElement, FlowEditorProps>(
  (
    {
      nodes,
      edges,
      onNodeClick,
      onNodeMove,
      renderNode,
      selectedId,
      showGrid = true,
      showControls = true,
      className,
      ...props
    },
    ref,
  ) => {
    const api = createFlowEditor()

    // Track pointer-drag state without triggering re-renders mid-drag.
    const dragRef = React.useRef<{
      id: string
      startPointerX: number
      startPointerY: number
      startNodeX: number
      startNodeY: number
    } | null>(null)

    const handlePointerDown = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>, node: FlowNode) => {
        if (!onNodeMove) return
        event.currentTarget.setPointerCapture(event.pointerId)
        dragRef.current = {
          id: node.id,
          startPointerX: event.clientX,
          startPointerY: event.clientY,
          startNodeX: node.x,
          startNodeY: node.y,
        }
      },
      [onNodeMove],
    )

    const handlePointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current
        if (!drag || !onNodeMove) return
        const dx = event.clientX - drag.startPointerX
        const dy = event.clientY - drag.startPointerY
        onNodeMove(drag.id, drag.startNodeX + dx, drag.startNodeY + dy)
      },
      [onNodeMove],
    )

    const handlePointerUp = React.useCallback(() => {
      dragRef.current = null
    }, [])

    return (
      <div
        ref={ref}
        className={cn(flowEditorVariants(), className)}
        {...(api.ariaProps as React.HTMLAttributes<HTMLDivElement>)}
        {...api.dataAttributes}
        {...props}
      >
        <InfiniteCanvas showGrid={showGrid} showControls={showControls}>
          {/* SVG edge layer — rendered behind nodes */}
          <svg
            className="absolute inset-0 w-full h-full overflow-visible text-muted-foreground pointer-events-none"
            aria-hidden="true"
          >
            {edges.map((edge) => {
              const src = nodeById(nodes, edge.source)
              const tgt = nodeById(nodes, edge.target)
              if (!src || !tgt) return null
              const d = edgePath(src, tgt)
              const midX = (src.x + (src.width ?? 160) + tgt.x) / 2
              const midY = (src.y + (src.height ?? 48) / 2 + tgt.y + (tgt.height ?? 48) / 2) / 2
              return (
                <g key={edge.id}>
                  <path d={d} className={flowEdgePathClass} />
                  {edge.label != null && (
                    <text
                      x={midX}
                      y={midY - 4}
                      textAnchor="middle"
                      className={flowEdgeLabelClass}
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Node layer — positioned absolutely by x/y */}
          {nodes.map((node) => {
            const isSelected = node.selected || node.id === selectedId
            const w = node.width ?? 160
            const h = node.height ?? 48
            return (
              <div
                key={node.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={node.label}
                className={flowNodeVariants({
                  selected: isSelected ? 'true' : 'false',
                })}
                style={{ left: node.x, top: node.y, width: w, height: h }}
                onClick={() => onNodeClick?.(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onNodeClick?.(node.id)
                  }
                }}
                onPointerDown={(e) => handlePointerDown(e, node)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {renderNode ? (
                  renderNode(node)
                ) : (
                  <span className={flowNodeLabelClass}>{node.label}</span>
                )}
              </div>
            )
          })}
        </InfiniteCanvas>
      </div>
    )
  },
)

FlowEditor.displayName = 'FlowEditor'
