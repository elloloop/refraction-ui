import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { DatePicker } from '../src/date-picker.js'
import { createDefaultDatePresets } from '../src/index.js'

// SSR suite — structure and attributes only. This adapter is a styled native
// `<input type="date">`; `onChange` wiring is client interaction not covered
// here.

describe('DatePicker (React)', () => {
  it('renders a date input with base classes', () => {
    const html = renderToString(React.createElement(DatePicker, null))
    expect(html).toContain('<input')
    expect(html).toContain('type="date"')
    expect(html).toContain('rounded-md border border-input')
  })

  it('renders a datetime-local input when showTime is set', () => {
    const html = renderToString(React.createElement(DatePicker, { showTime: true }))
    expect(html).toContain('type="datetime-local"')
    expect(html).not.toContain('type="date"')
  })

  it('formats the value as YYYY-MM-DD', () => {
    const html = renderToString(React.createElement(DatePicker, { value: new Date(2024, 2, 15) }))
    expect(html).toContain('value="2024-03-15"')
  })

  it('includes the time in the value when showTime is set', () => {
    const html = renderToString(
      React.createElement(DatePicker, { value: new Date(2024, 2, 15, 9, 30), showTime: true }),
    )
    expect(html).toContain('value="2024-03-15T09:30"')
  })

  it('renders an empty value when no date is given', () => {
    const html = renderToString(React.createElement(DatePicker, null))
    expect(html).toContain('value=""')
  })

  it('maps minDate/maxDate to native min/max attributes', () => {
    const html = renderToString(
      React.createElement(DatePicker, {
        minDate: new Date(2024, 0, 1),
        maxDate: new Date(2024, 11, 31),
      }),
    )
    expect(html).toContain('min="2024-01-01"')
    expect(html).toContain('max="2024-12-31"')
  })

  it('renders the selected date in a custom display format', () => {
    // Regression guard: the `format` prop used to be accepted but ignored.
    const html = renderToString(
      React.createElement(DatePicker, { value: new Date(2024, 2, 15), format: 'DD/MM/YYYY' }),
    )
    expect(html).toContain('15/03/2024')
    // The native input keeps its ISO value.
    expect(html).toContain('value="2024-03-15"')
  })

  it('applies the custom format with time when showTime is set', () => {
    const html = renderToString(
      React.createElement(DatePicker, {
        value: new Date(2024, 2, 15, 9, 30),
        showTime: true,
        format: 'DD/MM/YYYY HH:mm',
      }),
    )
    expect(html).toContain('15/03/2024 09:30')
    expect(html).toContain('value="2024-03-15T09:30"')
  })

  it('renders no extra display text without a format prop', () => {
    const html = renderToString(React.createElement(DatePicker, { value: new Date(2024, 2, 15) }))
    expect(html).not.toContain('<span')
  })

  it('renders no display text when a format is given but no date is selected', () => {
    const html = renderToString(React.createElement(DatePicker, { format: 'DD/MM/YYYY' }))
    expect(html).not.toContain('<span')
  })

  it('sets the disabled attribute', () => {
    const html = renderToString(React.createElement(DatePicker, { disabled: true }))
    expect(html).toContain('disabled')
  })

  it('appends a custom className', () => {
    const html = renderToString(React.createElement(DatePicker, { className: 'my-picker' }))
    expect(html).toContain('my-picker')
    expect(html).toContain('border-input')
  })

  it('spreads additional input attributes', () => {
    const html = renderToString(
      React.createElement(DatePicker, {
        placeholder: 'Pick a date',
        'aria-label': 'Start date',
        name: 'start',
      }),
    )
    expect(html).toContain('placeholder="Pick a date"')
    expect(html).toContain('aria-label="Start date"')
    expect(html).toContain('name="start"')
  })

  describe('presets', () => {
    // Saturday 17 October 2026: Today is the 17th, Tomorrow the 18th, Next week Monday the 19th.
    const today = new Date(2026, 9, 17, 15, 0)
    const presets = createDefaultDatePresets()

    function buttons(html: string): string[] {
      return html.match(/<button[^>]*>[^<]*<\/button>/g) ?? []
    }

    it('renders nothing extra, and no id, without presets', () => {
      for (const html of [
        renderToString(React.createElement(DatePicker, null)),
        renderToString(React.createElement(DatePicker, { presets: [] })),
      ]) {
        expect(html).not.toContain('role="group"')
        expect(html).not.toContain('<button')
        expect(html).not.toContain(' id=')
      }
    })

    it('renders a labelled group of buttons, in order, that point at the input', () => {
      const html = renderToString(React.createElement(DatePicker, { presets, today }))
      const inputId = html.match(/<input[^>]* id="([^"]+)"/)?.[1]
      expect(inputId).toBeTruthy()
      expect(html).toMatch(/<div role="group" aria-label="Date shortcuts" class="[^"]*flex-wrap[^"]*" data-rfr-datepicker-presets="">/)
      expect(html.indexOf('<input')).toBeLessThan(html.indexOf('role="group"'))
      const rendered = buttons(html)
      expect(rendered.map((button) => button.match(/>([^<]*)<\/button>$/)?.[1])).toEqual(['Today', 'Tomorrow', 'Next week'])
      for (const [index, id] of ['today', 'tomorrow', 'next-week'].entries()) {
        expect(rendered[index]).toContain('type="button"')
        expect(rendered[index]).toContain(`data-rfr-datepicker-preset="${id}"`)
        expect(rendered[index]).toContain(`aria-controls="${inputId}"`)
        expect(rendered[index]).toContain('focus-visible:ring-2')
        expect(rendered[index]).not.toContain('disabled=""')
      }
    })

    it('shows translated labels and a translated group name as given', () => {
      const html = renderToString(
        React.createElement(DatePicker, {
          presets: createDefaultDatePresets({ labels: { today: 'Hoy', tomorrow: 'Mañana', nextWeek: 'La semana que viene' } }),
          presetsLabel: 'Atajos de fecha',
          today,
        }),
      )
      expect(html).toContain('aria-label="Atajos de fecha"')
      expect(html).toContain('>Hoy</button>')
      expect(html).toContain('>Mañana</button>')
      expect(html).toContain('>La semana que viene</button>')
    })

    it('renders caller-defined presets after the defaults', () => {
      const html = renderToString(
        React.createElement(DatePicker, {
          presets: [...presets, { id: 'in-two-weeks', label: 'In two weeks', days: 14 }],
          today,
        }),
      )
      expect(buttons(html).at(-1)).toContain('data-rfr-datepicker-preset="in-two-weeks"')
      expect(buttons(html).at(-1)).toContain('>In two weeks</button>')
    })

    it('disables presets outside minDate and maxDate', () => {
      const html = renderToString(
        React.createElement(DatePicker, { presets, today, minDate: new Date(2026, 9, 18), maxDate: new Date(2026, 9, 18) }),
      )
      expect(buttons(html).map((button) => button.includes('disabled=""'))).toEqual([true, false, true])
    })

    it('disables every preset when the picker is disabled or read-only', () => {
      for (const extra of [{ disabled: true }, { readOnly: true }]) {
        const html = renderToString(React.createElement(DatePicker, { presets, today, ...extra }))
        expect(buttons(html).every((button) => button.includes('disabled=""'))).toBe(true)
      }
    })

    it('points the presets at a caller-supplied input id', () => {
      const html = renderToString(React.createElement(DatePicker, { presets, today, id: 'due-date' }))
      expect(html).toContain('<input id="due-date"')
      expect(buttons(html).every((button) => button.includes('aria-controls="due-date"'))).toBe(true)
    })

    it('keeps the formatted date between the input and the presets', () => {
      const html = renderToString(
        React.createElement(DatePicker, { presets, today, value: new Date(2026, 9, 18), format: 'DD/MM/YYYY' }),
      )
      expect(html.indexOf('value="2026-10-18"')).toBeLessThan(html.indexOf('18/10/2026'))
      expect(html.indexOf('18/10/2026')).toBeLessThan(html.indexOf('role="group"'))
    })
  })
})
