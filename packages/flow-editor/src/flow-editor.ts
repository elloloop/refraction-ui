/** A node in the flow editor canvas. */
export type FlowNode = {
  id: string
  x: number
  y: number
  width?: number
  height?: number
  label: string
  selected?: boolean
}

/** A directed edge connecting two nodes. */
export type FlowEdge = {
  id: string
  source: string
  target: string
  label?: string
}

/** Default node dimensions used when width/height are not specified. */
const DEFAULT_NODE_WIDTH = 160
const DEFAULT_NODE_HEIGHT = 48

/**
 * Compute the center point of a node in canvas coordinates.
 * Uses the node's explicit dimensions when available, otherwise falls back to
 * the default box size.
 */
export function nodeCenter(node: FlowNode): { x: number; y: number } {
  const w = node.width ?? DEFAULT_NODE_WIDTH
  const h = node.height ?? DEFAULT_NODE_HEIGHT
  return { x: node.x + w / 2, y: node.y + h / 2 }
}

/**
 * Find a node by id. Returns `undefined` when not found; callers must guard.
 */
export function nodeById(
  nodes: FlowNode[],
  id: string,
): FlowNode | undefined {
  return nodes.find((n) => n.id === id)
}

/**
 * Produce an SVG cubic-bezier path `d` string between the anchor points of two
 * nodes. The control handles extend horizontally from each anchor so the curve
 * is smooth regardless of relative position — matching the easyloops
 * architecture-editor style.
 *
 * Source anchor: right-center of the source node.
 * Target anchor: left-center of the target node.
 */
export function edgePath(source: FlowNode, target: FlowNode): string {
  const sw = source.width ?? DEFAULT_NODE_WIDTH
  const sh = source.height ?? DEFAULT_NODE_HEIGHT
  const th = target.height ?? DEFAULT_NODE_HEIGHT

  const x1 = source.x + sw
  const y1 = source.y + sh / 2
  const x2 = target.x
  const y2 = target.y + th / 2

  const dx = Math.abs(x2 - x1)
  const handleLen = Math.max(dx * 0.5, 40)

  const cx1 = x1 + handleLen
  const cy1 = y1
  const cx2 = x2 - handleLen
  const cy2 = y2

  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
}

/**
 * Compute the bounding box that contains all nodes. Useful for fitting the
 * viewport to content. Returns zeros when the node list is empty.
 */
export function contentBounds(nodes: FlowNode[]): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const node of nodes) {
    const w = node.width ?? DEFAULT_NODE_WIDTH
    const h = node.height ?? DEFAULT_NODE_HEIGHT
    if (node.x < minX) minX = node.x
    if (node.y < minY) minY = node.y
    if (node.x + w > maxX) maxX = node.x + w
    if (node.y + h > maxY) maxY = node.y + h
  }

  return { minX, minY, maxX, maxY }
}

/** Accessibility and data attributes for the root flow editor container. */
export interface FlowEditorAPI {
  ariaProps: Record<string, string | number | boolean>
  dataAttributes: Record<string, string>
}

/**
 * Return the framework-agnostic root attributes for a FlowEditor.
 * Adapters spread `ariaProps` and `dataAttributes` on the outermost element.
 */
export function createFlowEditor(): FlowEditorAPI {
  return {
    ariaProps: {
      role: 'group',
      'aria-label': 'Flow editor',
    },
    dataAttributes: {
      'data-flow-editor': 'true',
    },
  }
}
