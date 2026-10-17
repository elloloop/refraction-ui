// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createPortal } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { resetDevFeedback } from '@refraction-ui/shared'
import {
  CollapsibleRail,
  RailBackdrop,
  RailEdgeToggle,
  RAIL_MOBILE_MEDIA_QUERY,
  useCollapsibleRail,
  type UseCollapsibleRailOptions,
} from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const KEY = 'rail-test-collapsed'

/** A matchMedia stand-in whose answer the test controls and can change. */
function installViewport(narrow: boolean) {
  let matches = narrow
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  const queries: string[] = []
  window.matchMedia = ((query: string) => {
    queries.push(query)
    return {
      get matches() {
        return matches
      },
      media: query,
      onchange: null,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.add(listener),
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        listeners.delete(listener),
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList
  }) as typeof window.matchMedia
  return {
    queries,
    listeners,
    set(next: boolean) {
      matches = next
      act(() => {
        for (const listener of [...listeners]) listener({ matches: next } as MediaQueryListEvent)
      })
    },
  }
}

function Harness(options: UseCollapsibleRailOptions & { portal?: boolean }) {
  const { portal, ...hookOptions } = options
  const rail = useCollapsibleRail(hookOptions)
  const { collapsed, open, mobile } = rail.state
  return (
    <div>
      {mobile && open && <RailBackdrop aria-label="Close navigation" onClick={rail.closeMobile} />}
      <CollapsibleRail
        data-testid="rail"
        collapsed={collapsed}
        open={open}
        mobile={mobile}
        expandedWidth="220px"
        collapsedWidth="64px"
        onClick={rail.onChromeClick}
      >
        <RailEdgeToggle collapsed={collapsed} open={open} onClick={rail.toggle} />
        <nav aria-label="Main">
          <a href="#home">Home</a>
          <span data-testid="label">Workspace</span>
        </nav>
        {portal &&
          createPortal(<div data-testid="portal-pad">Menu padding</div>, document.body)}
      </CollapsibleRail>
      <main>
        <button type="button" onClick={rail.openMobile}>
          Open navigation
        </button>
      </main>
    </div>
  )
}

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  localStorage.clear()
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
  resetDevFeedback()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function remount(ui: React.ReactElement) {
  act(() => {
    root.unmount()
  })
  root = createRoot(container)
  render(ui)
}

const rail = () => container.querySelector<HTMLElement>('[data-testid="rail"]')!
const edge = () => container.querySelector<HTMLButtonElement>('[data-slot="rail-edge-toggle"]')!
const backdrop = () => container.querySelector<HTMLButtonElement>('[data-slot="rail-backdrop"]')
const opener = () =>
  [...container.querySelectorAll('button')].find((b) => b.textContent === 'Open navigation')!

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function press(key: string, target: EventTarget = document.activeElement ?? document.body) {
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
  })
}

describe('useCollapsibleRail on a wide viewport', () => {
  beforeEach(() => {
    installViewport(false)
  })

  it('listens to the same query the overlay CSS uses', () => {
    const viewport = installViewport(false)
    render(<Harness />)
    expect(viewport.queries).toEqual([RAIL_MOBILE_MEDIA_QUERY])
  })

  it('shows the rail in the layout at full width, not inert', () => {
    render(<Harness storageKey={KEY} />)
    expect(rail().dataset.open).toBe('true')
    expect(rail().dataset.mobile).toBe('false')
    expect(rail().style.width).toBe('220px')
    expect(rail().hasAttribute('inert')).toBe(false)
  })

  it('collapses from the edge control (a native button, so Enter and Space work) and remembers it', () => {
    render(<Harness storageKey={KEY} />)
    expect(edge().tagName).toBe('BUTTON')
    expect(edge().getAttribute('aria-expanded')).toBe('true')
    edge().focus()
    expect(document.activeElement).toBe(edge())
    click(edge())
    expect(rail().dataset.collapsed).toBe('true')
    expect(rail().style.width).toBe('64px')
    expect(edge().getAttribute('aria-label')).toBe('Expand navigation')
    expect(edge().getAttribute('aria-expanded')).toBe('false')
    expect(localStorage.getItem(KEY)).toBe('true')
    // Focus stays on the control, so the next key press flips it back.
    expect(document.activeElement).toBe(edge())
    click(edge())
    expect(rail().dataset.collapsed).toBe('false')
    expect(localStorage.getItem(KEY)).toBe('false')
  })

  it('starts at the remembered width on the next visit', () => {
    render(<Harness storageKey={KEY} />)
    click(edge())
    remount(<Harness storageKey={KEY} />)
    expect(rail().dataset.collapsed).toBe('true')
  })

  it('uses defaultCollapsed until a width is remembered, then the remembered one', () => {
    render(<Harness storageKey={KEY} defaultCollapsed />)
    expect(rail().dataset.collapsed).toBe('true')
    localStorage.setItem(KEY, 'false')
    remount(<Harness storageKey={KEY} defaultCollapsed />)
    expect(rail().dataset.collapsed).toBe('false')
  })

  it('flips the width on a click of empty chrome, never on a link or a portal inside it', () => {
    render(<Harness portal />)
    click(container.querySelector('a')!)
    expect(rail().dataset.collapsed).toBe('false')
    click(document.querySelector('[data-testid="portal-pad"]')!)
    expect(rail().dataset.collapsed).toBe('false')
    click(container.querySelector('[data-testid="label"]')!)
    expect(rail().dataset.collapsed).toBe('true')
    click(rail())
    expect(rail().dataset.collapsed).toBe('false')
  })

  it('ignores Escape: there is no overlay to close', () => {
    render(<Harness />)
    press('Escape', document.body)
    expect(rail().dataset.open).toBe('true')
  })
})

