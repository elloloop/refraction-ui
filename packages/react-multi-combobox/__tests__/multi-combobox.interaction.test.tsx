// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MultiCombobox, type MultiComboboxOption, type MultiComboboxProps } from '../src/index.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const ada: MultiComboboxOption = { value: 'ada', label: 'Ada Lovelace' }
const alan: MultiComboboxOption = { value: 'alan', label: 'Alan Turing' }
const grace: MultiComboboxOption = { value: 'grace', label: 'Grace Hopper' }
const off: MultiComboboxOption = { value: 'off', label: 'Offline Person', disabled: true }
const people = [ada, alan, grace]

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

function render(ui: React.ReactElement) {
  act(() => root.render(ui))
}

function input(): HTMLInputElement {
  const el = container.querySelector<HTMLInputElement>('input[role="combobox"]')
  if (!el) throw new Error('combobox input not rendered')
  return el
}

function listbox(): HTMLElement {
  const el = container.querySelector<HTMLElement>('[role="listbox"]')
  if (!el) throw new Error('listbox not rendered')
  return el
}

function options(): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="option"]'))
}

function chipLabels(): string[] {
  return Array.from(container.querySelectorAll('ul[aria-label="Selected"] > li')).map(
    (li) => li.querySelector('span')?.textContent ?? '',
  )
}

function activeOption(): HTMLElement | null {
  const id = input().getAttribute('aria-activedescendant')
  return id ? document.getElementById(id) : null
}

function liveText(): string {
  return container.querySelector('[role="status"]')?.textContent ?? ''
}

function focusInput() {
  act(() => input().focus())
}

function type(value: string) {
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    setter.call(input(), value)
    input().dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function press(key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    input().dispatchEvent(event)
  })
  return event
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

/** Uncontrolled harness reporting changes. */
function renderPicker(props: Partial<MultiComboboxProps> = {}) {
  const onValueChange = vi.fn()
  render(
    <MultiCombobox
      options={people}
      aria-label="Invite people"
      onValueChange={onValueChange}
      {...props}
    />,
  )
  focusInput()
  return { onValueChange }
}

