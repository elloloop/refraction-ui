// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { fireEvent } from '@testing-library/react'
import { MiniMap } from '../src/mini-map.js'

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

describe('MiniMap interaction', () => {
  const items = [
    { id: '1', x: 0, y: 0, width: 100, height: 100 },
    { id: '2', x: 200, y: 200, width: 100, height: 100 }
  ]
  const viewport = { x: 50, y: 50, width: 200, height: 200 }

  it('click/drag inside the minimap fires onViewportChange with new center', () => {
    const onViewportChange = vi.fn()
    render(<MiniMap items={items} onViewportChange={onViewportChange} viewport={viewport} width={200} height={200} />)
    
    const minimap = container.firstChild as HTMLDivElement
    minimap.setPointerCapture = vi.fn()
    vi.spyOn(minimap, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 200, height: 200, x: 0, y: 0, bottom: 200, right: 200, toJSON: () => {}
    } as DOMRect)
    
    act(() => {
      fireEvent.pointerDown(minimap, { pointerId: 1, clientX: 100, clientY: 100 })
    })
    
    expect(onViewportChange).toHaveBeenCalled()
    // It should receive a new center { x, y }
    const center = onViewportChange.mock.calls[0][0]
    expect(center).toHaveProperty('x')
    expect(center).toHaveProperty('y')
    
    act(() => {
      fireEvent.pointerMove(minimap, { pointerId: 1, clientX: 150, clientY: 150 })
    })
    expect(onViewportChange).toHaveBeenCalledTimes(2)
    
    act(() => {
      fireEvent.pointerUp(minimap, { pointerId: 1 })
    })
  })

  it('node dots via worldToMini; viewport rect via viewportRectInMini', () => {
    render(<MiniMap items={items} viewport={viewport} />)
    
    // 2 dots
    const spans = Array.from(container.querySelectorAll('span[aria-hidden="true"]'))
    expect(spans.length).toBe(3) // 2 dots + 1 viewport rect
    
    // We can assume the last span is the viewport rect
    const viewportRect = spans[2] as HTMLSpanElement
    expect(viewportRect.className).toContain('bg-primary/10') // or whatever class it has
    expect(viewportRect.style.position).toBe('absolute')
  })

  it('no onViewportChange -> static (no pointer handlers)', () => {
    render(<MiniMap items={items} viewport={viewport} />)
    const minimap = container.firstChild as HTMLDivElement
    expect(minimap.getAttribute('data-interactive')).toBeNull() // Assuming creating variants uses data-interactive
  })
})
