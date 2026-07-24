// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { resetIdCounter } from '@refraction-ui/shared'
import { Tooltip, TooltipTrigger, TooltipContent } from '../src/tooltip.js'

// Interaction suite for the react-tooltip adapter. Content is portaled to
// document.body, so queries span the whole document — complementing the SSR
// suite in tooltip.test.tsx, which covers structure/ARIA only.
//
// Known scope limits (no false coverage): the adapter opens on hover/focus
// (after delayDuration) and closes on mouseleave/blur. It does NOT implement
// Escape-to-dismiss — that is asserted as-is below.

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  resetIdCounter()
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
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

// React synthesizes onMouseEnter/onMouseLeave from native mouseover/mouseout
// (comparing relatedTarget), so dispatch those native events.
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

// React delegates onFocus/onBlur through the bubbling focusin/focusout pair.
function focus(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
  })
}

function blur(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
  })
}

function keyDown(el: HTMLElement, key: string) {
  act(() => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  })
}

function trigger(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[aria-describedby]')
  if (!el) throw new Error('trigger not rendered')
  return el
}

/** Tooltip content is portaled to document.body. */
function tooltip(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[role="tooltip"]')
}

function BasicTooltip(props: React.ComponentProps<typeof Tooltip> = {}) {
  return React.createElement(
    Tooltip,
    props,
    React.createElement(TooltipTrigger, null, 'Hover me'),
    React.createElement(TooltipContent, null, 'Tip text'),
  )
}

describe('Tooltip interaction — hover with no delay', () => {
  it('starts closed: no tooltip in the document', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    expect(tooltip()).toBeNull()
  })

  it('hover opens the tooltip', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    mouseEnter(trigger())
    expect(tooltip()).toBeTruthy()
    expect(tooltip()!.textContent).toBe('Tip text')
  })

  it('mouseleave closes the tooltip', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    mouseEnter(trigger())
    expect(tooltip()).toBeTruthy()
    mouseLeave(trigger())
    expect(tooltip()).toBeNull()
  })

  it('re-hovering reopens after close (open/close state transitions)', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    mouseEnter(trigger())
    mouseLeave(trigger())
    mouseEnter(trigger())
    expect(tooltip()).toBeTruthy()
  })

  it('aria-describedby matches the visible tooltip id while open', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    mouseEnter(trigger())
    expect(trigger().getAttribute('aria-describedby')).toBe(tooltip()!.id)
  })
})

describe('Tooltip interaction — focus with no delay', () => {
  it('focus opens the tooltip', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    focus(trigger())
    expect(tooltip()).toBeTruthy()
  })

  it('blur closes the tooltip', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    focus(trigger())
    blur(trigger())
    expect(tooltip()).toBeNull()
  })
})

describe('Tooltip interaction — delayDuration timing', () => {
  it('does not open before the default 300ms delay elapses', () => {
    vi.useFakeTimers()
    render(React.createElement(BasicTooltip))
    mouseEnter(trigger())
    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(tooltip()).toBeNull()
  })

  it('opens once the delay elapses', () => {
    vi.useFakeTimers()
    render(React.createElement(BasicTooltip))
    mouseEnter(trigger())
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(tooltip()).toBeTruthy()
  })

  it('respects a custom delayDuration', () => {
    vi.useFakeTimers()
    render(React.createElement(BasicTooltip, { delayDuration: 700 }))
    mouseEnter(trigger())
    act(() => {
      vi.advanceTimersByTime(699)
    })
    expect(tooltip()).toBeNull()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(tooltip()).toBeTruthy()
  })

  it('mouseleave before the delay elapses cancels the pending open', () => {
    vi.useFakeTimers()
    render(React.createElement(BasicTooltip))
    mouseEnter(trigger())
    act(() => {
      vi.advanceTimersByTime(100)
    })
    mouseLeave(trigger())
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(tooltip()).toBeNull()
  })

  it('blur before the delay elapses cancels the pending open', () => {
    vi.useFakeTimers()
    render(React.createElement(BasicTooltip))
    focus(trigger())
    act(() => {
      vi.advanceTimersByTime(100)
    })
    blur(trigger())
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(tooltip()).toBeNull()
  })

  it('unmounting with a pending timer does not open or crash', () => {
    vi.useFakeTimers()
    render(React.createElement(BasicTooltip))
    mouseEnter(trigger())
    act(() => {
      root.unmount()
    })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    // Re-mount for afterEach cleanup symmetry.
    root = createRoot(container)
  })
})

