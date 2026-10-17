// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, hydrateRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { DropdownMenuItem } from '@refraction-ui/react-dropdown-menu'
import {
  SplitButton,
  SplitButtonAction,
  SplitButtonTrigger,
  SplitButtonMenu,
  type SplitButtonProps,
  type SplitButtonTriggerProps,
} from '../src/index.js'

// Interaction suite (jsdom, no Testing Library). jsdom has no layout engine
// and does not turn Enter/Space on a button into a click, so native button
// activation, hit-testing and menu placement are covered by the Playwright
// suite (e2e/split-button.spec.ts); here we drive clicks and key events.

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
  vi.restoreAllMocks()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

interface ExampleProps extends Partial<SplitButtonProps> {
  onAction?: () => void
  onDraft?: () => void
  trigger?: Partial<SplitButtonTriggerProps>
  actionDisabled?: boolean
}

function Example({ onAction, onDraft, trigger, actionDisabled, ...props }: ExampleProps) {
  return (
    <SplitButton {...props}>
      <SplitButtonAction onClick={onAction} disabled={actionDisabled}>
        Save
      </SplitButtonAction>
      <SplitButtonTrigger {...trigger} />
      <SplitButtonMenu>
        <DropdownMenuItem onSelect={onDraft}>Save as draft</DropdownMenuItem>
        <DropdownMenuItem disabled>Save to cloud</DropdownMenuItem>
        <DropdownMenuItem>Save a copy</DropdownMenuItem>
      </SplitButtonMenu>
    </SplitButton>
  )
}

function action(): HTMLButtonElement {
  return container.querySelectorAll<HTMLButtonElement>('button')[0]
}

function caret(): HTMLButtonElement {
  return container.querySelectorAll<HTMLButtonElement>('button')[1]
}

/** The menu is portalled to document.body. */
function menu(): HTMLElement | null {
  return document.body.querySelector<HTMLElement>('[role="menu"]')
}

