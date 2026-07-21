// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ReactionBar } from '../src/reaction-bar.js'
import type { Reaction } from '../src/index.js'

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

function pills(): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button[aria-pressed]'))
}

function addButton(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('button[aria-label="Add reaction"]')
  if (!el) throw new Error('add button not rendered')
  return el
}

/** Harness that wires onToggle to state the way a real parent would. */
function StatefulBar({ initial }: { initial: Reaction[] }) {
  const [reactions, setReactions] = React.useState(initial)
  return (
    <ReactionBar
      reactions={reactions}
      onToggle={(emoji) =>
        setReactions((rs) =>
          rs.map((r) =>
            r.emoji === emoji
              ? {
                  ...r,
                  count: r.count + (r.userReacted ? -1 : 1),
                  userReacted: !r.userReacted,
                }
              : r,
          ),
        )
      }
    />
  )
}

describe('ReactionBar (interaction, jsdom)', () => {
  it('clicking a pill calls onToggle with its emoji', () => {
    const onToggle = vi.fn()
    render(
      <ReactionBar
        reactions={[
          { emoji: '\u{1F44D}', count: 2, userReacted: false },
          { emoji: '\u{1F389}', count: 5, userReacted: false },
        ]}
        onToggle={onToggle}
      />,
    )
    click(pills()[1])
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onToggle).toHaveBeenCalledWith('\u{1F389}')

    click(pills()[0])
    expect(onToggle).toHaveBeenCalledTimes(2)
    expect(onToggle).toHaveBeenCalledWith('\u{1F44D}')
  })

  it('toggling a reaction on increments the count and sets userReacted', () => {
    render(<StatefulBar initial={[{ emoji: '\u{1F44D}', count: 2, userReacted: false }]} />)
    const pill = pills()[0]
    expect(pill.textContent).toContain('2')
    expect(pill.getAttribute('aria-pressed')).toBe('false')

    click(pill)
    expect(pill.textContent).toContain('3')
    expect(pill.getAttribute('aria-pressed')).toBe('true')
    expect(pill.getAttribute('aria-label')).toBe('\u{1F44D} 3 reactions, you reacted')
  })

  it('toggling a reaction off decrements the count and clears userReacted', () => {
    render(<StatefulBar initial={[{ emoji: '\u{1F44D}', count: 3, userReacted: true }]} />)
    const pill = pills()[0]
    expect(pill.textContent).toContain('3')

    click(pill)
    expect(pill.textContent).toContain('2')
    expect(pill.getAttribute('aria-pressed')).toBe('false')
    expect(pill.getAttribute('aria-label')).toBe('\u{1F44D} 2 reactions')
  })

  it('active state switches the pill variant classes on toggle', () => {
    render(<StatefulBar initial={[{ emoji: '\u{1F44D}', count: 2, userReacted: false }]} />)
    const pill = pills()[0]
    expect(pill.className).toContain('border-border')
    expect(pill.className).not.toContain('border-primary')

    click(pill)
    expect(pill.className).toContain('border-primary')
    expect(pill.className).toContain('bg-primary/10')

    click(pill)
    expect(pill.className).toContain('border-border')
    expect(pill.className).not.toContain('border-primary')
  })

  it('toggling one reaction leaves the others untouched', () => {
    render(
      <StatefulBar
        initial={[
          { emoji: '\u{1F44D}', count: 2, userReacted: false },
          { emoji: '\u{1F389}', count: 5, userReacted: true },
        ]}
      />,
    )
    click(pills()[0])
    const party = pills()[1]
    expect(party.textContent).toContain('5')
    expect(party.getAttribute('aria-pressed')).toBe('true')
  })

  it('clicking the add button calls onAdd with the default emoji', () => {
    const onAdd = vi.fn()
    render(
      <ReactionBar
        reactions={[{ emoji: '\u{1F44D}', count: 2, userReacted: false }]}
        onAdd={onAdd}
      />,
    )
    click(addButton())
    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd).toHaveBeenCalledWith('\u{1F44D}')
  })

  it('works without callbacks attached', () => {
    render(
      <ReactionBar reactions={[{ emoji: '\u{1F44D}', count: 2, userReacted: false }]} />,
    )
    expect(() => {
      click(pills()[0])
      click(addButton())
    }).not.toThrow()
  })

  it('pills are native focusable buttons (keyboard accessible)', () => {
    render(
      <ReactionBar reactions={[{ emoji: '\u{1F44D}', count: 2, userReacted: false }]} />,
    )
    const pill = pills()[0]
    expect(pill.tagName).toBe('BUTTON')
    expect(pill.type).toBe('button')
    expect(pill.disabled).toBe(false)
    // Native buttons are focusable without a tabindex
    expect(pill.getAttribute('tabindex')).toBeNull()
    act(() => {
      pill.focus()
    })
    expect(document.activeElement).toBe(pill)
  })

  it('a focused pill activates on the click a browser dispatches for Enter/Space', () => {
    const onToggle = vi.fn()
    render(
      <ReactionBar
        reactions={[{ emoji: '\u{1F44D}', count: 2, userReacted: false }]}
        onToggle={onToggle}
      />,
    )
    const pill = pills()[0]
    act(() => {
      pill.focus()
    })
    // jsdom does not implement key-to-click activation behavior; dispatch the
    // resulting click the browser would fire for Enter/Space on a button.
    act(() => {
      document.activeElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(onToggle).toHaveBeenCalledWith('\u{1F44D}')
  })
})
