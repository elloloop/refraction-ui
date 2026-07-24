// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { resetIdCounter } from '@refraction-ui/shared'
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from '../src/popover.js'

// Interaction suite for the react-popover adapter. Content is portaled to
// document.body, so queries span the whole document — complementing the SSR
// suite in popover.test.tsx, which covers structure/ARIA only.
//
// Known scope limits (no false coverage): the adapter implements trigger
// click toggle, Escape-to-close inside the content, and PopoverClose. It does
// NOT implement focus-on-open, focus return on close, or outside-click
// dismissal — focus behaviour is asserted exactly as implemented.

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
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function keyDown(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function trigger(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')
  if (!el) throw new Error('trigger not rendered')
  return el
}

/** Popover content is portaled to document.body. */
function dialog(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[role="dialog"]')
}

function BasicPopover(props: React.ComponentProps<typeof Popover> = {}) {
  return React.createElement(
    Popover,
    props,
    React.createElement(PopoverTrigger, null, 'Open popover'),
    React.createElement(
      PopoverContent,
      null,
      React.createElement('p', null, 'Popover body'),
      React.createElement(PopoverClose, null, 'Dismiss'),
    ),
  )
}

describe('Popover interaction — open/close state transitions', () => {
  it('starts closed: no dialog in the document', () => {
    render(React.createElement(BasicPopover))
    expect(dialog()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('clicking the trigger opens the popover', () => {
    render(React.createElement(BasicPopover))
    click(trigger())
    expect(dialog()).toBeTruthy()
    expect(dialog()!.textContent).toContain('Popover body')
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
  })

  it('clicking the trigger again closes the popover', () => {
    render(React.createElement(BasicPopover))
    click(trigger())
    click(trigger())
    expect(dialog()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('fires onOpenChange with the open state sequence', () => {
    const onOpenChange = vi.fn()
    render(React.createElement(BasicPopover, { onOpenChange }))
    click(trigger())
    click(trigger())
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })

  it('defaultOpen starts open (uncontrolled)', () => {
    render(React.createElement(BasicPopover, { defaultOpen: true }))
    expect(dialog()).toBeTruthy()
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
  })
})

describe('Popover interaction — keyboard', () => {
  it('Escape inside the content closes the popover', () => {
    const onOpenChange = vi.fn()
    render(React.createElement(BasicPopover, { onOpenChange }))
    click(trigger())
    const event = keyDown(dialog()!, 'Escape')
    expect(dialog()).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(event.key).toBe('Escape')
  })

  it('Escape bubbles from a nested child of the content', () => {
    render(React.createElement(BasicPopover))
    click(trigger())
    const close = Array.from(dialog()!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Dismiss',
    )!
    keyDown(close, 'Escape')
    expect(dialog()).toBeNull()
  })

  it('consumer onKeyDown on PopoverContent still fires alongside Escape handling', () => {
    const onKeyDown = vi.fn()
    render(
      React.createElement(
        Popover,
        null,
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, { onKeyDown }, 'Body'),
      ),
    )
    click(trigger())
    keyDown(dialog()!, 'Escape')
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(dialog()).toBeNull()
  })

  it('non-Escape keys do not close the popover', () => {
    render(React.createElement(BasicPopover))
    click(trigger())
    keyDown(dialog()!, 'Enter')
    keyDown(dialog()!, 'Tab')
    keyDown(dialog()!, 'a')
    expect(dialog()).toBeTruthy()
  })
})

describe('Popover interaction — PopoverClose', () => {
  it('clicking PopoverClose closes the popover', () => {
    const onOpenChange = vi.fn()
    render(React.createElement(BasicPopover, { onOpenChange }))
    click(trigger())
    const close = Array.from(dialog()!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Dismiss',
    )!
    click(close)
    expect(dialog()).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('consumer onClick on PopoverClose still fires', () => {
    const onClick = vi.fn()
    render(
      React.createElement(
        Popover,
        { defaultOpen: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(
          PopoverContent,
          null,
          React.createElement(PopoverClose, { onClick }, 'Dismiss'),
        ),
      ),
    )
    const close = Array.from(dialog()!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Dismiss',
    )!
    click(close)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(dialog()).toBeNull()
  })
})

describe('Popover interaction — controlled open', () => {
  it('open=true keeps the popover open regardless of trigger clicks', () => {
    const onOpenChange = vi.fn()
    render(React.createElement(BasicPopover, { open: true, onOpenChange }))
    expect(dialog()).toBeTruthy()
    click(trigger())
    // Callback fires, but the parent controls state — still open.
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(dialog()).toBeTruthy()
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
  })

  it('open=false keeps the popover closed regardless of trigger clicks', () => {
    const onOpenChange = vi.fn()
    render(React.createElement(BasicPopover, { open: false, onOpenChange }))
    click(trigger())
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(dialog()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('controlled: Escape reports the close intent but state stays with the parent', () => {
    const onOpenChange = vi.fn()
    render(React.createElement(BasicPopover, { open: true, onOpenChange }))
    keyDown(dialog()!, 'Escape')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(dialog()).toBeTruthy()
  })

  it('re-rendering with a toggled open prop shows/hides the content', () => {
    render(React.createElement(BasicPopover, { open: false }))
    expect(dialog()).toBeNull()
    render(React.createElement(BasicPopover, { open: true }))
    expect(dialog()).toBeTruthy()
    render(React.createElement(BasicPopover, { open: false }))
    expect(dialog()).toBeNull()
  })
})

describe('Popover interaction — ARIA and portal wiring', () => {
  it('content is portaled outside the trigger container into document.body', () => {
    render(React.createElement(BasicPopover))
    click(trigger())
    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(dialog()!.parentElement).toBe(document.body)
  })

  it('trigger aria-controls matches the portaled content id', () => {
    render(React.createElement(BasicPopover))
    click(trigger())
    expect(trigger().getAttribute('aria-controls')).toBe(dialog()!.id)
  })

  it('unmounting removes the portaled content', () => {
    render(React.createElement(BasicPopover, { defaultOpen: true }))
    expect(dialog()).toBeTruthy()
    act(() => {
      root.unmount()
    })
    expect(document.body.querySelector('[role="dialog"]')).toBeNull()
    // Re-mount for afterEach cleanup symmetry.
    root = createRoot(container)
  })
})

describe('Popover interaction — focus behaviour (as implemented)', () => {
  it('opening does not steal focus (no focus-on-open in adapter)', () => {
    render(React.createElement(BasicPopover))
    trigger().focus()
    click(trigger())
    expect(dialog()).toBeTruthy()
    expect(document.activeElement).toBe(trigger())
  })

  it('Escape close does not move focus (no focus-return in adapter)', () => {
    render(React.createElement(BasicPopover))
    trigger().focus()
    click(trigger())
    keyDown(dialog()!, 'Escape')
    expect(dialog()).toBeNull()
    // Focus is untouched by the adapter — no focus trap, no focus return.
    expect(document.activeElement).toBe(trigger())
  })

  it('focus can move freely into and out of the content (no focus trap)', () => {
    render(React.createElement(BasicPopover))
    click(trigger())
    const close = Array.from(dialog()!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Dismiss',
    )!
    close.focus()
    expect(document.activeElement).toBe(close)
    trigger().focus()
    expect(document.activeElement).toBe(trigger())
    // Popover stays open — the adapter does not dismiss on blur.
    expect(dialog()).toBeTruthy()
  })
})

describe('Popover interaction — edge cases', () => {
  it('renders empty content without crashing', () => {
    render(
      React.createElement(
        Popover,
        { defaultOpen: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null),
      ),
    )
    expect(dialog()).toBeTruthy()
    expect(dialog()!.textContent).toBe('')
  })

  it('renders long content', () => {
    const longText = 'popover content '.repeat(300)
    render(
      React.createElement(
        Popover,
        { defaultOpen: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, longText),
      ),
    )
    expect(dialog()!.textContent).toBe(longText)
  })

  it('closed popover does not leak content text into the document', () => {
    render(React.createElement(BasicPopover))
    expect(document.body.textContent).not.toContain('Popover body')
  })

  it('consumer onClick on the trigger fires alongside the toggle', () => {
    const onClick = vi.fn()
    render(
      React.createElement(
        Popover,
        null,
        React.createElement(PopoverTrigger, { onClick }, 'Open'),
        React.createElement(PopoverContent, null, 'Body'),
      ),
    )
    click(trigger())
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(dialog()).toBeTruthy()
  })

  it('placement prop is accepted and content still renders', () => {
    render(React.createElement(BasicPopover, { defaultOpen: true, placement: 'bottom' }))
    expect(dialog()).toBeTruthy()
  })
})
