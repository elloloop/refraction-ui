// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { EventCalendar, type EventCalendarEvent, type EventCalendarProps } from '../src/index.js'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const H = 60
const NOW = { date: '2026-10-14', minutes: 10 * H + 30 }
const EVENTS: EventCalendarEvent[] = [
  {
    id: 'offsite',
    title: 'Offsite',
    allDay: true,
    start: { date: '2026-10-13', minutes: 0 },
    end: { date: '2026-10-14', minutes: 0 },
  },
  {
    id: 'review',
    title: 'Design review',
    start: { date: '2026-10-14', minutes: 9 * H },
    end: { date: '2026-10-14', minutes: 10 * H },
  },
  {
    id: 'lunch',
    title: 'Lunch',
    start: { date: '2026-10-15', minutes: 12 * H },
    end: { date: '2026-10-15', minutes: 13 * H },
  },
]

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

function render(props: Partial<EventCalendarProps> = {}) {
  act(() => {
    root.render(<EventCalendar events={EVENTS} now={NOW} dayStartHour={8} dayEndHour={14} {...props} />)
  })
}

function $(selector: string): HTMLElement {
  const el = container.querySelector<HTMLElement>(selector)
  if (!el) throw new Error(`Missing ${selector}`)
  return el
}

function byLabel(label: string): HTMLElement {
  return $(`[aria-label="${label}"]`)
}

function title(): string {
  return $('h2').textContent ?? ''
}

function click(el: Element) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function pointer(el: EventTarget, type: string, init: PointerEventInit = {}) {
  act(() => {
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, ...init }))
  })
}

