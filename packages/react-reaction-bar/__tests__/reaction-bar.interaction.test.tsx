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

  it('clicking the add button hands the caller the button to anchor a picker', () => {
    const onAddReaction = vi.fn()
    const onToggle = vi.fn()
    render(
      <ReactionBar
        reactions={[{ emoji: '\u{1F44D}', count: 2, userReacted: false }]}
        onToggle={onToggle}
        onAddReaction={onAddReaction}
      />,
    )
    click(addButton())
    expect(onAddReaction).toHaveBeenCalledTimes(1)
    expect(onAddReaction).toHaveBeenCalledWith(addButton())
    // The bar never invents a reaction on the caller's behalf.
    expect(onToggle).not.toHaveBeenCalled()
  })

  it('works without callbacks attached', () => {
    render(
      <ReactionBar reactions={[{ emoji: '\u{1F44D}', count: 2, userReacted: false }]} />,
    )
    expect(() => click(pills()[0])).not.toThrow()
    expect(container.querySelector('button[aria-label="Add reaction"]')).toBeNull()
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

  it('the add button is a native focusable button', () => {
    render(<ReactionBar reactions={[]} onAddReaction={() => {}} />)
    const add = addButton()
    expect(add.type).toBe('button')
    act(() => {
      add.focus()
    })
    expect(document.activeElement).toBe(add)
  })
})

function pointer(el: Element, type: 'pointerover' | 'pointerout' | 'pointerdown', pointerType = 'mouse') {
  act(() => {
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType }))
  })
}

function key(el: Element, k: string) {
  const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function tooltipOf(pill: HTMLElement): HTMLElement {
  const id = pill.getAttribute('aria-describedby')
  if (!id) throw new Error('pill is not described by a tooltip')
  const el = document.getElementById(id)
  if (!el) throw new Error(`tooltip ${id} not rendered`)
  return el
}

describe('ReactionBar who-reacted tooltip (interaction, jsdom)', () => {
  const AGREE: Reaction = {
    emoji: '\u{1F44D}',
    label: 'Agree',
    count: 3,
    userReacted: false,
    reactors: ['Ana', 'Dev', 'Sam'],
  }
  const PARTY: Reaction = {
    emoji: '\u{1F389}',
    count: 1,
    userReacted: false,
    reactors: ['Kim'],
  }

  it('describes the pill and stays hidden until asked for', () => {
    render(<ReactionBar reactions={[AGREE]} />)
    const tip = tooltipOf(pills()[0])
    expect(tip.getAttribute('role')).toBe('tooltip')
    expect(tip.textContent).toBe('Ana, Dev and Sam reacted with Agree')
    expect(tip.hidden).toBe(true)
  })

  it('opens on mouse hover and closes when the pointer leaves', () => {
    render(<ReactionBar reactions={[AGREE]} />)
    const pill = pills()[0]
    pointer(pill, 'pointerover')
    expect(tooltipOf(pill).hidden).toBe(false)
    pointer(pill, 'pointerout')
    expect(tooltipOf(pill).hidden).toBe(true)
  })

  it('does not open on a touch, where nothing would close it', () => {
    render(<ReactionBar reactions={[AGREE]} />)
    const pill = pills()[0]
    pointer(pill, 'pointerover', 'touch')
    pointer(pill, 'pointerdown', 'touch')
    act(() => {
      pill.focus()
    })
    expect(tooltipOf(pill).hidden).toBe(true)
  })

  it('opens on keyboard focus and closes on blur', () => {
    render(<ReactionBar reactions={[AGREE]} />)
    const pill = pills()[0]
    act(() => {
      pill.focus()
    })
    expect(tooltipOf(pill).hidden).toBe(false)
    act(() => {
      pill.blur()
    })
    expect(tooltipOf(pill).hidden).toBe(true)
  })

  it('a pointer press after focus does not suppress the next keyboard focus', () => {
    render(<ReactionBar reactions={[AGREE]} />)
    const pill = pills()[0]
    act(() => {
      pill.focus()
    })
    pointer(pill, 'pointerdown')
    act(() => {
      pill.blur()
    })
    act(() => {
      pill.focus()
    })
    expect(tooltipOf(pill).hidden).toBe(false)
  })

  it('Escape closes a focused tooltip without reaching enclosing handlers', () => {
    const outer = vi.fn()
    render(
      <div onKeyDown={(event) => outer(event.key)}>
        <ReactionBar reactions={[AGREE]} />
      </div>,
    )
    const pill = pills()[0]
    act(() => {
      pill.focus()
    })
    key(pill, 'Escape')
    expect(tooltipOf(pill).hidden).toBe(true)
    expect(outer).not.toHaveBeenCalled()
    // Once closed, Escape is the enclosing UI's again.
    key(pill, 'Escape')
    expect(outer).toHaveBeenCalledWith('Escape')
  })

  it('Escape closes a hovered tooltip wherever focus is', () => {
    render(<ReactionBar reactions={[AGREE]} />)
    const pill = pills()[0]
    pointer(pill, 'pointerover')
    key(document.body, 'Escape')
    expect(tooltipOf(pill).hidden).toBe(true)
  })

  it('shows one tooltip at a time', () => {
    render(<ReactionBar reactions={[AGREE, PARTY]} />)
    const [agree, party] = pills()
    pointer(agree, 'pointerover')
    act(() => {
      party.focus()
    })
    expect(tooltipOf(agree).hidden).toBe(true)
    expect(tooltipOf(party).hidden).toBe(false)
    expect(tooltipOf(party).textContent).toBe('Kim reacted with \u{1F389}')
  })

  describe('placement', () => {
    // jsdom has no layout: give the viewport, the pill and the tooltip sizes.
    function layout(pillLeft: number) {
      vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(400)
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        const width = this.getAttribute('role') === 'tooltip' ? 200 : 40
        const left = this.getAttribute('role') === 'tooltip' ? 0 : pillLeft
        const rect = { x: left, y: 0, left, top: 0, width, height: 24, right: left + width, bottom: 24 }
        return { ...rect, toJSON: () => rect } as DOMRect
      })
    }

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('lines up with the pill start when it fits', () => {
      layout(20)
      render(<ReactionBar reactions={[AGREE]} />)
      const pill = pills()[0]
      act(() => {
        pill.focus()
      })
      expect(tooltipOf(pill).getAttribute('data-align')).toBe('start')
    })

    it('flips to the pill end near the far edge of the viewport', () => {
      layout(300)
      render(<ReactionBar reactions={[AGREE]} />)
      const pill = pills()[0]
      pointer(pill, 'pointerover')
      expect(tooltipOf(pill).hidden).toBe(false)
      expect(tooltipOf(pill).getAttribute('data-align')).toBe('end')
    })

    it('marks only the open tooltip', () => {
      layout(20)
      render(<ReactionBar reactions={[AGREE, PARTY]} />)
      const [agree, party] = pills()
      act(() => {
        agree.focus()
      })
      expect(tooltipOf(party).hasAttribute('data-align')).toBe(false)
    })
  })
})

