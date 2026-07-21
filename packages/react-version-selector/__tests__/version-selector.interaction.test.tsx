// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { VersionSelector } from '../src/version-selector.js'

// React 19 expects this flag when running tests outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const versions = [
  { value: '3.0.0', label: 'v3.0.0', isLatest: true },
  { value: '2.1.0', label: 'v2.1.0' },
  { value: '2.0.0', label: 'v2.0.0' },
  { value: '1.0.0', label: 'v1.0.0' },
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
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

function keyDown(el: Element, key: string) {
  act(() => {
    el.dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    )
  })
}

function trigger(): HTMLButtonElement {
  const el = container.querySelector('button[role="combobox"]')
  if (!el) throw new Error('trigger not rendered')
  return el as HTMLButtonElement
}

function listbox(): HTMLElement | null {
  return container.querySelector('[role="listbox"]')
}

function options(): HTMLElement[] {
  return Array.from(container.querySelectorAll('[role="option"]'))
}

function option(value: string): HTMLElement {
  const el = container.querySelector(`[role="option"][data-value="${value}"]`)
  if (!el) throw new Error(`option ${value} not rendered`)
  return el as HTMLElement
}

describe('option list', () => {
  it('opens the dropdown on trigger click and lists every version', () => {
    render(React.createElement(VersionSelector, { versions }))
    expect(listbox()).toBeNull()
    click(trigger())
    expect(listbox()).not.toBeNull()
    expect(options()).toHaveLength(4)
    const labels = options().map((o) => o.textContent)
    expect(labels[0]).toContain('v3.0.0')
    expect(labels[1]).toContain('v2.1.0')
    expect(labels[2]).toContain('v2.0.0')
    expect(labels[3]).toContain('v1.0.0')
  })

  it('sets aria-expanded="true" on the trigger while open', () => {
    render(React.createElement(VersionSelector, { versions }))
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    click(trigger())
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
  })

  it('renders options with data-value attributes', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    const values = options().map((o) => o.getAttribute('data-value'))
    expect(values).toEqual(['3.0.0', '2.1.0', '2.0.0', '1.0.0'])
  })

  it('marks the latest option with data-latest and a Latest badge', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    const latest = option('3.0.0')
    expect(latest.getAttribute('data-latest')).toBe('true')
    expect(latest.textContent).toContain('Latest')
    expect(option('2.1.0').getAttribute('data-latest')).toBeNull()
    expect(option('2.1.0').textContent).not.toContain('Latest')
  })

  it('listbox id matches the trigger aria-controls', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    expect(listbox()!.id).toBe(trigger().getAttribute('aria-controls'))
  })
})

describe('current version marking', () => {
  it('marks the selected option with aria-selected="true"', () => {
    render(React.createElement(VersionSelector, { versions, value: '2.1.0' }))
    click(trigger())
    expect(option('2.1.0').getAttribute('aria-selected')).toBe('true')
    expect(option('3.0.0').getAttribute('aria-selected')).toBe('false')
    expect(option('2.0.0').getAttribute('aria-selected')).toBe('false')
  })

  it('applies selected styling to the current option', () => {
    render(React.createElement(VersionSelector, { versions, value: '2.1.0' }))
    click(trigger())
    expect(option('2.1.0').className).toContain('bg-accent/50')
    expect(option('2.1.0').className).toContain('font-medium')
    expect(option('3.0.0').className).not.toContain('bg-accent/50')
  })

  it('marks nothing when no value is selected', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    for (const opt of options()) {
      expect(opt.getAttribute('aria-selected')).toBe('false')
    }
  })
})

describe('selection change callback', () => {
  it('calls onValueChange with the clicked option value', () => {
    const onValueChange = vi.fn()
    render(React.createElement(VersionSelector, { versions, onValueChange }))
    click(trigger())
    click(option('2.0.0'))
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('2.0.0')
  })

  it('updates the trigger label to the chosen version', () => {
    render(React.createElement(VersionSelector, { versions }))
    expect(trigger().textContent).toContain('Select version...')
    click(trigger())
    click(option('2.0.0'))
    expect(trigger().textContent).toContain('v2.0.0')
  })

  it('closes the dropdown after selection', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    click(option('2.0.0'))
    expect(listbox()).toBeNull()
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('shows the Latest badge on the trigger after selecting the latest version', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    click(option('3.0.0'))
    expect(trigger().textContent).toContain('v3.0.0')
    expect(trigger().textContent).toContain('Latest')
  })

  it('updates the selection without an onValueChange handler', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    click(option('1.0.0'))
    expect(trigger().textContent).toContain('v1.0.0')
  })

  it('moves the aria-selected marking to the newly chosen option', () => {
    render(React.createElement(VersionSelector, { versions, value: '2.1.0' }))
    click(trigger())
    click(option('1.0.0'))
    click(trigger())
    expect(option('1.0.0').getAttribute('aria-selected')).toBe('true')
    expect(option('2.1.0').getAttribute('aria-selected')).toBe('false')
  })
})

describe('open/close behaviour', () => {
  it('toggles closed on a second trigger click', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    expect(listbox()).not.toBeNull()
    click(trigger())
    expect(listbox()).toBeNull()
  })

  it('closes on Escape', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    expect(listbox()).not.toBeNull()
    keyDown(trigger(), 'Escape')
    expect(listbox()).toBeNull()
  })

  it('Enter toggles the dropdown', () => {
    render(React.createElement(VersionSelector, { versions }))
    keyDown(trigger(), 'Enter')
    expect(listbox()).not.toBeNull()
    keyDown(trigger(), 'Enter')
    expect(listbox()).toBeNull()
  })

  it('Space toggles the dropdown', () => {
    render(React.createElement(VersionSelector, { versions }))
    keyDown(trigger(), ' ')
    expect(listbox()).not.toBeNull()
    keyDown(trigger(), ' ')
    expect(listbox()).toBeNull()
  })

  it('ArrowDown opens a closed dropdown', () => {
    render(React.createElement(VersionSelector, { versions }))
    keyDown(trigger(), 'ArrowDown')
    expect(listbox()).not.toBeNull()
  })

  it('ArrowUp opens a closed dropdown', () => {
    render(React.createElement(VersionSelector, { versions }))
    keyDown(trigger(), 'ArrowUp')
    expect(listbox()).not.toBeNull()
  })

  it('closes when clicking outside the component', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    expect(listbox()).not.toBeNull()
    act(() => {
      document.body.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
      )
    })
    expect(listbox()).toBeNull()
  })

  it('stays open when clicking inside the component', () => {
    render(React.createElement(VersionSelector, { versions }))
    click(trigger())
    const wrapper = container.firstElementChild!
    act(() => {
      wrapper.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, cancelable: true }),
      )
    })
    expect(listbox()).not.toBeNull()
  })
})
