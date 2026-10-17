// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  MESSAGE_ROW_HIGHLIGHT_FADE_MS,
  MESSAGE_ROW_HIGHLIGHT_HOLD_MS,
  MESSAGE_ROW_LONG_PRESS_MOVE_TOLERANCE_PX,
} from '@refraction-ui/message-row'
import { MESSAGE_ROW_LONG_PRESS_DELAY_MS, MessageRow, type MessageRowAction, type MessageRowProps } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  document.getSelection()?.removeAllRanges()
  document.body.replaceChildren()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function render(props: Partial<MessageRowProps> = {}) {
  act(() => {
    root.render(<MessageRow authorName="Ana Lima" timestamp="10:42" body="Ship it on Friday?" {...props} />)
  })
}

function row(): HTMLElement {
  return container.querySelector<HTMLElement>('[role="article"]')!
}
function body(): HTMLElement {
  return container.querySelector<HTMLElement>('[data-message-row-body]')!
}
function toolbar(): HTMLElement {
  return container.querySelector<HTMLElement>('[role="toolbar"]')!
}
function toolbarState(): string | null {
  return toolbar().getAttribute('data-state')
}
function button(label: string): HTMLButtonElement {
  const el = document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
  if (!el) throw new Error(`button ${label} not rendered`)
  return el
}

function pointer(type: string, target: Element, init: PointerEventInit = {}) {
  act(() => {
    target.dispatchEvent(
      new PointerEvent(type, { bubbles: type !== 'pointerenter' && type !== 'pointerleave', pointerType: 'mouse', button: 0, ...init }),
    )
  })
}
function hover(target: Element = row()) {
  pointer('pointerenter', target)
}
function click(target: Element) {
  act(() => {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}
function key(target: Element, k: string) {
  const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}
function focus(el: HTMLElement) {
  act(() => el.focus())
}
function selectBody() {
  act(() => {
    const range = document.createRange()
    range.selectNodeContents(body())
    const selection = document.getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))
  })
}
function clearSelection() {
  act(() => {
    document.getSelection()!.removeAllRanges()
    document.dispatchEvent(new Event('selectionchange'))
  })
}

const noop = () => {}
function actions(overrides: Partial<Record<string, () => void>> = {}): MessageRowAction[] {
  return ['Reply', 'React', 'Edit', 'Copy link', 'Delete'].map((label) => ({
    icon: <svg />,
    label,
    onSelected: overrides[label] ?? noop,
    destructive: label === 'Delete',
  }))
}

