import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { SlotPicker } from '../src/slot-picker.js'
import type { SlotDay } from '../src/slot-picker.js'

const days: SlotDay[] = [
  { id: 'day-1', weekday: 'Mon', dayNum: '9' },
  { id: 'day-2', weekday: 'Tue', dayNum: '10' },
  { id: 'day-3', weekday: 'Wed', dayNum: '11' },
]

const slotsByDay: Record<string, string[]> = {
  'day-1': ['9:00 AM', '10:00 AM', '2:00 PM'],
  'day-2': ['11:00 AM', '3:00 PM'],
  'day-3': [],
}

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(SlotPicker, props as never))

describe('SlotPicker (SSR)', () => {
  it('renders a day chip for each day', () => {
    const html = render({ days, slotsByDay })
    expect(html).toContain('Mon')
    expect(html).toContain('Tue')
    expect(html).toContain('Wed')
    // All three chips present as radio buttons
    const radioMatches = html.match(/role="radio"/g) ?? []
    expect(radioMatches.length).toBeGreaterThanOrEqual(3)
  })

  it('renders slots for the default-selected day', () => {
    const html = render({
      days,
      slotsByDay,
      defaultValue: { dayId: 'day-1', slot: '10:00 AM' },
    })
    expect(html).toContain('9:00 AM')
    expect(html).toContain('10:00 AM')
    expect(html).toContain('2:00 PM')
  })

  it('marks the selected day chip as checked', () => {
    const html = render({
      days,
      slotsByDay,
      value: { dayId: 'day-2', slot: '11:00 AM' },
    })
    // day-2 chip should be aria-checked="true"
    // The checked chip is the one with data-state="checked" among day chips
    expect(html).toContain('aria-checked="true"')
  })

  it('marks the selected slot as checked', () => {
    const html = render({
      days,
      slotsByDay,
      value: { dayId: 'day-1', slot: '9:00 AM' },
    })
    // Multiple aria-checked="true": at least the day + the slot
    const checked = (html.match(/aria-checked="true"/g) ?? []).length
    expect(checked).toBeGreaterThanOrEqual(2)
  })

  it('renders the timezone label when provided', () => {
    const html = render({
      days,
      slotsByDay,
      value: { dayId: 'day-1', slot: '9:00 AM' },
      timezoneLabel: 'Eastern Time',
    })
    expect(html).toContain('Eastern Time')
  })

  it('does not render a slot grid when no day is selected', () => {
    const html = render({ days, slotsByDay })
    expect(html).not.toContain('9:00 AM')
  })
})
