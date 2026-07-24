// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { resetIdCounter } from '@refraction-ui/shared'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../src/tabs.js'

// Interaction suite for the react-tabs adapter. Asserts real DOM behaviour
// (selection, roving tabindex, ARIA wiring) — complementing the SSR suite in
// tabs.test.tsx, which covers structure only.
//
// Known scope limit (no false coverage): the adapter does NOT implement
// arrow-key / Home / End navigation between tabs. TabsTrigger only forwards
// keydown to a consumer-supplied onKeyDown. That is asserted as-is below;
// keyboard navigation tests would require an adapter change.

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

function tabs(): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="tab"]'))
}

function panel(): HTMLElement | null {
  return container.querySelector<HTMLElement>('[role="tabpanel"]')
}

function BasicTabs(props: React.ComponentProps<typeof Tabs> = {}) {
  return React.createElement(
    Tabs,
    { defaultValue: 'a', ...props },
    React.createElement(
      TabsList,
      null,
      React.createElement(TabsTrigger, { value: 'a' }, 'Tab A'),
      React.createElement(TabsTrigger, { value: 'b' }, 'Tab B'),
      React.createElement(TabsTrigger, { value: 'c' }, 'Tab C'),
    ),
    React.createElement(TabsContent, { value: 'a' }, 'Panel A'),
    React.createElement(TabsContent, { value: 'b' }, 'Panel B'),
    React.createElement(TabsContent, { value: 'c' }, 'Panel C'),
  )
}

describe('Tabs interaction — uncontrolled selection', () => {
  it('starts on defaultValue with only its panel rendered', () => {
    render(React.createElement(BasicTabs))
    expect(panel()?.textContent).toBe('Panel A')
    const [a, b, c] = tabs()
    expect(a.getAttribute('aria-selected')).toBe('true')
    expect(b.getAttribute('aria-selected')).toBe('false')
    expect(c.getAttribute('aria-selected')).toBe('false')
  })

  it('clicking a tab selects it and swaps the panel', () => {
    render(React.createElement(BasicTabs))
    click(tabs()[1])
    expect(panel()?.textContent).toBe('Panel B')
    expect(container.textContent).not.toContain('Panel A')
    expect(tabs()[1].getAttribute('aria-selected')).toBe('true')
    expect(tabs()[0].getAttribute('aria-selected')).toBe('false')
    expect(tabs()[1].getAttribute('data-state')).toBe('active')
    expect(tabs()[0].getAttribute('data-state')).toBe('inactive')
  })

  it('clicking again switches back (open/close state transitions)', () => {
    render(React.createElement(BasicTabs))
    click(tabs()[1])
    click(tabs()[2])
    click(tabs()[0])
    expect(panel()?.textContent).toBe('Panel A')
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true')
  })

  it('clicking the already-active tab keeps the selection', () => {
    const onValueChange = vi.fn()
    render(React.createElement(BasicTabs, { onValueChange }))
    click(tabs()[0])
    expect(panel()?.textContent).toBe('Panel A')
    expect(onValueChange).toHaveBeenCalledWith('a')
  })

  it('calls onValueChange with the clicked value', () => {
    const onValueChange = vi.fn()
    render(React.createElement(BasicTabs, { onValueChange }))
    click(tabs()[2])
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledWith('c')
  })
})

describe('Tabs interaction — roving tabindex', () => {
  it('only the selected tab is tabbable', () => {
    render(React.createElement(BasicTabs))
    const [a, b, c] = tabs()
    expect(a.tabIndex).toBe(0)
    expect(b.tabIndex).toBe(-1)
    expect(c.tabIndex).toBe(-1)
  })

  it('tabindex follows the selection', () => {
    render(React.createElement(BasicTabs))
    click(tabs()[1])
    expect(tabs()[0].tabIndex).toBe(-1)
    expect(tabs()[1].tabIndex).toBe(0)
    expect(tabs()[2].tabIndex).toBe(-1)
  })
})

describe('Tabs interaction — ARIA wiring after selection', () => {
  it('tab aria-controls points at the newly rendered panel id', () => {
    render(React.createElement(BasicTabs))
    click(tabs()[1])
    const activeTab = tabs()[1]
    const activePanel = panel()
    expect(activePanel).toBeTruthy()
    expect(activeTab.getAttribute('aria-controls')).toBe(activePanel!.id)
    expect(activePanel!.getAttribute('aria-labelledby')).toBe(activeTab.id)
  })

  it('inactive tabs keep aria-controls pointing at their (unrendered) panel id', () => {
    render(React.createElement(BasicTabs))
    const [a] = tabs()
    expect(a.getAttribute('aria-controls')).toContain('-panel-a')
  })
})

describe('Tabs interaction — controlled value', () => {
  it('selection follows the value prop, not internal state', () => {
    const onValueChange = vi.fn()
    render(React.createElement(BasicTabs, { value: 'a', onValueChange }))
    click(tabs()[1])
    // Controlled: the parent did not re-render with a new value, so the
    // selection stays on "a" — but the callback still fires.
    expect(onValueChange).toHaveBeenCalledWith('b')
    expect(panel()?.textContent).toBe('Panel A')
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true')
    expect(tabs()[1].getAttribute('aria-selected')).toBe('false')
  })

  it('re-rendering with a new value moves the selection', () => {
    render(React.createElement(BasicTabs, { value: 'a' }))
    expect(panel()?.textContent).toBe('Panel A')
    render(React.createElement(BasicTabs, { value: 'b' }))
    expect(panel()?.textContent).toBe('Panel B')
    expect(tabs()[1].tabIndex).toBe(0)
  })
})