describe('toolbar visibility', () => {
  it('shows on mouse hover and hides on leave', () => {
    render({ actions: actions() })
    expect(toolbarState()).toBe('hidden')
    hover()
    expect(toolbarState()).toBe('visible')
    expect(row().getAttribute('data-active')).toBe('true')
    pointer('pointerleave', row())
    expect(toolbarState()).toBe('hidden')
  })

  it('does not treat a touch pointer as hover', () => {
    render({ actions: actions() })
    pointer('pointerenter', row(), { pointerType: 'touch' })
    expect(toolbarState()).toBe('hidden')
  })

  it('shows while keyboard focus is inside the row and hides when it leaves', () => {
    render({ actions: actions() })
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    focus(button('Reply'))
    expect(toolbarState()).toBe('visible')
    focus(outside)
    expect(toolbarState()).toBe('hidden')
  })

  it('reveals the continuation timestamp on hover and on focus', () => {
    render({ continuation: true, actions: actions() })
    const time = () => container.querySelector('[id$="-time"]')!.parentElement!.className
    expect(time()).toContain('opacity-0')
    hover()
    expect(time()).toContain('opacity-100')
    pointer('pointerleave', row())
    focus(button('Reply'))
    expect(time()).toContain('opacity-100')
  })

  it('steps aside while text in the body is selected', () => {
    render({ actions: actions() })
    hover()
    selectBody()
    expect(toolbarState()).toBe('hidden')
    clearSelection()
    expect(toolbarState()).toBe('visible')
  })

  it('steps aside when a selection elsewhere lies under the toolbar', () => {
    render({ actions: actions() })
    const other = document.createElement('p')
    other.textContent = 'previous message'
    document.body.prepend(other)
    vi.spyOn(toolbar(), 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 0, 100, 30))
    const under = [new DOMRect(120, 10, 40, 16)]
    Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => under })
    try {
      hover()
      act(() => {
        const range = document.createRange()
        range.selectNodeContents(other)
        document.getSelection()!.addRange(range)
        document.dispatchEvent(new Event('selectionchange'))
      })
      expect(toolbarState()).toBe('hidden')
      under.splice(0, 1, new DOMRect(400, 200, 40, 16))
      act(() => {
        document.dispatchEvent(new Event('selectionchange'))
      })
      expect(toolbarState()).toBe('visible')
    } finally {
      delete (Range.prototype as { getClientRects?: unknown }).getClientRects
    }
  })

  it('hides during a pointer drag that starts in the body, and returns on release', () => {
    render({ actions: actions() })
    hover()
    pointer('pointerdown', body(), { clientX: 10, clientY: 10 })
    expect(toolbarState()).toBe('visible')
    pointer('pointermove', document.body, { clientX: 10 + MESSAGE_ROW_LONG_PRESS_MOVE_TOLERANCE_PX + 5, clientY: 10 })
    expect(toolbarState()).toBe('hidden')
    // Released outside the row: the document listener still ends the drag.
    pointer('pointerup', document.body)
    expect(toolbarState()).toBe('visible')
  })

  it('never renders a toolbar on a tombstone', () => {
    render({ tombstone: true, actions: actions() })
    hover()
    expect(container.querySelector('[role="toolbar"]')).toBeNull()
  })
})

describe('roving toolbar focus', () => {
  it('is a single Tab stop and moves with arrows, Home and End (leading slot included)', () => {
    render({ actions: actions(), toolbarLeading: <button type="button" aria-label="React with thumbs up">👍</button> })
    const items = () => Array.from(toolbar().querySelectorAll<HTMLButtonElement>('button'))
    expect(items().map((b) => b.tabIndex)).toEqual([0, -1, -1, -1, -1])

    focus(items()[0])
    key(document.activeElement!, 'ArrowRight')
    expect(document.activeElement).toBe(button('Reply'))
    expect(items().filter((b) => b.tabIndex === 0)).toEqual([button('Reply')])

    key(document.activeElement!, 'End')
    expect(document.activeElement).toBe(button('More actions'))
    key(document.activeElement!, 'ArrowRight')
    expect(document.activeElement).toBe(items()[0])
    key(document.activeElement!, 'ArrowLeft')
    expect(document.activeElement).toBe(button('More actions'))
    key(document.activeElement!, 'Home')
    expect(document.activeElement).toBe(items()[0])
  })

  it('remembers the last focused item as the Tab stop', () => {
    render({ actions: actions() })
    focus(button('Edit'))
    expect(button('Edit').tabIndex).toBe(0)
    expect(button('Reply').tabIndex).toBe(-1)
  })
})

