// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { fireEvent } from '@testing-library/react'
import { GraphView, type GraphNode, type GraphEdge } from '../src/graph-view.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  vi.restoreAllMocks()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

describe('GraphView interaction', () => {
  const nodes: GraphNode[] = [
    { id: '1', x: 0, y: 0, label: 'Node 1', state: 'mastered' },
    { id: '2', x: 100, y: 100, label: 'Node 2', state: 'in-progress' }
  ]
  const edges: GraphEdge[] = [
    { id: 'e1', source: '1', target: '2' }
  ]

  it('clicking a node fires onNodeClick with the node object', () => {
    const onNodeClick = vi.fn()
    render(<GraphView nodes={nodes} edges={edges} onNodeClick={onNodeClick} />)
    
    const nodeButtons = container.querySelectorAll('button[data-state]')
    expect(nodeButtons.length).toBe(2)
    
    act(() => {
      fireEvent.click(nodeButtons[0])
    })
    
    expect(onNodeClick).toHaveBeenCalledWith(nodes[0])
  })

  it('legend counts (summarizeStates) render when showLegend', () => {
    render(<GraphView nodes={nodes} edges={edges} showLegend />)
    
    const legend = container.querySelector('[role="list"]')
    expect(legend).not.toBeNull()
    
    const legendItems = container.querySelectorAll('[role="listitem"]')
    expect(legendItems.length).toBe(2) // 1 mastered, 1 in-progress
    expect(legendItems[0].textContent).toContain('Mastered')
    expect(legendItems[0].textContent).toContain('1')
    expect(legendItems[1].textContent).toContain('In Progress')
    expect(legendItems[1].textContent).toContain('1')
  })

  it('node state classes applied; edges render', () => {
    render(<GraphView nodes={nodes} edges={edges} />)
    
    const nodeButtons = container.querySelectorAll('button[data-state]')
    expect(nodeButtons[0].getAttribute('data-state')).toBe('mastered')
    expect(nodeButtons[1].getAttribute('data-state')).toBe('in-progress')
    
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(1)
  })
})
