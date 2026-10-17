// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  CONTEXT_MENU_LONG_PRESS_DELAY_MS,
  CONTEXT_SUBMENU_CLOSE_DELAY_MS,
  CONTEXT_SUBMENU_OPEN_DELAY_MS,
  CONTEXT_MENU_TYPEAHEAD_RESET_MS,
} from '../src/index.js'

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
  document.body.replaceChildren()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function render(ui: React.ReactElement) {
  act(() => root.render(ui))
}

function $(selector: string): HTMLElement {
  const el = document.querySelector<HTMLElement>(selector)
  if (!el) throw new Error(`Missing ${selector}`)
  return el
}

function menus(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="menu"]'))
}

function item(label: string): HTMLElement {
  const found = Array.from(document.querySelectorAll<HTMLElement>('[role^="menuitem"]')).find(
    (el) => el.textContent?.trim().startsWith(label),
  )
  if (!found) throw new Error(`Missing item ${label}`)
  return found
}

function focused(): string | undefined {
  return document.activeElement?.textContent?.trim()
}

function rightClick(el: Element, clientX = 120, clientY = 80): MouseEvent {
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX, clientY, button: 2 })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  act(() => {
    ;(document.activeElement ?? document.body).dispatchEvent(event)
  })
  return event
}

/** Type a character at an explicit event time, so typeahead bursts are deterministic. */
function type(key: string, timeStamp: number) {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  Object.defineProperty(event, 'timeStamp', { value: timeStamp })
  act(() => {
    document.activeElement!.dispatchEvent(event)
  })
}

function pointer(el: Element, type: string, init: PointerEventInit = {}) {
  act(() => {
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerType: 'mouse', ...init }))
  })
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }
}

/** A message row with a full menu: actions, a checkbox, a radio group and a submenu. */
function Harness({ onSelect = () => {}, longPressDelay }: { onSelect?: (label: string) => void; longPressDelay?: number }) {
  const [pinned, setPinned] = React.useState(false)
  const [notify, setNotify] = React.useState('all')
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger longPressDelay={longPressDelay}>
          <div tabIndex={0} data-testid="row">
            Hello from Ada
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Message actions">
          <ContextMenuItem onSelect={() => onSelect('Reply')}>Reply</ContextMenuItem>
          <ContextMenuItem disabled onSelect={() => onSelect('Edit')}>
            Edit
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => onSelect('Copy')}>Copy text</ContextMenuItem>
          <ContextMenuItem onSelect={() => onSelect('Copy link')}>Copy link</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
            <ContextMenuSubContent aria-label="Destinations">
              <ContextMenuItem onSelect={() => onSelect('Archive')}>Archive</ContextMenuItem>
              <ContextMenuItem onSelect={() => onSelect('Inbox')}>Inbox</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked={pinned} onCheckedChange={setPinned}>
            Pinned
          </ContextMenuCheckboxItem>
          <ContextMenuRadioGroup value={notify} onValueChange={setNotify}>
            <ContextMenuRadioItem value="all">Notify all</ContextMenuRadioItem>
            <ContextMenuRadioItem value="mentions">Notify mentions</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
          <ContextMenuItem variant="destructive" onSelect={() => onSelect('Delete')}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <button type="button" data-testid="elsewhere">
        Elsewhere
      </button>
    </>
  )
}