describe('ReactionBar overflow (interaction, jsdom)', () => {
  const FOUR: Reaction[] = ['\u{1F44D}', '\u{1F389}', '\u{1F680}', '\u{1F440}'].map((emoji) => ({
    emoji,
    count: 1,
    userReacted: false,
  }))

  function overflowButton(): HTMLButtonElement {
    const el = container.querySelector<HTMLButtonElement>('button[aria-expanded]')
    if (!el) throw new Error('overflow button not rendered')
    return el
  }

  it('expands to every reaction and collapses again', () => {
    render(<ReactionBar reactions={FOUR} maxVisible={2} />)
    expect(pills()).toHaveLength(2)
    expect(overflowButton().textContent).toBe('+2')
    expect(overflowButton().getAttribute('aria-label')).toBe('Show 2 more reactions')

    click(overflowButton())
    expect(pills()).toHaveLength(4)
    expect(overflowButton().getAttribute('aria-expanded')).toBe('true')
    expect(overflowButton().textContent).toBe('Show less')

    click(overflowButton())
    expect(pills()).toHaveLength(2)
    expect(overflowButton().getAttribute('aria-expanded')).toBe('false')
  })

  it('keeps focus on the overflow button across expanding', () => {
    render(<ReactionBar reactions={FOUR} maxVisible={2} />)
    const button = overflowButton()
    act(() => {
      button.focus()
    })
    click(button)
    expect(document.activeElement).toBe(button)
    expect(button.textContent).toBe('Show less')
  })

  it('a revealed reaction toggles like any other', () => {
    const onToggle = vi.fn()
    render(<ReactionBar reactions={FOUR} maxVisible={2} onToggle={onToggle} />)
    click(overflowButton())
    click(pills()[3])
    expect(onToggle).toHaveBeenCalledWith('\u{1F440}')
  })
})
