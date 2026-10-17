import { describe, it, expect } from 'vitest'
import {
  addEventCalendarDays,
  addEventCalendarMonths,
  compareEventCalendarDateTime,
  diffEventCalendarDays,
  endOfEventCalendarMonth,
  formatEventCalendarDate,
  formatEventCalendarDateRange,
  formatEventCalendarDateTime,
  formatEventCalendarTime,
  fromEventCalendarAbsoluteMinutes,
  fromEventCalendarDayNumber,
  getEventCalendarWeekday,
  normalizeEventCalendarDateTime,
  parseEventCalendarDateTime,
  splitEventCalendarDate,
  startOfEventCalendarMonth,
  startOfEventCalendarWeek,
  toEventCalendarAbsoluteMinutes,
  toEventCalendarDayNumber,
} from '../src/index.js'

describe('day numbers', () => {
  it('counts days from the Unix epoch and round-trips', () => {
    expect(toEventCalendarDayNumber('1970-01-01')).toBe(0)
    expect(toEventCalendarDayNumber('1970-01-02')).toBe(1)
    expect(toEventCalendarDayNumber('1969-12-31')).toBe(-1)
    for (const date of ['2024-02-29', '2026-10-17', '1999-12-31', '2100-03-01']) {
      expect(fromEventCalendarDayNumber(toEventCalendarDayNumber(date))).toBe(date)
    }
  })

  it('rejects malformed and impossible dates', () => {
    expect(() => toEventCalendarDayNumber('2026-2-3')).toThrow(RangeError)
    expect(() => toEventCalendarDayNumber('2026-02-30')).toThrow(RangeError)
    expect(() => toEventCalendarDayNumber('2025-02-29')).toThrow(RangeError)
    expect(() => toEventCalendarDayNumber('2026-13-01')).toThrow(RangeError)
    expect(() => toEventCalendarDayNumber('')).toThrow(RangeError)
  })

  it('is independent of the host time zone (no DST holes)', () => {
    // US DST starts 2026-03-08 and ends 2026-11-01; local-time Date maths would skew here.
    expect(addEventCalendarDays('2026-03-07', 1)).toBe('2026-03-08')
    expect(addEventCalendarDays('2026-03-08', 1)).toBe('2026-03-09')
    expect(addEventCalendarDays('2026-11-01', 1)).toBe('2026-11-02')
    expect(diffEventCalendarDays('2026-03-01', '2026-04-01')).toBe(31)
  })
})

