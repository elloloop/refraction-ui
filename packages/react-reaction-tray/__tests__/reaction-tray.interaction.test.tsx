// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ReactionTray, type ReactionTrayOption } from '../src/index.js'
import { REACTION_TRAY_POP_DURATION_MS } from '@refraction-ui/reaction-tray'

// React 19 expects this flag when running outside a browser bundler.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const OPTIONS: ReactionTrayOption[] = Array.from({ length: 8 }, (_, i) => ({
  id: `r${i}`,
  glyph: `g${i}`,
  label: `Reaction ${i}`,
}))

let container: HTMLDivElement
let root: Root

function stubReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

beforeEach(() => {
  stubReducedMotion(false)
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

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function keyDown(el: Element, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function option(label: string): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
  if (!el) throw new Error(`${label} not rendered`)
  return el
}

function toggle(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('button[aria-expanded]')
  if (!el) throw new Error('toggle not rendered')
  return el
}

function focused(): string | null {
  return (document.activeElement as HTMLElement | null)?.getAttribute('aria-label') ?? null
}

/** Harness that toggles isActive the way a real parent would. */
function StatefulTray(props: Partial<React.ComponentProps<typeof ReactionTray>>) {
  const [options, setOptions] = React.useState(OPTIONS)
  return (
    <ReactionTray
      options={options}
      onSelected={(picked) =>
        setOptions((list) =>
          list.map((o) => (o.id === picked.id ? { ...o, isActive: !o.isActive } : o)),
        )
      }
      {...props}
    />
  )
}

describe('ReactionTray (interaction, jsdom)', () => {
  it('clicking an option reports it via onSelected', () => {
    const onSelected = vi.fn()
    render(<ReactionTray options={OPTIONS} inlineCount={3} onSelected={onSelected} />)
    click(option('Reaction 1'))
    expect(onSelected).toHaveBeenCalledTimes(1)
    expect(onSelected.mock.calls[0][0]).toMatchObject({ id: 'r1', label: 'Reaction 1' })
  })

  it('a parent toggling isActive flips aria-pressed on and off', () => {
    render(<StatefulTray inlineCount={3} />)
    click(option('Reaction 0'))
    expect(option('Reaction 0').getAttribute('aria-pressed')).toBe('true')
    click(option('Reaction 0'))
    expect(option('Reaction 0').getAttribute('aria-pressed')).toBe('false')
  })

  it('Enter and Space reach the native button activation (not swallowed by the grid)', () => {
    // jsdom does not synthesise the click a browser fires for Enter/Space on a
    // <button>; we assert our handler leaves those keys alone and the cell is a
    // native button, then dispatch that click.
    const onSelected = vi.fn()
    render(<ReactionTray options={OPTIONS} inlineCount={3} onSelected={onSelected} />)
    const cell = option('Reaction 2')
    expect(cell.tagName).toBe('BUTTON')
    expect(cell.type).toBe('button')
    expect(keyDown(cell, 'Enter').defaultPrevented).toBe(false)
    expect(keyDown(cell, ' ').defaultPrevented).toBe(false)
    click(cell)
    expect(onSelected).toHaveBeenCalledWith(expect.objectContaining({ id: 'r2' }))
  })

  it('arrow keys move focus in 2-D with a roving tabindex', () => {
    // inlineCount 3 + toggle → 4 columns. Expanded rows:
    //   r0 r1 r2 [toggle]
    //   r3 r4 r5 r6
    //   r7
    render(<ReactionTray options={OPTIONS} inlineCount={3} initiallyExpanded />)
    act(() => option('Reaction 0').focus())

    keyDown(option('Reaction 0'), 'ArrowRight')
    expect(focused()).toBe('Reaction 1')
    keyDown(option('Reaction 1'), 'ArrowDown')
    expect(focused()).toBe('Reaction 4')
    keyDown(option('Reaction 4'), 'ArrowDown')
    expect(focused()).toBe('Reaction 7')
    keyDown(option('Reaction 7'), 'ArrowUp')
    expect(focused()).toBe('Reaction 3')
    keyDown(option('Reaction 3'), 'ArrowLeft')
    expect(focused()).toBe('Fewer reactions')

    expect(toggle().tabIndex).toBe(0)
    expect(option('Reaction 3').tabIndex).toBe(-1)
  })

  it('Home/End stay in the row; Ctrl+Home/End reach the grid ends', () => {
    render(<ReactionTray options={OPTIONS} inlineCount={3} initiallyExpanded />)
    act(() => option('Reaction 5').focus())
    keyDown(option('Reaction 5'), 'Home')
    expect(focused()).toBe('Reaction 3')
    keyDown(option('Reaction 3'), 'End')
    expect(focused()).toBe('Reaction 6')
    keyDown(option('Reaction 6'), 'Home', { ctrlKey: true })
    expect(focused()).toBe('Reaction 0')
    keyDown(option('Reaction 0'), 'End', { ctrlKey: true })
    expect(focused()).toBe('Reaction 7')
  })

  it('navigation keys are consumed even at an edge so the page does not scroll', () => {
    render(<ReactionTray options={OPTIONS} inlineCount={3} />)
    act(() => option('Reaction 0').focus())
    expect(keyDown(option('Reaction 0'), 'ArrowUp').defaultPrevented).toBe(true)
    expect(focused()).toBe('Reaction 0')
    expect(keyDown(option('Reaction 0'), 'Tab').defaultPrevented).toBe(false)
  })

  it('More expands, Fewer collapses, and focus stays on the same toggle element', () => {
    render(<ReactionTray options={OPTIONS} inlineCount={3} />)
    expect(container.querySelectorAll('button[aria-pressed]')).toHaveLength(3)

    const before = toggle()
    act(() => before.focus())
    click(before)
    expect(toggle()).toBe(before)
    expect(document.activeElement).toBe(before)
    expect(before.getAttribute('aria-expanded')).toBe('true')
    expect(before.getAttribute('aria-label')).toBe('Fewer reactions')
    expect(container.querySelectorAll('button[aria-pressed]')).toHaveLength(8)

    click(before)
    expect(document.activeElement).toBe(before)
    expect(before.getAttribute('aria-expanded')).toBe('false')
    expect(before.getAttribute('aria-label')).toBe('More reactions')
    expect(container.querySelectorAll('button[aria-pressed]')).toHaveLength(3)
  })

  it('collapsing while the roving stop was on a hidden option moves it to the toggle', () => {
    render(<ReactionTray options={OPTIONS} inlineCount={3} initiallyExpanded />)
    act(() => option('Reaction 6').focus())
    click(toggle())
    expect(toggle().tabIndex).toBe(0)
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(1)
  })

  it('autofocus focuses the first cell on mount', () => {
    render(<ReactionTray options={OPTIONS} inlineCount={3} autofocus />)
    expect(focused()).toBe('Reaction 0')
  })

  it('without autofocus nothing is focused', () => {
    render(<ReactionTray options={OPTIONS} inlineCount={3} />)
    expect(document.activeElement).toBe(document.body)
  })

  it('selecting pops the glyph briefly', () => {
    vi.useFakeTimers()
    render(<ReactionTray options={OPTIONS} inlineCount={3} />)
    click(option('Reaction 1'))
    const glyph = option('Reaction 1').querySelector('[data-popping]')
    expect(glyph?.getAttribute('data-popping')).toBe('true')
    act(() => {
      vi.advanceTimersByTime(REACTION_TRAY_POP_DURATION_MS)
    })
    expect(glyph?.getAttribute('data-popping')).toBe('false')
  })

  it('does not pop under prefers-reduced-motion', () => {
    stubReducedMotion(true)
    const onSelected = vi.fn()
    render(<ReactionTray options={OPTIONS} inlineCount={3} onSelected={onSelected} />)
    click(option('Reaction 1'))
    expect(onSelected).toHaveBeenCalledTimes(1)
    expect(option('Reaction 1').querySelector('[data-popping]')?.getAttribute('data-popping')).toBe(
      'false',
    )
  })

  it('unmounting mid-pop clears the timer without warnings', () => {
    vi.useFakeTimers()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<ReactionTray options={OPTIONS} inlineCount={3} />)
    click(option('Reaction 1'))
    act(() => root.render(<div />))
    act(() => {
      vi.advanceTimersByTime(REACTION_TRAY_POP_DURATION_MS)
    })
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })
})