describe('useCollapsibleRail on a narrow viewport', () => {
  beforeEach(() => {
    installViewport(true)
  })

  it('starts closed, collapsed and inert, with no backdrop', () => {
    render(<Harness storageKey={KEY} />)
    expect(rail().dataset.open).toBe('false')
    expect(rail().dataset.collapsed).toBe('true')
    expect(rail().hasAttribute('inert')).toBe(true)
    expect(backdrop()).toBeNull()
  })

  it('opens at the collapsed width, moves focus into the rail, and Escape closes it and returns focus', () => {
    render(<Harness storageKey={KEY} />)
    opener().focus()
    click(opener())
    expect(rail().dataset.open).toBe('true')
    expect(rail().dataset.collapsed).toBe('true')
    expect(rail().hasAttribute('inert')).toBe(false)
    expect(backdrop()?.getAttribute('aria-label')).toBe('Close navigation')
    expect(document.activeElement).toBe(edge())

    press('Escape')
    expect(rail().dataset.open).toBe('false')
    expect(rail().hasAttribute('inert')).toBe(true)
    expect(backdrop()).toBeNull()
    expect(document.activeElement).toBe(opener())
  })

  it('leaves Escape to a handler that already used it', () => {
    render(<Harness />)
    click(opener())
    const stop = (event: KeyboardEvent) => event.preventDefault()
    document.addEventListener('keydown', stop, { capture: true })
    press('Escape')
    document.removeEventListener('keydown', stop, { capture: true })
    expect(rail().dataset.open).toBe('true')
  })

  it('closes from the backdrop and returns focus to the opener', () => {
    render(<Harness />)
    opener().focus()
    click(opener())
    backdrop()!.focus()
    click(backdrop()!)
    expect(rail().dataset.open).toBe('false')
    expect(backdrop()).toBeNull()
    expect(document.activeElement).toBe(opener())
  })

  it('does not overwrite the remembered desktop width', () => {
    localStorage.setItem(KEY, 'false')
    render(<Harness storageKey={KEY} />)
    click(opener())
    click(edge())
    expect(rail().dataset.collapsed).toBe('false')
    press('Escape')
    expect(localStorage.getItem(KEY)).toBe('false')
  })
})

describe('useCollapsibleRail across a viewport change', () => {
  it('closes the overlay when the viewport narrows and restores the remembered width when it widens', () => {
    const viewport = installViewport(false)
    render(<Harness storageKey={KEY} />)
    click(edge())
    expect(rail().dataset.collapsed).toBe('true')
    click(edge())
    expect(rail().dataset.collapsed).toBe('false')

    viewport.set(true)
    expect(rail().dataset.mobile).toBe('true')
    expect(rail().dataset.open).toBe('false')
    expect(rail().hasAttribute('inert')).toBe(true)

    viewport.set(false)
    expect(rail().dataset.mobile).toBe('false')
    expect(rail().dataset.open).toBe('true')
    expect(rail().dataset.collapsed).toBe('false')
    expect(rail().hasAttribute('inert')).toBe(false)
  })

  it('remembers the width for the page without a storage key', () => {
    const viewport = installViewport(false)
    render(<Harness />)
    click(edge())
    viewport.set(true)
    viewport.set(false)
    expect(rail().dataset.collapsed).toBe('true')
    expect(localStorage.length).toBe(0)
  })

  it('stops listening when unmounted', () => {
    const viewport = installViewport(false)
    render(<Harness />)
    expect(viewport.listeners.size).toBe(1)
    act(() => {
      root.unmount()
    })
    expect(viewport.listeners.size).toBe(0)
    root = createRoot(container)
  })
})

describe('useCollapsibleRail without usable storage', () => {
  it('keeps working and warns once in development', () => {
    installViewport(false)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    render(<Harness storageKey={KEY} />)
    click(edge())
    click(edge())
    expect(rail().dataset.collapsed).toBe('false')
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0][0])).toContain('react-collapsible-rail/storage-unavailable')
  })
})

describe('CollapsibleRail refs', () => {
  it('forwards refs to the aside and both buttons', () => {
    installViewport(false)
    const railRef = React.createRef<HTMLElement>()
    const edgeRef = React.createRef<HTMLButtonElement>()
    const backdropRef = React.createRef<HTMLButtonElement>()
    render(
      <>
        <RailBackdrop ref={backdropRef} aria-label="Close navigation" />
        <CollapsibleRail ref={railRef} collapsed={false} open>
          <RailEdgeToggle ref={edgeRef} collapsed={false} open />
        </CollapsibleRail>
      </>,
    )
    expect(railRef.current?.tagName).toBe('ASIDE')
    expect(edgeRef.current?.dataset.slot).toBe('rail-edge-toggle')
    expect(backdropRef.current?.dataset.slot).toBe('rail-backdrop')
  })
})
