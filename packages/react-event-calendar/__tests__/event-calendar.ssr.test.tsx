import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { EventCalendar, type EventCalendarEvent } from '../src/index.js'

const H = 60
const NOW = { date: '2026-10-14', minutes: 10 * H + 30 }

const EVENTS: EventCalendarEvent[] = [
  {
    id: 'standup',
    title: 'Standup',
    start: { date: '2026-10-14', minutes: 9 * H },
    end: { date: '2026-10-14', minutes: 9 * H + 30 },
    category: 'Team',
    color: 'info',
  },
  {
    id: 'review',
    title: 'Design review',
    start: { date: '2026-10-14', minutes: 9 * H },
    end: { date: '2026-10-14', minutes: 10 * H },
    color: 'success',
  },
  {
    id: 'offsite',
    title: 'Offsite',
    allDay: true,
    start: { date: '2026-10-13', minutes: 0 },
    end: { date: '2026-10-15', minutes: 0 },
    color: 'warning',
  },
]

function html(ui: React.ReactElement): string {
  return renderToString(ui)
}

function count(markup: string, needle: string): number {
  return markup.split(needle).length - 1
}

describe('EventCalendar (SSR)', () => {
  it('renders a labelled region with header controls that have accessible names', () => {
    const markup = html(<EventCalendar events={EVENTS} now={NOW} defaultDate="2026-10-14" />)
    expect(markup).toContain('role="region"')
    expect(markup).toContain('aria-label="Calendar"')
    expect(markup).toContain('data-view="week"')
    expect(markup).toContain('>Today</button>')
    expect(markup).toContain('aria-label="Previous week"')
    expect(markup).toContain('aria-label="Next week"')
    expect(markup).toContain('role="radiogroup"')
    expect(markup).toContain('aria-label="Calendar view"')
    expect(count(markup, 'role="radio"')).toBe(3)
    expect(markup).toMatch(/aria-checked="true"[^>]*>Week</)
    expect(markup).toContain('aria-live="polite"')
    expect(markup).toContain('Oct 11 – 17, 2026')
  })

  it('renders the week time grid with headers, all-day row and slot cells', () => {
    const markup = html(<EventCalendar events={EVENTS} now={NOW} dayStartHour={8} dayEndHour={12} />)
    expect(markup).toContain('role="grid"')
    expect(markup).toMatch(/role="grid" aria-labelledby="[^"]+"/)
    // Time header + 7 day headers.
    expect(count(markup, 'role="columnheader"')).toBe(8)
    expect(markup).toContain('aria-label="Wednesday, October 14, 2026" aria-current="date"')
    expect(markup).toContain('>All day</div>')
    // 8 slots (8:00–12:00 in 30 min) × 7 days + 7 all-day cells.
    expect(count(markup, 'role="gridcell"')).toBe(8 * 7 + 7)
    expect(markup).toContain('aria-label="Monday, October 12, 2026, 9:30 AM"')
    // Exactly one roving tab stop in the grid: the cursor slot (now, snapped).
    expect(count(markup, 'data-cursor=""')).toBe(1)
    expect(markup).toMatch(/tabindex="0" data-cursor="" data-date="2026-10-14" data-slot="630"/)
  })

  it('renders events as buttons whose names include time range and category', () => {
    const markup = html(<EventCalendar events={EVENTS} now={NOW} />)
    expect(markup).toContain('aria-label="Standup, 9:00 AM – 9:30 AM, Wednesday, October 14, 2026, Team"')
    expect(markup).toContain('aria-label="Design review, 9:00 AM – 10:00 AM, Wednesday, October 14, 2026"')
    expect(markup).toContain('aria-label="Offsite, All day, Oct 13 – 14"')
    expect(markup).toContain('data-color="info"')
    expect(markup).toContain('bg-success text-success-foreground')
    // Visible text repeats time + category so colour is not the only signal.
    expect(markup).toContain('9:00 AM – 9:30 AM · Team')
  })

  it('lays overlapping events out in side-by-side lanes', () => {
    const markup = html(<EventCalendar events={EVENTS} now={NOW} />)
    const review = /data-event-id="review"[^>]*style="([^"]+)"/.exec(markup)?.[1] ?? ''
    const standup = /data-event-id="standup"[^>]*style="([^"]+)"/.exec(markup)?.[1] ?? ''
    expect(review).toContain('left:calc(0% + 0.125rem)')
    expect(review).toContain('width:calc(50% - 2 * 0.125rem)')
    expect(standup).toContain('left:calc(50% + 0.125rem)')
  })

  it('draws the current-time line only when now is visible', () => {
    expect(html(<EventCalendar events={[]} now={NOW} />)).toContain('data-now-line=""')
    expect(html(<EventCalendar events={[]} now={NOW} defaultDate="2026-11-20" />)).not.toContain('data-now-line')
    expect(html(<EventCalendar events={[]} now={NOW} dayStartHour={12} />)).not.toContain('data-now-line')
  })

  it('renders the day view with a single day column', () => {
    const markup = html(<EventCalendar events={EVENTS} now={NOW} defaultView="day" dayStartHour={9} dayEndHour={10} />)
    expect(markup).toContain('data-view="day"')
    expect(count(markup, 'role="columnheader"')).toBe(2)
    expect(markup).toContain('Wednesday, October 14, 2026</h2>')
    expect(markup).toContain('aria-label="Previous day"')
  })

  it('renders the month grid with weeks, outside days and "+N more"', () => {
    const busy: EventCalendarEvent[] = Array.from({ length: 4 }, (_, i) => ({
      id: `m${i}`,
      title: `Meeting ${i}`,
      start: { date: '2026-10-20', minutes: (9 + i) * H },
      end: { date: '2026-10-20', minutes: (10 + i) * H },
    }))
    const markup = html(
      <EventCalendar events={[...EVENTS, ...busy]} now={NOW} defaultView="month" maxEventsPerCell={3} />,
    )
    expect(markup).toContain('data-month-grid=""')
    expect(markup).toContain('October 2026</h2>')
    expect(markup).toContain('aria-label="Previous month"')
    expect(count(markup, 'role="row"')).toBe(1 + 5)
    expect(count(markup, 'role="gridcell"')).toBe(35)
    expect(markup).toContain('aria-label="Tuesday, October 20, 2026, 4 events"')
    expect(markup).toContain('aria-label="Show 2 more events on Tuesday, October 20, 2026"')
    expect(markup).toContain('>+2 more</button>')
    expect(markup).toMatch(/data-date="2026-09-27" data-outside=""/)
    expect(markup).toContain('aria-label="Wednesday, October 14, 2026, 3 events" aria-current="date"')
    // Month boundary days show the month name in text, not only a muted colour.
    expect(markup).toContain('>Oct 1</span>')
    expect(count(markup, 'data-cursor=""')).toBe(1)
  })

  it('honours weekStartsOn, locale and label overrides', () => {
    const markup = html(
      <EventCalendar
        events={[]}
        now={NOW}
        defaultView="month"
        weekStartsOn={1}
        locale="en-GB"
        labels={{ today: 'Now', calendar: 'Team calendar' }}
      />,
    )
    expect(markup).toContain('aria-label="Team calendar"')
    expect(markup).toContain('>Now</button>')
    expect(markup).toMatch(/role="columnheader"[^>]*>Mon</)
    expect(markup).toContain('data-date="2026-09-28"')
    expect(markup).toContain('Wednesday, 14 October 2026')
  })

  it('forwards className and arbitrary props, and lets aria-label override', () => {
    const markup = html(
      <EventCalendar events={[]} now={NOW} className="h-full" data-testid="cal" aria-label="Rota" />,
    )
    expect(markup).toContain('h-full')
    expect(markup).toContain('data-testid="cal"')
    expect(markup).toContain('aria-label="Rota"')
    expect(markup).not.toContain('aria-label="Calendar"')
  })

})