describe('opening', () => {
  it('opens at the pointer on right-click and suppresses the native menu', () => {
    render(<Harness />)
    const event = rightClick($('[data-testid="row"]'), 120, 80)
    expect(event.defaultPrevented).toBe(true)
    const [menu] = menus()
    expect(menu.style.left).toBe('120px')
    expect(menu.style.top).toBe('80px')
    expect(menu.parentElement).toBe(document.body) // portalled
    expect(document.activeElement).toBe(menu)
  })

  it('flips and shifts the menu into the viewport using its measured size', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200)
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300)
    Object.assign(window, { innerWidth: 1000, innerHeight: 800 })
    render(<Harness />)
    rightClick($('[data-testid="row"]'), 950, 700)
    const [menu] = menus()
    expect(menu.style.left).toBe('750px')
    expect(menu.style.top).toBe('400px')
    expect(menu.hasAttribute('data-flipped-x')).toBe(true)
    expect(menu.hasAttribute('data-flipped-y')).toBe(true)
  })

  it('moves to a new point on a second right-click', () => {
    render(<Harness />)
    rightClick($('[data-testid="row"]'), 10, 20)
    rightClick($('[data-testid="row"]'), 300, 200)
    expect(menus()).toHaveLength(1)
    expect(menus()[0].style.left).toBe('300px')
  })

  it.each([
    ['Shift+F10', 'F10', true],
    ['the ContextMenu key', 'ContextMenu', false],
  ])('opens at the focused element on %s and focuses the first item', (_name, key, shiftKey) => {
    render(<Harness />)
    const row = $('[data-testid="row"]')
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue(rect(40, 100, 300, 32))
    row.focus()
    expect(press(key, { shiftKey }).defaultPrevented).toBe(true)
    const [menu] = menus()
    expect(menu.style.left).toBe('40px')
    expect(menu.style.top).toBe('132px')
    expect(focused()).toBe('Reply')
  })

  it('ignores F10 without Shift', () => {
    render(<Harness />)
    $('[data-testid="row"]').focus()
    press('F10')
    expect(menus()).toHaveLength(0)
  })

  it('keeps the keyboard anchor when the browser follows up with its own contextmenu event', () => {
    render(<Harness />)
    const row = $('[data-testid="row"]')
    vi.spyOn(row, 'getBoundingClientRect').mockReturnValue(rect(40, 100, 300, 32))
    row.focus()
    press('ContextMenu')
    expect(rightClick(row, 0, 0).defaultPrevented).toBe(true)
    expect(menus()[0].style.left).toBe('40px')
  })

  it('lets the native menu through when the trigger is disabled', () => {
    render(
      <ContextMenu>
        <ContextMenuTrigger disabled>Row</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Reply</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    expect(rightClick(container.firstElementChild!).defaultPrevented).toBe(false)
    expect(menus()).toHaveLength(0)
  })

  it('reports open changes through onOpenChange', () => {
    const onOpenChange = vi.fn()
    render(
      <ContextMenu onOpenChange={onOpenChange}>
        <ContextMenuTrigger>Row</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Reply</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    rightClick(container.firstElementChild!)
    press('Escape')
    expect(onOpenChange.mock.calls).toEqual([[true], [false]])
  })
})

describe('long-press', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('opens at the touch point after the long-press delay', () => {
    render(<Harness />)
    pointer($('[data-testid="row"]'), 'pointerdown', { pointerType: 'touch', clientX: 60, clientY: 90 })
    advance(CONTEXT_MENU_LONG_PRESS_DELAY_MS - 1)
    expect(menus()).toHaveLength(0)
    advance(1)
    expect(menus()[0].style.left).toBe('60px')
    expect(menus()[0].style.top).toBe('90px')
  })

  it('honours a custom longPressDelay', () => {
    render(<Harness longPressDelay={50} />)
    pointer($('[data-testid="row"]'), 'pointerdown', { pointerType: 'pen', clientX: 5, clientY: 5 })
    advance(50)
    expect(menus()).toHaveLength(1)
  })

  it('cancels when the finger lifts, drifts past the tolerance, or the browser takes over', () => {
    render(<Harness />)
    const row = $('[data-testid="row"]')
    pointer(row, 'pointerdown', { pointerType: 'touch', clientX: 60, clientY: 90 })
    pointer(row, 'pointerup', { pointerType: 'touch' })
    pointer(row, 'pointerdown', { pointerType: 'touch', clientX: 60, clientY: 90 })
    pointer(row, 'pointermove', { pointerType: 'touch', clientX: 60, clientY: 120 })
    pointer(row, 'pointerdown', { pointerType: 'touch', clientX: 60, clientY: 90 })
    pointer(row, 'pointercancel', { pointerType: 'touch' })
    advance(CONTEXT_MENU_LONG_PRESS_DELAY_MS * 2)
    expect(menus()).toHaveLength(0)
  })

  it('does not long-press with a mouse', () => {
    render(<Harness />)
    pointer($('[data-testid="row"]'), 'pointerdown', { pointerType: 'mouse' })
    advance(CONTEXT_MENU_LONG_PRESS_DELAY_MS * 2)
    expect(menus()).toHaveLength(0)
  })

  it('swallows the click from lifting the finger so it cannot pick the item underneath', () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    pointer($('[data-testid="row"]'), 'pointerdown', { pointerType: 'touch', clientX: 60, clientY: 90 })
    advance(CONTEXT_MENU_LONG_PRESS_DELAY_MS)
    click(item('Reply'))
    expect(onSelect).not.toHaveBeenCalled()
    expect(menus()).toHaveLength(1)
    // The next deliberate tap works.
    pointer(item('Reply'), 'pointerdown', { pointerType: 'touch' })
    click(item('Reply'))
    expect(onSelect).toHaveBeenCalledWith('Reply')
  })
})

