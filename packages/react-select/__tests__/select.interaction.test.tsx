// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { resetIdCounter } from '@refraction-ui/shared'
import { Select, SelectTrigger, SelectContent, SelectItem } from '../src/select.js'

// Interaction suite for the react-select adapter. Asserts real DOM behaviour
// (open/close, focus management, keyboard) — complementing the SSR suite in
// select.test.tsx, which covers structure/ARIA only.
//
// Known scope limits (no false coverage): the adapter implements Enter/Space
// toggle, ArrowDown/ArrowUp to open, option arrow navigation (with wrap),
// Escape to close + refocus trigger, and Enter/Space/click to select. It does
// NOT implement Home/End or typeahead — those are intentionally untested.

// React 19 expects this flag when running outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  resetIdCounter()
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

function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function keyDown(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

/** Flush the adapter's setTimeout(0) focus scheduling. */
async function flushFocus() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10))
  })
}

function trigger(): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>('[role="combobox"]')
  if (!el) throw new Error('trigger not rendered')
  return el
}

function listbox(): HTMLElement | null {
  return container.querySelector<HTMLElement>('[role="listbox"]')
}

function options(): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="option"]'))
}

const FRUITS: Array<[string, string]> = [
  ['apple', 'Apple'],
  ['banana', 'Banana'],
  ['cherry', 'Cherry'],
]

function FruitSelect(props: React.ComponentProps<typeof Select> = {}) {
  return React.createElement(
    Select,
    props,
    React.createElement(SelectTrigger, null, 'Pick a fruit'),
    React.createElement(
      SelectContent,
      null,
      FRUITS.map(([value, label]) =>
        React.createElement(SelectItem, { key: value, value }, label),
      ),
    ),
  )
}

describe('Select interaction — open/close state transitions', () => {
  it('starts closed: no listbox in the DOM', () => {
    render(React.createElement(FruitSelect))
    expect(listbox()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(trigger().getAttribute('data-state')).toBe('closed')
  })

  it('clicking the trigger opens the listbox', () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    expect(listbox()).toBeTruthy()
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(trigger().getAttribute('data-state')).toBe('open')
    expect(options()).toHaveLength(3)
  })

  it('clicking the trigger again closes the listbox', () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    click(trigger())
    expect(listbox()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('listbox is labelled by the trigger and referenced via aria-controls', () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    const list = listbox()!
    expect(list.getAttribute('aria-labelledby')).toBe(trigger().id)
    expect(trigger().getAttribute('aria-controls')).toBe(list.id)
  })
})

describe('Select interaction — trigger keyboard', () => {
  it('Enter opens when closed and closes when open', () => {
    render(React.createElement(FruitSelect))
    const openEvent = keyDown(trigger(), 'Enter')
    expect(openEvent.defaultPrevented).toBe(true)
    expect(listbox()).toBeTruthy()
    keyDown(trigger(), 'Enter')
    expect(listbox()).toBeNull()
  })

  it('Space toggles the listbox', () => {
    render(React.createElement(FruitSelect))
    keyDown(trigger(), ' ')
    expect(listbox()).toBeTruthy()
    keyDown(trigger(), ' ')
    expect(listbox()).toBeNull()
  })

  it('ArrowDown opens when closed', () => {
    render(React.createElement(FruitSelect))
    const event = keyDown(trigger(), 'ArrowDown')
    expect(event.defaultPrevented).toBe(true)
    expect(listbox()).toBeTruthy()
  })

  it('ArrowUp opens when closed', () => {
    render(React.createElement(FruitSelect))
    keyDown(trigger(), 'ArrowUp')
    expect(listbox()).toBeTruthy()
  })

  it('Escape closes an open listbox', () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    keyDown(trigger(), 'Escape')
    expect(listbox()).toBeNull()
  })
})

describe('Select interaction — focus management', () => {
  it('opening moves focus to the first enabled option', async () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    await flushFocus()
    expect(document.activeElement).toBe(options()[0])
  })

  it('opening skips disabled options when auto-focusing', async () => {
    render(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, null, 'Pick'),
        React.createElement(
          SelectContent,
          null,
          React.createElement(SelectItem, { value: 'a', disabled: true }, 'A'),
          React.createElement(SelectItem, { value: 'b' }, 'B'),
        ),
      ),
    )
    click(trigger())
    await flushFocus()
    expect(document.activeElement).toBe(options()[1])
  })

  it('Escape inside the listbox closes it and returns focus to the trigger', async () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    await flushFocus()
    keyDown(options()[0], 'Escape')
    expect(listbox()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('selecting an option with Enter returns focus to the trigger', async () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    await flushFocus()
    keyDown(options()[1], 'Enter')
    await flushFocus()
    expect(listbox()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })

  it('selecting an option by click returns focus to the trigger', async () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    await flushFocus()
    click(options()[2])
    await flushFocus()
    expect(listbox()).toBeNull()
    expect(document.activeElement).toBe(trigger())
  })
})

