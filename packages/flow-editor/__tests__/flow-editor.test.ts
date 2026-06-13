import { describe, it, expect } from 'vitest'
import {
  nodeCenter,
  edgePath,
  contentBounds,
  createFlowEditor,
  nodeById,
} from '../src/index.js'
import type { FlowNode } from '../src/index.js'

const makeNode = (overrides: Partial<FlowNode> = {}): FlowNode => ({
  id: 'a',
  x: 0,
  y: 0,
  label: 'Node A',
  ...overrides,
})

describe('nodeCenter', () => {
  it('uses default dimensions when width/height are absent', () => {
    const center = nodeCenter(makeNode({ x: 0, y: 0 }))
    // Default: 160×48 → center at (80, 24)
    expect(center).toEqual({ x: 80, y: 24 })
  })

  it('uses explicit dimensions', () => {
    const center = nodeCenter(makeNode({ x: 10, y: 20, width: 100, height: 40 }))
    expect(center).toEqual({ x: 60, y: 40 })
  })
})

describe('nodeById', () => {
  it('returns the matching node', () => {
    const nodes = [makeNode({ id: 'a' }), makeNode({ id: 'b' })]
    expect(nodeById(nodes, 'b')?.id).toBe('b')
  })

  it('returns undefined for unknown ids', () => {
    expect(nodeById([makeNode()], 'z')).toBeUndefined()
  })
})

describe('edgePath', () => {
  it('returns a string starting with M', () => {
    const src = makeNode({ id: 'a', x: 0, y: 0 })
    const tgt = makeNode({ id: 'b', x: 300, y: 0 })
    const d = edgePath(src, tgt)
    expect(typeof d).toBe('string')
    expect(d.trimStart().startsWith('M')).toBe(true)
  })

  it('contains a cubic bezier command C', () => {
    const src = makeNode({ id: 'a', x: 0, y: 0 })
    const tgt = makeNode({ id: 'b', x: 200, y: 100 })
    expect(edgePath(src, tgt)).toContain('C')
  })
})

describe('contentBounds', () => {
  it('returns zeros for an empty node list', () => {
    expect(contentBounds([])).toEqual({ minX: 0, minY: 0, maxX: 0, maxY: 0 })
  })

  it('computes bounds across all nodes', () => {
    const nodes: FlowNode[] = [
      makeNode({ id: 'a', x: 10, y: 20, width: 160, height: 48 }),
      makeNode({ id: 'b', x: 200, y: 5, width: 160, height: 48 }),
    ]
    const bounds = contentBounds(nodes)
    expect(bounds.minX).toBe(10)
    expect(bounds.minY).toBe(5)
    expect(bounds.maxX).toBe(360) // 200 + 160
    expect(bounds.maxY).toBe(68)  // 20 + 48
  })
})

describe('createFlowEditor', () => {
  it('exposes group role and aria-label', () => {
    const { ariaProps } = createFlowEditor()
    expect(ariaProps['role']).toBe('group')
    expect(ariaProps['aria-label']).toBe('Flow editor')
  })

  it('includes data-flow-editor attribute', () => {
    const { dataAttributes } = createFlowEditor()
    expect(dataAttributes['data-flow-editor']).toBe('true')
  })
})