describe('roving focus and typeahead', () => {
  function openWithKeyboard() {
    render(<Harness />)
    $('[data-testid="row"]').focus()
    press('F10', { shiftKey: true })
  }

  it('moves with the arrows, skipping disabled items and wrapping', () => {
    openWithKeyboard()
    expect(focused()).toBe('Reply')
    press('ArrowDown')
    expect(focused()).toBe('Copy text') // Edit is disabled
    press('ArrowUp')
    expect(focused()).toBe('Reply')
    press('ArrowUp')
    expect(focused()).toBe('Delete')
    press('ArrowDown')
    expect(focused()).toBe('Reply')
  })

  it('jumps with Home and End', () => {
    openWithKeyboard()
    press('End')
    expect(focused()).toBe('Delete')
    press('Home')
    expect(focused()).toBe('Reply')
  })

  it('enters the list from the menu itself after a right-click', () => {
    render(<Harness />)
    rightClick($('[data-testid="row"]'))
    press('ArrowDown')
    expect(focused()).toBe('Reply')
  })

  it('jumps to items by typed prefix and cycles on a repeated letter', () => {
    openWithKeyboard()
    type('c', 1000)
    expect(focused()).toBe('Copy text')
    type('c', 1100)
    expect(focused()).toBe('Copy link')
    type('d', 1200) // "ccd" matches nothing, so focus stays
    expect(focused()).toBe('Copy link')
    type('d', 1200 + CONTEXT_MENU_TYPEAHEAD_RESET_MS + 1)
    expect(focused()).toBe('Delete')
  })

  it('never lands on a disabled item by typeahead', () => {
    openWithKeyboard()
    press('e')
    expect(focused()).toBe('Reply')
  })

  it('moves focus to an item under the pointer, but not to a disabled one', () => {
    render(<Harness />)
    rightClick($('[data-testid="row"]'))
    pointer(item('Copy link'), 'pointerover')
    expect(focused()).toBe('Copy link')
    pointer(item('Edit'), 'pointerover')
    expect(focused()).toBe('Copy link')
  })
})

describe('submenus', () => {
  function openAndFocusSubTrigger() {
    render(<Harness />)
    $('[data-testid="row"]').focus()
    press('F10', { shiftKey: true })
    press('m')
    expect(focused()).toBe('Move to')
  }

  it('opens with ArrowRight onto its first item and closes with ArrowLeft back to the trigger', () => {
    openAndFocusSubTrigger()
    const trigger = item('Move to')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    press('ArrowRight')
    expect(menus()).toHaveLength(2)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(menus()[1].id)
    expect(focused()).toBe('Archive')
    press('ArrowDown')
    expect(focused()).toBe('Inbox')
    press('ArrowLeft')
    expect(menus()).toHaveLength(1)
    expect(document.activeElement).toBe(trigger)
  })

  it('opens with Enter, and ArrowDown in the submenu stays in the submenu', () => {
    openAndFocusSubTrigger()
    press('Enter')
    press('ArrowDown')
    press('ArrowDown')
    expect(focused()).toBe('Archive')
    expect(menus()).toHaveLength(2)
  })

  it('closes when keyboard focus moves to a sibling in the parent menu', () => {
    openAndFocusSubTrigger()
    vi.useFakeTimers()
    pointer(item('Move to'), 'pointerover')
    advance(CONTEXT_SUBMENU_OPEN_DELAY_MS)
    expect(menus()).toHaveLength(2)
    expect(focused()).toBe('Move to')
    press('ArrowDown')
    expect(focused()).toBe('Pinned')
    expect(menus()).toHaveLength(1)
  })

  it('selecting a submenu item runs it and closes every level', () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    const row = $('[data-testid="row"]')
    row.focus()
    press('F10', { shiftKey: true })
    press('m')
    press('ArrowRight')
    press('Enter')
    expect(onSelect).toHaveBeenCalledWith('Archive')
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(row)
  })

  describe('hover intent', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      render(<Harness />)
      rightClick($('[data-testid="row"]'))
    })

    it('opens after the pointer rests on the sub-trigger, leaving focus on it', () => {
      pointer(item('Move to'), 'pointerover')
      advance(CONTEXT_SUBMENU_OPEN_DELAY_MS - 1)
      expect(menus()).toHaveLength(1)
      advance(1)
      expect(menus()).toHaveLength(2)
      expect(focused()).toBe('Move to')
    })

    it('does not open when the pointer only passes over the sub-trigger', () => {
      pointer(item('Move to'), 'pointerover')
      pointer(item('Move to'), 'pointerout', { relatedTarget: item('Pinned') })
      advance(CONTEXT_SUBMENU_OPEN_DELAY_MS)
      expect(menus()).toHaveLength(1)
    })

    it('stays open while the pointer travels into the submenu, and closes after the grace period otherwise', () => {
      pointer(item('Move to'), 'pointerover')
      advance(CONTEXT_SUBMENU_OPEN_DELAY_MS)
      const sub = menus()[1]
      // Leaving the trigger and crossing a sibling row starts the grace timer...
      pointer(item('Move to'), 'pointerout', { relatedTarget: item('Copy link') })
      advance(CONTEXT_SUBMENU_CLOSE_DELAY_MS - 1)
      // ...which entering the submenu cancels.
      pointer(sub, 'pointerover')
      advance(CONTEXT_SUBMENU_CLOSE_DELAY_MS * 2)
      expect(menus()).toHaveLength(2)
      // Leaving the submenu for the parent closes it after the grace period.
      pointer(sub, 'pointerout', { relatedTarget: item('Reply') })
      advance(CONTEXT_SUBMENU_CLOSE_DELAY_MS)
      expect(menus()).toHaveLength(1)
    })

    it('opens immediately on click', () => {
      click(item('Move to'))
      expect(menus()).toHaveLength(2)
    })
  })
})

