import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { GraphView } from '../src/graph-view.js'
import type { GraphNode, GraphEdge } from '../src/graph-view.js'

// Minimal stub for InfiniteCanvas so SSR doesn't need the real impl.
// The actual package may not have dist in CI; we stub it here to keep the
// test hermetic.
vi.mock('@refraction-ui/react-infinite-canvas', () => ({
  InfiniteCanvas: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'infinite-canvas' }, children),
}))

import { vi } from 'vitest'

const nodes: GraphNode[] = [
  { id: 'a', x: 50, y: 50, label: 'Arrays', state: 'mastered' },
  { id: 'b', x: 150, y: 150, label: 'Sorting', state: 'in-progress' },
  { id: 'c', x: 250, y: 250, label: 'Graphs', state: 'not-started' },
  { id: 'd', x: 350, y: 100, label: 'Trees', state: 'highlight' },
]

const edges: GraphEdge[] = [
  { id: 'e1', source: 'a', target: 'b' },
  { id: 'e2', source: 'b', target: 'c' },
]

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(GraphView, props as never))

describe('GraphView (SSR)', () => {
  it('renders all node labels', () => {
    const html = render({ nodes, edges })
    expect(html).toContain('Arrays')
    expect(html).toContain('Sorting')
    expect(html).toContain('Graphs')
    expect(html).toContain('Trees')
  })

  it('renders an svg element for edges', () => {
    const html = render({ nodes, edges })
    expect(html).toContain('<svg')
    // Two edges → two <path> elements.
    expect((html.match(/<path/g) ?? []).length).toBe(2)
  })

  it('applies mastery state data-attribute on node chips', () => {
    const html = render({ nodes, edges })
    expect(html).toContain('data-state="mastered"')
    expect(html).toContain('data-state="in-progress"')
    expect(html).toContain('data-state="not-started"')
    expect(html).toContain('data-state="highlight"')
  })

  it('renders legend with counts when showLegend is true', () => {
    const html = render({ nodes, edges, showLegend: true })
    // Legend list should appear
    expect(html).toContain('aria-label="Graph legend"')
    // Each state with count > 0 gets a chip; all 4 states have 1 node each.
    expect(html).toContain('Mastered')
    expect(html).toContain('In Progress')
    expect(html).toContain('Not Started')
    expect(html).toContain('Highlight')
  })

  it('does not render legend by default', () => {
    const html = render({ nodes, edges })
    expect(html).not.toContain('aria-label="Graph legend"')
  })

  it('uses role="group" on the container', () => {
    const html = render({ nodes, edges })
    expect(html).toContain('role="group"')
  })

  it('handles empty nodes and edges gracefully', () => {
    const html = render({ nodes: [], edges: [] })
    expect(html).toContain('role="group"')
    expect(html).not.toContain('<path')
  })
})
