import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@elloloop/shared'
import { Calendar, CalendarHeader } from '../src/calendar.js'

beforeEach(() => {
  resetIdCounter()
})

describe('Calendar (React SSR)', () => {
  it('renders a grid with role=grid', () => {
    const html = renderToString(
      React.createElement(Calendar, { month: new Date(2025, 5, 1) }),
    )
    expect(html).toContain('role="grid"')
  })

  it('renders day-of-week headers', () => {
    const html = renderToString(
      React.createElement(Calendar, { month: new Date(2025, 5, 1) }),
    )
    expect(html).toContain('Su')
    expect(html).toContain('Mo')
    expect(html).toContain('We')
    expect(html).toContain('Fr')
    expect(html).toContain('Sa')
  })

  it('renders day buttons as gridcells', () => {
    const html = renderToString(
      React.createElement(Calendar, { month: new Date(2025, 5, 1) }),
    )
    expect(html).toContain('role="gridcell"')
    expect(html).toContain('<button')
  })

  it('renders the month label', () => {
    const html = renderToString(
      React.createElement(Calendar, { month: new Date(2025, 5, 1) }),
    )
    expect(html).toContain('June 2025')
  })

  it('renders prev and next month buttons', () => {
    const html = renderToString(
      React.createElement(Calendar, { month: new Date(2025, 5, 1) }),
    )
    expect(html).toContain('aria-label="Previous month"')
    expect(html).toContain('aria-label="Next month"')
  })

  it('renders with calendar variant styles', () => {
    const html = renderToString(
      React.createElement(Calendar, { month: new Date(2025, 5, 1) }),
    )
    expect(html).toContain('p-3')
    expect(html).toContain('rounded-md')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(Calendar, {
        month: new Date(2025, 5, 1),
        className: 'my-calendar',
      }),
    )
    expect(html).toContain('my-calendar')
  })

  it('renders aria-labelledby linking to the label', () => {
    const html = renderToString(
      React.createElement(Calendar, { month: new Date(2025, 5, 1) }),
    )
    expect(html).toContain('aria-labelledby')
    expect(html).toContain('rfr-calendar-label')
  })

  it('renders 42 day buttons', () => {
    const html = renderToString(
      React.createElement(Calendar, { month: new Date(2025, 5, 1) }),
    )
    const buttonCount = (html.match(/<button/g) || []).length
    // 42 day buttons + 2 nav buttons = 44
    expect(buttonCount).toBe(44)
  })

  it('marks selected date with aria-selected', () => {
    const html = renderToString(
      React.createElement(Calendar, {
        value: new Date(2025, 5, 15),
        month: new Date(2025, 5, 1),
      }),
    )
    expect(html).toContain('aria-selected="true"')
  })

  it('disables day buttons for disabled dates', () => {
    const html = renderToString(
      React.createElement(Calendar, {
        month: new Date(2025, 5, 1),
        disabledDates: [new Date(2025, 5, 15)],
      }),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('aria-disabled="true"')
  })
})

describe('CalendarHeader (React SSR)', () => {
  it('renders the label and nav buttons', () => {
    const html = renderToString(
      React.createElement(CalendarHeader, {
        label: 'June 2025',
        labelId: 'test-label',
        onPrevMonth: () => {},
        onNextMonth: () => {},
      }),
    )
    expect(html).toContain('June 2025')
    expect(html).toContain('aria-label="Previous month"')
    expect(html).toContain('aria-label="Next month"')
    expect(html).toContain('id="test-label"')
  })
})