describe('closing and focus return', () => {
  it('Escape closes and returns focus to the target', () => {
    render(<Harness />)
    const row = $('[data-testid="row"]')
    rightClick(row)
    expect(document.activeElement).not.toBe(row)
    press('Escape')
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(row)
  })

  it('Escape inside a submenu closes every level', () => {
    render(<Harness />)
    const row = $('[data-testid="row"]')
    row.focus()
    press('F10', { shiftKey: true })
    press('m')
    press('ArrowRight')
    press('Escape')
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(row)
  })

  it('an outside press closes and returns focus to the target', () => {
    render(<Harness />)
    const row = $('[data-testid="row"]')
    rightClick(row)
    pointer($('[data-testid="elsewhere"]'), 'pointerdown')
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(row)
  })

  it('a press inside an open submenu is not an outside press', () => {
    render(<Harness />)
    rightClick($('[data-testid="row"]'))
    click(item('Move to'))
    pointer(item('Archive'), 'pointerdown')
    expect(menus()).toHaveLength(2)
  })

  it('Tab closes and hands focus back to the target', () => {
    render(<Harness />)
    const row = $('[data-testid="row"]')
    row.focus()
    press('ContextMenu')
    press('Tab')
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(row)
  })

  it('never shows the native menu over the custom one', () => {
    render(<Harness />)
    rightClick($('[data-testid="row"]'))
    expect(rightClick(item('Reply')).defaultPrevented).toBe(true)
  })
})

describe('items', () => {
  it('click and Enter / Space run onSelect, close, and return focus', () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    const row = $('[data-testid="row"]')
    rightClick(row)
    click(item('Reply'))
    expect(onSelect).toHaveBeenLastCalledWith('Reply')
    expect(menus()).toHaveLength(0)
    expect(document.activeElement).toBe(row)

    row.focus()
    press('F10', { shiftKey: true })
    press('End')
    press(' ')
    expect(onSelect).toHaveBeenLastCalledWith('Delete')
  })

  it('disabled items ignore click and Enter', () => {
    const onSelect = vi.fn()
    render(<Harness onSelect={onSelect} />)
    rightClick($('[data-testid="row"]'))
    const edit = item('Edit')
    expect(edit.getAttribute('aria-disabled')).toBe('true')
    click(edit)
    edit.focus()
    press('Enter')
    expect(onSelect).not.toHaveBeenCalled()
    expect(menus()).toHaveLength(1)
  })

  it('a checkbox item toggles its checked state', () => {
    render(<Harness />)
    const row = $('[data-testid="row"]')
    rightClick(row)
    expect(item('Pinned').getAttribute('aria-checked')).toBe('false')
    click(item('Pinned'))
    rightClick(row)
    expect(item('Pinned').getAttribute('aria-checked')).toBe('true')
    item('Pinned').focus()
    press('Enter')
    rightClick(row)
    expect(item('Pinned').getAttribute('aria-checked')).toBe('false')
  })

  it('a radio item selects its value within the group', () => {
    render(<Harness />)
    const row = $('[data-testid="row"]')
    rightClick(row)
    expect(item('Notify all').getAttribute('aria-checked')).toBe('true')
    expect(item('Notify mentions').getAttribute('aria-checked')).toBe('false')
    click(item('Notify mentions'))
    rightClick(row)
    expect(item('Notify all').getAttribute('aria-checked')).toBe('false')
    expect(item('Notify mentions').getAttribute('aria-checked')).toBe('true')
  })
})

describe('asChild trigger', () => {
  it('merges the behaviour onto the child and still runs its own handlers', () => {
    const own = vi.fn()
    render(
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button type="button" onContextMenu={own}>
            File.txt
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Rename</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    )
    const button = $('button')
    rightClick(button)
    expect(own).toHaveBeenCalledTimes(1)
    expect(menus()).toHaveLength(1)
    press('Escape')
    expect(document.activeElement).toBe(button)
  })
})