function items(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'))
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function keyDown(el: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function focus(el: HTMLElement) {
  act(() => {
    el.focus()
  })
}

describe('SplitButton — primary action', () => {
  it('runs the action without opening the menu', () => {
    const onAction = vi.fn()
    render(<Example onAction={onAction} />)
    click(action())
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(menu()).toBeNull()
  })

  it('a click on the action’s hit-area extender reaches the action', () => {
    const onAction = vi.fn()
    render(<Example onAction={onAction} />)
    click(action().querySelector('[data-split-button-hit-area]')!)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('leaves Enter and Space to the native button', () => {
    render(<Example />)
    expect(keyDown(action(), 'Enter').defaultPrevented).toBe(false)
    expect(keyDown(action(), ' ').defaultPrevented).toBe(false)
  })
})

describe('SplitButton — caret', () => {
  it('opens the menu on click and moves focus to the first enabled item', () => {
    render(<Example />)
    expect(caret().getAttribute('aria-expanded')).toBe('false')
    click(caret())
    expect(menu()).not.toBeNull()
    expect(caret().getAttribute('aria-expanded')).toBe('true')
    expect(caret().getAttribute('data-state')).toBe('open')
    expect(container.firstElementChild?.getAttribute('data-state')).toBe('open')
    expect(document.activeElement).toBe(items()[0])
  })

  it('closes the menu on a second click', () => {
    render(<Example />)
    click(caret())
    click(caret())
    expect(menu()).toBeNull()
    expect(caret().getAttribute('aria-expanded')).toBe('false')
  })

  it('a click on the caret’s hit-area extender opens the menu', () => {
    render(<Example />)
    click(caret().querySelector('[data-split-button-hit-area]')!)
    expect(menu()).not.toBeNull()
  })

  it('opens the menu on ArrowDown, without scrolling the page, and focuses the first item', () => {
    render(<Example />)
    focus(caret())
    const event = keyDown(caret(), 'ArrowDown')
    expect(event.defaultPrevented).toBe(true)
    expect(menu()).not.toBeNull()
    expect(document.activeElement).toBe(items()[0])
  })

  it('leaves Enter and Space to the native button, which clicks it', () => {
    render(<Example />)
    expect(keyDown(caret(), 'Enter').defaultPrevented).toBe(false)
    expect(keyDown(caret(), ' ').defaultPrevented).toBe(false)
    expect(menu()).toBeNull()
  })

  it('respects a caller onKeyDown that prevents the default', () => {
    render(<Example trigger={{ onKeyDown: (event) => event.preventDefault() }} />)
    keyDown(caret(), 'ArrowDown')
    expect(menu()).toBeNull()
  })

  it('names the menu with the caret', () => {
    render(<Example />)
    click(caret())
    expect(menu()!.getAttribute('aria-labelledby')).toBe(caret().id)
    expect(caret().getAttribute('aria-controls')).toBe(menu()!.id)
  })

  it('keeps the menu named when the caret is given its own id', () => {
    render(<Example trigger={{ id: 'export-caret' }} />)
    click(caret())
    expect(caret().id).toBe('export-caret')
    expect(menu()!.getAttribute('aria-labelledby')).toBe('export-caret')
  })

  it('names the menu by the id the caret kept from the server render', () => {
    // An empty slot shifts useId's tree position without changing the markup,
    // so the client computes other ids than the server rendered. React keeps
    // the server's attributes, as it does when react-dom before 19.3 replays a
    // lazy ancestor that suspended during hydration.
    const caretIdIn = (html: string) => /aria-haspopup="menu"[^>]*id="([^"]+)"/.exec(html)?.[1]
    const serverHtml = renderToString(<div>{[null, <Example key="example" />]}</div>)
    const clientIdHere = caretIdIn(renderToString(<div><Example /></div>))
    const serverId = caretIdIn(serverHtml)
    expect(serverId).toBeTruthy()
    expect(serverId).not.toBe(clientIdHere)

    const host = document.createElement('div')
    host.innerHTML = serverHtml
    document.body.appendChild(host)
    // React reports the attribute mismatch; it is the condition under test.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let hydrated: Root | undefined
    act(() => {
      hydrated = hydrateRoot(host, <div><Example /></div>)
    })
    const hostCaret = host.querySelectorAll<HTMLButtonElement>('button')[1]
    expect(hostCaret.id).toBe(serverId)
    click(hostCaret)
    expect(menu()!.getAttribute('aria-labelledby')).toBe(hostCaret.id)
    act(() => {
      hydrated!.unmount()
    })
    host.remove()
  })

  it('forwards refs to the group, both buttons and the menu', () => {
    const groupRef = React.createRef<HTMLDivElement>()
    const actionRef = React.createRef<HTMLButtonElement>()
    const caretRef = React.createRef<HTMLButtonElement>()
    const menuRef = React.createRef<HTMLDivElement>()
    render(
      <SplitButton ref={groupRef} defaultOpen>
        <SplitButtonAction ref={actionRef}>Save</SplitButtonAction>
        <SplitButtonTrigger ref={caretRef} />
        <SplitButtonMenu ref={menuRef}>
          <DropdownMenuItem>Save as draft</DropdownMenuItem>
        </SplitButtonMenu>
      </SplitButton>,
    )
    expect(groupRef.current).toBe(container.firstElementChild)
    expect(actionRef.current).toBe(action())
    expect(caretRef.current).toBe(caret())
    expect(menuRef.current).toBe(menu())
  })
})

describe('SplitButton — menu', () => {
  it('Escape closes the menu and returns focus to the caret', () => {
    render(<Example />)
    click(caret())
    keyDown(items()[0], 'Escape')
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(caret())
  })

  it('selecting an item runs it, closes the menu and returns focus to the caret', () => {
    const onDraft = vi.fn()
    const onAction = vi.fn()
    render(<Example onDraft={onDraft} onAction={onAction} />)
    click(caret())
    keyDown(items()[0], 'Enter')
    expect(onDraft).toHaveBeenCalledTimes(1)
    expect(onAction).not.toHaveBeenCalled()
    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(caret())
  })

  it('moves between enabled items with the arrow keys', () => {
    render(<Example />)
    click(caret())
    keyDown(items()[0], 'ArrowDown')
    // "Save to cloud" is disabled, so focus skips to "Save a copy".
    expect(document.activeElement).toBe(items()[2])
  })

  it('pressing the action while the menu is open closes it and runs the action', () => {
    const onAction = vi.fn()
    render(<Example onAction={onAction} />)
    click(caret())
    act(() => {
      action().dispatchEvent(new Event('pointerdown', { bubbles: true }))
    })
    click(action())
    expect(menu()).toBeNull()
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('aligns to the caret’s end edge left-to-right', () => {
    render(<Example />)
    click(caret())
    expect(menu()!.getAttribute('data-align')).toBe('end')
  })

  it('mirrors the alignment right-to-left, so the menu still opens under the control', () => {
    render(<Example trigger={{ style: { direction: 'rtl' } }} />)
    click(caret())
    expect(menu()!.getAttribute('data-align')).toBe('start')
  })

  it('takes an explicit logical alignment', () => {
    render(
      <SplitButton defaultOpen>
        <SplitButtonAction>Save</SplitButtonAction>
        <SplitButtonTrigger />
        <SplitButtonMenu align="start">
          <DropdownMenuItem>Save as draft</DropdownMenuItem>
        </SplitButtonMenu>
      </SplitButton>,
    )
    expect(menu()!.getAttribute('data-align')).toBe('start')
  })
})

describe('SplitButton — open state', () => {
  it('reports changes and stays closed until a controlling parent opens it', () => {
    const onOpenChange = vi.fn()
    render(<Example open={false} onOpenChange={onOpenChange} />)
    click(caret())
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(menu()).toBeNull()
  })

  it('follows a controlling parent', () => {
    function Controlled() {
      const [open, setOpen] = React.useState(false)
      return (
        <>
          <output data-open={String(open)} />
          <Example open={open} onOpenChange={setOpen} />
        </>
      )
    }
    render(<Controlled />)
    keyDown(caret(), 'ArrowDown')
    expect(menu()).not.toBeNull()
    expect(container.querySelector('output')!.getAttribute('data-open')).toBe('true')
    keyDown(items()[0], 'Escape')
    expect(container.querySelector('output')!.getAttribute('data-open')).toBe('false')
  })

  it('starts open with defaultOpen', () => {
    render(<Example defaultOpen />)
    expect(menu()).not.toBeNull()
  })
})

describe('SplitButton — disabled', () => {
  it('disables both parts and ignores ArrowDown', () => {
    const onAction = vi.fn()
    render(<Example disabled onAction={onAction} />)
    expect(action().disabled).toBe(true)
    expect(caret().disabled).toBe(true)
    keyDown(caret(), 'ArrowDown')
    expect(menu()).toBeNull()
  })

  it('closes an open menu when the group becomes disabled', () => {
    const onOpenChange = vi.fn()
    render(<Example defaultOpen onOpenChange={onOpenChange} />)
    expect(menu()).not.toBeNull()
    render(<Example defaultOpen disabled onOpenChange={onOpenChange} />)
    expect(menu()).toBeNull()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes an open menu when the caret alone becomes disabled', () => {
    render(<Example defaultOpen />)
    render(<Example defaultOpen trigger={{ disabled: true }} />)
    expect(menu()).toBeNull()
    expect(action().disabled).toBe(false)
    expect(caret().disabled).toBe(true)
  })

  it('keeps the caret usable when only the action is disabled', () => {
    render(<Example actionDisabled />)
    expect(action().disabled).toBe(true)
    click(caret())
    expect(menu()).not.toBeNull()
  })
})
