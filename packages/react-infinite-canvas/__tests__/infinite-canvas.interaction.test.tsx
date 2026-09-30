// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { fireEvent } from '@testing-library/react'
import { InfiniteCanvas } from '../src/infinite-canvas.js'

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

describe('InfiniteCanvas interaction', () => {
  it('wheel zooms, clamped to [minZoom, maxZoom]', () => {
    const onTransformChange = vi.fn()
    render(<InfiniteCanvas minZoom={0.5} maxZoom={2} onTransformChange={onTransformChange} />)
    
    const canvas = container.querySelector('div[role="group"]')!
    
    act(() => {
      fireEvent.wheel(canvas, { deltaY: -100 })
    })
    expect(onTransformChange).toHaveBeenCalled()
    let lastCall = onTransformChange.mock.calls[onTransformChange.mock.calls.length - 1][0]
    expect(lastCall.zoom).toBeGreaterThan(1)
    
    act(() => {
      fireEvent.wheel(canvas, { deltaY: 10000 })
    })
    lastCall = onTransformChange.mock.calls[onTransformChange.mock.calls.length - 1][0]
    expect(lastCall.zoom).toBe(0.5)
  })

  it('pointer drag pans the content layer', () => {
    const onTransformChange = vi.fn()
    render(<InfiniteCanvas onTransformChange={onTransformChange} />)
    const canvas = container.querySelector('div[role="group"]')!
    
    canvas.setPointerCapture = vi.fn()
    
    act(() => {
      fireEvent.pointerDown(canvas, { pointerId: 1, clientX: 100, clientY: 100 })
    })
    act(() => {
      fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 150, clientY: 120 })
    })
    
    expect(onTransformChange).toHaveBeenCalled()
    const lastCall = onTransformChange.mock.calls[onTransformChange.mock.calls.length - 1][0]
    expect(lastCall.x).toBe(50)
    expect(lastCall.y).toBe(20)
    
    act(() => {
      fireEvent.pointerUp(canvas, { pointerId: 1 })
    })
  })

  it('zoom +/- buttons change zoom; fit restores', () => {
    const onTransformChange = vi.fn()
    render(<InfiniteCanvas showControls onTransformChange={onTransformChange} />)
    
    const zoomIn = container.querySelector('[aria-label="Zoom in"]')!
    const zoomOut = container.querySelector('[aria-label="Zoom out"]')!
    const fit = container.querySelector('[aria-label="Fit to content"]')!
    
    act(() => {
      fireEvent.click(zoomIn)
    })
    expect(onTransformChange.mock.calls[onTransformChange.mock.calls.length - 1][0].zoom).toBe(1.25)
    
    act(() => {
      fireEvent.click(zoomOut)
    })
    expect(onTransformChange.mock.calls[onTransformChange.mock.calls.length - 1][0].zoom).toBe(1)
    
    const canvas = container.querySelector('div[role="group"]')!
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      width: 800,
      height: 600,
      x: 0, y: 0, top: 0, left: 0, bottom: 600, right: 800,
      toJSON: () => {}
    } as DOMRect)
    
    act(() => {
      fireEvent.click(fit)
    })
    expect(onTransformChange).toHaveBeenCalled()
  })

  it('controlled transform: interactions fire onTransformChange, transform follows prop', () => {
    const onTransformChange = vi.fn()
    render(<InfiniteCanvas zoom={2} x={100} y={100} onTransformChange={onTransformChange} />)
    
    const content = container.querySelector('div[style*="transform"]')!
    expect(content.getAttribute('style')).toContain('scale(2)')
    expect(content.getAttribute('style')).toContain('translate(100px, 100px)')
    
    const canvas = container.querySelector('div[role="group"]')!
    act(() => {
      fireEvent.wheel(canvas, { deltaY: -100 })
    })
    expect(onTransformChange).toHaveBeenCalled()
  })
})