describe('actions', () => {
  it('inline buttons call onSelected and are not row taps', () => {
    const onReply = vi.fn()
    const onTap = vi.fn()
    render({ actions: actions({ Reply: onReply }), onTap })
    click(button('Reply'))
    expect(onReply).toHaveBeenCalledTimes(1)
    expect(onTap).not.toHaveBeenCalled()
  })

  it('overflow actions open in a menu that keeps the toolbar visible, and close on select', () => {
    const onDelete = vi.fn()
    const onTap = vi.fn()
    render({ actions: actions({ Delete: onDelete }), onTap })
    focus(button('More actions'))
    click(button('More actions'))
    const menu = document.querySelector('[role="menu"]')!
    expect(menu).not.toBeNull()
    expect(button('More actions').getAttribute('aria-expanded')).toBe('true')
    const items = Array.from(menu.querySelectorAll('[role="menuitem"]'))
    expect(items.map((i) => i.textContent)).toEqual(['Copy link', 'Delete'])
    expect(items[1].hasAttribute('data-destructive')).toBe(true)
    // Focus moved into the portalled menu, yet the toolbar stays up.
    expect(row().contains(document.activeElement)).toBe(false)
    expect(toolbarState()).toBe('visible')

    click(items[1])
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onTap).not.toHaveBeenCalled()
    expect(document.querySelector('[role="menu"]')).toBeNull()
    expect(document.activeElement).toBe(button('More actions'))
  })

  it('menu arrow keys do not move the toolbar focus', () => {
    render({ actions: actions() })
    focus(button('More actions'))
    click(button('More actions'))
    const items = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]'))
    expect(document.activeElement).toBe(items[0])
    key(items[0], 'End')
    expect(document.activeElement).toBe(items[1])
  })
})

describe('tap', () => {
  it('fires on a plain click on the row content', () => {
    const onTap = vi.fn()
    render({ onTap })
    click(body())
    expect(onTap).toHaveBeenCalledTimes(1)
  })

  it('does not fire after the reader selected text', () => {
    const onTap = vi.fn()
    render({ onTap })
    selectBody()
    click(body())
    expect(onTap).not.toHaveBeenCalled()
  })

  it('does not fire for a link inside the body', () => {
    const onTap = vi.fn()
    render({ onTap, body: <a href="#plan">plan</a> })
    click(container.querySelector('a')!)
    expect(onTap).not.toHaveBeenCalled()
  })

  it('Enter on the focused row taps; Enter on a toolbar button does not', () => {
    const onTap = vi.fn()
    render({ onTap, actions: actions() })
    focus(row())
    expect(key(row(), 'Enter').defaultPrevented).toBe(true)
    expect(onTap).toHaveBeenCalledTimes(1)
    key(button('Reply'), 'Enter')
    expect(onTap).toHaveBeenCalledTimes(1)
  })
})

describe('long-press', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('fires after the default delay, not before', () => {
    const onLongPress = vi.fn()
    render({ onLongPress })
    pointer('pointerdown', body(), { clientX: 5, clientY: 5 })
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_LONG_PRESS_DELAY_MS - 1))
    expect(onLongPress).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onLongPress).toHaveBeenCalledTimes(1)
  })

  it('honours a custom delay', () => {
    const onLongPress = vi.fn()
    render({ onLongPress, longPressDelay: 800 })
    pointer('pointerdown', body())
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_LONG_PRESS_DELAY_MS))
    expect(onLongPress).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(300))
    expect(onLongPress).toHaveBeenCalledTimes(1)
  })

  it('tolerates jitter but is cancelled by a selection drag', () => {
    const onLongPress = vi.fn()
    render({ onLongPress })
    pointer('pointerdown', body(), { clientX: 0, clientY: 0 })
    pointer('pointermove', body(), { clientX: MESSAGE_ROW_LONG_PRESS_MOVE_TOLERANCE_PX, clientY: 0 })
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_LONG_PRESS_DELAY_MS))
    expect(onLongPress).toHaveBeenCalledTimes(1)

    pointer('pointerup', body())
    pointer('pointerdown', body(), { clientX: 0, clientY: 0 })
    pointer('pointermove', body(), { clientX: 30, clientY: 4 })
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_LONG_PRESS_DELAY_MS * 2))
    expect(onLongPress).toHaveBeenCalledTimes(1)
  })

  it('is cancelled by an early release or a pointercancel (e.g. scroll)', () => {
    const onLongPress = vi.fn()
    render({ onLongPress })
    pointer('pointerdown', body())
    pointer('pointerup', body())
    pointer('pointerdown', body())
    pointer('pointercancel', body())
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_LONG_PRESS_DELAY_MS * 2))
    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('ignores presses on controls, secondary buttons and tombstones', () => {
    const onLongPress = vi.fn()
    render({ onLongPress, actions: actions() })
    pointer('pointerdown', button('Reply'))
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_LONG_PRESS_DELAY_MS))
    pointer('pointerup', button('Reply'))
    pointer('pointerdown', body(), { button: 2 })
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_LONG_PRESS_DELAY_MS))
    render({ onLongPress, tombstone: true })
    pointer('pointerdown', body())
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_LONG_PRESS_DELAY_MS))
    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('swallows the click and the touch contextmenu that follow it', () => {
    const onLongPress = vi.fn()
    const onTap = vi.fn()
    const onContextMenu = vi.fn()
    render({ onLongPress, onTap, onContextMenu })
    pointer('pointerdown', body(), { pointerType: 'touch' })
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_LONG_PRESS_DELAY_MS))
    const menuEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    act(() => {
      body().dispatchEvent(menuEvent)
    })
    pointer('pointerup', body())
    click(body())
    expect(onLongPress).toHaveBeenCalledTimes(1)
    expect(menuEvent.defaultPrevented).toBe(true)
    expect(onContextMenu).not.toHaveBeenCalled()
    expect(onTap).not.toHaveBeenCalled()

    // The next ordinary click is a tap again.
    pointer('pointerdown', body())
    pointer('pointerup', body())
    click(body())
    expect(onTap).toHaveBeenCalledTimes(1)
  })
})