describe('calendar arithmetic', () => {
  it('adds days across month and year boundaries', () => {
    expect(addEventCalendarDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addEventCalendarDays('2026-03-01', -1)).toBe('2026-02-28')
    expect(addEventCalendarDays('2024-03-01', -1)).toBe('2024-02-29')
  })

  it('adds months, clamping the day to the target month', () => {
    expect(addEventCalendarMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(addEventCalendarMonths('2024-01-31', 1)).toBe('2024-02-29')
    expect(addEventCalendarMonths('2026-03-31', -1)).toBe('2026-02-28')
    expect(addEventCalendarMonths('2026-12-15', 1)).toBe('2027-01-15')
    expect(addEventCalendarMonths('2026-01-15', -1)).toBe('2025-12-15')
    expect(addEventCalendarMonths('2026-05-10', -17)).toBe('2024-12-10')
  })

  it('splits and finds month bounds', () => {
    expect(splitEventCalendarDate('2026-10-17')).toEqual({ year: 2026, month: 10, day: 17 })
    expect(startOfEventCalendarMonth('2026-10-17')).toBe('2026-10-01')
    expect(endOfEventCalendarMonth('2026-02-10')).toBe('2026-02-28')
    expect(endOfEventCalendarMonth('2024-02-10')).toBe('2024-02-29')
    expect(endOfEventCalendarMonth('2026-12-01')).toBe('2026-12-31')
  })

  it('computes weekdays (0 = Sunday)', () => {
    expect(getEventCalendarWeekday('1970-01-01')).toBe(4)
    expect(getEventCalendarWeekday('2026-10-17')).toBe(6)
    expect(getEventCalendarWeekday('2026-10-18')).toBe(0)
    expect(getEventCalendarWeekday('1969-12-28')).toBe(0)
  })

  it('finds the start of the week for any week start', () => {
    // 2026-10-17 is a Saturday.
    expect(startOfEventCalendarWeek('2026-10-17', 0)).toBe('2026-10-11')
    expect(startOfEventCalendarWeek('2026-10-17', 1)).toBe('2026-10-12')
    expect(startOfEventCalendarWeek('2026-10-17', 6)).toBe('2026-10-17')
    expect(startOfEventCalendarWeek('2026-10-18', 1)).toBe('2026-10-12')
    expect(startOfEventCalendarWeek('2026-10-18', 0)).toBe('2026-10-18')
  })
})

describe('date-times', () => {
  it('orders moments by absolute minutes', () => {
    const a = { date: '2026-10-17', minutes: 1439 }
    const b = { date: '2026-10-18', minutes: 0 }
    expect(compareEventCalendarDateTime(a, b)).toBeLessThan(0)
    expect(compareEventCalendarDateTime(b, a)).toBeGreaterThan(0)
    expect(compareEventCalendarDateTime(a, a)).toBe(0)
    expect(fromEventCalendarAbsoluteMinutes(toEventCalendarAbsoluteMinutes(a))).toEqual(a)
  })

  it('normalises minute overflow and underflow into the date', () => {
    expect(normalizeEventCalendarDateTime({ date: '2026-10-17', minutes: 1440 })).toEqual({
      date: '2026-10-18',
      minutes: 0,
    })
    expect(normalizeEventCalendarDateTime({ date: '2026-10-17', minutes: -30 })).toEqual({
      date: '2026-10-16',
      minutes: 1410,
    })
  })

  it('parses and formats local ISO date-times', () => {
    expect(parseEventCalendarDateTime('2026-10-17T09:30')).toEqual({ date: '2026-10-17', minutes: 570 })
    expect(parseEventCalendarDateTime('2026-10-17T24:00')).toEqual({ date: '2026-10-18', minutes: 0 })
    expect(formatEventCalendarDateTime({ date: '2026-10-17', minutes: 570 })).toBe('2026-10-17T09:30')
    expect(formatEventCalendarDateTime({ date: '2026-10-17', minutes: 1440 })).toBe('2026-10-18T00:00')
  })

  it('rejects malformed date-times, including offsets (convert to the display zone first)', () => {
    expect(() => parseEventCalendarDateTime('2026-10-17T09:30Z')).toThrow(RangeError)
    expect(() => parseEventCalendarDateTime('2026-10-17T09:30+02:00')).toThrow(RangeError)
    expect(() => parseEventCalendarDateTime('2026-10-17T25:00')).toThrow(RangeError)
    expect(() => parseEventCalendarDateTime('2026-10-17T09:60')).toThrow(RangeError)
    expect(() => parseEventCalendarDateTime('2026-02-30T09:00')).toThrow(RangeError)
  })
})

describe('formatting', () => {
  it('formats times with plain spaces whatever the ICU version', () => {
    expect(formatEventCalendarTime(570, 'en-US')).toBe('9:30 AM')
    expect(formatEventCalendarTime(0, 'en-US')).toBe('12:00 AM')
    expect(formatEventCalendarTime(13 * 60 + 5, 'en-US')).toBe('1:05 PM')
    expect(formatEventCalendarTime(13 * 60, 'en-GB')).toBe('13:00')
    expect(formatEventCalendarTime(570, 'en-US')).not.toMatch(/[   ]/)
  })

  it('formats dates in UTC so the calendar date never shifts', () => {
    expect(formatEventCalendarDate('2026-10-17', 'en-US', { weekday: 'long', day: 'numeric' })).toBe(
      '17 Saturday',
    )
    expect(formatEventCalendarDate('2026-01-01', 'en-US', { month: 'long', year: 'numeric' })).toBe(
      'January 2026',
    )
  })

  it('formats date ranges', () => {
    expect(
      formatEventCalendarDateRange('2026-10-11', '2026-10-17', 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    ).toBe('Oct 11 – 17, 2026')
  })
})
