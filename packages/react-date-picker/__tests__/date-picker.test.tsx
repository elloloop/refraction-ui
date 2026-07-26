import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { DatePicker } from '../src/date-picker.js'

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
})
