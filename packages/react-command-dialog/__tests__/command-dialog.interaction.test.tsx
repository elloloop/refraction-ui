// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  CommandDialog,
  type CommandDialogGroupData,
  type CommandDialogItemData,
  type CommandDialogProps,
} from '../src/index.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const PEOPLE: CommandDialogItemData[] = [
  { id: 'ada', label: 'Ada Lovelace' },
  { id: 'alan', label: 'Alan Turing' },
]
const FILES: CommandDialogItemData[] = [{ id: 'roadmap', label: 'Roadmap.pdf' }]
const FILTERS = [
  { id: 'people', label: 'People' },
  { id: 'files', label: 'Files' },
]

/** A caller-side search: substring match, as an app's backend would do. */
function search(query: string): CommandDialogGroupData[] {
  const match = (item: CommandDialogItemData) => item.label.toLowerCase().includes(query.trim().toLowerCase())
  return [
    { id: 'people', heading: 'People', scope: 'people', items: PEOPLE.filter(match) },
    { id: 'files', heading: 'Files', scope: 'files', items: FILES.filter(match) },
  ]
}

function Harness(props: Partial<CommandDialogProps>) {
  const [query, setQuery] = React.useState('')
  return (
    <>
      <button type="button" id="opener">
        Open
      </button>
      <CommandDialog
        groups={search(query)}
        filters={FILTERS}
        // Pinned so Ctrl+K opens regardless of the host running jsdom; tests override it.
        platform="other"
        {...props}
        onQueryChange={(q) => {
          setQuery(q)
          props.onQueryChange?.(q)
        }}
      />
    </>
  )
}

let host: HTMLDivElement
let root: Root

beforeEach(() => {
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
})

afterEach(() => {
  act(() => root.unmount())
  document.body.replaceChildren()
})

function render(ui: React.ReactElement) {
  act(() => root.render(ui))
}

const dialog = () => document.querySelector('[role="dialog"]')
const input = () => document.querySelector<HTMLInputElement>('[role="searchbox"]')!
const radios = () => [...document.querySelectorAll<HTMLButtonElement>('[role="radio"]')]
const options = () => [...document.querySelectorAll<HTMLElement>('[role="option"]')]

function key(target: Element, init: KeyboardEventInit) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

function focusOpenerAndPress(init: KeyboardEventInit) {
  const opener = document.getElementById('opener')!
  opener.focus()
  key(opener, init)
  return opener
}

function type(value: string) {
  const el = input()
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
  act(() => {
    setValue.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

describe('opening by shortcut', () => {
  it('opens on Ctrl+K, focuses the search input, and Escape returns focus to the opener', () => {
    const onOpenChange = vi.fn()
    render(<Harness platform="other" onOpenChange={onOpenChange} />)
    expect(dialog()).toBeNull()

    const opener = focusOpenerAndPress({ key: 'k', ctrlKey: true })
    expect(dialog()).not.toBeNull()
    expect(document.activeElement).toBe(input())
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    key(input(), { key: 'Escape' })
    expect(dialog()).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(document.activeElement).toBe(opener)
  })

  it('opens on ⌘K on mac and the same shortcut toggles it closed', () => {
    render(<Harness platform="mac" />)
    const opener = document.getElementById('opener')!
    opener.focus()
    // Prevented so the browser's own ⌘K / Ctrl+K (address bar search) does not also fire.
    expect(key(opener, { key: 'K', metaKey: true }).defaultPrevented).toBe(true)
    expect(dialog()).not.toBeNull()
    key(input(), { key: 'k', metaKey: true })
    expect(dialog()).toBeNull()
  })

  it('ignores plain K and K with the wrong modifier', () => {
    render(<Harness />)
    focusOpenerAndPress({ key: 'k' })
    focusOpenerAndPress({ key: 'k', altKey: true })
    expect(dialog()).toBeNull()
  })

  it('honours a custom shortcut and can be disabled', () => {
    render(<Harness shortcut="Ctrl+/" />)
    focusOpenerAndPress({ key: 'k', ctrlKey: true })
    expect(dialog()).toBeNull()
    focusOpenerAndPress({ key: '/', ctrlKey: true })
    expect(dialog()).not.toBeNull()

    act(() => root.unmount())
    root = createRoot(host)
    render(<Harness shortcut={false} />)
    focusOpenerAndPress({ key: 'k', ctrlKey: true })
    expect(dialog()).toBeNull()
  })

  it('stays controlled: the shortcut only requests a change', () => {
    const onOpenChange = vi.fn()
    render(<Harness platform="other" open={false} onOpenChange={onOpenChange} />)
    focusOpenerAndPress({ key: 'k', ctrlKey: true })
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(dialog()).toBeNull()
  })
})

describe('Mod per platform', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('on mac binds ⌘K only, leaving Ctrl+K (kill to end of line) to the text field', () => {
    render(<Harness platform="mac" />)
    const opener = document.getElementById('opener')!
    opener.focus()
    expect(key(opener, { key: 'k', ctrlKey: true }).defaultPrevented).toBe(false)
    expect(dialog()).toBeNull()
    key(opener, { key: 'k', metaKey: true })
    expect(dialog()).not.toBeNull()
  })

  it('elsewhere binds Ctrl+K only, leaving Meta+K alone', () => {
    render(<Harness platform="other" />)
    const opener = document.getElementById('opener')!
    opener.focus()
    expect(key(opener, { key: 'k', metaKey: true }).defaultPrevented).toBe(false)
    expect(dialog()).toBeNull()
    key(opener, { key: 'k', ctrlKey: true })
    expect(dialog()).not.toBeNull()
  })

  it('binds an explicit Ctrl+K exactly as written, even on mac', () => {
    render(<Harness platform="mac" shortcut="Ctrl+K" />)
    focusOpenerAndPress({ key: 'k', metaKey: true })
    expect(dialog()).toBeNull()
    focusOpenerAndPress({ key: 'k', ctrlKey: true })
    expect(dialog()).not.toBeNull()
  })

  it('detects mac from navigator after mount when no platform is given', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    render(<Harness platform={undefined} />)
    focusOpenerAndPress({ key: 'k', ctrlKey: true })
    expect(dialog()).toBeNull()
    focusOpenerAndPress({ key: 'k', metaKey: true })
    expect(dialog()).not.toBeNull()
  })

  it('detects a non-Apple platform from navigator after mount', () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32')
    render(<Harness platform={undefined} />)
    focusOpenerAndPress({ key: 'k', metaKey: true })
    expect(dialog()).toBeNull()
    focusOpenerAndPress({ key: 'k', ctrlKey: true })
    expect(dialog()).not.toBeNull()
  })
})

