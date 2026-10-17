// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { PinnedBar, type PinnedBarItem } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const ITEMS: PinnedBarItem[] = [
  { id: 'a', author: 'Ada Lovelace', snippet: 'Standup moved to 10:30.' },
  { id: 'b', author: 'Grace Hopper', snippet: 'Release checklist is in the wiki.' },
  { id: 'c', author: 'Alan Turing', snippet: 'Please review the migration plan.' },
]

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

function button(label: string): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)
  if (!el) throw new Error(`button "${label}" not rendered`)
  return el
}

const next = () => button('Next pinned message')
const previous = () => button('Previous pinned message')
const liveRegion = () => container.querySelector('[aria-live="polite"]')!
const position = () => container.querySelector('[id$="-position"]')!.textContent

function snippetText() {
  return container.querySelector('[role="region"]')!.textContent ?? ''
}

/** Harness that removes pins on unpin the way a real parent would. */
function UnpinningBar({ initial }: { initial: PinnedBarItem[] }) {
  const [items, setItems] = React.useState(initial)
  return (
    <PinnedBar
      items={items}
      defaultIndex={initial.length - 1}
      onUnpin={(item) => setItems((current) => current.filter((i) => i.id !== item.id))}
    />
  )
}

describe('PinnedBar (interaction, jsdom)', () => {
  it('next and previous move through the pins and wrap at both ends', () => {
    const onIndexChange = vi.fn()
    render(<PinnedBar items={ITEMS} onIndexChange={onIndexChange} />)
    expect(position()).toBe('1 of 3')

    click(next())
    expect(position()).toBe('2 of 3')
    expect(snippetText()).toContain('Grace Hopper')

    click(next())
    click(next())
    expect(position()).toBe('1 of 3')

    click(previous())
    expect(position()).toBe('3 of 3')
    expect(onIndexChange.mock.calls.map(([i]) => i)).toEqual([1, 2, 0, 2])
  })

  it('keeps focus on the next button across the wrap (it never disables)', () => {
    render(<PinnedBar items={ITEMS} defaultIndex={2} />)
    next().focus()
    click(next())
    expect(position()).toBe('1 of 3')
    expect(next().disabled).toBe(false)
    expect(document.activeElement).toBe(next())
  })

  it('in controlled mode reports the index and waits for the parent', () => {
    const onIndexChange = vi.fn()
    render(<PinnedBar items={ITEMS} index={0} onIndexChange={onIndexChange} />)
    click(next())
    expect(onIndexChange).toHaveBeenCalledWith(1)
    expect(position()).toBe('1 of 3')

    render(<PinnedBar items={ITEMS} index={1} onIndexChange={onIndexChange} />)
    expect(position()).toBe('2 of 3')
  })

  it('announces the new pin politely, but not on first render', () => {
    render(<PinnedBar items={ITEMS} />)
    expect(liveRegion().textContent).toBe('')

    click(next())
    expect(liveRegion().textContent).toBe(
      'Pinned message 2 of 3. Grace Hopper: Release checklist is in the wiki.',
    )
  })

  it('does not re-announce when only an unrelated prop changes', () => {
    render(<PinnedBar items={ITEMS} className="a" />)
    render(<PinnedBar items={ITEMS} className="b" />)
    expect(liveRegion().textContent).toBe('')
  })

  it('uses labels.announcement for the live region', () => {
    render(
      <PinnedBar
        items={ITEMS}
        labels={{ announcement: (item, pos) => `${pos}: ${item.author}` }}
      />,
    )
    click(next())
    expect(liveRegion().textContent).toBe('2 of 3: Grace Hopper')
  })

  it('clicking the snippet opens that message', () => {
    const onOpen = vi.fn()
    render(<PinnedBar items={ITEMS} defaultIndex={1} onOpen={onOpen} />)
    const snippet = container.querySelector<HTMLButtonElement>('button[aria-describedby]')!
    click(snippet)
    expect(onOpen).toHaveBeenCalledWith(ITEMS[1])
  })

  it('open-list and unpin call their handlers with the current pin', () => {
    const onOpenList = vi.fn()
    const onUnpin = vi.fn()
    render(<PinnedBar items={ITEMS} defaultIndex={2} onOpenList={onOpenList} onUnpin={onUnpin} />)
    click(button('Show all pinned messages'))
    expect(onOpenList).toHaveBeenCalledTimes(1)
    click(button('Unpin message'))
    expect(onUnpin).toHaveBeenCalledWith(ITEMS[2])
  })

  it('unpinning the last pin shows the new last pin and announces it', () => {
    render(<UnpinningBar initial={ITEMS} />)
    expect(position()).toBe('3 of 3')

    click(button('Unpin message'))
    expect(position()).toBe('2 of 2')
    expect(snippetText()).toContain('Grace Hopper')
    expect(liveRegion().textContent).toContain('Grace Hopper')
  })

  it('unpinning everything removes the bar', () => {
    render(<UnpinningBar initial={[ITEMS[0]]} />)
    click(button('Unpin message'))
    expect(container.querySelector('[role="region"]')).toBeNull()
  })

  it('keeps showing the same pin when pins before it are removed (uncontrolled)', () => {
    render(<PinnedBar items={ITEMS} defaultIndex={2} />)
    render(<PinnedBar items={ITEMS.slice(1)} />)
    expect(position()).toBe('2 of 2')
    expect(snippetText()).toContain('Alan Turing')
    // Same pin, so nothing new to announce.
    expect(liveRegion().textContent).toBe('')
  })

  it('collapses and expands with the toggle (uncontrolled)', () => {
    const onCollapsedChange = vi.fn()
    render(<PinnedBar items={ITEMS} onCollapsedChange={onCollapsedChange} />)
    const content = container.querySelector<HTMLElement>('[id$="-content"]')!

    click(button('Collapse pinned messages'))
    expect(onCollapsedChange).toHaveBeenLastCalledWith(true)
    expect(content.hidden).toBe(true)
    expect(button('Expand pinned messages').getAttribute('aria-expanded')).toBe('false')
    expect(container.textContent).toContain('3 pinned messages')

    click(button('Expand pinned messages'))
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false)
    expect(content.hidden).toBe(false)
    expect(button('Collapse pinned messages').getAttribute('aria-expanded')).toBe('true')
  })

  it('keeps focus on the toggle when it collapses the bar', () => {
    render(<PinnedBar items={ITEMS} />)
    const toggle = button('Collapse pinned messages')
    toggle.focus()
    click(toggle)
    expect(document.activeElement).toBe(toggle)
  })

  it('in controlled collapsed mode reports the change and waits for the parent', () => {
    const onCollapsedChange = vi.fn()
    render(<PinnedBar items={ITEMS} collapsed={false} onCollapsedChange={onCollapsedChange} />)
    click(button('Collapse pinned messages'))
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    expect(container.querySelector<HTMLElement>('[id$="-content"]')!.hidden).toBe(false)
  })

  it('every control is a native button in the tab order', () => {
    render(<PinnedBar items={ITEMS} onOpen={vi.fn()} onOpenList={vi.fn()} onUnpin={vi.fn()} />)
    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons).toHaveLength(6)
    for (const b of buttons) {
      expect(b.getAttribute('type')).toBe('button')
      expect(b.tabIndex).toBe(0)
    }
  })
})
