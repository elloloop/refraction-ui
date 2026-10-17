// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { TimePicker, type TimePickerProps } from '../src/index.js'

// React 19 expects this flag when running outside a browser bundler.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const t = (h: number, m = 0) => h * 60 + m

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

/** A 24-hour picker so assertions don't depend on the test runner's locale. */
function renderPicker(props: TimePickerProps = {}) {
  render(<TimePicker aria-label="Time" hourCycle={24} {...props} />)
  return input()
}

function input(): HTMLInputElement {
  const el = container.querySelector<HTMLInputElement>('input[role="combobox"]')
  if (!el) throw new Error('input not rendered')
  return el
}

function listbox(): HTMLUListElement {
  const el = container.querySelector<HTMLUListElement>('[role="listbox"]')
  if (!el) throw new Error('listbox not rendered')
  return el
}

function options(): HTMLLIElement[] {
  return Array.from(container.querySelectorAll<HTMLLIElement>('[role="option"]'))
}

function activeOption(): HTMLElement | null {
  const id = input().getAttribute('aria-activedescendant')
  return id ? document.getElementById(id) : null
}

function message(): string {
  const id = input().getAttribute('aria-describedby')
  return (id && document.getElementById(id)?.textContent) || ''
}

function focus(el: HTMLElement) {
  act(() => {
    el.focus()
  })
}

function blur(el: HTMLElement) {
  act(() => {
    el.blur()
  })
}

