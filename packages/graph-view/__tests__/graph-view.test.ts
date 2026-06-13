import { describe, it, expect } from 'vitest'
import {
  createGraphView,
  graphEdgePath,
  graphBounds,
  summarizeStates,
  nodeById,
  type GraphNode,
} from '../src/index.js'

const nodes: GraphNode[] = [
  { id: 'a', x: 0, y: 0, label: 'Alpha', state: 'mastered' },
  { id: 'b', x: 100, y: 200, label: 'Beta', state: 'in-progress' },
  { id: 'c', x: 200, y: 400, label: 'Gamma', state: 'not-started' },
  { id: 'd', x: 300, y: 100, label: 'Delta', state: 'highlight' },
  { id: 'e', x: 50, y: 50, label: 'Epsilon' }, // no state → not-started
]

describe('createGraphView', () => {
  it('returns role="group" and aria-label="Knowledge graph"', () => {
    const { ariaProps } = createGraphView()
    expect(ariaProps.role).toBe('group')
    expect(ariaProps['aria-label']).toBe('Knowledge graph')
  })

  it('returns empty dataAttributes', () => {
    const { dataAttributes } = createGraphView()
    expect(dataAttributes).toEqual({})
  })
})

describe('graphEdgePath', () => {
  it('returns a string starting with M', () => {
    const source = nodes[0]
    const target = nodes[1]
    const d = graphEdgePath(source, target)
    expect(d).toMatch(/^M /)
  })

  it('contains both source and target coordinates', () => {
    const source: GraphNode = { id: 's', x: 10, y: 20, label: 'S' }
    const target: GraphNode = { id: 't', x: 90, y: 120, label: 'T' }
    const d = graphEdgePath(source, target)
    expect(d).toContain('10')
    expect(d).toContain('20')
    expect(d).toContain('90')
    expect(d).toContain('120')
  })

  it('produces a cubic bezier (C) path', () => {
    const d = graphEdgePath(nodes[0], nodes[2])
    expect(d).toContain('C ')
  })
})

describe('graphBounds', () => {
  it('returns correct min/max/width/height for a node set', () => {
    const bounds = graphBounds(nodes)
    expect(bounds.minX).toBe(0)
    expect(bounds.minY).toBe(0)
    expect(bounds.maxX).toBe(300)
    expect(bounds.maxY).toBe(400)
    expect(bounds.width).toBe(300)
    expect(bounds.height).toBe(400)
  })

  it('returns zero bounds for an empty array', () => {
    const bounds = graphBounds([])
    expect(bounds.width).toBe(0)
    expect(bounds.height).toBe(0)
    expect(bounds.minX).toBe(0)
    expect(bounds.minY).toBe(0)
  })
})

describe('summarizeStates', () => {
  it('counts nodes per state', () => {
    const summary = summarizeStates(nodes)
    expect(summary.mastered).toBe(1)
    expect(summary['in-progress']).toBe(1)
    // 'c' explicit not-started + 'e' default not-started
    expect(summary['not-started']).toBe(2)
    expect(summary.highlight).toBe(1)
  })

  it('returns zeros for an empty array', () => {
    const summary = summarizeStates([])
    expect(summary.mastered).toBe(0)
    expect(summary['in-progress']).toBe(0)
    expect(summary['not-started']).toBe(0)
    expect(summary.highlight).toBe(0)
  })
})

describe('nodeById', () => {
  it('finds a node by id', () => {
    expect(nodeById(nodes, 'b')?.label).toBe('Beta')
  })

  it('returns undefined for unknown id', () => {
    expect(nodeById(nodes, 'z')).toBeUndefined()
  })
})
