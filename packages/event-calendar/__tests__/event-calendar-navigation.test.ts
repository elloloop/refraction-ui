import { describe, it, expect } from 'vitest'
import {
  EVENT_CALENDAR_DEFAULT_SLOT_MINUTES,
  eventCalendarFractionToSlot,
  eventCalendarMinutesToFraction,
  eventCalendarSnapToSlot,
  getEventCalendarDayRange,
  getEventCalendarEventFocusIndex,
  getEventCalendarKeyboardTarget,
  getEventCalendarMonthWeeks,
  getEventCalendarNowPosition,
  getEventCalendarSlotRange,
  getEventCalendarSlotStarts,
  getEventCalendarVisibleDays,
  isEventCalendarHour,
  resolveEventCalendarTimeGrid,
  stepEventCalendarDate,
  type EventCalendarKeyboardOptions,
} from '../src/index.js'

const H = 60

describe('visible ranges', () => {
  it('day view shows only the anchor', () => {
    expect(getEventCalendarVisibleDays('day', '2026-10-17', 0)).toEqual(['2026-10-17'])
  })

  it('week view honours the configured week start', () => {
    const sunday = getEventCalendarVisibleDays('week', '2026-10-14', 0)
    expect(sunday[0]).toBe('2026-10-11')
    expect(sunday.at(-1)).toBe('2026-10-17')
    const monday = getEventCalendarVisibleDays('week', '2026-10-14', 1)
    expect(monday[0]).toBe('2026-10-12')
    expect(monday.at(-1)).toBe('2026-10-18')
    expect(getEventCalendarVisibleDays('week', '2026-10-11', 1)[0]).toBe('2026-10-05')
  })

  it('month view covers whole weeks around the month, only as many as needed', () => {
    // October 2026 starts on Thursday and ends on Saturday.
    const sundayWeeks = getEventCalendarMonthWeeks('2026-10-17', 0)
    expect(sundayWeeks).toHaveLength(5)
    expect(sundayWeeks[0][0]).toBe('2026-09-27')
    expect(sundayWeeks.at(-1)?.at(-1)).toBe('2026-10-31')
    const mondayWeeks = getEventCalendarMonthWeeks('2026-10-17', 1)
    expect(mondayWeeks[0][0]).toBe('2026-09-28')
    expect(mondayWeeks.at(-1)?.at(-1)).toBe('2026-11-01')
    expect(getEventCalendarVisibleDays('month', '2026-10-17', 0)).toHaveLength(35)
  })

  it('spans four to six weeks', () => {
    // February 2026 starts on Sunday: exactly four Sunday-start weeks.
    expect(getEventCalendarMonthWeeks('2026-02-01', 0)).toHaveLength(4)
    // August 2026 starts on Saturday and has 31 days: six Sunday-start weeks.
    expect(getEventCalendarMonthWeeks('2026-08-15', 0)).toHaveLength(6)
    for (const week of getEventCalendarMonthWeeks('2026-08-15', 3)) expect(week).toHaveLength(7)
  })

  it('steps by one view period', () => {
    expect(stepEventCalendarDate('day', '2026-10-17', 1)).toBe('2026-10-18')
    expect(stepEventCalendarDate('week', '2026-10-17', -1)).toBe('2026-10-10')
    expect(stepEventCalendarDate('month', '2026-01-31', 1)).toBe('2026-02-28')
    expect(stepEventCalendarDate('month', '2026-01-15', -1)).toBe('2025-12-15')
  })
})

describe('resolveEventCalendarTimeGrid', () => {
  it('defaults to a full day of 30-minute slots', () => {
    expect(resolveEventCalendarTimeGrid()).toEqual({
      dayStartMinutes: 0,
      dayEndMinutes: 24 * H,
      slotMinutes: EVENT_CALENDAR_DEFAULT_SLOT_MINUTES,
    })
  })

  it('clamps hours and slot length into a valid window', () => {
    expect(resolveEventCalendarTimeGrid({ dayStartHour: -3, dayEndHour: 30 })).toMatchObject({
      dayStartMinutes: 0,
      dayEndMinutes: 24 * H,
    })
    expect(resolveEventCalendarTimeGrid({ dayStartHour: 10, dayEndHour: 9 })).toMatchObject({
      dayStartMinutes: 10 * H,
      dayEndMinutes: 11 * H,
    })
    expect(resolveEventCalendarTimeGrid({ dayStartHour: 9, dayEndHour: 10, slotMinutes: 600 }).slotMinutes).toBe(H)
    expect(resolveEventCalendarTimeGrid({ slotMinutes: 0 }).slotMinutes).toBe(1)
  })
})