/** Set the input's text the way a user's typing does (React tracks the native setter). */
function type(el: HTMLInputElement, text: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  act(() => {
    setter?.call(el, text)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function press(el: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

describe('TimePicker (interaction, jsdom)', () => {
  describe('typed entry', () => {
    it.each([
      ['930', '09:30', t(9, 30)],
      ['9:30pm', '21:30', t(21, 30)],
      ['21:30', '21:30', t(21, 30)],
      ['12am', '00:00', 0],
    ])('commits %j on Enter and reformats it', (typed, shown, minutes) => {
      const onValueChange = vi.fn()
      const el = renderPicker({ onValueChange })
      focus(el)
      type(el, typed)
      press(el, 'Enter')
      expect(onValueChange).toHaveBeenCalledWith(minutes)
      expect(el.value).toBe(shown)
      expect(el.getAttribute('aria-expanded')).toBe('false')
    })

    it('commits a valid entry on blur, on a 12-hour clock', () => {
      const onValueChange = vi.fn()
      const el = renderPicker({ hourCycle: 12, onValueChange })
      focus(el)
      type(el, '2130')
      blur(el)
      expect(onValueChange).toHaveBeenCalledWith(t(21, 30))
      expect(el.value).toBe('9:30 PM')
    })

    it('flags an unparseable entry on blur with aria-invalid and a message', () => {
      const onValueChange = vi.fn()
      const el = renderPicker({ defaultValue: t(9), onValueChange })
      focus(el)
      type(el, '9:75')
      blur(el)
      expect(onValueChange).not.toHaveBeenCalled()
      expect(el.getAttribute('aria-invalid')).toBe('true')
      expect(el.value).toBe('9:75')
      expect(message()).toBe('Enter a time like 09:30.')
      expect(container.firstElementChild?.hasAttribute('data-invalid')).toBe(true)
    })

    it('rejects an out-of-range entry and names the range', () => {
      const el = renderPicker({ min: t(9), max: t(17) })
      focus(el)
      type(el, '8am')
      press(el, 'Enter')
      expect(el.getAttribute('aria-invalid')).toBe('true')
      expect(message()).toBe('Choose a time between 09:00 and 17:00.')
    })

    it('uses a custom invalid message', () => {
      const el = renderPicker({ invalidMessage: (reason) => `bad: ${reason}` })
      focus(el)
      type(el, 'soon')
      blur(el)
      expect(message()).toBe('bad: unparseable')
    })

    it('keeps a caller aria-describedby alongside the message', () => {
      render(
        <>
          <p id="hint">Office hours only</p>
          <TimePicker aria-label="Time" aria-describedby="hint" hourCycle={24} />
        </>,
      )
      const el = input()
      expect(el.getAttribute('aria-describedby')).toBe('hint')
      focus(el)
      type(el, 'x')
      blur(el)
      const ids = el.getAttribute('aria-describedby')?.split(' ') ?? []
      expect(ids[0]).toBe('hint')
      expect(ids).toHaveLength(2)
    })

    it('clears the invalid state as soon as the user edits again', () => {
      const el = renderPicker()
      focus(el)
      type(el, 'x')
      blur(el)
      expect(el.hasAttribute('aria-invalid')).toBe(true)
      focus(el)
      type(el, '9')
      expect(el.hasAttribute('aria-invalid')).toBe(false)
    })

    it('clears the value when the text is emptied', () => {
      const onValueChange = vi.fn()
      const el = renderPicker({ defaultValue: t(9), onValueChange })
      focus(el)
      type(el, '')
      blur(el)
      expect(onValueChange).toHaveBeenCalledWith(null)
    })

    it('keeps Enter in the field when it changes the value, but lets it submit otherwise', () => {
      const el = renderPicker({ defaultValue: t(9) })
      focus(el)
      expect(press(el, 'Enter').defaultPrevented).toBe(false)
      type(el, '10')
      expect(press(el, 'Enter').defaultPrevented).toBe(true)
      expect(el.value).toBe('10:00')
      expect(press(el, 'Enter').defaultPrevented).toBe(false)
    })
  })

  describe('arrow keys with the list closed', () => {
    it('ArrowUp steps later and ArrowDown earlier by the step', () => {
      const onValueChange = vi.fn()
      const el = renderPicker({ defaultValue: t(10), onValueChange })
      focus(el)
      const up = press(el, 'ArrowUp')
      expect(up.defaultPrevented).toBe(true)
      expect(el.value).toBe('10:15')
      press(el, 'ArrowDown')
      press(el, 'ArrowDown')
      expect(el.value).toBe('09:45')
      expect(onValueChange).toHaveBeenLastCalledWith(t(9, 45))
      expect(el.getAttribute('aria-expanded')).toBe('false')
    })

    it('steps from the typed (uncommitted) time with a custom step', () => {
      const el = renderPicker({ step: 30 })
      focus(el)
      type(el, '10:07')
      act(() => {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true }))
      })
      press(el, 'ArrowUp')
      expect(el.value).toBe('10:30')
    })

    it('clamps at min and max', () => {
      const el = renderPicker({ defaultValue: t(17), min: t(9), max: t(17) })
      focus(el)
      press(el, 'ArrowUp')
      expect(el.value).toBe('17:00')
      for (let i = 0; i < 40; i++) press(el, 'ArrowDown')
      expect(el.value).toBe('09:00')
    })

    it('does nothing when read-only', () => {
      const el = renderPicker({ defaultValue: t(10), readOnly: true })
      focus(el)
      press(el, 'ArrowUp')
      expect(el.value).toBe('10:00')
    })
  })

  describe('suggestion list', () => {
    it('opens on Alt+ArrowDown with the current value active', () => {
      const el = renderPicker({ defaultValue: t(10), step: 60 })
      focus(el)
      press(el, 'ArrowDown', { altKey: true })
      expect(el.getAttribute('aria-expanded')).toBe('true')
      expect(listbox().hidden).toBe(false)
      expect(activeOption()?.textContent).toBe('10:00')
      expect(activeOption()?.hasAttribute('data-highlighted')).toBe(true)
    })

    it('opens on click and on typing', () => {
      const el = renderPicker()
      click(el)
      expect(el.getAttribute('aria-expanded')).toBe('true')
      press(el, 'Escape')
      expect(el.getAttribute('aria-expanded')).toBe('false')
      type(el, '1')
      expect(el.getAttribute('aria-expanded')).toBe('true')
    })

    it('arrows move the active option (clamped) and Enter commits it', () => {
      const onValueChange = vi.fn()
      const el = renderPicker({ min: t(9), max: t(10), step: 30, onValueChange })
      focus(el)
      press(el, 'ArrowDown', { altKey: true })
      expect(activeOption()).toBeNull()
      press(el, 'ArrowDown')
      expect(activeOption()?.textContent).toBe('09:00')
      press(el, 'ArrowDown')
      press(el, 'ArrowDown')
      press(el, 'ArrowDown')
      expect(activeOption()?.textContent).toBe('10:00')
      press(el, 'ArrowUp')
      expect(activeOption()?.textContent).toBe('09:30')
      press(el, 'Enter')
      expect(onValueChange).toHaveBeenCalledWith(t(9, 30))
      expect(el.value).toBe('09:30')
      expect(el.getAttribute('aria-expanded')).toBe('false')
      expect(el.hasAttribute('aria-activedescendant')).toBe(false)
    })

    it('Enter after typing an off-grid time commits the typed time', () => {
      const onValueChange = vi.fn()
      const el = renderPicker({ onValueChange })
      focus(el)
      type(el, '10:07')
      expect(activeOption()).toBeNull()
      press(el, 'Enter')
      expect(onValueChange).toHaveBeenCalledWith(t(10, 7))
    })

    it('typing an exact suggestion makes it active', () => {
      const el = renderPicker()
      focus(el)
      type(el, '1030')
      expect(activeOption()?.textContent).toBe('10:30')
    })

    it('Escape closes the list and reverts the text', () => {
      const onValueChange = vi.fn()
      const el = renderPicker({ defaultValue: t(9), onValueChange })
      focus(el)
      type(el, '11')
      const esc = press(el, 'Escape')
      expect(esc.defaultPrevented).toBe(true)
      expect(el.value).toBe('09:00')
      expect(el.getAttribute('aria-expanded')).toBe('false')
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('Escape with nothing to revert is left for parents (e.g. a dialog)', () => {
      const el = renderPicker({ defaultValue: t(9) })
      focus(el)
      expect(press(el, 'Escape').defaultPrevented).toBe(false)
    })

    it('Escape clears an invalid state', () => {
      const el = renderPicker({ defaultValue: t(9) })
      focus(el)
      type(el, 'nope')
      press(el, 'Enter')
      expect(el.hasAttribute('aria-invalid')).toBe(true)
      press(el, 'Escape')
      expect(el.hasAttribute('aria-invalid')).toBe(false)
      expect(el.value).toBe('09:00')
    })

    it('clicking an option commits it and keeps focus in the input', () => {
      const onValueChange = vi.fn()
      const el = renderPicker({ step: 60, onValueChange })
      focus(el)
      click(el)
      const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      const target = options()[14]
      act(() => {
        target.dispatchEvent(mousedown)
      })
      expect(mousedown.defaultPrevented).toBe(true)
      click(target)
      expect(onValueChange).toHaveBeenCalledWith(t(14))
      expect(el.value).toBe('14:00')
      expect(document.activeElement).toBe(el)
    })

    it('suggests end times with durations relative to start', () => {
      const el = renderPicker({ start: t(10), step: 30, max: t(12) })
      click(el)
      expect(options().map((o) => o.textContent)).toEqual([
        '10:30(30 min)',
        '11:00(1 h)',
        '11:30(1 h 30 min)',
        '12:00(2 h)',
      ])
    })

    it('marks the committed value with aria-selected', () => {
      const el = renderPicker({ step: 60, min: t(9), max: t(11), defaultValue: t(10) })
      click(el)
      const selected = options().filter((o) => o.getAttribute('aria-selected') === 'true')
      expect(selected.map((o) => o.textContent)).toEqual(['10:00'])
    })

    it('never opens an empty list', () => {
      const el = renderPicker({ min: t(12), max: t(11, 59), step: 60 })
      click(el)
      expect(el.getAttribute('aria-expanded')).toBe('false')
      expect(listbox().hidden).toBe(true)
    })

    it('does not open when disabled', () => {
      const el = renderPicker({ disabled: true })
      click(el)
      expect(el.getAttribute('aria-expanded')).toBe('false')
    })
  })

  describe('controlled usage', () => {
    function Controlled({ onValueChange }: { onValueChange: (v: number | null) => void }) {
      const [value, setValue] = React.useState<number | null>(t(9))
      return (
        <>
          <TimePicker
            aria-label="Time"
            hourCycle={24}
            value={value}
            onValueChange={(v) => {
              setValue(v)
              onValueChange(v)
            }}
          />
          <button type="button" onClick={() => setValue(t(13, 15))}>
            set
          </button>
        </>
      )
    }

    it('reflects external value changes and reports commits', () => {
      const onValueChange = vi.fn()
      render(<Controlled onValueChange={onValueChange} />)
      const el = input()
      expect(el.value).toBe('09:00')
      click(container.querySelector('button') as HTMLButtonElement)
      expect(el.value).toBe('13:15')
      focus(el)
      press(el, 'ArrowUp')
      expect(onValueChange).toHaveBeenCalledWith(t(13, 30))
      expect(el.value).toBe('13:30')
    })
  })

  it('submits HH:mm through the hidden named input', () => {
    const el = renderPicker({ name: 'start', hourCycle: 12 })
    focus(el)
    type(el, '9:30pm')
    blur(el)
    const hidden = container.querySelector<HTMLInputElement>('input[type="hidden"][name="start"]')
    expect(hidden?.value).toBe('21:30')
    expect(el.value).toBe('9:30 PM')
  })
})
