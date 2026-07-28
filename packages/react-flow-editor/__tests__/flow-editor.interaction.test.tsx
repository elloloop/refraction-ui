// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { fireEvent } from '@testing-library/react'
import { FlowEditor } from '../src/flow-editor.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  if (!HTMLElement.prototype.setPointerCapture) { HTMLElement.prototype.setPointerCapture = vi.fn(); }
  if (!HTMLElement.prototype.releasePointerCapture) { HTMLElement.prototype.releasePointerCapture = vi.fn(); }
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

describe('FlowEditor interaction', () => {
  const nodes = [
    { id: '1', x: 0, y: 0, label: 'Node 1' },
    { id: '2', x: 200, y: 100, label: 'Node 2' }
  ]
  const edges = [
    { id: 'e1', source: '1', target: '2' }
  ]

  it('clicking a node fires onNodeClick + selected node gets the ring', () => {
    const onNodeClick = vi.fn()
    render(<FlowEditor nodes={nodes} edges={edges} onNodeClick={onNodeClick} selectedId="1" />)
    
    const nodeElements = container.querySelectorAll('div[role="button"]')
    expect(nodeElements.length).toBe(2)
    
    // Check selected state
    expect(nodeElements[0].getAttribute('aria-pressed')).toBe('true')
    expect(nodeElements[1].getAttribute('aria-pressed')).toBe('false')
    
    act(() => {
      fireEvent.click(nodeElements[1])
    })
    
    expect(onNodeClick).toHaveBeenCalledWith('2')
  })

  it('dragging a node fires onNodeMove with new coords', () => {
    const onNodeMove = vi.fn()
    render(<FlowEditor nodes={nodes} edges={edges} onNodeMove={onNodeMove} />)
    
    const node1 = container.querySelectorAll('div[role="button"]')[0] as HTMLDivElement
    node1.setPointerCapture = vi.fn()
    
    act(() => {
      fireEvent.pointerDown(node1, { pointerId: 1, clientX: 50, clientY: 50 })
    })
    act(() => {
      fireEvent.pointerMove(node1, { pointerId: 1, clientX: 70, clientY: 90 })
    })
    
    expect(onNodeMove).toHaveBeenCalledWith('1', 20, 40)
    
    act(() => {
      fireEvent.pointerUp(node1, { pointerId: 1 })
    })
  })

  it('edges render as SVG paths; renderNode override used', () => {
    render(
      <FlowEditor 
        nodes={nodes} 
        edges={edges} 
        renderNode={(node) => <div data-testid="custom-node">Custom {node.label}</div>} 
      />
    )
    
    const customNodes = container.querySelectorAll('[data-testid="custom-node"]')
    expect(customNodes.length).toBe(2)
    expect(customNodes[0].textContent).toBe('Custom Node 1')
    
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBe(1)
  })
})
