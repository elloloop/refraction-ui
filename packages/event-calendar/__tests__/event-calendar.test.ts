import { describe, it, expect } from 'vitest'
import {
  createEventCalendar,
  eventCalendarEventVariants,
  eventCalendarMonthCellVariants,
  formatEventCalendarEventTime,
  formatEventCalendarTitle,
  getEventCalendarEventLabel,
  resolveEventCalendarLabels,
  type EventCalendarEvent,
} from '../src/index.js'

const H = 60
const NOW = { date: '2026-10-14', minutes: 10 * H + 30 }

const standup: EventCalendarEvent = {
  id: 'standup',
  title: 'Standup',
  start: { date: '2026-10-14', minutes: 9 * H },
  end: { date: '2026-10-14', minutes: 9 * H + 15 },
  category: 'Team',
}
const review: EventCalendarEvent = {
  id: 'review',
  title: 'Design review',
  start: { date: '2026-10-14', minutes: 9 * H },
  end: { date: '2026-10-14', minutes: 10 * H },
  color: 'info',
}
const offsite: EventCalendarEvent = {
  id: 'offsite',
  title: 'Offsite',
  allDay: true,
  start: { date: '2026-10-13', minutes: 0 },
  end: { date: '2026-10-16', minutes: 0 },
  color: 'success',
}

describe('labels', () => {
  it('merges overrides onto the defaults, including nested views', () => {
    const labels = resolveEventCalendarLabels({ today: 'Heute', views: { day: 'Tag' } as never })
    expect(labels.today).toBe('Heute')
    expect(labels.views).toEqual({ day: 'Tag', week: 'Week', month: 'Month' })
    expect(labels.previous('week')).toBe('Previous week')
    expect(labels.more(3)).toBe('+3 more')
    expect(labels.showMore(1, 'Monday')).toBe('Show 1 more event on Monday')
    expect(labels.eventCount(0)).toBe('No events')
    expect(labels.eventCount(2)).toBe('2 events')
  })
})

describe('text', () => {
  it('formats titles per view', () => {
    expect(formatEventCalendarTitle('month', '2026-10-14', [], 'en-US')).toBe('October 2026')
    expect(formatEventCalendarTitle('day', '2026-10-14', ['2026-10-14'], 'en-US')).toBe('Wednesday, October 14, 2026')
    expect(formatEventCalendarTitle('week', '2026-10-14', ['2026-10-11', '2026-10-17'], 'en-US')).toBe(
      'Oct 11 – 17, 2026',
    )
    expect(formatEventCalendarTitle('week', '2026-12-30', ['2026-12-27', '2027-01-02'], 'en-US')).toBe(
      'Dec 27, 2026 – Jan 2, 2027',
    )
  })

  it('formats event times for timed, all-day and overnight events', () => {
    expect(formatEventCalendarEventTime(review, 'en-US')).toBe('9:00 AM – 10:00 AM')
    expect(formatEventCalendarEventTime(offsite, 'en-US')).toBe('All day, Oct 13 – 15')
    expect(
      formatEventCalendarEventTime({ ...offsite, end: { date: '2026-10-14', minutes: 0 } }, 'en-US'),
    ).toBe('All day')
    expect(
      formatEventCalendarEventTime(
        { ...review, start: { date: '2026-10-14', minutes: 22 * H }, end: { date: '2026-10-15', minutes: 2 * H } },
        'en-US',
      ),
    ).toBe('Oct 14, 10:00 PM – Oct 15, 2:00 AM')
    expect(
      formatEventCalendarEventTime(
        { ...review, start: { date: '2026-10-14', minutes: 23 * H }, end: { date: '2026-10-15', minutes: 0 } },
        'en-US',
      ),
    ).toBe('11:00 PM – 12:00 AM')
  })

  it('builds accessible names with time, day and category (not colour alone)', () => {
    expect(getEventCalendarEventLabel(standup, 'en-US')).toBe(
      'Standup, 9:00 AM – 9:15 AM, Wednesday, October 14, 2026, Team',
    )
    expect(getEventCalendarEventLabel(offsite, 'en-US')).toBe('Offsite, All day, Oct 13 – 15')
  })
})