describe('Tabs interaction — disabled tab', () => {
  function DisabledTabs() {
    return React.createElement(
      Tabs,
      { defaultValue: 'a' },
      React.createElement(
        TabsList,
        null,
        React.createElement(TabsTrigger, { value: 'a' }, 'Tab A'),
        React.createElement(TabsTrigger, { value: 'b', disabled: true }, 'Tab B'),
      ),
      React.createElement(TabsContent, { value: 'a' }, 'Panel A'),
      React.createElement(TabsContent, { value: 'b' }, 'Panel B'),
    )
  }

  it('renders the disabled attribute on the trigger', () => {
    render(React.createElement(DisabledTabs))
    expect((tabs()[1] as HTMLButtonElement).disabled).toBe(true)
  })

  it('programmatic click on a disabled tab does not select it', () => {
    const onValueChange = vi.fn()
    render(
      React.createElement(
        Tabs,
        { defaultValue: 'a', onValueChange },
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'a' }, 'Tab A'),
          React.createElement(TabsTrigger, { value: 'b', disabled: true }, 'Tab B'),
        ),
        React.createElement(TabsContent, { value: 'a' }, 'Panel A'),
        React.createElement(TabsContent, { value: 'b' }, 'Panel B'),
      ),
    )
    // jsdom honours the HTML disabled contract: click() on a disabled
    // button is a no-op, so no click event is dispatched at all.
    act(() => {
      ;(tabs()[1] as HTMLButtonElement).click()
    })
    expect(onValueChange).not.toHaveBeenCalled()
    expect(panel()?.textContent).toBe('Panel A')
  })
})

describe('Tabs interaction — keydown forwarding', () => {
  it('forwards keydown events to a consumer-supplied onKeyDown', () => {
    // The adapter intentionally leaves arrow/Home/End navigation to the
    // consumer; the only guarantee it makes today is that the handler prop
    // receives the event. Arrow navigation is NOT implemented (see header).
    const onKeyDown = vi.fn()
    render(
      React.createElement(
        Tabs,
        { defaultValue: 'a' },
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'a', onKeyDown }, 'Tab A'),
        ),
      ),
    )
    const event = keyDown(tabs()[0], 'ArrowRight')
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(event.key).toBe('ArrowRight')
  })

  it('arrow/Home/End keys do NOT change the selection by default', () => {
    render(React.createElement(BasicTabs))
    for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End']) {
      keyDown(tabs()[0], key)
    }
    expect(panel()?.textContent).toBe('Panel A')
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true')
  })
})

describe('Tabs interaction — edge cases', () => {
  it('renders with no defaultValue: no tab selected, no panel, all tabindex -1', () => {
    render(
      React.createElement(
        Tabs,
        null,
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'a' }, 'Tab A'),
          React.createElement(TabsTrigger, { value: 'b' }, 'Tab B'),
        ),
        React.createElement(TabsContent, { value: 'a' }, 'Panel A'),
      ),
    )
    expect(panel()).toBeNull()
    expect(container.querySelector('[aria-selected="true"]')).toBeNull()
    for (const tab of tabs()) expect(tab.tabIndex).toBe(-1)
    // Clicking still selects from the empty state.
    click(tabs()[0])
    expect(panel()?.textContent).toBe('Panel A')
  })

  it('renders an empty tablist without crashing', () => {
    render(
      React.createElement(
        Tabs,
        { defaultValue: 'a' },
        React.createElement(TabsList, null),
      ),
    )
    expect(container.querySelector('[role="tablist"]')).toBeTruthy()
    expect(tabs()).toHaveLength(0)
  })

  it('supports many tabs (long list) with independent selection', () => {
    const values = Array.from({ length: 30 }, (_, i) => `tab-${i}`)
    render(
      React.createElement(
        Tabs,
        { defaultValue: 'tab-0' },
        React.createElement(
          TabsList,
          null,
          values.map((v) =>
            React.createElement(TabsTrigger, { key: v, value: v }, `Label ${v}`),
          ),
        ),
        values.map((v) =>
          React.createElement(TabsContent, { key: v, value: v }, `Panel ${v}`),
        ),
      ),
    )
    expect(tabs()).toHaveLength(30)
    click(tabs()[29])
    expect(panel()?.textContent).toBe('Panel tab-29')
    expect(tabs()[29].getAttribute('aria-selected')).toBe('true')
    expect(tabs()[0].getAttribute('aria-selected')).toBe('false')
  })

  it('renders long content in the active panel', () => {
    const longText = 'lorem ipsum '.repeat(200)
    render(
      React.createElement(
        Tabs,
        { defaultValue: 'a' },
        React.createElement(
          TabsList,
          null,
          React.createElement(TabsTrigger, { value: 'a' }, 'Tab A'),
        ),
        React.createElement(TabsContent, { value: 'a' }, longText),
      ),
    )
    expect(panel()?.textContent).toBe(longText)
  })

  it('vertical orientation is reflected on the tablist', () => {
    render(React.createElement(BasicTabs, { orientation: 'vertical' }))
    expect(
      container.querySelector('[role="tablist"]')!.getAttribute('aria-orientation'),
    ).toBe('vertical')
  })

  it('does not steal or trap focus on selection (no focus management in adapter)', () => {
    render(React.createElement(BasicTabs))
    click(tabs()[1])
    // The adapter never calls .focus(); focus stays wherever the browser put
    // it (body in jsdom, since synthetic click does not focus).
    expect(document.activeElement).toBe(document.body)
  })
})