describe('context menu hook', () => {
  it('passes the native contextmenu event through', () => {
    const onContextMenu = vi.fn((event: React.MouseEvent) => event.preventDefault())
    render({ onContextMenu })
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 12, clientY: 34 })
    act(() => {
      body().dispatchEvent(event)
    })
    expect(onContextMenu).toHaveBeenCalledTimes(1)
    expect(onContextMenu.mock.calls[0][0].clientX).toBe(12)
    expect(event.defaultPrevented).toBe(true)
  })
})

describe('highlight', () => {
  function phase() {
    return row().getAttribute('data-highlight')
  }

  it('holds, fades and turns off', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }))
    render({ highlighted: true })
    expect(phase()).toBe('on')
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_HIGHLIGHT_HOLD_MS))
    expect(phase()).toBe('fading')
    expect(container.querySelector('[data-message-row-highlight]')!.className).toContain('transition-opacity')
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_HIGHLIGHT_FADE_MS))
    expect(phase()).toBe('off')
    expect(container.querySelector('[data-message-row-highlight]')).toBeNull()
  })

  it('is static under reduced motion until highlighted turns off', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce'), media: query }))
    render({ highlighted: true })
    act(() => vi.advanceTimersByTime((MESSAGE_ROW_HIGHLIGHT_HOLD_MS + MESSAGE_ROW_HIGHLIGHT_FADE_MS) * 2))
    expect(phase()).toBe('on')
    render({ highlighted: false })
    expect(phase()).toBe('off')
  })

  it('does not throw where matchMedia is missing', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(() => render({ highlighted: true })).not.toThrow()
    expect(phase()).toBe('on')
  })

  it('re-runs when highlighted is set again', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: false, media: query }))
    render({ highlighted: true })
    act(() => vi.advanceTimersByTime(MESSAGE_ROW_HIGHLIGHT_HOLD_MS + MESSAGE_ROW_HIGHLIGHT_FADE_MS))
    render({ highlighted: false })
    render({ highlighted: true })
    expect(phase()).toBe('on')
  })
})

describe('ref', () => {
  it('forwards the ref to the row element', () => {
    const ref = React.createRef<HTMLDivElement>()
    act(() => {
      root.render(<MessageRow ref={ref} authorName="Ana" body="hi" />)
    })
    expect(ref.current).toBe(row())
  })
})
