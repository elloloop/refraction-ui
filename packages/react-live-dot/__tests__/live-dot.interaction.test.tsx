// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { LiveDot } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
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
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function dot(): HTMLSpanElement {
  const el = container.querySelector<HTMLSpanElement>('[data-live]')
  if (!el) throw new Error('LiveDot not rendered')
  return el
}

const halo = () => container.querySelector('[data-live-dot-halo]')

/** A recorder that starts and stops, the way a real parent drives `live`. */
function Recorder() {
  const [recording, setRecording] = React.useState(true)
  return (
    <div>
      <LiveDot live={recording} color="destructive" />
      <span>{recording ? 'Recording' : 'Stopped'}</span>
      <button type="button" onClick={() => setRecording((r) => !r)}>
        Toggle
      </button>
    </div>
  )
}

describe('LiveDot (interaction)', () => {
  it('adds and removes the halo as live toggles', () => {
    render(<Recorder />)
    expect(dot().dataset.live).toBe('true')
    expect(halo()).not.toBeNull()

    const button = container.querySelector('button')!
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(dot().dataset.live).toBe('false')
    expect(halo()).toBeNull()
    expect(container.textContent).toContain('Stopped')

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(halo()).not.toBeNull()
  })

  it('keeps the halo still under reduced motion via motion-reduce classes', () => {
    // jsdom does not evaluate media queries, so assert the CSS contract that
    // the browser applies under `prefers-reduced-motion: reduce`.
    render(<LiveDot live />)
    const cls = halo()!.className
    expect(cls).toContain('animate-ping')
    expect(cls).toContain('motion-reduce:animate-none')
  })

  it('switches between decorative and labelled when label changes', () => {
    render(<LiveDot />)
    expect(dot().getAttribute('aria-hidden')).toBe('true')
    expect(dot().getAttribute('role')).toBeNull()

    render(<LiveDot label="Live" />)
    expect(dot().getAttribute('role')).toBe('img')
    expect(dot().getAttribute('aria-label')).toBe('Live')
    expect(dot().hasAttribute('aria-hidden')).toBe(false)
  })

  it('updates colour on both dot and halo', () => {
    render(<LiveDot color="success" />)
    render(<LiveDot color="warning" />)
    expect(dot().dataset.color).toBe('warning')
    expect(container.querySelectorAll('.bg-warning')).toHaveLength(2)
    expect(container.querySelectorAll('.bg-success')).toHaveLength(0)
  })

  it('stays out of the tab order', () => {
    render(
      <div>
        <LiveDot label="Live" />
        <button type="button">Next</button>
      </div>,
    )
    expect(dot().tabIndex).toBe(-1)
  })

  it('forwards its ref to the root span', () => {
    const ref = React.createRef<HTMLSpanElement>()
    render(<LiveDot ref={ref} size={0.75} />)
    expect(ref.current).toBe(dot())
    expect(ref.current!.style.width).toBe('0.75rem')
  })

  it('lets a consumer style override the computed size', () => {
    render(<LiveDot size={0.75} style={{ width: '2rem' }} />)
    expect(dot().style.width).toBe('2rem')
    expect(dot().style.height).toBe('0.75rem')
  })
})
