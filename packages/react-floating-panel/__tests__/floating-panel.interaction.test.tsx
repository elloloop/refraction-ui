// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { FloatingPanel, type FloatingPanelCorner } from '../src/index.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

// jsdom has no layout: stub the viewport and the panel's rendered size.
const VIEWPORT = { width: 1024, height: 768 }
const PANEL_WIDTH = 200
const PANEL_HEIGHT = 150
const COLLAPSED_HEIGHT = 44
const MARGIN = 16
const RIGHT_X = VIEWPORT.width - PANEL_WIDTH - MARGIN // 808
const BOTTOM_Y = VIEWPORT.height - PANEL_HEIGHT - MARGIN // 602

function isPanel(el: HTMLElement) {
  return el.getAttribute('role') === 'region'
}

const sizeDescriptors = {
  offsetWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth'),
  offsetHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight'),
}

let container: HTMLDivElement
let root: Root
let capture: Set<number>

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
}

function stubReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: matches && query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  })
}

beforeEach(() => {
  setViewport(VIEWPORT.width, VIEWPORT.height)
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return isPanel(this) ? PANEL_WIDTH : 0
    },
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get(this: HTMLElement) {
      if (!isPanel(this)) return 0
      return this.getAttribute('data-state') === 'collapsed' ? COLLAPSED_HEIGHT : PANEL_HEIGHT
    },
  })
  // jsdom implements neither pointer capture nor PointerEvent.
  capture = new Set()
  Object.assign(Element.prototype, {
    setPointerCapture: vi.fn((id: number) => capture.add(id)),
    releasePointerCapture: vi.fn((id: number) => capture.delete(id)),
    hasPointerCapture: (id: number) => capture.has(id),
  })
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  for (const [key, descriptor] of Object.entries(sizeDescriptors)) {
    if (descriptor) Object.defineProperty(HTMLElement.prototype, key, descriptor)
  }
  Reflect.deleteProperty(window, 'matchMedia')
  document.body.style.userSelect = ''
})

function render(ui: React.ReactElement) {
  act(() => root.render(ui))
}

function panel(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[role="region"]')
  if (!el) throw new Error('panel not rendered')
  return el
}

function handle(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('[data-floating-panel-handle]')
  if (!el) throw new Error('handle not rendered')
  return el
}

function toggle(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('button[aria-expanded]')
  if (!el) throw new Error('collapse control not rendered')
  return el
}

function translate(x: number, y: number) {
  return `translate3d(${x}px, ${y}px, 0)`
}

function press(key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    handle().dispatchEvent(event)
  })
  return event
}

function pointer(
  type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
  x: number,
  y: number,
  { pointerId = 1, button = 0 }: { pointerId?: number; button?: number } = {},
) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button })
  Object.defineProperty(event, 'pointerId', { value: pointerId })
  act(() => {
    handle().dispatchEvent(event)
  })
}

function status(): string {
  return container.querySelector('[role="status"]')?.textContent ?? ''
}

describe('FloatingPanel positioning (jsdom)', () => {
  it('measures and places itself in the default bottom-right corner', () => {
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    expect(panel().style.transform).toBe(translate(RIGHT_X, BOTTOM_Y))
    expect(panel().style.left).toBe('0px')
    expect(panel().style.top).toBe('0px')
    expect(panel().style.bottom).toBe('')
    // The first placement must not animate in from the origin.
    expect(panel().getAttribute('data-motion')).toBe('instant')
  })

  it('re-clamps inside the viewport when the window resizes', () => {
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    setViewport(600, 400)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(panel().style.transform).toBe(translate(600 - PANEL_WIDTH - MARGIN, 400 - PANEL_HEIGHT - MARGIN))
    expect(panel().getAttribute('data-motion')).toBe('instant')
  })

  it('keeps an oversized panel on-screen at the start edge', () => {
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    setViewport(150, 100)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(panel().style.transform).toBe(translate(0, 0))
  })

  it('removes its resize listener on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    act(() => root.render(<></>))
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function))
    remove.mockRestore()
  })
})