describe('slots', () => {
  const grid = resolveEventCalendarTimeGrid({ dayStartHour: 8, dayEndHour: 10, slotMinutes: 30 })

  it('lists slot starts', () => {
    expect(getEventCalendarSlotStarts(grid)).toEqual([480, 510, 540, 570])
    expect(getEventCalendarSlotStarts({ dayStartMinutes: 0, dayEndMinutes: 50, slotMinutes: 20 })).toEqual([0, 20, 40])
  })

  it('converts minutes to a clamped fraction', () => {
    expect(eventCalendarMinutesToFraction(9 * H, grid)).toBe(0.5)
    expect(eventCalendarMinutesToFraction(0, grid)).toBe(0)
    expect(eventCalendarMinutesToFraction(23 * H, grid)).toBe(1)
  })

  it('snaps a pointer fraction to the slot under it', () => {
    expect(eventCalendarFractionToSlot(0, grid)).toBe(480)
    expect(eventCalendarFractionToSlot(0.24, grid)).toBe(480)
    expect(eventCalendarFractionToSlot(0.25, grid)).toBe(510)
    expect(eventCalendarFractionToSlot(0.99, grid)).toBe(570)
    // The very bottom edge, and anything past it, is still the last slot.
    expect(eventCalendarFractionToSlot(1, grid)).toBe(570)
    expect(eventCalendarFractionToSlot(1.5, grid)).toBe(570)
    expect(eventCalendarFractionToSlot(-1, grid)).toBe(480)
  })

  it('snaps any minute to its slot start', () => {
    expect(eventCalendarSnapToSlot(9 * H + 17, grid)).toBe(540)
    expect(eventCalendarSnapToSlot(0, grid)).toBe(480)
    expect(eventCalendarSnapToSlot(20 * H, grid)).toBe(570)
  })

  it('builds a create range from a click (one slot) or a drag in either direction', () => {
    expect(getEventCalendarSlotRange('2026-10-12', 540, 540, grid)).toEqual({
      start: { date: '2026-10-12', minutes: 540 },
      end: { date: '2026-10-12', minutes: 570 },
      allDay: false,
    })
    const down = getEventCalendarSlotRange('2026-10-12', 480, 540, grid)
    const up = getEventCalendarSlotRange('2026-10-12', 540, 480, grid)
    expect(down).toEqual(up)
    expect(down.start.minutes).toBe(480)
    expect(down.end.minutes).toBe(570)
  })

  it('rolls an end at midnight over to the next day', () => {
    const full = resolveEventCalendarTimeGrid()
    expect(getEventCalendarSlotRange('2026-10-12', 23 * H + 30, 23 * H + 30, full).end).toEqual({
      date: '2026-10-13',
      minutes: 0,
    })
  })

  it('never extends a trailing partial slot past the window', () => {
    const odd = { dayStartMinutes: 0, dayEndMinutes: 50, slotMinutes: 20 }
    expect(getEventCalendarSlotRange('2026-10-12', 40, 40, odd).end.minutes).toBe(50)
  })

  it('builds an all-day create range across days in either direction', () => {
    const forward = getEventCalendarDayRange('2026-10-12', '2026-10-14')
    expect(forward).toEqual({
      start: { date: '2026-10-12', minutes: 0 },
      end: { date: '2026-10-15', minutes: 0 },
      allDay: true,
    })
    expect(getEventCalendarDayRange('2026-10-14', '2026-10-12')).toEqual(forward)
    expect(getEventCalendarDayRange('2026-10-12', '2026-10-12').end.date).toBe('2026-10-13')
  })

  it('marks whole hours', () => {
    expect(isEventCalendarHour(540)).toBe(true)
    expect(isEventCalendarHour(570)).toBe(false)
  })
})

describe('getEventCalendarNowPosition', () => {
  const days = ['2026-10-11', '2026-10-12', '2026-10-13']
  const grid = resolveEventCalendarTimeGrid({ dayStartHour: 8, dayEndHour: 18 })

  it('places the line on the right day and height', () => {
    expect(getEventCalendarNowPosition({ date: '2026-10-12', minutes: 13 * H }, days, grid)).toEqual({
      dayIndex: 1,
      minutes: 13 * H,
      fraction: 0.5,
    })
  })

  it('is null outside the visible days or hours', () => {
    expect(getEventCalendarNowPosition({ date: '2026-10-20', minutes: 13 * H }, days, grid)).toBeNull()
    expect(getEventCalendarNowPosition({ date: '2026-10-12', minutes: 7 * H }, days, grid)).toBeNull()
    expect(getEventCalendarNowPosition({ date: '2026-10-12', minutes: 18 * H }, days, grid)).toBeNull()
  })

  it('normalises minute overflow before placing', () => {
    const full = resolveEventCalendarTimeGrid()
    expect(getEventCalendarNowPosition({ date: '2026-10-11', minutes: 24 * H + 6 * H }, days, full)).toEqual({
      dayIndex: 1,
      minutes: 6 * H,
      fraction: 0.25,
    })
  })
})