describe('MultiCombobox (interaction, jsdom)', () => {
  describe('opening and keyboard navigation', () => {
    it('ArrowDown opens the popup and activates the first option', () => {
      renderPicker()
      expect(input().getAttribute('aria-expanded')).toBe('false')
      const event = press('ArrowDown')
      expect(event.defaultPrevented).toBe(true)
      expect(input().getAttribute('aria-expanded')).toBe('true')
      expect(options()).toHaveLength(3)
      expect(activeOption()?.textContent).toBe('Ada Lovelace')
      expect(activeOption()?.hasAttribute('data-active')).toBe(true)
    })

    it('ArrowUp opens on the last option', () => {
      renderPicker()
      press('ArrowUp')
      expect(activeOption()?.textContent).toBe('Grace Hopper')
    })

    it('arrows move and wrap; Home and End jump to the ends', () => {
      renderPicker()
      press('ArrowDown')
      press('ArrowDown')
      expect(activeOption()?.textContent).toBe('Alan Turing')
      press('End')
      expect(activeOption()?.textContent).toBe('Grace Hopper')
      press('ArrowDown')
      expect(activeOption()?.textContent).toBe('Ada Lovelace')
      press('ArrowUp')
      expect(activeOption()?.textContent).toBe('Grace Hopper')
      press('Home')
      expect(activeOption()?.textContent).toBe('Ada Lovelace')
    })

    it('skips disabled options', () => {
      renderPicker({ options: [ada, off, alan] })
      press('ArrowDown')
      press('ArrowDown')
      expect(activeOption()?.textContent).toBe('Alan Turing')
      expect(options()[1].getAttribute('aria-disabled')).toBe('true')
    })

    it('Escape closes the popup, then clears the query', () => {
      renderPicker()
      type('ad')
      expect(input().getAttribute('aria-expanded')).toBe('true')
      press('Escape')
      expect(input().getAttribute('aria-expanded')).toBe('false')
      expect(input().hasAttribute('aria-activedescendant')).toBe(false)
      expect(input().value).toBe('ad')
      press('Escape')
      expect(input().value).toBe('')
    })

    it('typing opens the popup and filters options, activating the first match', () => {
      renderPicker()
      type('gr')
      expect(options().map((o) => o.textContent)).toEqual(['Grace Hopper'])
      expect(activeOption()?.textContent).toBe('Grace Hopper')
    })

    it('clicking the field opens the popup', () => {
      renderPicker()
      click(input())
      expect(input().getAttribute('aria-expanded')).toBe('true')
    })

    it('closes when focus leaves the component', () => {
      const outside = document.createElement('button')
      document.body.appendChild(outside)
      renderPicker()
      press('ArrowDown')
      act(() => outside.focus())
      expect(input().getAttribute('aria-expanded')).toBe('false')
      outside.remove()
    })
  })

  describe('selecting', () => {
    it('Enter toggles the active option into a chip, keeps the popup open and clears the query', () => {
      const { onValueChange } = renderPicker()
      type('ala')
      const event = press('Enter')
      expect(event.defaultPrevented).toBe(true)
      expect(onValueChange).toHaveBeenLastCalledWith([alan])
      expect(chipLabels()).toEqual(['Alan Turing'])
      expect(input().value).toBe('')
      expect(input().getAttribute('aria-expanded')).toBe('true')
      const selected = options().find((o) => o.textContent === 'Alan Turing')
      expect(selected?.getAttribute('aria-selected')).toBe('true')
      expect(selected?.querySelector('svg')).not.toBeNull()
    })

    it('Enter on a selected option deselects it', () => {
      const { onValueChange } = renderPicker({ defaultValue: [ada] })
      press('ArrowDown')
      press('Enter')
      expect(onValueChange).toHaveBeenLastCalledWith([])
      expect(chipLabels()).toEqual([])
    })

    it('clicking an option toggles it and mousedown keeps focus in the input', () => {
      const { onValueChange } = renderPicker()
      press('ArrowDown')
      const target = options()[2]
      const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      act(() => {
        target.dispatchEvent(mousedown)
      })
      expect(mousedown.defaultPrevented).toBe(true)
      click(target)
      expect(onValueChange).toHaveBeenLastCalledWith([grace])
    })

    it('hovering an option makes it active', () => {
      renderPicker()
      press('ArrowDown')
      act(() => {
        options()[1].dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))
      })
      expect(activeOption()?.textContent).toBe('Alan Turing')
    })

    it('Enter does nothing while closed (lets forms submit)', () => {
      const { onValueChange } = renderPicker()
      const event = press('Enter')
      expect(event.defaultPrevented).toBe(false)
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })

  describe('removing chips', () => {
    it('Backspace on an empty query removes the last chip', () => {
      const { onValueChange } = renderPicker({ defaultValue: [ada, alan] })
      const event = press('Backspace')
      expect(event.defaultPrevented).toBe(true)
      expect(onValueChange).toHaveBeenLastCalledWith([ada])
      expect(chipLabels()).toEqual(['Ada Lovelace'])
    })

    it('Backspace with text in the query edits the text instead', () => {
      const { onValueChange } = renderPicker({ defaultValue: [ada] })
      type('x')
      const event = press('Backspace')
      expect(event.defaultPrevented).toBe(false)
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('the remove button removes its chip and returns focus to the input', () => {
      const { onValueChange } = renderPicker({ defaultValue: [ada, alan] })
      const remove = container.querySelector<HTMLButtonElement>(
        'button[aria-label="Remove Ada Lovelace"]',
      )!
      act(() => remove.focus())
      click(remove)
      expect(onValueChange).toHaveBeenLastCalledWith([alan])
      expect(document.activeElement).toBe(input())
      // The click does not bubble up into opening the popup.
      expect(input().getAttribute('aria-expanded')).toBe('false')
    })
  })

  describe('controlled usage', () => {
    it('reflects the value prop and reports changes without mutating it', () => {
      const onValueChange = vi.fn()
      render(
        <MultiCombobox options={people} value={[ada]} onValueChange={onValueChange} aria-label="P" />,
      )
      focusInput()
      press('ArrowDown')
      press('ArrowDown')
      press('Enter')
      expect(onValueChange).toHaveBeenLastCalledWith([ada, alan])
      // Parent did not update, so the chips still show the controlled value.
      expect(chipLabels()).toEqual(['Ada Lovelace'])
    })

    it('works with a stateful parent and a controlled query', () => {
      function Parent() {
        const [value, setValue] = React.useState<MultiComboboxOption[]>([])
        const [query, setQuery] = React.useState('')
        return (
          <>
            <MultiCombobox
              options={people}
              value={value}
              onValueChange={setValue}
              query={query}
              onQueryChange={setQuery}
              aria-label="P"
            />
            <output>{query}</output>
          </>
        )
      }
      render(<Parent />)
      focusInput()
      type('gr')
      expect(container.querySelector('output')?.textContent).toBe('gr')
      press('Enter')
      expect(chipLabels()).toEqual(['Grace Hopper'])
      expect(container.querySelector('output')?.textContent).toBe('')
    })
  })

  describe('async options', () => {
    it('shows a loading row, then the caller-filtered results', () => {
      const onQueryChange = vi.fn()
      function Async({ loading, results }: { loading: boolean; results: MultiComboboxOption[] }) {
        return (
          <MultiCombobox
            options={results}
            loading={loading}
            filter={false}
            onQueryChange={onQueryChange}
            aria-label="Search people"
          />
        )
      }
      render(<Async loading={false} results={[]} />)
      focusInput()
      type('zz')
      expect(onQueryChange).toHaveBeenLastCalledWith('zz')
      expect(container.textContent).toContain('No results')

      render(<Async loading results={[]} />)
      expect(listbox().getAttribute('aria-busy')).toBe('true')
      expect(container.textContent).toContain('Loading…')
      expect(container.textContent).not.toContain('No results')

      // Server results are shown as given even though they don't contain "zz".
      render(<Async loading={false} results={[ada, alan]} />)
      expect(listbox().hasAttribute('aria-busy')).toBe(false)
      expect(options().map((o) => o.textContent)).toEqual(['Ada Lovelace', 'Alan Turing'])
      expect(activeOption()?.textContent).toBe('Ada Lovelace')
    })

    it('keeps the active option when results refresh around it', () => {
      function Async({ results }: { results: MultiComboboxOption[] }) {
        return <MultiCombobox options={results} filter={false} aria-label="P" />
      }
      render(<Async results={[ada, alan]} />)
      focusInput()
      press('ArrowDown')
      press('ArrowDown')
      expect(activeOption()?.textContent).toBe('Alan Turing')
      render(<Async results={[grace, ada, alan]} />)
      expect(activeOption()?.textContent).toBe('Alan Turing')
    })

    it('uses custom loading and empty messages', () => {
      render(
        <MultiCombobox
          options={[]}
          loading
          messages={{ loading: 'Searching people…' }}
          aria-label="P"
        />,
      )
      focusInput()
      press('ArrowDown')
      expect(container.textContent).toContain('Searching people…')
    })
  })

  describe('create from query', () => {
    it('offers a create item that adds the returned option', () => {
      const onCreate = vi.fn((query: string) => ({ value: `new:${query}`, label: query }))
      const { onValueChange } = renderPicker({ onCreate })
      type('Katherine')
      const createItem = options().find((o) => o.dataset.kind === 'create')
      expect(createItem?.textContent).toBe('Create "Katherine"')
      expect(activeOption()).toBe(createItem)
      press('Enter')
      expect(onCreate).toHaveBeenCalledWith('Katherine')
      expect(onValueChange).toHaveBeenLastCalledWith([{ value: 'new:Katherine', label: 'Katherine' }])
      expect(chipLabels()).toEqual(['Katherine'])
    })

    it('lets the caller handle creation when onCreate returns nothing', () => {
      const onCreate = vi.fn()
      const { onValueChange } = renderPicker({ onCreate })
      type('Someone')
      press('Enter')
      expect(onCreate).toHaveBeenCalledWith('Someone')
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('hides the create item when an option already has that label', () => {
      renderPicker({ onCreate: vi.fn() })
      type('grace hopper')
      expect(options().some((o) => o.dataset.kind === 'create')).toBe(false)
    })
  })

  describe('max', () => {
    it('disables unselected options once full, shows a note and announces when blocked', () => {
      const { onValueChange } = renderPicker({ defaultValue: [ada], max: 1 })
      press('ArrowDown')
      expect(container.textContent).toContain('Maximum of 1 selected')
      const [first, second] = options()
      expect(first.hasAttribute('aria-disabled')).toBe(false)
      expect(second.getAttribute('aria-disabled')).toBe('true')
      // Only the selected option can be active.
      press('ArrowDown')
      expect(activeOption()?.textContent).toBe('Ada Lovelace')
      click(second)
      expect(onValueChange).not.toHaveBeenCalled()
      expect(liveText()).toBe('Maximum of 1 selected')
    })

    it('still allows removing when full', () => {
      const { onValueChange } = renderPicker({ defaultValue: [ada], max: 1 })
      press('Backspace')
      expect(onValueChange).toHaveBeenLastCalledWith([])
    })
  })

  describe('announcements', () => {
    it('announces additions and removals politely', () => {
      renderPicker()
      expect(liveText()).toBe('')
      press('ArrowDown')
      press('Enter')
      expect(liveText()).toBe('Ada Lovelace added. 1 selected.')
      press('Backspace')
      expect(liveText()).toBe('Ada Lovelace removed. 0 selected.')
    })

    it('announces controlled updates made by the parent', () => {
      render(<MultiCombobox options={people} value={[ada]} aria-label="P" />)
      expect(liveText()).toBe('')
      render(<MultiCombobox options={people} value={[ada, alan, grace]} aria-label="P" />)
      expect(liveText()).toBe('3 selected.')
    })
  })

  describe('disabled', () => {
    it('does not open or change the selection', () => {
      const { onValueChange } = renderPicker({ disabled: true, defaultValue: [ada] })
      click(input())
      expect(input().getAttribute('aria-expanded')).toBe('false')
      const remove = container.querySelector<HTMLButtonElement>('button[aria-label="Remove Ada Lovelace"]')!
      expect(remove.disabled).toBe(true)
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })

  describe('leading slot', () => {
    it('renders the leading content for each option', () => {
      renderPicker({
        renderOptionLeading: (option) => <img alt="" src={`/${option.value}.png`} data-leading="" />,
      })
      press('ArrowDown')
      const leading = Array.from(container.querySelectorAll('[data-leading]'))
      expect(leading).toHaveLength(3)
      expect(leading[0].getAttribute('src')).toBe('/ada.png')
    })
  })

  describe('IME composition', () => {
    it('ignores keys while composing', () => {
      const { onValueChange } = renderPicker({ defaultValue: [ada] })
      const event = new KeyboardEvent('keydown', {
        key: 'Backspace',
        bubbles: true,
        cancelable: true,
        isComposing: true,
      })
      act(() => {
        input().dispatchEvent(event)
      })
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })
})