function key(el: Element, k: string) {
  const event = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function slot(date: string, minutes: number): HTMLElement {
  return $(`[data-date="${date}"][data-slot="${minutes}"]`)
}

function cursor(): HTMLElement {
  return $('[data-cursor]')
}

/** Give the slot rowgroup a measurable box: 8:00–14:00 = 12 slots of 20 px. */
function mockBodyRect() {
  const body = slot('2026-10-14', 8 * H).closest('[role="rowgroup"]') as HTMLElement
  body.getBoundingClientRect = () =>
    ({ top: 100, height: 240, bottom: 340, left: 0, right: 700, width: 700, x: 0, y: 100 }) as DOMRect
  return body
}

describe('header', () => {
  it('pages with previous / next and returns with Today (uncontrolled)', () => {
    const onDateChange = vi.fn()
    render({ onDateChange })
    expect(title()).toBe('Oct 11 – 17, 2026')
    click(byLabel('Next week'))
    expect(onDateChange).toHaveBeenLastCalledWith('2026-10-21')
    expect(title()).toBe('Oct 18 – 24, 2026')
    click(byLabel('Previous week'))
    click(byLabel('Previous week'))
    expect(title()).toBe('Oct 4 – 10, 2026')
    click($('button:not([aria-label])'))
    expect(onDateChange).toHaveBeenLastCalledWith('2026-10-14')
    expect(title()).toBe('Oct 11 – 17, 2026')
  })

  it('switches views from the view switch', () => {
    const onViewChange = vi.fn()
    render({ onViewChange })
    const month = Array.from(container.querySelectorAll('[role="radio"]')).find((el) => el.textContent === 'Month')
    click(month as Element)
    expect(onViewChange).toHaveBeenCalledWith('month')
    expect(container.querySelector('[data-month-grid]')).not.toBeNull()
    expect(title()).toBe('October 2026')
    expect(byLabel('Next month')).toBeTruthy()
  })

  it('respects controlled view and date', () => {
    const onDateChange = vi.fn()
    render({ view: 'day', date: '2026-10-15', onDateChange })
    click(byLabel('Next day'))
    expect(onDateChange).toHaveBeenCalledWith('2026-10-16')
    // Parent did not update the prop, so the view stays put.
    expect(title()).toBe('Thursday, October 15, 2026')
  })
})

describe('selecting events', () => {
  it('calls onSelectEvent on click and does not create', () => {
    const onSelectEvent = vi.fn()
    const onCreate = vi.fn()
    render({ onSelectEvent, onCreate })
    const review = $('[data-event-id="review"]')
    pointer(review, 'pointerdown')
    pointer(window, 'pointerup')
    click(review)
    expect(onSelectEvent).toHaveBeenCalledWith(EVENTS[1])
    expect(onCreate).not.toHaveBeenCalled()
  })
})

describe('creating by pointer (time grid)', () => {
  it('a click on an empty slot creates one snapped slot', () => {
    const onCreate = vi.fn()
    render({ onCreate })
    const cell = slot('2026-10-12', 11 * H)
    pointer(cell, 'pointerdown')
    pointer(cell, 'pointerup')
    expect(onCreate).toHaveBeenCalledTimes(1)
    expect(onCreate).toHaveBeenCalledWith({
      start: { date: '2026-10-12', minutes: 11 * H },
      end: { date: '2026-10-12', minutes: 11 * H + 30 },
      allDay: false,
    })
  })

  it('a drag creates the snapped range and shows a preview while dragging', () => {
    const onCreate = vi.fn()
    render({ onCreate })
    const body = mockBodyRect()
    pointer(slot('2026-10-12', 9 * H), 'pointerdown', { clientY: 140 })
    // 10:40 → y = 100 + (160 / 360) * 240 ≈ 206.7 → snaps to the 10:30 slot.
    pointer(body, 'pointermove', { clientY: 207 })
    expect(container.querySelector('[data-create-preview]')).not.toBeNull()
    pointer(body, 'pointerup', { clientY: 207 })
    expect(onCreate).toHaveBeenCalledWith({
      start: { date: '2026-10-12', minutes: 9 * H },
      end: { date: '2026-10-12', minutes: 11 * H },
      allDay: false,
    })
    expect(container.querySelector('[data-create-preview]')).toBeNull()
  })

  it('dragging upwards and past the edges clamps to the window', () => {
    const onCreate = vi.fn()
    render({ onCreate })
    const body = mockBodyRect()
    pointer(slot('2026-10-12', 9 * H), 'pointerdown')
    pointer(body, 'pointermove', { clientY: 0 })
    pointer(window, 'pointerup')
    expect(onCreate).toHaveBeenCalledWith({
      start: { date: '2026-10-12', minutes: 8 * H },
      end: { date: '2026-10-12', minutes: 9 * H + 30 },
      allDay: false,
    })
  })

  it('Escape or pointercancel aborts a drag; right-click never starts one', () => {
    const onCreate = vi.fn()
    render({ onCreate })
    pointer(slot('2026-10-12', 9 * H), 'pointerdown')
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    pointer(window, 'pointerup')
    pointer(slot('2026-10-12', 9 * H), 'pointerdown')
    pointer(window, 'pointercancel')
    pointer(window, 'pointerup')
    pointer(slot('2026-10-12', 9 * H), 'pointerdown', { button: 2 })
    pointer(window, 'pointerup')
    expect(onCreate).not.toHaveBeenCalled()
  })

  it('dragging across the all-day row creates an all-day range', () => {
    const onCreate = vi.fn()
    render({ onCreate })
    pointer($('[data-all-day][data-date="2026-10-16"]'), 'pointerdown')
    pointer($('[data-all-day][data-date="2026-10-15"]'), 'pointerover')
    pointer(window, 'pointerup')
    expect(onCreate).toHaveBeenCalledWith({
      start: { date: '2026-10-15', minutes: 0 },
      end: { date: '2026-10-17', minutes: 0 },
      allDay: true,
    })
  })
})

describe('creating by pointer (month)', () => {
  it('drag across day cells creates a multi-day all-day range', () => {
    const onCreate = vi.fn()
    render({ onCreate, defaultView: 'month' })
    const grid = $('[data-month-grid]')
    pointer($('[data-month-grid] [data-date="2026-10-05"]'), 'pointerdown')
    pointer($('[data-month-grid] [data-date="2026-10-07"]'), 'pointerover')
    expect($('[data-month-grid] [data-date="2026-10-06"]').className).toContain('bg-accent')
    pointer(grid, 'pointerup')
    expect(onCreate).toHaveBeenCalledWith({
      start: { date: '2026-10-05', minutes: 0 },
      end: { date: '2026-10-08', minutes: 0 },
      allDay: true,
    })
  })
})

describe('keyboard (time grid)', () => {
  it('arrows move the cursor between days and slots and focus follows', () => {
    render()
    const start = cursor()
    expect(start.dataset.date).toBe('2026-10-14')
    expect(start.dataset.slot).toBe(String(10 * H + 30))
    start.focus()
    key(start, 'ArrowRight')
    expect(document.activeElement).toBe(slot('2026-10-15', 10 * H + 30))
    key(document.activeElement as Element, 'ArrowUp')
    expect(document.activeElement).toBe(slot('2026-10-15', 10 * H))
    key(document.activeElement as Element, 'Home')
    expect(document.activeElement).toBe(slot('2026-10-11', 10 * H))
    key(document.activeElement as Element, 'End')
    expect(document.activeElement).toBe(slot('2026-10-17', 10 * H))
    expect(container.querySelectorAll('[role="gridcell"][tabindex="0"]')).toHaveLength(1)
  })

  it('moving past the week pages the view and keeps focus on the cursor', () => {
    const onDateChange = vi.fn()
    render({ onDateChange })
    cursor().focus()
    key(cursor(), 'End')
    key(document.activeElement as Element, 'ArrowRight')
    expect(onDateChange).toHaveBeenLastCalledWith('2026-10-18')
    expect(title()).toBe('Oct 18 – 24, 2026')
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-18')
    key(document.activeElement as Element, 'PageUp')
    expect(title()).toBe('Oct 11 – 17, 2026')
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-11')
  })

  it('Enter / Space on the cursor creates a one-slot event', () => {
    const onCreate = vi.fn()
    render({ onCreate })
    const event = key(cursor(), 'Enter')
    expect(event.defaultPrevented).toBe(true)
    key(cursor(), ' ')
    expect(onCreate).toHaveBeenCalledTimes(2)
    expect(onCreate).toHaveBeenLastCalledWith({
      start: { date: '2026-10-14', minutes: 10 * H + 30 },
      end: { date: '2026-10-14', minutes: 11 * H },
      allDay: false,
    })
  })

  it('leaves unrelated keys alone', () => {
    render()
    expect(key(cursor(), 'a').defaultPrevented).toBe(false)
  })
})

describe('keyboard (month)', () => {
  it('moves by day / week, Home / End, PageUp / PageDown, and Enter creates', () => {
    const onCreate = vi.fn()
    render({ onCreate, defaultView: 'month' })
    cursor().focus()
    key(cursor(), 'ArrowDown')
    expect(document.activeElement).toBe($('[data-month-grid] [data-date="2026-10-21"]'))
    key(document.activeElement as Element, 'ArrowLeft')
    key(document.activeElement as Element, 'Home')
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-18')
    key(document.activeElement as Element, 'End')
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-10-24')
    key(document.activeElement as Element, 'PageDown')
    expect(title()).toBe('November 2026')
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-11-24')
    key(document.activeElement as Element, 'Enter')
    expect(onCreate).toHaveBeenCalledWith({
      start: { date: '2026-11-24', minutes: 0 },
      end: { date: '2026-11-25', minutes: 0 },
      allDay: true,
    })
  })

  it('"+N more" opens the day view for that date', () => {
    const many: EventCalendarEvent[] = Array.from({ length: 5 }, (_, i) => ({
      id: `m${i}`,
      title: `Meeting ${i}`,
      start: { date: '2026-10-20', minutes: (9 + i) * H },
      end: { date: '2026-10-20', minutes: (10 + i) * H },
    }))
    const onViewChange = vi.fn()
    const onDateChange = vi.fn()
    render({ events: many, defaultView: 'month', maxEventsPerCell: 3, onViewChange, onDateChange })
    click(byLabel('Show 3 more events on Tuesday, October 20, 2026'))
    expect(onViewChange).toHaveBeenCalledWith('day')
    expect(onDateChange).toHaveBeenCalledWith('2026-10-20')
    expect(title()).toBe('Tuesday, October 20, 2026')
    expect(container.querySelectorAll('[data-event-id]')).toHaveLength(5)
  })
})

describe('keyboard between events', () => {
  it('arrows move chronologically between events; Escape returns to the grid', () => {
    render()
    const offsite = $('[data-event-id="offsite"]')
    offsite.focus()
    key(offsite, 'ArrowDown')
    expect(document.activeElement).toBe($('[data-event-id="review"]'))
    key(document.activeElement as Element, 'ArrowRight')
    expect(document.activeElement).toBe($('[data-event-id="lunch"]'))
    key(document.activeElement as Element, 'ArrowDown')
    expect(document.activeElement).toBe($('[data-event-id="lunch"]'))
    key(document.activeElement as Element, 'Home')
    expect(document.activeElement).toBe(offsite)
    key(offsite, 'End')
    expect(document.activeElement).toBe($('[data-event-id="lunch"]'))
    // The grid cursor did not move while navigating events.
    expect(cursor().dataset.date).toBe('2026-10-14')
    key(document.activeElement as Element, 'Escape')
    expect(document.activeElement).toBe(cursor())
    expect(cursor().dataset.date).toBe('2026-10-15')
  })

  it('event keys do not move the grid cursor or create', () => {
    const onCreate = vi.fn()
    render({ onCreate })
    const review = $('[data-event-id="review"]')
    review.focus()
    key(review, 'ArrowLeft')
    key(review, 'Enter')
    expect(onCreate).not.toHaveBeenCalled()
    expect(cursor().dataset.date).toBe('2026-10-14')
  })

  it('works across month cells too', () => {
    render({ defaultView: 'month' })
    const offsite = $('[data-event-id="offsite"]')
    offsite.focus()
    key(offsite, 'ArrowDown')
    expect(document.activeElement).toBe($('[data-event-id="review"]'))
  })
})