describe('query, results and highlighting', () => {
  it('reports the query, shows caller results and highlights matches', () => {
    const onQueryChange = vi.fn()
    render(<Harness defaultOpen onQueryChange={onQueryChange} />)
    type('lov')
    expect(onQueryChange).toHaveBeenLastCalledWith('lov')
    expect(options().map((o) => o.dataset.value)).toEqual(['ada'])
    const marks = [...document.querySelectorAll('[role="option"] mark')].map((m) => m.textContent)
    expect(marks).toEqual(['Lov'])
    expect(document.querySelector('[role="status"]')!.textContent).toBe('1 result')
  })

  it('announces the count through a custom formatter', () => {
    render(<Harness defaultOpen formatResultCount={(n) => `${n} hits`} />)
    type('a')
    expect(document.querySelector('[role="status"]')!.textContent).toBe('3 hits')
  })

  it('highlights every whitespace-separated term', () => {
    render(<Harness defaultOpen groups={[{ id: 'g', heading: 'G', items: PEOPLE }]} />)
    type('ada love')
    const marks = [...document.querySelectorAll('[data-value="ada"] mark')].map((m) => m.textContent)
    expect(marks).toEqual(['Ada', 'Love'])
  })

  it('shows the empty label when nothing matches', () => {
    render(<Harness defaultOpen emptyLabel="Nothing found" />)
    type('zzz')
    expect(options()).toHaveLength(0)
    expect(dialog()!.textContent).toContain('Nothing found')
    expect(document.querySelector('[role="status"]')!.textContent).toBe('0 results')
  })

  it('clears the query (and tells the caller) when the dialog closes', () => {
    const onQueryChange = vi.fn()
    render(<Harness onQueryChange={onQueryChange} />)
    focusOpenerAndPress({ key: 'k', ctrlKey: true })
    type('ada')
    key(input(), { key: 'Escape' })
    expect(onQueryChange).toHaveBeenLastCalledWith('')
    focusOpenerAndPress({ key: 'k', ctrlKey: true })
    expect(input().value).toBe('')
  })

  it('shows the loading state, then results when the caller resolves', () => {
    function Async() {
      const [loading, setLoading] = React.useState(true)
      return (
        <>
          <button type="button" id="resolve" onClick={() => setLoading(false)}>
            resolve
          </button>
          <CommandDialog defaultOpen loading={loading} groups={loading ? [] : search('')} emptyLabel="None" />
        </>
      )
    }
    render(<Async />)
    const status = document.querySelector('[role="status"]')!
    expect(status.textContent).toBe('Searching…')
    expect(document.querySelector('[role="listbox"]')!.getAttribute('aria-busy')).toBe('true')
    expect(dialog()!.textContent).not.toContain('None')

    act(() => document.getElementById('resolve')!.click())
    // A blank query is the opening state, so there is no count to announce.
    expect(status.textContent).toBe('')
    expect(document.querySelector('[role="listbox"]')!.getAttribute('aria-busy')).toBe('false')
    expect(options()).toHaveLength(3)
  })
})