describe('FloatingPanel keyboard (jsdom)', () => {
  it('moves to the adjacent corner with the arrows and announces it', () => {
    const onCornerChange = vi.fn()
    render(
      <FloatingPanel label="Call" onCornerChange={onCornerChange}>
        Video
      </FloatingPanel>,
    )
    handle().focus()

    const up = press('ArrowUp')
    expect(up.defaultPrevented).toBe(true)
    expect(onCornerChange).toHaveBeenLastCalledWith('top-right')
    expect(panel().getAttribute('data-corner')).toBe('top-right')
    expect(panel().style.transform).toBe(translate(RIGHT_X, MARGIN))
    expect(panel().getAttribute('data-motion')).toBe('animated')
    expect(status()).toBe('Panel moved to top right')

    press('ArrowLeft')
    expect(onCornerChange).toHaveBeenLastCalledWith('top-left')
    expect(panel().style.transform).toBe(translate(MARGIN, MARGIN))
    expect(document.activeElement).toBe(handle())
  })

  it('consumes an arrow at the edge without moving (no wrap, no page scroll)', () => {
    const onCornerChange = vi.fn()
    render(
      <FloatingPanel label="Call" defaultCorner="top-left" onCornerChange={onCornerChange}>
        Video
      </FloatingPanel>,
    )
    expect(press('ArrowUp').defaultPrevented).toBe(true)
    expect(press('ArrowLeft').defaultPrevented).toBe(true)
    expect(onCornerChange).not.toHaveBeenCalled()
    expect(panel().getAttribute('data-corner')).toBe('top-left')
  })

  it('leaves other keys alone (Tab is not trapped)', () => {
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    expect(press('Tab').defaultPrevented).toBe(false)
    expect(press('Enter').defaultPrevented).toBe(false)
  })

  it('in controlled mode only reports the move', () => {
    const onCornerChange = vi.fn()
    render(
      <FloatingPanel label="Call" corner="bottom-left" onCornerChange={onCornerChange}>
        Video
      </FloatingPanel>,
    )
    press('ArrowRight')
    expect(onCornerChange).toHaveBeenCalledWith('bottom-right')
    expect(panel().getAttribute('data-corner')).toBe('bottom-left')
  })

  it('follows a controlled corner change from the parent', () => {
    function Harness() {
      const [corner, setCorner] = React.useState<FloatingPanelCorner>('top-left')
      return (
        <>
          <button type="button" id="outside" onClick={() => setCorner('bottom-left')}>
            Move
          </button>
          <FloatingPanel label="Call" corner={corner} onCornerChange={setCorner}>
            Video
          </FloatingPanel>
        </>
      )
    }
    render(<Harness />)
    expect(panel().style.transform).toBe(translate(MARGIN, MARGIN))
    act(() => {
      container.querySelector<HTMLButtonElement>('#outside')!.click()
    })
    expect(panel().style.transform).toBe(translate(MARGIN, BOTTOM_Y))
    expect(status()).toBe('Panel moved to bottom left')
  })
})

describe('FloatingPanel drag (jsdom, synthetic pointer events)', () => {
  it('follows the pointer, then snaps to the nearest corner on drop', () => {
    const onCornerChange = vi.fn()
    render(
      <FloatingPanel label="Call" onCornerChange={onCornerChange}>
        Video
      </FloatingPanel>,
    )
    // Grab 92,18 into the panel (it sits at 808,602).
    pointer('pointerdown', 900, 620)
    expect(Element.prototype.setPointerCapture).toHaveBeenCalledWith(1)
    expect(panel().getAttribute('data-dragging')).toBe('true')
    expect(panel().className).toContain('select-none')
    expect(document.body.style.userSelect).toBe('none')

    pointer('pointermove', 150, 100)
    expect(panel().style.transform).toBe(translate(58, 82))
    expect(panel().getAttribute('data-motion')).toBe('instant')
    expect(onCornerChange).not.toHaveBeenCalled()

    pointer('pointerup', 150, 100)
    expect(onCornerChange).toHaveBeenCalledWith('top-left')
    expect(panel().style.transform).toBe(translate(MARGIN, MARGIN))
    expect(panel().getAttribute('data-dragging')).toBe('false')
    expect(panel().getAttribute('data-motion')).toBe('animated')
    expect(Element.prototype.releasePointerCapture).toHaveBeenCalledWith(1)
    expect(document.body.style.userSelect).toBe('')
  })

  it('stops animating once the snap transition ends', () => {
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    pointer('pointerdown', 900, 620)
    pointer('pointermove', 150, 100)
    pointer('pointerup', 150, 100)
    expect(panel().getAttribute('data-motion')).toBe('animated')
    act(() => {
      panel().dispatchEvent(new Event('transitionend', { bubbles: true }))
    })
    expect(panel().getAttribute('data-motion')).toBe('instant')
  })

  it('clamps the panel inside the viewport while dragging', () => {
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    pointer('pointerdown', 900, 620)
    pointer('pointermove', -500, 5000)
    expect(panel().style.transform).toBe(translate(MARGIN, BOTTOM_Y))
  })

  it('re-clamps a drag in progress when the window shrinks', () => {
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    pointer('pointerdown', 900, 620)
    setViewport(500, 400)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(panel().style.transform).toBe(translate(500 - PANEL_WIDTH - MARGIN, 400 - PANEL_HEIGHT - MARGIN))
  })

  it('animates back to the same corner when dropped near it', () => {
    const onCornerChange = vi.fn()
    render(
      <FloatingPanel label="Call" onCornerChange={onCornerChange}>
        Video
      </FloatingPanel>,
    )
    pointer('pointerdown', 900, 620)
    pointer('pointermove', 800, 500)
    pointer('pointerup', 800, 500)
    expect(onCornerChange).not.toHaveBeenCalled()
    expect(panel().style.transform).toBe(translate(RIGHT_X, BOTTOM_Y))
    expect(panel().getAttribute('data-motion')).toBe('animated')
  })

  it('ignores secondary buttons and other pointers', () => {
    const onCornerChange = vi.fn()
    render(
      <FloatingPanel label="Call" onCornerChange={onCornerChange}>
        Video
      </FloatingPanel>,
    )
    pointer('pointerdown', 900, 620, { button: 2 })
    expect(panel().getAttribute('data-dragging')).toBe('false')

    pointer('pointerdown', 900, 620, { pointerId: 1 })
    pointer('pointermove', 100, 100, { pointerId: 2 })
    expect(panel().style.transform).toBe(translate(RIGHT_X, BOTTOM_Y))
    pointer('pointerup', 100, 100, { pointerId: 2 })
    expect(panel().getAttribute('data-dragging')).toBe('true')
    expect(onCornerChange).not.toHaveBeenCalled()
  })

  it('puts the panel back when the gesture is cancelled', () => {
    const onCornerChange = vi.fn()
    render(
      <FloatingPanel label="Call" onCornerChange={onCornerChange}>
        Video
      </FloatingPanel>,
    )
    pointer('pointerdown', 900, 620)
    pointer('pointermove', 100, 100)
    pointer('pointercancel', 100, 100)
    expect(onCornerChange).not.toHaveBeenCalled()
    expect(panel().style.transform).toBe(translate(RIGHT_X, BOTTOM_Y))
    expect(panel().getAttribute('data-dragging')).toBe('false')
    expect(document.body.style.userSelect).toBe('')
  })

  it('restores body text selection if unmounted mid-drag', () => {
    document.body.style.userSelect = 'text'
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    pointer('pointerdown', 900, 620)
    expect(document.body.style.userSelect).toBe('none')
    act(() => root.render(<></>))
    expect(document.body.style.userSelect).toBe('text')
  })
})

