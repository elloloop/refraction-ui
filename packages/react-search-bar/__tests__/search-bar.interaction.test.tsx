// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { SearchBar, SearchResults, SearchResultItem } from '../src/search-bar.js'

// React 19 expects this flag when running tests outside a browser bundler.
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
  vi.useRealTimers()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function input(): HTMLInputElement {
  const el = container.querySelector('input')
  if (!el) throw new Error('input not rendered')
  return el
}

const nativeValueSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'value',
)!.set!

/** Simulate a user edit: native value + a bubbling input event. */
function setValue(next: string) {
  act(() => {
    nativeValueSetter.call(input(), next)
    input().dispatchEvent(new Event('input', { bubbles: true }))
  })
}

/** Type text one character at a time (one input event per character). */
function typeText(text: string) {
  for (const ch of text) setValue(input().value + ch)
}

function keyDown(key: string) {
  act(() => {
    input().dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    )
  })
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function clearButton(): HTMLButtonElement | null {
  return container.querySelector('button[aria-label="Clear search"]')
}

function spinner(): Element | null {
  return container.querySelector('[aria-label="Loading"]')
}

function listbox(): HTMLElement | null {
  return container.querySelector('[role="listbox"]')
}

describe('typing', () => {
  it('updates the input value as the user types (uncontrolled)', () => {
    render(React.createElement(SearchBar, null))
    typeText('hey')
    expect(input().value).toBe('hey')
  })

  it('starts from defaultValue when uncontrolled', () => {
    render(React.createElement(SearchBar, { defaultValue: 'seed' }))
    expect(input().value).toBe('seed')
    setValue('seedling')
    expect(input().value).toBe('seedling')
  })

  it('calls onValueChange for every keystroke', () => {
    const onValueChange = vi.fn()
    render(React.createElement(SearchBar, { onValueChange }))
    typeText('ab')
    expect(onValueChange).toHaveBeenCalledTimes(2)
    expect(onValueChange).toHaveBeenNthCalledWith(1, 'a')
    expect(onValueChange).toHaveBeenNthCalledWith(2, 'ab')
  })

  it('keeps the controlled value while reporting changes', () => {
    const onValueChange = vi.fn()
    render(
      React.createElement(SearchBar, { value: 'fixed', onValueChange }),
    )
    setValue('fixedx')
    expect(onValueChange).toHaveBeenCalledWith('fixedx')
    // Controlled: the rendered value does not move without a prop update
    expect(input().value).toBe('fixed')
  })
})

describe('debounce', () => {
  it('does not call onSearch synchronously while typing', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(React.createElement(SearchBar, { onSearch }))
    typeText('query')
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('calls onSearch once with the latest value after the debounce window', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(React.createElement(SearchBar, { onSearch }))
    typeText('query')
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('query')
  })

  it('resets the debounce timer on each keystroke', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(React.createElement(SearchBar, { onSearch }))
    typeText('a')
    act(() => {
      vi.advanceTimersByTime(200)
    })
    typeText('b')
    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(onSearch).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('ab')
  })

  it('honours a custom debounceMs', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(React.createElement(SearchBar, { onSearch, debounceMs: 500 }))
    typeText('x')
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(onSearch).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('x')
  })

  it('does not schedule a search when the input is emptied', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(React.createElement(SearchBar, { onSearch }))
    typeText('x')
    setValue('')
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onSearch).not.toHaveBeenCalled()
  })
})

describe('loading spinner', () => {
  it('shows the spinner while a search is pending and hides it after', () => {
    vi.useFakeTimers()
    render(React.createElement(SearchBar, { onSearch: () => {} }))
    expect(spinner()).toBeNull()
    typeText('a')
    expect(spinner()).not.toBeNull()
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(spinner()).toBeNull()
  })

  it('renders the spinner immediately when loading is set', () => {
    render(React.createElement(SearchBar, { loading: true }))
    expect(spinner()).not.toBeNull()
  })
})

describe('clear button', () => {
  it('is hidden while a search is pending and appears once settled', () => {
    vi.useFakeTimers()
    render(React.createElement(SearchBar, { onSearch: () => {} }))
    typeText('a')
    expect(clearButton()).toBeNull()
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(clearButton()).not.toBeNull()
  })

  it('clicking it empties the input and notifies onValueChange', () => {
    vi.useFakeTimers()
    const onValueChange = vi.fn()
    render(React.createElement(SearchBar, { onValueChange }))
    typeText('abc')
    act(() => {
      vi.advanceTimersByTime(300)
    })
    click(clearButton()!)
    expect(input().value).toBe('')
    expect(onValueChange).toHaveBeenLastCalledWith('')
  })

  it('clicking it hides the clear button again', () => {
    vi.useFakeTimers()
    render(React.createElement(SearchBar, null))
    typeText('abc')
    act(() => {
      vi.advanceTimersByTime(300)
    })
    click(clearButton()!)
    expect(clearButton()).toBeNull()
  })
})

describe('Escape key', () => {
  it('clears the input and cancels the pending search', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(React.createElement(SearchBar, { onSearch }))
    typeText('abc')
    keyDown('Escape')
    expect(input().value).toBe('')
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onSearch).not.toHaveBeenCalled()
  })
})

describe('Enter submit', () => {
  it('submits the current value immediately without waiting for the debounce', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(React.createElement(SearchBar, { onSearch }))
    typeText('hello')
    keyDown('Enter')
    expect(onSearch).toHaveBeenCalledTimes(1)
    expect(onSearch).toHaveBeenCalledWith('hello')
  })

  it('cancels the pending debounced search on Enter', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(React.createElement(SearchBar, { onSearch }))
    typeText('hello')
    keyDown('Enter')
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('hides the spinner after an Enter submit', () => {
    vi.useFakeTimers()
    const onSearch = vi.fn()
    render(React.createElement(SearchBar, { onSearch }))
    typeText('hello')
    expect(spinner()).not.toBeNull()
    keyDown('Enter')
    expect(spinner()).toBeNull()
  })
})

describe('suggestions', () => {
  function renderWithSuggestions(extraProps: Record<string, unknown> = {}) {
    return render(
      React.createElement(
        SearchBar,
        extraProps,
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, null, 'Apple'),
          React.createElement(SearchResultItem, null, 'Apricot'),
        ),
      ),
    )
  }

  it('renders the results list only once a value is present', () => {
    renderWithSuggestions()
    expect(listbox()).toBeNull()
    typeText('a')
    expect(listbox()).not.toBeNull()
    expect(listbox()!.textContent).toContain('Apple')
    expect(listbox()!.textContent).toContain('Apricot')
  })

  it('removes the results list after clearing', () => {
    renderWithSuggestions()
    typeText('a')
    expect(listbox()).not.toBeNull()
    keyDown('Escape')
    expect(listbox()).toBeNull()
  })

  it('suggestion items receive click handlers', () => {
    const onPick = vi.fn()
    render(
      React.createElement(
        SearchBar,
        { defaultValue: 'a' },
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, { onClick: onPick }, 'Apple'),
        ),
      ),
    )
    const item = container.querySelector('[role="option"]')
    expect(item).not.toBeNull()
    click(item!)
    expect(onPick).toHaveBeenCalledTimes(1)
  })

  it('input aria-controls points at the rendered list id', () => {
    renderWithSuggestions({ defaultValue: 'a' })
    const controls = input().getAttribute('aria-controls')
    expect(controls).toBeTruthy()
    expect(listbox()!.id).toBe(controls)
  })
})
