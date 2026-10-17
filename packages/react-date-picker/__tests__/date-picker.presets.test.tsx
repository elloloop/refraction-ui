// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { renderToString } from 'react-dom/server'
import { createRoot, hydrateRoot, type Root } from 'react-dom/client'
import { DatePicker, type DatePickerProps } from '../src/date-picker.js'
import { createDefaultDatePresets } from '../src/index.js'

// Choosing a preset in a browser-like DOM: what reaches onChange, and when.

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

// Saturday 17 October 2026: Today is the 17th, Tomorrow the 18th, Next week Monday the 19th.
const SATURDAY = new Date(2026, 9, 17, 15, 0)
const presets = createDefaultDatePresets()

let root: Root | undefined
let host: HTMLDivElement

async function render(props: DatePickerProps) {
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(React.createElement(DatePicker, props))
  })
}

function preset(id: string): HTMLButtonElement {
  const button = host.querySelector<HTMLButtonElement>(`[data-rfr-datepicker-preset="${id}"]`)
  if (!button) throw new Error(`Missing preset ${id}`)
  return button
}

async function choose(id: string) {
  await act(async () => {
    preset(id).click()
  })
}

afterEach(async () => {
  if (root) await act(async () => root!.unmount())
  root = undefined
  document.body.replaceChildren()
  vi.useRealTimers()
})

describe('DatePicker presets', () => {
  it('calls onChange with the chosen day at midnight', async () => {
    const onChange = vi.fn()
    await render({ presets, today: SATURDAY, onChange })
    await choose('tomorrow')
    await choose('next-week')
    expect(onChange.mock.calls).toEqual([[new Date(2026, 9, 18)], [new Date(2026, 9, 19)]])
  })

  it('keeps the time already chosen when showTime is set', async () => {
    const onChange = vi.fn()
    await render({ presets, today: SATURDAY, showTime: true, value: new Date(2026, 9, 1, 14, 30), onChange })
    await choose('next-week')
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 9, 19, 14, 30))
  })

  it('shows the chosen day in the input once the caller passes it back', async () => {
    function Controlled() {
      const [value, setValue] = React.useState<Date>()
      return React.createElement(DatePicker, { presets, today: SATURDAY, value, onChange: setValue })
    }
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
    await act(async () => root!.render(React.createElement(Controlled)))
    await choose('tomorrow')
    expect(host.querySelector('input')!.value).toBe('2026-10-18')
  })

  it('does not choose a disabled preset', async () => {
    const onChange = vi.fn()
    await render({ presets, today: SATURDAY, minDate: new Date(2026, 9, 18), onChange })
    expect(preset('today').disabled).toBe(true)
    await choose('today')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('resolves against the current date when chosen, not when rendered', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 17, 23, 59))
    const onChange = vi.fn()
    await render({ presets, onChange })
    // The page stays open past midnight.
    vi.setSystemTime(new Date(2026, 9, 18, 0, 1))
    await choose('today')
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 9, 18))
  })

  it('ignores a preset that has left the allowed range since it was rendered', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 17, 23, 59))
    const onChange = vi.fn()
    await render({ presets, maxDate: new Date(2026, 9, 17), onChange })
    expect(preset('today').disabled).toBe(false)
    vi.setSystemTime(new Date(2026, 9, 18, 0, 1))
    await choose('today')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('puts the presets after the input in the tab order', async () => {
    await render({ presets, today: SATURDAY })
    const focusable = Array.from(host.querySelectorAll<HTMLElement>('input, button'))
    expect(focusable.map((element) => element.dataset.rfrDatepickerPreset ?? element.tagName)).toEqual([
      'INPUT',
      'today',
      'tomorrow',
      'next-week',
    ])
    expect(focusable.every((element) => element.tabIndex === 0)).toBe(true)
  })

  it('hydrates server-rendered presets without a mismatch when today is passed', async () => {
    const props: DatePickerProps = { presets, today: SATURDAY, minDate: new Date(2026, 9, 18) }
    host = document.createElement('div')
    host.innerHTML = renderToString(React.createElement(DatePicker, props))
    document.body.appendChild(host)
    const serverButtons = Array.from(host.querySelectorAll('button'))
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const recoverable: unknown[] = []
    try {
      await act(async () => {
        root = hydrateRoot(host, React.createElement(DatePicker, props), {
          onRecoverableError: (error) => recoverable.push(error),
        })
      })
      expect(errors.mock.calls).toEqual([])
      expect(recoverable).toEqual([])
      expect(Array.from(host.querySelectorAll('button'))).toEqual(serverButtons)
    } finally {
      errors.mockRestore()
    }
  })
})
