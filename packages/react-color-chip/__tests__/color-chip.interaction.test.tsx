// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { resetDevFeedback } from '@refraction-ui/shared'
import {
  ICON_BUTTON_TOOLTIP_DELAY_MS,
  ICON_BUTTON_TOOLTIP_OFFSET_PX,
} from '@refraction-ui/icon-button'
import { ColorChip } from '../src/index.js'

// Interaction suite (jsdom, no Testing Library). jsdom has no layout engine,
// so real hit-testing of the 44 px extender, the rendered colours and the
// tooltip's on-screen placement are NOT covered here; the placement maths is
// unit-tested in @refraction-ui/icon-button and the measured inputs are
// stubbed below. Contrast is checked in tailwind-config's categories test.

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  vi.useFakeTimers()
  resetDevFeedback()
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

function button(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('button')
  if (!el) throw new Error('button not rendered')
  return el
}

/** Tooltip content is portaled to document.body. */
function tooltip(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[role="tooltip"]')
}

function click(el: Element) {
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

describe('ColorChip — read-only', () => {
  it('is not a tab stop and has no button', () => {
    render(<ColorChip label="Ada" hint="from the calendar" />)
    const chip = container.firstElementChild as HTMLElement
    expect(chip.tagName).toBe('SPAN')
    expect(chip.tabIndex).toBe(-1)
    expect(container.querySelector('button')).toBeNull()
    expect(chip.textContent).toBe('Ada·from the calendar')
  })

  it('shows no tooltip on hover', () => {
    render(<ColorChip label="Ada" />)
    mouseEnter(container.firstElementChild as HTMLElement)
    waitForTooltipDelay()
    expect(tooltip()).toBeNull()
  })

  it('forwards the ref to the span', () => {
    const ref = React.createRef<HTMLElement>()
    render(<ColorChip ref={ref} label="Ada" />)
    expect(ref.current?.tagName).toBe('SPAN')
  })
})

describe('ColorChip — editable: one target', () => {
  it('calls onEdit (and onClick) when the chip is clicked', () => {
    const onEdit = vi.fn()
    const onClick = vi.fn()
    render(<ColorChip label="Ada" onEdit={onEdit} onClick={onClick} />)
    expect(container.querySelectorAll('button')).toHaveLength(1)
    click(button())
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('a click on the label, the dot, the glyph or the hit-area extender edits', () => {
    const onEdit = vi.fn()
    render(<ColorChip label="Ada" hint="from the calendar" onEdit={onEdit} />)
    const parts = [
      button().querySelector('[data-color-chip-hit-area]')!,
      button().querySelector('[data-color-chip-edit-icon]')!,
      ...Array.from(button().querySelectorAll('span')),
    ]
    for (const part of parts) click(part)
    expect(onEdit).toHaveBeenCalledTimes(parts.length)
  })

  it('is reachable by keyboard and activates natively (Enter/Space are not swallowed)', () => {
    const onEdit = vi.fn()
    const onKeyDown = vi.fn()
    render(<ColorChip label="Ada" onEdit={onEdit} onKeyDown={onKeyDown} />)
    focus(button())
    expect(document.activeElement).toBe(button())
    expect(button().tabIndex).toBe(0)
    expect(keyDown(button(), 'Enter').defaultPrevented).toBe(false)
    expect(keyDown(button(), ' ').defaultPrevented).toBe(false)
    expect(onKeyDown).toHaveBeenCalledTimes(2)
    // jsdom does not turn a key press into a click; browsers do for every
    // <button>. HTMLElement.click() runs that same activation path.
    act(() => {
      button().click()
    })
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('forwards the ref to the button', () => {
    const ref = React.createRef<HTMLElement>()
    render(<ColorChip ref={ref} label="Ada" onEdit={() => {}} />)
    expect(ref.current).toBe(button())
  })

  it('exposes the edit name, and the hint as a description', () => {
    render(<ColorChip label="Ada" hint="from the calendar" onEdit={() => {}} editLabel="Rename Ada" />)
    expect(button().getAttribute('aria-label')).toBe('Rename Ada')
    const ids = button().getAttribute('aria-describedby')!.split(' ')
    expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual(['from the calendar'])
  })
})

describe('ColorChip — editable: tooltip', () => {
  it('shows editTooltip on keyboard focus after the delay and hides on blur', () => {
    render(<ColorChip label="Ada" onEdit={() => {}} editTooltip="Change speaker" />)
    focus(button())
    expect(tooltip()).toBeNull()
    waitForTooltipDelay()
    expect(tooltip()?.textContent).toBe('Change speaker')
    blur(button())
    expect(tooltip()).toBeNull()
  })

  it('defaults the tooltip to the edit label and shows it on hover', () => {
    render(<ColorChip label="Ada" onEdit={() => {}} />)
    mouseEnter(button())
    waitForTooltipDelay()
    expect(tooltip()?.textContent).toBe('Edit Ada')
    mouseLeave(button())
    expect(tooltip()).toBeNull()
  })

  it('keeps the floating copy aria-hidden; extra text reaches screen readers as a description', () => {
    render(<ColorChip label="Ada" onEdit={() => {}} editTooltip="Change speaker" />)
    focus(button())
    waitForTooltipDelay()
    expect(tooltip()?.getAttribute('aria-hidden')).toBe('true')
    const id = button().getAttribute('aria-describedby')!
    expect(document.getElementById(id)?.textContent).toBe('Change speaker')
    expect(document.getElementById(id)?.className).toBe('sr-only')
  })

  it('Escape dismisses it, without stopping propagation, until focus leaves', () => {
    const onParentKeyDown = vi.fn()
    container.addEventListener('keydown', onParentKeyDown)
    render(<ColorChip label="Ada" onEdit={() => {}} />)
    focus(button())
    waitForTooltipDelay()
    expect(tooltip()).not.toBeNull()

    keyDown(button(), 'Escape')
    expect(tooltip()).toBeNull()
    expect(onParentKeyDown).toHaveBeenCalled()

    mouseEnter(button())
    waitForTooltipDelay()
    expect(tooltip()).toBeNull()

    blur(button())
    focus(button())
    waitForTooltipDelay()
    expect(tooltip()).not.toBeNull()
  })

  it('an empty editTooltip turns the tooltip off but keeps the name', () => {
    render(<ColorChip label="Ada" onEdit={() => {}} editTooltip="" />)
    focus(button())
    mouseEnter(button())
    waitForTooltipDelay()
    expect(tooltip()).toBeNull()
    expect(button().getAttribute('aria-label')).toBe('Edit Ada')
  })

  it('is placed above the chip from measured sizes, flipping below at the top edge', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(80)
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(24)
    const rect = (top: number) =>
      ({ top, left: 300, width: 64, height: 24, right: 364, bottom: top + 24, x: 300, y: top }) as DOMRect

    render(<ColorChip label="Ada" onEdit={() => {}} />)
    const rectSpy = vi.spyOn(button(), 'getBoundingClientRect').mockReturnValue(rect(200))
    focus(button())
    waitForTooltipDelay()
    expect(tooltip()!.style.visibility).toBe('')
    expect(tooltip()!.style.top).toBe(`${200 - ICON_BUTTON_TOOLTIP_OFFSET_PX - 24}px`)
    expect(tooltip()!.style.left).toBe(`${300 + 32 - 40}px`)

    blur(button())
    rectSpy.mockReturnValue(rect(0))
    focus(button())
    waitForTooltipDelay()
    expect(tooltip()!.style.top).toBe(`${24 + ICON_BUTTON_TOOLTIP_OFFSET_PX}px`)
  })
})

describe('ColorChip — dev warnings', () => {
  it('warns when editLabel does not contain the visible label (WCAG 2.5.3)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<ColorChip label="Ada" onEdit={() => {}} editLabel="Rename speaker" />)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('react-color-chip/label-not-in-name'),
      expect.anything(),
    )
  })

  it('does not warn for the default edit label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<ColorChip label="Ada" onEdit={() => {}} />)
    expect(warn).not.toHaveBeenCalled()
  })
})
