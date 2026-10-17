// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ListItem, ListItemGroup, ListItemAction } from '../src/list-item.js'

// React 19 expects this flag when running outside a browser bundler.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

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
  vi.restoreAllMocks()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

function options(): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="option"]'))
}

function tabStops(): string[] {
  return options()
    .filter((o) => o.tabIndex === 0)
    .map((o) => o.textContent ?? '')
}

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const target = document.activeElement
  if (!target) throw new Error('nothing focused')
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  act(() => {
    target.dispatchEvent(event)
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
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

const PEOPLE = ['Ada', 'Grace', 'Linus', 'Margaret']

/** A single-select people picker wired the way a real parent would. */
function Picker({ initial, people = PEOPLE }: { initial?: string; people?: string[] }) {
  const [value, setValue] = React.useState(initial)
  return (
    <ListItemGroup context="listbox" aria-label="People">
      {people.map((name) => (
        <ListItem key={name} id={`p-${name}`} title={name} selected={value === name} onTap={() => setValue(name)} />
      ))}
    </ListItemGroup>
  )
}

describe('ListItemGroup listbox — roving focus', () => {
  it('has a single tab stop on the selected option', () => {
    render(<Picker initial="Linus" />)
    expect(tabStops()).toEqual(['Linus'])
  })

  it('has a single tab stop on the first option when nothing is selected', () => {
    render(<Picker />)
    expect(tabStops()).toEqual(['Ada'])
  })

  it('ArrowDown / ArrowUp move focus and the tab stop with it', () => {
    render(<Picker />)
    focus(options()[0])

    expect(press('ArrowDown').defaultPrevented).toBe(true)
    expect(document.activeElement?.textContent).toBe('Grace')
    expect(tabStops()).toEqual(['Grace'])

    press('ArrowDown')
    expect(document.activeElement?.textContent).toBe('Linus')

    press('ArrowUp')
    expect(document.activeElement?.textContent).toBe('Grace')
    expect(tabStops()).toEqual(['Grace'])
  })

  it('Home and End jump to the first and last option', () => {
    render(<Picker />)
    focus(options()[1])
    press('End')
    expect(document.activeElement?.textContent).toBe('Margaret')
    press('Home')
    expect(document.activeElement?.textContent).toBe('Ada')
  })

  it('clamps at the ends and still prevents page scroll', () => {
    render(<Picker />)
    const [first] = options()
    focus(first)
    expect(press('ArrowUp').defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(first)

    press('End')
    const last = document.activeElement
    expect(press('ArrowDown').defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(last)
  })

  it('moving focus does not change the selection', () => {
    render(<Picker initial="Ada" />)
    focus(options()[0])
    press('ArrowDown')
    expect(options()[0].getAttribute('aria-selected')).toBe('true')
    expect(options()[1].getAttribute('aria-selected')).toBe('false')
  })

  it('ignores modified keys and unrelated keys', () => {
    render(<Picker />)
    focus(options()[0])
    expect(press('ArrowDown', { metaKey: true }).defaultPrevented).toBe(false)
    expect(press('ArrowRight').defaultPrevented).toBe(false)
    expect(document.activeElement?.textContent).toBe('Ada')
  })

  it('respects a consumer onKeyDown that prevents default', () => {
    render(
      <ListItemGroup context="listbox" aria-label="People" onKeyDown={(e) => e.preventDefault()}>
        <ListItem title="Ada" />
        <ListItem title="Grace" />
      </ListItemGroup>,
    )
    focus(options()[0])
    press('ArrowDown')
    expect(document.activeElement?.textContent).toBe('Ada')
  })

  it('re-homes the tab stop when the active option is removed', () => {
    render(<Picker />)
    focus(options()[0])
    press('ArrowDown')
    expect(tabStops()).toEqual(['Grace'])

    render(<Picker people={['Ada', 'Linus']} />)
    expect(tabStops()).toEqual(['Ada'])
  })
})

describe('ListItemGroup listbox — activation and selection', () => {
  it('click, Enter and Space call onTap', () => {
    const onTap = vi.fn()
    render(
      <ListItemGroup context="listbox" aria-label="People">
        <ListItem title="Ada" onTap={onTap} />
      </ListItemGroup>,
    )
    const [option] = options()
    click(option)
    focus(option)
    press('Enter')
    expect(press(' ').defaultPrevented).toBe(true)
    expect(onTap).toHaveBeenCalledTimes(3)
  })

  it('selecting with Enter updates aria-selected (single select)', () => {
    render(<Picker initial="Ada" />)
    focus(options()[0])
    press('ArrowDown')
    press('Enter')
    expect(options().map((o) => o.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false', 'false'])
  })

  it('clicking an option makes it the tab stop', () => {
    render(<Picker />)
    const third = options()[2]
    act(() => {
      third.focus()
    })
    click(third)
    expect(tabStops()).toEqual(['Linus'])
    expect(third.getAttribute('aria-selected')).toBe('true')
  })

  it('warns and drops an action passed to a listbox option', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <ListItemGroup context="listbox" aria-label="People">
        <ListItem title="Ada" action={<ListItemAction aria-label="Remove">x</ListItemAction>} />
      </ListItemGroup>,
    )
    expect(container.querySelector('[data-slot="list-item-action"]')).toBeNull()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('`action` is not rendered in a listbox')
  })
})

describe('ListItemGroup navigation', () => {
  function Sidebar({ onMute }: { onMute: (name: string) => void }) {
    const [current, setCurrent] = React.useState('general')
    return (
      <nav aria-label="Channels">
        <ListItemGroup context="navigation">
          {['general', 'random'].map((name) => (
            <ListItem
              key={name}
              title={`#${name}`}
              selected={current === name}
              onTap={() => setCurrent(name)}
              action={
                <ListItemAction aria-label={`Mute ${name}`} onClick={() => onMute(name)}>
                  M
                </ListItemAction>
              }
            />
          ))}
        </ListItemGroup>
      </nav>
    )
  }

  const rowButtons = () =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('li > button'))

  it('tapping a row moves aria-current to it', () => {
    render(<Sidebar onMute={() => {}} />)
    expect(rowButtons().map((b) => b.getAttribute('aria-current'))).toEqual(['true', null])
    click(rowButtons()[1])
    expect(rowButtons().map((b) => b.getAttribute('aria-current'))).toEqual([null, 'true'])
  })

  it('the action is its own control and does not tap the row', () => {
    const onMute = vi.fn()
    render(<Sidebar onMute={onMute} />)
    const mute = container.querySelector<HTMLButtonElement>('[aria-label="Mute random"]')
    if (!mute) throw new Error('action not rendered')
    expect(mute.closest('li > button')).toBeNull()
    click(mute)
    expect(onMute).toHaveBeenCalledWith('random')
    expect(rowButtons()[1].getAttribute('aria-current')).toBeNull()
  })

  it('keeps every control in the Tab order and does not hijack arrows', () => {
    render(<Sidebar onMute={() => {}} />)
    const controls = Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    expect(controls).toHaveLength(4)
    expect(controls.every((b) => b.tabIndex === 0)).toBe(true)

    focus(rowButtons()[0])
    expect(press('ArrowDown').defaultPrevented).toBe(false)
    expect(document.activeElement).toBe(rowButtons()[0])
  })

  it('a native row button activates with Enter via its click', () => {
    const onTap = vi.fn()
    render(
      <ListItemGroup context="navigation">
        <ListItem title="General" onTap={onTap} />
      </ListItemGroup>,
    )
    // jsdom does not synthesise click from Enter on buttons; the native
    // <button> guarantees that in browsers, so we assert the element type.
    const [button] = rowButtons()
    expect(button.type).toBe('button')
    click(button)
    expect(onTap).toHaveBeenCalledTimes(1)
  })
})