describe('getEventCalendarKeyboardTarget', () => {
  const grid = resolveEventCalendarTimeGrid({ dayStartHour: 8, dayEndHour: 10, slotMinutes: 30 })
  const month: EventCalendarKeyboardOptions = { view: 'month', weekStartsOn: 1, grid }
  const week: EventCalendarKeyboardOptions = { view: 'week', weekStartsOn: 1, grid }
  const day: EventCalendarKeyboardOptions = { view: 'day', weekStartsOn: 1, grid }
  const cursor = { date: '2026-10-14', minutes: 510 } // Wednesday

  it('moves by day with left / right in every view', () => {
    for (const options of [month, week, day]) {
      expect(getEventCalendarKeyboardTarget(cursor, 'ArrowLeft', options)?.date).toBe('2026-10-13')
      expect(getEventCalendarKeyboardTarget(cursor, 'ArrowRight', options)?.date).toBe('2026-10-15')
    }
  })

  it('month: up / down move a week, Home / End go to the week edges, PageUp / PageDown a month', () => {
    expect(getEventCalendarKeyboardTarget(cursor, 'ArrowUp', month)?.date).toBe('2026-10-07')
    expect(getEventCalendarKeyboardTarget(cursor, 'ArrowDown', month)?.date).toBe('2026-10-21')
    expect(getEventCalendarKeyboardTarget(cursor, 'Home', month)?.date).toBe('2026-10-12')
    expect(getEventCalendarKeyboardTarget(cursor, 'End', month)?.date).toBe('2026-10-18')
    expect(getEventCalendarKeyboardTarget(cursor, 'PageUp', month)?.date).toBe('2026-09-14')
    expect(getEventCalendarKeyboardTarget(cursor, 'PageDown', month)?.date).toBe('2026-11-14')
  })

  it('week: up / down move a slot (clamped), Home / End the week, PageUp / PageDown a week', () => {
    expect(getEventCalendarKeyboardTarget(cursor, 'ArrowUp', week)).toEqual({ date: '2026-10-14', minutes: 480 })
    expect(getEventCalendarKeyboardTarget({ ...cursor, minutes: 480 }, 'ArrowUp', week)?.minutes).toBe(480)
    expect(getEventCalendarKeyboardTarget({ ...cursor, minutes: 570 }, 'ArrowDown', week)?.minutes).toBe(570)
    expect(getEventCalendarKeyboardTarget(cursor, 'ArrowDown', week)?.minutes).toBe(540)
    expect(getEventCalendarKeyboardTarget(cursor, 'Home', week)).toEqual({ date: '2026-10-12', minutes: 510 })
    expect(getEventCalendarKeyboardTarget(cursor, 'End', week)).toEqual({ date: '2026-10-18', minutes: 510 })
    expect(getEventCalendarKeyboardTarget(cursor, 'PageUp', week)?.date).toBe('2026-10-07')
    expect(getEventCalendarKeyboardTarget(cursor, 'PageDown', week)?.date).toBe('2026-10-21')
  })

  it('day: Home / End jump to the first / last slot, PageUp / PageDown a day', () => {
    expect(getEventCalendarKeyboardTarget(cursor, 'Home', day)).toEqual({ date: '2026-10-14', minutes: 480 })
    expect(getEventCalendarKeyboardTarget(cursor, 'End', day)).toEqual({ date: '2026-10-14', minutes: 570 })
    expect(getEventCalendarKeyboardTarget(cursor, 'PageDown', day)?.date).toBe('2026-10-15')
  })

  it('snaps an off-grid cursor before moving a slot', () => {
    expect(getEventCalendarKeyboardTarget({ date: '2026-10-14', minutes: 0 }, 'ArrowDown', week)?.minutes).toBe(510)
  })

  it('returns null for keys it does not handle', () => {
    expect(getEventCalendarKeyboardTarget(cursor, 'Enter', week)).toBeNull()
    expect(getEventCalendarKeyboardTarget(cursor, 'a', month)).toBeNull()
  })
})

describe('getEventCalendarEventFocusIndex', () => {
  it('moves between events and clamps at the ends', () => {
    expect(getEventCalendarEventFocusIndex(1, 'ArrowDown', 3)).toBe(2)
    expect(getEventCalendarEventFocusIndex(1, 'ArrowRight', 3)).toBe(2)
    expect(getEventCalendarEventFocusIndex(2, 'ArrowDown', 3)).toBe(2)
    expect(getEventCalendarEventFocusIndex(1, 'ArrowUp', 3)).toBe(0)
    expect(getEventCalendarEventFocusIndex(0, 'ArrowLeft', 3)).toBe(0)
    expect(getEventCalendarEventFocusIndex(1, 'Home', 3)).toBe(0)
    expect(getEventCalendarEventFocusIndex(0, 'End', 3)).toBe(2)
  })

  it('returns null for other keys or no events', () => {
    expect(getEventCalendarEventFocusIndex(0, 'Enter', 3)).toBeNull()
    expect(getEventCalendarEventFocusIndex(0, 'ArrowDown', 0)).toBeNull()
  })
})
