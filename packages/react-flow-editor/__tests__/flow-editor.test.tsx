import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { FlowEditor } from '../src/flow-editor.js'
import type { FlowNode, FlowEdge } from '../src/flow-editor.js'

// Minimal stub so InfiniteCanvas SSR doesn't need the real package wired up.
// We replace it with a simple passthrough container.
vi.mock('@refraction-ui/react-infinite-canvas', () => ({
  InfiniteCanvas: ({
    children,
  }: {
    children?: React.ReactNode
    [key: string]: unknown
  }) =>
    React.createElement(
      'div',
      { role: 'group', 'data-testid': 'infinite-canvas' },
      children,
    ),
}))

import { vi } from 'vitest'

const NODES: FlowNode[] = [
  { id: 'n1', x: 0, y: 0, label: 'Start' },
  { id: 'n2', x: 300, y: 0, label: 'Process' },
  { id: 'n3', x: 600, y: 0, label: 'End' },
]

const EDGES: FlowEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2', label: 'next' },
  { id: 'e2', source: 'n2', target: 'n3' },
]

const render = (
  props: Partial<React.ComponentProps<typeof FlowEditor>> = {},
) =>
  renderToString(
    React.createElement(FlowEditor, {
      nodes: NODES,
      edges: EDGES,
      ...props,
    }),
  )

describe('FlowEditor (SSR)', () => {
  it('renders a label for each node', () => {
    const html = render()
    expect(html).toContain('Start')
    expect(html).toContain('Process')
    expect(html).toContain('End')
    // Three node button elements
    expect((html.match(/role="button"/g) ?? []).length).toBe(3)
  })

  it('renders an svg with one path per edge', () => {
    const html = render()
    expect(html).toContain('<svg')
    // Two edges → two <path> elements
    expect((html.match(/<path /g) ?? []).length).toBe(2)
  })

  it('renders edge labels when provided', () => {
    const html = render()
    expect(html).toContain('next')
  })

  it('applies selected ring when selectedId matches', () => {
    const html = render({ selectedId: 'n2' })
    // The selected node should have aria-pressed="true"
    expect(html).toContain('aria-pressed="true"')
    // Only one node is selected
    expect((html.match(/aria-pressed="true"/g) ?? []).length).toBe(1)
  })

  it('exposes group role and aria-label on the root', () => {
    const html = render()
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Flow editor"')
  })

  it('skips edges whose source or target node is missing', () => {
    const html = renderToString(
      React.createElement(FlowEditor, {
        nodes: [NODES[0]],
        edges: [{ id: 'e1', source: 'n1', target: 'missing' }],
      }),
    )
    // No path rendered for invalid edge
    expect((html.match(/<path /g) ?? []).length).toBe(0)
  })
})