describe('FloatingPanel reduced motion (jsdom)', () => {
  it('snaps instantly after a drop and a key move', () => {
    stubReducedMotion(true)
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    pointer('pointerdown', 900, 620)
    pointer('pointermove', 150, 100)
    pointer('pointerup', 150, 100)
    expect(panel().getAttribute('data-motion')).toBe('instant')
    expect(panel().className).toContain('transition-none')
    expect(panel().className).not.toContain('duration-200')

    press('ArrowDown')
    expect(panel().getAttribute('data-motion')).toBe('instant')
  })

  it('animates when the user has no reduced-motion preference', () => {
    stubReducedMotion(false)
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    press('ArrowUp')
    expect(panel().getAttribute('data-motion')).toBe('animated')
    expect(panel().className).toContain('duration-200')
  })
})

describe('FloatingPanel collapse (jsdom)', () => {
  it('collapses and expands the body, re-placing a bottom panel', () => {
    const onCollapsedChange = vi.fn()
    render(
      <FloatingPanel label="Call" onCollapsedChange={onCollapsedChange}>
        Video
      </FloatingPanel>,
    )
    const bodyId = toggle().getAttribute('aria-controls')!
    act(() => toggle().click())
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true)
    expect(toggle().getAttribute('aria-expanded')).toBe('false')
    expect(toggle().getAttribute('aria-label')).toBe('Expand panel')
    expect(document.getElementById(bodyId)!.hidden).toBe(true)
    expect(panel().style.transform).toBe(
      translate(RIGHT_X, VIEWPORT.height - COLLAPSED_HEIGHT - MARGIN),
    )

    act(() => toggle().click())
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false)
    expect(document.getElementById(bodyId)!.hidden).toBe(false)
    expect(panel().style.transform).toBe(translate(RIGHT_X, BOTTOM_Y))
  })

  it('in controlled mode only reports the toggle', () => {
    const onCollapsedChange = vi.fn()
    render(
      <FloatingPanel label="Call" collapsed={false} onCollapsedChange={onCollapsedChange}>
        Video
      </FloatingPanel>,
    )
    act(() => toggle().click())
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    expect(toggle().getAttribute('aria-expanded')).toBe('true')
  })
})

describe('FloatingPanel is not modal (jsdom)', () => {
  it('does not take focus on mount and leaves the page interactive', () => {
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    render(<FloatingPanel label="Call">Video</FloatingPanel>)
    expect(document.activeElement).toBe(outside)
    expect(panel().hasAttribute('aria-modal')).toBe(false)
    expect(container.hasAttribute('inert')).toBe(false)
    expect(container.getAttribute('aria-hidden')).toBeNull()
    outside.remove()
  })
})
