// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { IconButton } from '../src/index.js'
import {
  ICON_BUTTON_TOOLTIP_DELAY_MS,
  ICON_BUTTON_TOOLTIP_OFFSET_PX,
} from '@refraction-ui/icon-button'

// Interaction suite (jsdom, no Testing Library). jsdom has no layout engine,
// so real hit-testing of the 44 px extender and pixel output are NOT covered
// here; the placement maths is unit-tested in the core and the measured
// inputs are stubbed below.

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.useFakeTimers()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

const Glyph = () => <svg viewBox="0 0 24 24" />

function button(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('button')
  if (!el) throw new Error('button not rendered')
  return el
}

/** Tooltip content is portaled to document.body. */
function tooltip(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[role="tooltip"]')
}

function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function focus(el: HTMLElement) {
  act(() => {
    el.focus()
  })
}

function blur(el: HTMLElement) {
  act(() => {
    el.blur()
  })
}

// React synthesizes onMouseEnter/onMouseLeave from native mouseover/mouseout.
function mouseEnter(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, relatedTarget: null }))
  })
}

function mouseLeave(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body }))
  })
}

function keyDown(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function waitForTooltipDelay() {
  act(() => {
    vi.advanceTimersByTime(ICON_BUTTON_TOOLTIP_DELAY_MS)
  })
}

function MuteToggle({ onToggle }: { onToggle?: (muted: boolean) => void }) {
  const [muted, setMuted] = React.useState(false)
  return (
    <IconButton
      icon={<Glyph />}
      label="Mute"
      pressed={muted}
      onClick={() => {
        setMuted((m) => !m)
        onToggle?.(!muted)
      }}
    />
  )
}

describe('IconButton — click', () => {
  it('calls onClick', () => {
    const onClick = vi.fn()
    render(<IconButton icon={<Glyph />} label="Close" onClick={onClick} />)
    click(button())
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('forwards the ref to the <button>', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(<IconButton ref={ref} icon={<Glyph />} label="Close" />)
    expect(ref.current).toBe(button())
  })

  it('a click on the hit-area extender reaches the button', () => {
    const onClick = vi.fn()
    render(<IconButton icon={<Glyph />} label="Close" onClick={onClick} />)
    const hitArea = button().querySelector<HTMLElement>('[data-icon-button-hit-area]')!
    click(hitArea)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('IconButton — toggle', () => {
  it('flips aria-pressed and data-state on each click', () => {
    const onToggle = vi.fn()
    render(<MuteToggle onToggle={onToggle} />)
    expect(button().getAttribute('aria-pressed')).toBe('false')
    expect(button().getAttribute('data-state')).toBe('off')

    click(button())
    expect(button().getAttribute('aria-pressed')).toBe('true')
    expect(button().getAttribute('data-state')).toBe('on')
    expect(onToggle).toHaveBeenLastCalledWith(true)

    click(button())
    expect(button().getAttribute('aria-pressed')).toBe('false')
    expect(onToggle).toHaveBeenLastCalledWith(false)
  })

  it('keeps the same accessible name in both states', () => {
    render(<MuteToggle />)
    expect(button().getAttribute('aria-label')).toBe('Mute')
    click(button())
    expect(button().getAttribute('aria-label')).toBe('Mute')
  })
})

describe('IconButton — keyboard', () => {
  it('is reachable by keyboard focus', () => {
    render(<IconButton icon={<Glyph />} label="Settings" />)
    focus(button())
    expect(document.activeElement).toBe(button())
    expect(button().tabIndex).toBe(0)
  })

  it('leaves Enter/Space to native activation (no preventDefault) and calls onKeyDown', () => {
    const onKeyDown = vi.fn()
    render(<IconButton icon={<Glyph />} label="Settings" onKeyDown={onKeyDown} />)
    expect(keyDown(button(), 'Enter').defaultPrevented).toBe(false)
    expect(keyDown(button(), ' ').defaultPrevented).toBe(false)
    expect(onKeyDown).toHaveBeenCalledTimes(2)
  })

  it('native activation (what Enter/Space dispatch) toggles the pressed state', () => {
    // jsdom does not turn a key press into a click; browsers do so for every
    // <button>. HTMLElement.click() runs that same activation path.
    render(<MuteToggle />)
    focus(button())
    act(() => {
      button().click()
    })
    expect(button().getAttribute('aria-pressed')).toBe('true')
  })
})

describe('IconButton — tooltip', () => {
  it('shows the label on keyboard focus after the delay and hides on blur', () => {
    render(<IconButton icon={<Glyph />} label="Settings" />)
    focus(button())
    expect(tooltip()).toBeNull()
    waitForTooltipDelay()
    expect(tooltip()?.textContent).toBe('Settings')
    blur(button())
    expect(tooltip()).toBeNull()
  })

  it('shows on hover and hides on mouse leave', () => {
    render(<IconButton icon={<Glyph />} label="Settings" />)
    mouseEnter(button())
    waitForTooltipDelay()
    expect(tooltip()?.textContent).toBe('Settings')
    mouseLeave(button())
    expect(tooltip()).toBeNull()
  })

  it('does not repeat the accessible name: tooltip is aria-hidden and not a description', () => {
    render(<IconButton icon={<Glyph />} label="Settings" />)
    focus(button())
    waitForTooltipDelay()
    expect(tooltip()?.getAttribute('aria-hidden')).toBe('true')
    expect(button().hasAttribute('aria-describedby')).toBe(false)
    expect(container.querySelector('[aria-describedby]')).toBeNull()
  })

  it('Escape dismisses it, without stopping propagation, until focus leaves', () => {
    const onParentKeyDown = vi.fn()
    container.addEventListener('keydown', onParentKeyDown)
    render(<IconButton icon={<Glyph />} label="Settings" />)
    focus(button())
    waitForTooltipDelay()
    expect(tooltip()).not.toBeNull()

    keyDown(button(), 'Escape')
    expect(tooltip()).toBeNull()
    expect(onParentKeyDown).toHaveBeenCalled()

    // Hovering while still focused does not bring it back...
    mouseEnter(button())
    waitForTooltipDelay()
    expect(tooltip()).toBeNull()

    // ...but leaving and returning does.
    blur(button())
    focus(button())
    waitForTooltipDelay()
    expect(tooltip()).not.toBeNull()
  })

  it('Escape before the delay elapses cancels the pending tooltip', () => {
    render(<IconButton icon={<Glyph />} label="Settings" />)
    focus(button())
    keyDown(button(), 'Escape')
    waitForTooltipDelay()
    expect(tooltip()).toBeNull()
  })

  it('never shows when showTooltip is false', () => {
    render(<IconButton icon={<Glyph />} label="Settings" showTooltip={false} />)
    focus(button())
    mouseEnter(button())
    waitForTooltipDelay()
    expect(tooltip()).toBeNull()
    expect(button().getAttribute('aria-label')).toBe('Settings')
  })

  it('is placed above the button from measured sizes, flipping below at the top edge', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(60)
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(24)
    const rect = (top: number) =>
      ({ top, left: 400, width: 36, height: 36, right: 436, bottom: top + 36, x: 400, y: top }) as DOMRect

    render(<IconButton icon={<Glyph />} label="Settings" />)
    const rectSpy = vi.spyOn(button(), 'getBoundingClientRect').mockReturnValue(rect(200))
    focus(button())
    waitForTooltipDelay()
    expect(tooltip()!.style.visibility).toBe('')
    expect(tooltip()!.style.top).toBe(`${200 - ICON_BUTTON_TOOLTIP_OFFSET_PX - 24}px`)
    expect(tooltip()!.style.left).toBe(`${400 + 18 - 30}px`)

    blur(button())
    rectSpy.mockReturnValue(rect(0))
    focus(button())
    waitForTooltipDelay()
    expect(tooltip()!.style.top).toBe(`${36 + ICON_BUTTON_TOOLTIP_OFFSET_PX}px`)
  })
})

describe('IconButton — disabled', () => {
  it('does not fire onClick and is not focusable', () => {
    const onClick = vi.fn()
    render(<IconButton icon={<Glyph />} label="Send" disabled onClick={onClick} />)
    click(button())
    expect(onClick).not.toHaveBeenCalled()
    expect(button().disabled).toBe(true)
    focus(button())
    expect(document.activeElement).not.toBe(button())
  })

  it('shows no tooltip', () => {
    render(<IconButton icon={<Glyph />} label="Send" disabled />)
    mouseEnter(button())
    waitForTooltipDelay()
    expect(tooltip()).toBeNull()
  })

  it('closes an open tooltip when it becomes disabled, without remounting the button', () => {
    function Harness({ disabled }: { disabled: boolean }) {
      return <IconButton icon={<Glyph />} label="Send" disabled={disabled} />
    }
    render(<Harness disabled={false} />)
    const before = button()
    mouseEnter(before)
    waitForTooltipDelay()
    expect(tooltip()).not.toBeNull()

    render(<Harness disabled />)
    expect(tooltip()).toBeNull()
    expect(button()).toBe(before)
  })
})
