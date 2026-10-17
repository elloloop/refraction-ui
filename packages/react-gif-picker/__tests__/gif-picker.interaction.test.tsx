// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { GifPicker, type GifPickerItem, type GifPickerProps } from '../src/index.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const DEBOUNCE_MS = 250

function gif(id: string, overrides: Partial<GifPickerItem> = {}): GifPickerItem {
  return {
    id,
    previewUrl: `https://media.example/${id}/still.png`,
    animatedUrl: `https://media.example/${id}/anim.gif`,
    width: 200,
    height: 200,
    alt: `Alt ${id}`,
    ...overrides,
  }
}

// 3 columns, 8 items:
// 0 1 2
// 3 4 5
// 6 7
const RESULTS = Array.from({ length: 8 }, (_, i) => gif(String(i)))

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
  vi.unstubAllGlobals()
})

function render(props: Partial<GifPickerProps> = {}) {
  act(() => {
    root.render(<GifPicker results={RESULTS} onSelect={() => {}} debounceMs={DEBOUNCE_MS} {...props} />)
  })
}

function searchBox(): HTMLInputElement {
  const el = container.querySelector<HTMLInputElement>('input[type="search"]')
  if (!el) throw new Error('search box not rendered')
  return el
}

/** Set an input's value the way a user edit does, so React's onChange fires. */
function type(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  act(() => {
    setter?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function press(el: Element, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
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

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function items(): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button[data-gif-id]'))
}

function tab(name: string): HTMLButtonElement {
  const el = Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]')).find(
    (t) => t.textContent === name,
  )
  if (!el) throw new Error(`tab ${name} not rendered`)
  return el
}

function buttonByText(text: string): HTMLButtonElement {
  const el = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find(
    (b) => b.textContent === text,
  )
  if (!el) throw new Error(`button ${text} not rendered`)
  return el
}

describe('GifPicker search (debounced)', () => {
  it('calls onSearch once with the settled, normalised query after the delay', () => {
    const onSearch = vi.fn()
    render({ onSearch })
    type(searchBox(), 'c')
    type(searchBox(), 'ca')
    type(searchBox(), 'cat ')
    advance(DEBOUNCE_MS - 1)
    expect(onSearch).not.toHaveBeenCalled()
    advance(1)
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('cat', 'popular')
  })

  it('Enter searches immediately and is not left to submit a form', () => {
    const onSearch = vi.fn()
    render({ onSearch })
    type(searchBox(), 'dog')
    const event = press(searchBox(), 'Enter')
    expect(event.defaultPrevented).toBe(true)
    expect(onSearch).toHaveBeenCalledWith('dog', 'popular')
    advance(DEBOUNCE_MS)
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('does not re-request the defaultQuery the results already reflect', () => {
    const onSearch = vi.fn()
    render({ onSearch, defaultQuery: 'dog' })
    type(searchBox(), 'dog ')
    advance(DEBOUNCE_MS)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('keeps a pending search when debounceMs changes', () => {
    const onSearch = vi.fn()
    render({ onSearch })
    type(searchBox(), 'owl')
    render({ onSearch, debounceMs: DEBOUNCE_MS * 2 })
    advance(DEBOUNCE_MS)
    expect(onSearch).not.toHaveBeenCalled()
    advance(DEBOUNCE_MS)
    expect(onSearch).toHaveBeenCalledWith('owl', 'popular')
  })

  it('drops a pending search on unmount', () => {
    const onSearch = vi.fn()
    render({ onSearch })
    type(searchBox(), 'owl')
    act(() => {
      root.unmount()
    })
    root = createRoot(container)
    advance(DEBOUNCE_MS)
    expect(onSearch).not.toHaveBeenCalled()
  })
})

describe('GifPicker tabs', () => {
  it('clicking a tab selects it and loads it immediately with the current query', () => {
    const onSearch = vi.fn()
    const onTabChange = vi.fn()
    render({ onSearch, onTabChange })
    type(searchBox(), 'wave')
    click(tab('Recent'))
    expect(onTabChange).toHaveBeenCalledWith('recent')
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('wave', 'recent')
    expect(tab('Recent').getAttribute('aria-selected')).toBe('true')
    advance(DEBOUNCE_MS)
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('arrow keys in the tab list move between tabs (automatic activation)', () => {
    const onTabChange = vi.fn()
    render({ onTabChange })
    focus(tab('Popular'))
    press(tab('Popular'), 'ArrowRight')
    expect(onTabChange).toHaveBeenLastCalledWith('recent')
    expect(document.activeElement).toBe(tab('Recent'))
    press(tab('Recent'), 'End')
    expect(onTabChange).toHaveBeenLastCalledWith('yours')
  })

  it('respects a controlled tab', () => {
    const onTabChange = vi.fn()
    render({ tab: 'yours', onTabChange })
    click(tab('Popular'))
    expect(onTabChange).toHaveBeenCalledWith('popular')
    expect(tab('Yours').getAttribute('aria-selected')).toBe('true')
  })
})

describe('GifPicker grid keyboard navigation', () => {
  it('moves the roving focus with arrows, Home/End and Ctrl+End', () => {
    render()
    const start = items()[0]
    focus(start)
    press(start, 'ArrowRight')
    expect(document.activeElement).toBe(items()[1])
    press(items()[1], 'ArrowDown')
    expect(document.activeElement).toBe(items()[4])
    press(items()[4], 'ArrowDown')
    expect(document.activeElement).toBe(items()[7])
    press(items()[7], 'ArrowUp')
    expect(document.activeElement).toBe(items()[4])
    press(items()[4], 'End')
    expect(document.activeElement).toBe(items()[5])
    press(items()[5], 'Home')
    expect(document.activeElement).toBe(items()[3])
    press(items()[3], 'End', { ctrlKey: true })
    expect(document.activeElement).toBe(items()[7])
    press(items()[7], 'Home', { ctrlKey: true })
    expect(document.activeElement).toBe(items()[0])
  })

  it('keeps exactly one tab stop on the focused item', () => {
    render()
    focus(items()[0])
    press(items()[0], 'ArrowRight')
    const stops = items().filter((b) => b.tabIndex === 0)
    expect(stops).toEqual([items()[1]])
  })

  it('prevents scrolling at an edge but leaves other keys alone', () => {
    render()
    focus(items()[0])
    expect(press(items()[0], 'ArrowUp').defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(items()[0])
    expect(press(items()[0], 'Tab').defaultPrevented).toBe(false)
  })

  it('follows the columns prop', () => {
    render({ columns: 4 })
    focus(items()[1])
    press(items()[1], 'ArrowDown')
    expect(document.activeElement).toBe(items()[5])
  })
})

describe('GifPicker selection and states', () => {
  it('clicking an item calls onSelect with that item', () => {
    const onSelect = vi.fn()
    render({ onSelect })
    click(items()[2])
    expect(onSelect).toHaveBeenCalledWith(RESULTS[2])
  })

  it('shows still images when the user prefers reduced motion', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    render()
    const img = items()[0].querySelector('img')
    expect(img?.getAttribute('src')).toBe(RESULTS[0].previewUrl)
    expect(items()[0].querySelector('source')).toBeNull()
  })

  it('Retry and Load more call their callbacks', () => {
    const onRetry = vi.fn()
    const onLoadMore = vi.fn()
    render({ results: [], status: 'error', onRetry })
    click(buttonByText('Try again'))
    expect(onRetry).toHaveBeenCalledTimes(1)
    render({ hasMore: true, onLoadMore })
    click(buttonByText('Load more'))
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('announces state changes in the live region', () => {
    render({ results: [], status: 'loading' })
    const status = container.querySelector('[role="status"]')
    expect(status?.textContent).toBe('Loading GIFs…')
    render({ results: RESULTS.slice(0, 2) })
    expect(status?.textContent).toBe('2 GIFs')
  })

  it('clamps the roving index when results shrink', () => {
    render()
    focus(items()[7])
    render({ results: RESULTS.slice(0, 3) })
    expect(items().filter((b) => b.tabIndex === 0)).toEqual([items()[2]])
  })
})