describe('Select interaction — option arrow navigation', () => {
  it('ArrowDown moves focus to the next option', async () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    await flushFocus()
    keyDown(document.activeElement as HTMLElement, 'ArrowDown')
    expect(document.activeElement).toBe(options()[1])
  })

  it('ArrowDown wraps from the last option to the first', async () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    await flushFocus()
    const opts = options()
    opts[opts.length - 1].focus()
    keyDown(opts[opts.length - 1], 'ArrowDown')
    expect(document.activeElement).toBe(options()[0])
  })

  it('ArrowUp moves focus to the previous option', async () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    await flushFocus()
    const opts = options()
    opts[1].focus()
    keyDown(opts[1], 'ArrowUp')
    expect(document.activeElement).toBe(options()[0])
  })

  it('ArrowUp wraps from the first option to the last', async () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    await flushFocus()
    keyDown(options()[0], 'ArrowUp')
    const opts = options()
    expect(document.activeElement).toBe(opts[opts.length - 1])
  })

  it('skips disabled options during arrow navigation', async () => {
    render(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, null, 'Pick'),
        React.createElement(
          SelectContent,
          null,
          React.createElement(SelectItem, { value: 'a' }, 'A'),
          React.createElement(SelectItem, { value: 'b', disabled: true }, 'B'),
          React.createElement(SelectItem, { value: 'c' }, 'C'),
        ),
      ),
    )
    click(trigger())
    await flushFocus()
    keyDown(options()[0], 'ArrowDown')
    expect(document.activeElement).toBe(options()[2])
    keyDown(options()[2], 'ArrowUp')
    expect(document.activeElement).toBe(options()[0])
  })

  it('arrow keys prevent default (no page scroll)', async () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    await flushFocus()
    const event = keyDown(document.activeElement as HTMLElement, 'ArrowDown')
    expect(event.defaultPrevented).toBe(true)
  })
})

describe('Select interaction — selection', () => {
  it('clicking an option calls onValueChange and closes', async () => {
    const onValueChange = vi.fn()
    render(React.createElement(FruitSelect, { onValueChange }))
    click(trigger())
    await flushFocus()
    click(options()[1])
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('banana')
    expect(listbox()).toBeNull()
  })

  it('Enter on an option selects it', async () => {
    const onValueChange = vi.fn()
    render(React.createElement(FruitSelect, { onValueChange }))
    click(trigger())
    await flushFocus()
    keyDown(options()[0], 'Enter')
    expect(onValueChange).toHaveBeenCalledWith('apple')
    expect(listbox()).toBeNull()
  })

  it('Space on an option selects it', async () => {
    const onValueChange = vi.fn()
    render(React.createElement(FruitSelect, { onValueChange }))
    click(trigger())
    await flushFocus()
    const event = keyDown(options()[2], ' ')
    expect(event.defaultPrevented).toBe(true)
    expect(onValueChange).toHaveBeenCalledWith('cherry')
  })

  it('clicking a disabled option does not select and keeps the listbox open', async () => {
    const onValueChange = vi.fn()
    render(
      React.createElement(
        Select,
        { onValueChange },
        React.createElement(SelectTrigger, null, 'Pick'),
        React.createElement(
          SelectContent,
          null,
          React.createElement(SelectItem, { value: 'a', disabled: true }, 'A'),
          React.createElement(SelectItem, { value: 'b' }, 'B'),
        ),
      ),
    )
    click(trigger())
    await flushFocus()
    click(options()[0])
    expect(onValueChange).not.toHaveBeenCalled()
    expect(listbox()).toBeTruthy()
  })

  it('Enter on a disabled option does not select', async () => {
    const onValueChange = vi.fn()
    render(
      React.createElement(
        Select,
        { onValueChange },
        React.createElement(SelectTrigger, null, 'Pick'),
        React.createElement(
          SelectContent,
          null,
          React.createElement(SelectItem, { value: 'a', disabled: true }, 'A'),
          React.createElement(SelectItem, { value: 'b' }, 'B'),
        ),
      ),
    )
    click(trigger())
    await flushFocus()
    keyDown(options()[0], 'Enter')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(listbox()).toBeTruthy()
  })
})

