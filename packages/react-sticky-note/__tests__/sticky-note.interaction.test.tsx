// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { fireEvent } from '@testing-library/react'
import { StickyNote } from '../src/sticky-note.js'

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

describe('StickyNote interaction', () => {
  it('editing the textarea fires onTextChange', () => {
    const onTextChange = vi.fn()
    render(<StickyNote text="Hello" onTextChange={onTextChange} />)
    
    const textarea = container.querySelector('textarea')!
    expect(textarea).not.toBeNull()
    expect(textarea.value).toBe('Hello')
    
    act(() => {
      fireEvent.change(textarea, { target: { value: 'World' } })
    })
    
    expect(onTextChange).toHaveBeenCalledWith('World')
  })

  it('pointer drag updates position / fires onMove (when draggable)', () => {
    const onMove = vi.fn()
    render(<StickyNote x={10} y={20} draggable onMove={onMove} />)
    
    const note = container.firstChild as HTMLDivElement
    note.setPointerCapture = vi.fn()
    
    act(() => {
      fireEvent.pointerDown(note, { pointerId: 1, clientX: 100, clientY: 100, button: 0 })
    })
    act(() => {
      fireEvent.pointerMove(note, { pointerId: 1, clientX: 150, clientY: 80 })
    })
    
    expect(onMove).toHaveBeenCalledWith({ x: 60, y: 0 })
    
    act(() => {
      fireEvent.pointerUp(note, { pointerId: 1 })
    })
  })

  it('color variant applied; x/y via inline style', () => {
    render(<StickyNote color="pink" x={50} y={100} />)
    
    const note = container.firstChild as HTMLDivElement
    // Since it's tailwind/cva, checking for the variant class might be flaky, but we can check style
    expect(note.getAttribute('style')).toContain('left: 50px')
    expect(note.getAttribute('style')).toContain('top: 100px')
    expect(note.getAttribute('style')).toContain('position: absolute')
    expect(note.getAttribute('data-color')).toBe('pink') // from aria/data attributes
  })

  it('static text when no onTextChange', () => {
    render(<StickyNote text="Read only note" />)
    
    const textarea = container.querySelector('textarea')
    expect(textarea).toBeNull()
    
    const p = container.querySelector('p')!
    expect(p).not.toBeNull()
    expect(p.textContent).toBe('Read only note')
  })
})