describe('createEventCalendar — week view', () => {
  const model = createEventCalendar({
    view: 'week',
    date: '2026-10-14',
    now: NOW,
    events: [standup, review, offsite],
    weekStartsOn: 1,
    dayStartHour: 8,
    dayEndHour: 18,
  })

  it('lists the visible days with display strings and today', () => {
    expect(model.days.map((d) => d.date)).toEqual([
      '2026-10-12',
      '2026-10-13',
      '2026-10-14',
      '2026-10-15',
      '2026-10-16',
      '2026-10-17',
      '2026-10-18',
    ])
    expect(model.days[2]).toMatchObject({
      label: 'Wednesday, October 14, 2026',
      weekday: 'Wed',
      dayOfMonth: '14',
      monthDay: 'Oct 14',
      isToday: true,
      isOutsideMonth: false,
    })
    expect(model.days.filter((d) => d.isToday)).toHaveLength(1)
    expect(model.title).toBe('Oct 12 – 18, 2026')
  })

  it('builds time-grid rows for the visible hours', () => {
    expect(model.slots).toHaveLength(20)
    expect(model.slots[0]).toEqual({ minutes: 8 * H, label: '8:00 AM', isHour: true })
    expect(model.slots[1].isHour).toBe(false)
  })

  it('lays out overlapping timed events side by side', () => {
    const wednesday = model.timed[2]
    expect(wednesday.map((s) => s.event.id)).toEqual(['review', 'standup'])
    expect(wednesday.map((s) => s.lane.width)).toEqual([0.5, 0.5])
    expect(model.timed[0]).toEqual([])
  })

  it('stacks all-day events and places the now line', () => {
    expect(model.allDay.rowCount).toBe(1)
    expect(model.allDay.segments[0]).toMatchObject({ startIndex: 1, endIndex: 3 })
    expect(model.now).toEqual({ dayIndex: 2, minutes: 10 * H + 30, fraction: 0.25 })
    expect(model.weeks).toEqual([])
  })

  it('exposes root ARIA and memoised event text', () => {
    expect(model.ariaProps).toEqual({ role: 'region', 'aria-label': 'Calendar' })
    expect(model.dataAttributes).toEqual({ 'data-view': 'week' })
    expect(model.describeEvent(review)).toBe(model.describeEvent(review))
    expect(model.describeEvent(review).time).toBe('9:00 AM – 10:00 AM')
  })

  it('is deterministic', () => {
    const again = createEventCalendar({
      view: 'week',
      date: '2026-10-14',
      now: NOW,
      events: [offsite, review, standup],
      weekStartsOn: 1,
      dayStartHour: 8,
      dayEndHour: 18,
    })
    const strip = (m: typeof model) => ({ ...m, describeEvent: undefined })
    expect(strip(again)).toEqual(strip(model))
  })
})

describe('createEventCalendar — day view', () => {
  it('shows one day and hides the now line on other days', () => {
    const model = createEventCalendar({ view: 'day', date: '2026-10-15', now: NOW, events: [standup] })
    expect(model.days).toHaveLength(1)
    expect(model.now).toBeNull()
    expect(model.timed).toEqual([[]])
    expect(model.slots).toHaveLength(48)
  })
})

describe('createEventCalendar — month view', () => {
  const many: EventCalendarEvent[] = Array.from({ length: 5 }, (_, i) => ({
    id: `m${i}`,
    title: `Meeting ${i}`,
    start: { date: '2026-10-14', minutes: (9 + i) * H },
    end: { date: '2026-10-14', minutes: (10 + i) * H },
  }))
  const model = createEventCalendar({
    view: 'month',
    date: '2026-10-14',
    now: NOW,
    events: [...many, offsite],
    maxEventsPerCell: 3,
  })

  it('groups cells into weeks and flags outside days', () => {
    expect(model.weeks).toHaveLength(5)
    expect(model.weeks.every((week) => week.length === 7)).toBe(true)
    expect(model.weeks[0][0].day).toMatchObject({ date: '2026-09-27', isOutsideMonth: true })
    expect(model.weeks[0][4].day).toMatchObject({ date: '2026-10-01', isOutsideMonth: false })
    expect(model.title).toBe('October 2026')
    expect(model.slots).toEqual([])
    expect(model.now).toBeNull()
  })

  it('folds overflowing events into "+N more"', () => {
    const cell = model.weeks.flat().find((c) => c.day.date === '2026-10-14')
    expect(cell?.items).toHaveLength(6)
    expect(cell?.visible.map((i) => i.event.id)).toEqual(['offsite', 'm0'])
    expect(cell?.hiddenCount).toBe(4)
    const quiet = model.weeks.flat().find((c) => c.day.date === '2026-10-13')
    expect(quiet?.visible.map((i) => i.event.id)).toEqual(['offsite'])
    expect(quiet?.hiddenCount).toBe(0)
  })
})

describe('styles', () => {
  it('maps colour token names to token fills with paired foregrounds', () => {
    expect(eventCalendarEventVariants({ color: 'success' })).toContain('bg-success text-success-foreground')
    expect(eventCalendarEventVariants({})).toContain('bg-primary text-primary-foreground')
    expect(eventCalendarEventVariants({ layout: 'chip' })).toContain('w-full')
  })

  it('uses string boolean variants and stops motion when reduced', () => {
    expect(eventCalendarMonthCellVariants({ outside: 'true' })).toContain('text-muted-foreground')
    expect(eventCalendarEventVariants({})).toContain('motion-reduce:transition-none')
    expect(eventCalendarEventVariants({})).toContain('focus-visible:ring-2')
  })
})