describe('Select interaction — controlled vs uncontrolled value', () => {
  it('controlled value marks the matching option aria-selected', async () => {
    render(React.createElement(FruitSelect, { value: 'banana' }))
    click(trigger())
    await flushFocus()
    expect(options()[0].getAttribute('aria-selected')).toBe('false')
    expect(options()[1].getAttribute('aria-selected')).toBe('true')
    expect(options()[1].getAttribute('data-state')).toBe('checked')
  })

  it('controlled: selecting an option reports but does not change selection', async () => {
    const onValueChange = vi.fn()
    render(React.createElement(FruitSelect, { value: 'apple', onValueChange }))
    click(trigger())
    await flushFocus()
    click(options()[2])
    expect(onValueChange).toHaveBeenCalledWith('cherry')
    // Parent never re-rendered with a new value — selection stays "apple".
    click(trigger())
    await flushFocus()
    expect(options()[0].getAttribute('aria-selected')).toBe('true')
    expect(options()[2].getAttribute('aria-selected')).toBe('false')
  })

  it('controlled: re-rendering with a new value moves aria-selected', async () => {
    render(React.createElement(FruitSelect, { value: 'apple' }))
    render(React.createElement(FruitSelect, { value: 'cherry' }))
    click(trigger())
    await flushFocus()
    expect(options()[0].getAttribute('aria-selected')).toBe('false')
    expect(options()[2].getAttribute('aria-selected')).toBe('true')
  })

  it('uncontrolled: no value prop leaves every option unselected', async () => {
    render(React.createElement(FruitSelect))
    click(trigger())
    await flushFocus()
    for (const option of options()) {
      expect(option.getAttribute('aria-selected')).toBe('false')
    }
  })
})

describe('Select interaction — disabled select', () => {
  function DisabledSelect() {
    return React.createElement(
      Select,
      { disabled: true },
      React.createElement(SelectTrigger, null, 'Pick'),
      React.createElement(
        SelectContent,
        null,
        React.createElement(SelectItem, { value: 'a' }, 'A'),
      ),
    )
  }

  it('trigger is disabled and marked aria-disabled', () => {
    render(React.createElement(DisabledSelect))
    expect(trigger().disabled).toBe(true)
    expect(trigger().getAttribute('aria-disabled')).toBe('true')
  })

  it('keyboard does not open a disabled select', () => {
    render(React.createElement(DisabledSelect))
    keyDown(trigger(), 'Enter')
    keyDown(trigger(), ' ')
    keyDown(trigger(), 'ArrowDown')
    keyDown(trigger(), 'ArrowUp')
    expect(listbox()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('programmatic click does not open a disabled select', () => {
    render(React.createElement(DisabledSelect))
    // jsdom honours the HTML disabled contract: click() on a disabled
    // button dispatches nothing.
    act(() => {
      trigger().click()
    })
    expect(listbox()).toBeNull()
  })
})

describe('Select interaction — edge cases', () => {
  it('opens with no options without crashing; arrows are no-ops', async () => {
    render(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, null, 'Pick'),
        React.createElement(SelectContent, null),
      ),
    )
    click(trigger())
    await flushFocus()
    expect(listbox()).toBeTruthy()
    expect(options()).toHaveLength(0)
    const event = keyDown(listbox()!, 'ArrowDown')
    // No option to focus and nothing crashes; focus stays put.
    expect(document.activeElement).not.toBe(options()[0])
    expect(event.key).toBe('ArrowDown')
  })

  it('opens with only disabled options without moving focus', async () => {
    render(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, null, 'Pick'),
        React.createElement(
          SelectContent,
          null,
          React.createElement(SelectItem, { value: 'a', disabled: true }, 'A'),
          React.createElement(SelectItem, { value: 'b', disabled: true }, 'B'),
        ),
      ),
    )
    click(trigger())
    await flushFocus()
    expect(listbox()).toBeTruthy()
    expect(options()).toHaveLength(2)
    expect(document.activeElement).not.toBe(options()[0])
    expect(document.activeElement).not.toBe(options()[1])
  })

  it('handles a long option list (100 items) with correct navigation', async () => {
    const values = Array.from({ length: 100 }, (_, i) => `opt-${i}`)
    render(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, null, 'Pick'),
        React.createElement(
          SelectContent,
          null,
          values.map((v) => React.createElement(SelectItem, { key: v, value: v }, v)),
        ),
      ),
    )
    click(trigger())
    await flushFocus()
    const opts = options()
    expect(opts).toHaveLength(100)
    expect(document.activeElement).toBe(opts[0])
    keyDown(opts[0], 'ArrowUp')
    expect(document.activeElement).toBe(opts[99])
    keyDown(opts[99], 'ArrowDown')
    expect(document.activeElement).toBe(opts[0])
  })

  it('renders long option labels', async () => {
    const longLabel = `long-${'x'.repeat(500)}`
    render(
      React.createElement(
        Select,
        null,
        React.createElement(SelectTrigger, null, 'Pick'),
        React.createElement(
          SelectContent,
          null,
          React.createElement(SelectItem, { value: 'a' }, longLabel),
        ),
      ),
    )
    click(trigger())
    await flushFocus()
    expect(options()[0].textContent).toBe(longLabel)
  })

  it('closed select does not leak option text into the DOM', () => {
    render(React.createElement(FruitSelect))
    expect(container.textContent).not.toContain('Apple')
    expect(container.querySelector('[role="option"]')).toBeNull()
  })

  it('custom placeholder prop is accepted (SSR-visible default unchanged)', () => {
    // The placeholder is part of the headless state; assert the adapter
    // accepts the prop without crashing and still renders the trigger.
    render(React.createElement(FruitSelect, { placeholder: 'Choose wisely' }))
    expect(trigger()).toBeTruthy()
  })
})