describe('selecting', () => {
  it('ArrowDown + Enter selects, records a recent, closes and restores focus', () => {
    const onSelect = vi.fn()
    const onRecentItemsChange = vi.fn()
    render(<Harness onSelect={onSelect} onRecentItemsChange={onRecentItemsChange} />)
    const opener = focusOpenerAndPress({ key: 'k', ctrlKey: true })

    key(input(), { key: 'ArrowDown' })
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[1].id)
    key(input(), { key: 'Enter' })

    const alan = { id: 'alan', label: 'Alan Turing', scope: 'people' }
    expect(onSelect).toHaveBeenCalledWith(alan)
    expect(onRecentItemsChange).toHaveBeenCalledWith([alan])
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(opener)
  })

  it('shows recents first on reopen, without repeating them in their group', () => {
    render(<Harness />)
    focusOpenerAndPress({ key: 'k', ctrlKey: true })
    act(() => options()[2].click())
    focusOpenerAndPress({ key: 'k', ctrlKey: true })

    const recent = document.querySelector('[data-section="recent"]')!
    expect(recent.getAttribute('aria-label')).toBe('Recent')
    expect(options().map((o) => o.dataset.value)).toEqual(['roadmap', 'ada', 'alan'])
    type('road')
    expect(document.querySelector('[data-section="recent"]')).toBeNull()
  })

  it('moves a re-selected recent to the front and caps the list', () => {
    const onRecentItemsChange = vi.fn()
    render(
      <Harness
        defaultOpen
        maxRecentItems={2}
        defaultRecentItems={[
          { id: 'roadmap', label: 'Roadmap.pdf', scope: 'files' },
          { id: 'ada', label: 'Ada Lovelace', scope: 'people' },
        ]}
        onRecentItemsChange={onRecentItemsChange}
      />,
    )
    const alan = options().find((o) => o.dataset.value === 'alan')!
    act(() => alan.click())
    expect(onRecentItemsChange.mock.calls[0][0].map((i: CommandDialogItemData) => i.id)).toEqual(['alan', 'roadmap'])
  })

  it('does not select a disabled item', () => {
    const onSelect = vi.fn()
    render(
      <Harness
        defaultOpen
        onSelect={onSelect}
        groups={[{ id: 'g', heading: 'G', items: [{ id: 'x', label: 'Locked', disabled: true }] }]}
      />,
    )
    key(input(), { key: 'Enter' })
    act(() => options()[0].click())
    expect(onSelect).not.toHaveBeenCalled()
    expect(dialog()).not.toBeNull()
  })
})

describe('filter chips', () => {
  it('sit in the Tab order right after the input, as a single stop', () => {
    render(<Harness defaultOpen />)
    const tabbable = [...dialog()!.querySelectorAll<HTMLElement>('input, button')].filter((el) => el.tabIndex >= 0)
    expect(tabbable).toEqual([input(), radios()[0]])
  })

  it('arrow keys move and select the chip, scoping results, without touching the list', () => {
    const onActiveFilterChange = vi.fn()
    render(<Harness defaultOpen onActiveFilterChange={onActiveFilterChange} />)
    radios()[0].focus()

    const right = key(radios()[0], { key: 'ArrowRight' })
    expect(right.defaultPrevented).toBe(true)
    expect(onActiveFilterChange).toHaveBeenLastCalledWith('people')
    expect(document.activeElement).toBe(radios()[1])
    expect(radios()[1].getAttribute('aria-checked')).toBe('true')
    expect(radios()[1].tabIndex).toBe(0)
    expect(radios()[0].tabIndex).toBe(-1)
    expect(options().map((o) => o.dataset.value)).toEqual(['ada', 'alan'])

    key(radios()[1], { key: 'End' })
    expect(document.activeElement).toBe(radios()[2])
    expect(options().map((o) => o.dataset.value)).toEqual(['roadmap'])

    key(radios()[2], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(radios()[0])
    key(radios()[0], { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(radios()[2])
    key(radios()[2], { key: 'Home' })
    expect(radios()[0].getAttribute('aria-checked')).toBe('true')
  })

  it('Enter on a chip does not select a result', () => {
    const onSelect = vi.fn()
    render(<Harness defaultOpen onSelect={onSelect} />)
    radios()[1].focus()
    key(radios()[1], { key: 'Enter' })
    expect(onSelect).not.toHaveBeenCalled()
    expect(dialog()).not.toBeNull()
  })

  it('Escape on a chip still closes the palette', () => {
    render(<Harness />)
    const opener = focusOpenerAndPress({ key: 'k', ctrlKey: true })
    radios()[1].focus()
    key(radios()[1], { key: 'Escape' })
    expect(dialog()).toBeNull()
    expect(document.activeElement).toBe(opener)
  })

  it('a click selects a chip and scopes recents too', () => {
    render(
      <Harness
        defaultOpen
        defaultRecentItems={[
          { id: 'roadmap', label: 'Roadmap.pdf', scope: 'files' },
          { id: 'ada', label: 'Ada Lovelace', scope: 'people' },
        ]}
      />,
    )
    act(() => radios()[2].click())
    expect(options().map((o) => o.dataset.value)).toEqual(['roadmap'])
  })

  it('a controlled chip only changes when the parent says so', () => {
    const onActiveFilterChange = vi.fn()
    render(<Harness defaultOpen activeFilter="files" onActiveFilterChange={onActiveFilterChange} />)
    act(() => radios()[1].click())
    expect(onActiveFilterChange).toHaveBeenCalledWith('people')
    expect(radios()[2].getAttribute('aria-checked')).toBe('true')
  })
})