describe('Tooltip interaction — controlled vs uncontrolled', () => {
  it('uncontrolled: hover fires onOpenChange(true), leave fires (false)', () => {
    const onOpenChange = vi.fn()
    render(React.createElement(BasicTooltip, { delayDuration: 0, onOpenChange }))
    mouseEnter(trigger())
    mouseLeave(trigger())
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  it('controlled open=true: content stays visible even after mouseleave', () => {
    const onOpenChange = vi.fn()
    render(React.createElement(BasicTooltip, { open: true, delayDuration: 0, onOpenChange }))
    expect(tooltip()).toBeTruthy()
    mouseLeave(trigger())
    // Intent is reported, but the parent owns the state.
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(tooltip()).toBeTruthy()
  })

  it('controlled open=false: hover reports intent but content stays hidden', () => {
    const onOpenChange = vi.fn()
    render(React.createElement(BasicTooltip, { open: false, delayDuration: 0, onOpenChange }))
    mouseEnter(trigger())
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(tooltip()).toBeNull()
  })

  it('re-rendering with a toggled open prop shows/hides the content', () => {
    render(React.createElement(BasicTooltip, { open: false }))
    expect(tooltip()).toBeNull()
    render(React.createElement(BasicTooltip, { open: true }))
    expect(tooltip()).toBeTruthy()
    render(React.createElement(BasicTooltip, { open: false }))
    expect(tooltip()).toBeNull()
  })

  it('defaultOpen starts open (uncontrolled)', () => {
    render(React.createElement(BasicTooltip, { defaultOpen: true }))
    expect(tooltip()).toBeTruthy()
  })
})

describe('Tooltip interaction — keyboard (as implemented)', () => {
  it('Escape does NOT dismiss the tooltip (no Escape handling in adapter)', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    mouseEnter(trigger())
    expect(tooltip()).toBeTruthy()
    keyDown(trigger(), 'Escape')
    expect(tooltip()).toBeTruthy()
    // Clean up via the supported close path.
    mouseLeave(trigger())
    expect(tooltip()).toBeNull()
  })
})

describe('Tooltip interaction — ARIA and portal wiring', () => {
  it('content is portaled outside the trigger container into document.body', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    mouseEnter(trigger())
    expect(container.querySelector('[role="tooltip"]')).toBeNull()
    expect(tooltip()!.parentElement).toBe(document.body)
  })

  it('trigger has aria-describedby even while closed', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    expect(trigger().getAttribute('aria-describedby')).toBeTruthy()
  })

  it('unmounting removes the portaled content', () => {
    render(React.createElement(BasicTooltip, { defaultOpen: true }))
    expect(tooltip()).toBeTruthy()
    act(() => {
      root.unmount()
    })
    expect(document.body.querySelector('[role="tooltip"]')).toBeNull()
    // Re-mount for afterEach cleanup symmetry.
    root = createRoot(container)
  })
})

describe('Tooltip interaction — edge cases', () => {
  it('renders empty content without crashing', () => {
    render(
      React.createElement(
        Tooltip,
        { open: true },
        React.createElement(TooltipTrigger, null, 'Hover'),
        React.createElement(TooltipContent, null),
      ),
    )
    expect(tooltip()).toBeTruthy()
    expect(tooltip()!.textContent).toBe('')
  })

  it('renders long content', () => {
    const longText = 'tooltip text '.repeat(300)
    render(
      React.createElement(
        Tooltip,
        { open: true },
        React.createElement(TooltipTrigger, null, 'Hover'),
        React.createElement(TooltipContent, null, longText),
      ),
    )
    expect(tooltip()!.textContent).toBe(longText)
  })

  it('closed tooltip does not leak content text into the document', () => {
    render(React.createElement(BasicTooltip, { delayDuration: 0 }))
    expect(document.body.textContent).not.toContain('Tip text')
  })

  it('consumer onMouseEnter/onMouseLeave props still fire', () => {
    const onMouseEnter = vi.fn()
    const onMouseLeave = vi.fn()
    render(
      React.createElement(
        Tooltip,
        { delayDuration: 0 },
        React.createElement(TooltipTrigger, { onMouseEnter, onMouseLeave }, 'Hover'),
        React.createElement(TooltipContent, null, 'Tip'),
      ),
    )
    mouseEnter(trigger())
    mouseLeave(trigger())
    expect(onMouseEnter).toHaveBeenCalledTimes(1)
    expect(onMouseLeave).toHaveBeenCalledTimes(1)
  })

  it('consumer onFocus/onBlur props still fire', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    render(
      React.createElement(
        Tooltip,
        { delayDuration: 0 },
        React.createElement(TooltipTrigger, { onFocus, onBlur }, 'Hover'),
        React.createElement(TooltipContent, null, 'Tip'),
      ),
    )
    focus(trigger())
    blur(trigger())
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('placement prop is accepted and content still renders', () => {
    render(React.createElement(BasicTooltip, { open: true, placement: 'bottom' }))
    expect(tooltip()).toBeTruthy()
  })
})
