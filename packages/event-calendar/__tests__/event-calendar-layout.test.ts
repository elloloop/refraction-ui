import { describe, it, expect } from 'vitest'
import {
  getEventCalendarEventDays,
  getEventCalendarOverflow,
  isEventCalendarAllDayRowEvent,
  layoutEventCalendarDay,
  layoutEventCalendarLanes,
  sortEventCalendarEvents,
  splitEventCalendarEvents,
  splitEventCalendarMonthEvents,
  stackEventCalendarSpans,
  type EventCalendarEvent,
} from '../src/index.js'

const H = 60
const FULL_DAY = { dayStartMinutes: 0, dayEndMinutes: 24 * H }

function timed(id: string, date: string, from: number, to: number, endDate = date): EventCalendarEvent {
  return { id, title: id, start: { date, minutes: from }, end: { date: endDate, minutes: to } }
}

function allDay(id: string, first: string, endExclusive: string): EventCalendarEvent {
  return {
    id,
    title: id,
    allDay: true,
    start: { date: first, minutes: 0 },
    end: { date: endExclusive, minutes: 0 },
  }
}

const WEEK = ['2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17']

describe('getEventCalendarEventDays', () => {
  it('treats end as exclusive, so ending at midnight stays on the start day', () => {
    const days = getEventCalendarEventDays(timed('a', '2026-10-12', 22 * H, 0, '2026-10-13'))
    expect(days.lastDay).toBe(days.firstDay)
  })

  it('treats an end before start as a zero-length event at start', () => {
    const days = getEventCalendarEventDays(timed('a', '2026-10-12', 10 * H, 9 * H))
    expect(days.endAbsolute).toBe(days.startAbsolute)
    expect(days.lastDay).toBe(days.firstDay)
  })
})

describe('isEventCalendarAllDayRowEvent', () => {
  it('is true for allDay and for timed events of 24 h or more', () => {
    expect(isEventCalendarAllDayRowEvent(allDay('a', '2026-10-12', '2026-10-13'))).toBe(true)
    expect(isEventCalendarAllDayRowEvent(timed('b', '2026-10-12', 9 * H, 9 * H, '2026-10-13'))).toBe(true)
    expect(isEventCalendarAllDayRowEvent(timed('c', '2026-10-12', 22 * H, 2 * H, '2026-10-13'))).toBe(false)
  })
})

describe('sortEventCalendarEvents', () => {
  it('orders by start, all-day first on a day, longer first, then id', () => {
    const events = [
      timed('late', '2026-10-12', 15 * H, 16 * H),
      timed('b-short', '2026-10-12', 9 * H, 10 * H),
      timed('long', '2026-10-12', 9 * H, 12 * H),
      timed('a-short', '2026-10-12', 9 * H, 10 * H),
      allDay('holiday', '2026-10-12', '2026-10-13'),
      timed('yesterday', '2026-10-11', 23 * H, 23 * H + 30),
    ]
    expect(sortEventCalendarEvents(events).map((e) => e.id)).toEqual([
      'yesterday',
      'holiday',
      'long',
      'a-short',
      'b-short',
      'late',
    ])
  })

  it('does not mutate its input', () => {
    const events = [timed('b', '2026-10-12', 10 * H, 11 * H), timed('a', '2026-10-12', 9 * H, 10 * H)]
    sortEventCalendarEvents(events)
    expect(events.map((e) => e.id)).toEqual(['b', 'a'])
  })
})

describe('splitEventCalendarEvents', () => {
  it('cuts a timed event that crosses midnight into one segment per day', () => {
    const { timed: perDay, allDay: bars } = splitEventCalendarEvents(
      [timed('late', '2026-10-12', 22 * H, 2 * H, '2026-10-13')],
      WEEK,
      FULL_DAY,
    )
    expect(bars).toEqual([])
    expect(perDay[1]).toHaveLength(1)
    expect(perDay[1][0]).toMatchObject({
      startMinutes: 22 * H,
      endMinutes: 24 * H,
      continuesBefore: false,
      continuesAfter: true,
    })
    expect(perDay[2][0]).toMatchObject({
      startMinutes: 0,
      endMinutes: 2 * H,
      continuesBefore: true,
      continuesAfter: false,
    })
  })

  it('puts all-day and ≥24 h events in the all-day row, clipped to the range', () => {
    const { allDay: bars, timed: perDay } = splitEventCalendarEvents(
      [
        allDay('trip', '2026-10-09', '2026-10-13'), // Oct 9–12
        allDay('single', '2026-10-15', '2026-10-16'),
        timed('conf', '2026-10-16', 9 * H, 9 * H, '2026-10-19'),
      ],
      WEEK,
      FULL_DAY,
    )
    expect(perDay.flat()).toEqual([])
    expect(bars.map((b) => [b.event.id, b.startIndex, b.endIndex, b.continuesBefore, b.continuesAfter])).toEqual([
      ['trip', 0, 1, true, false],
      ['single', 4, 4, false, false],
      ['conf', 5, 6, false, true],
    ])
  })

  it('drops events outside the visible days', () => {
    const split = splitEventCalendarEvents(
      [timed('before', '2026-10-10', 9 * H, 10 * H), allDay('after', '2026-10-18', '2026-10-19')],
      WEEK,
      FULL_DAY,
    )
    expect(split.allDay).toEqual([])
    expect(split.timed.flat()).toEqual([])
  })

  it('clips to the visible hours and flags the clipped side', () => {
    const bounds = { dayStartMinutes: 8 * H, dayEndMinutes: 18 * H }
    const { timed: perDay } = splitEventCalendarEvents(
      [
        timed('early', '2026-10-12', 7 * H, 9 * H),
        timed('late', '2026-10-12', 17 * H, 19 * H),
        timed('night', '2026-10-12', 20 * H, 21 * H),
        timed('dawn', '2026-10-12', 6 * H, 7 * H),
      ],
      WEEK,
      bounds,
    )
    expect(perDay[1].map((s) => [s.event.id, s.startMinutes, s.endMinutes, s.continuesBefore, s.continuesAfter])).toEqual([
      ['early', 8 * H, 9 * H, true, false],
      ['late', 17 * H, 18 * H, false, true],
    ])
  })

  it('gives very short events the minimum height', () => {
    const { timed: perDay } = splitEventCalendarEvents(
      [timed('ping', '2026-10-12', 9 * H, 9 * H + 5), timed('zero', '2026-10-12', 10 * H, 10 * H)],
      WEEK,
      { ...FULL_DAY, minEventMinutes: 20 },
    )
    expect(perDay[1].map((s) => s.endMinutes - s.startMinutes)).toEqual([20, 20])
    expect(perDay[1][0].continuesAfter).toBe(false)
  })

  it('handles an empty range', () => {
    expect(splitEventCalendarEvents([timed('a', '2026-10-12', 0, H)], [], FULL_DAY)).toEqual({
      allDay: [],
      timed: [],
    })
  })
})

describe('layoutEventCalendarLanes', () => {
  it('gives non-overlapping events the full width', () => {
    const lanes = layoutEventCalendarLanes([
      { start: 0, end: 60 },
      { start: 60, end: 120 },
    ])
    expect(lanes.map((l) => [l.column, l.columns, l.width])).toEqual([
      [0, 1, 1],
      [0, 1, 1],
    ])
  })

  it('splits two overlapping events into halves', () => {
    const lanes = layoutEventCalendarLanes([
      { start: 0, end: 60 },
      { start: 30, end: 90 },
    ])
    expect(lanes).toEqual([
      { column: 0, columns: 2, span: 1, left: 0, width: 0.5 },
      { column: 1, columns: 2, span: 1, left: 0.5, width: 0.5 },
    ])
  })

  it('reuses a column freed by an earlier event in the same cluster', () => {
    // A [0,120) overlaps B [0,60) and C [60,120); B and C share column 1.
    const lanes = layoutEventCalendarLanes([
      { start: 0, end: 120 },
      { start: 0, end: 60 },
      { start: 60, end: 120 },
    ])
    expect(lanes.map((l) => [l.column, l.columns])).toEqual([
      [0, 2],
      [1, 2],
      [1, 2],
    ])
  })

  it('expands an event into free columns to its right', () => {
    // A [0,60) B [0,30) C [0,30) → 3 columns. D [30,60) lands in column 1 and
    // can expand into column 2 (C has ended), so it spans 2/3.
    const lanes = layoutEventCalendarLanes([
      { start: 0, end: 60 },
      { start: 0, end: 30 },
      { start: 0, end: 30 },
      { start: 30, end: 60 },
    ])
    expect(lanes[3]).toEqual({ column: 1, columns: 3, span: 2, left: 1 / 3, width: 2 / 3 })
    expect(lanes[1].span).toBe(1)
  })

  it('stops expanding at the first blocked column', () => {
    // Columns: 0 = A [0,90), 1 = B [0,40) then D [40,60), 2 = C [10,90).
    const lanes = layoutEventCalendarLanes([
      { start: 0, end: 90 },
      { start: 0, end: 40 },
      { start: 10, end: 90 },
      { start: 40, end: 60 },
    ])
    expect(lanes.map((l) => l.column)).toEqual([0, 1, 2, 1])
    expect(lanes[3]).toMatchObject({ column: 1, columns: 3, span: 1 })
  })

  it('lays out separate clusters independently', () => {
    const lanes = layoutEventCalendarLanes([
      { start: 0, end: 60 },
      { start: 30, end: 60 },
      { start: 120, end: 180 },
    ])
    expect(lanes[2]).toMatchObject({ column: 0, columns: 1, width: 1 })
    expect(lanes[0].columns).toBe(2)
  })

  it('keeps transitively overlapping events in one cluster', () => {
    // A overlaps B, B overlaps C, A and C do not touch — still one 2-column cluster.
    const lanes = layoutEventCalendarLanes([
      { start: 0, end: 60 },
      { start: 30, end: 120 },
      { start: 90, end: 150 },
    ])
    expect(lanes.map((l) => [l.column, l.columns])).toEqual([
      [0, 2],
      [1, 2],
      [0, 2],
    ])
  })

  it('puts the longer of two same-start events first and is order independent', () => {
    const forward = layoutEventCalendarLanes([
      { start: 0, end: 30 },
      { start: 0, end: 120 },
    ])
    expect(forward[1].column).toBe(0)
    expect(forward[0].column).toBe(1)
  })

  it('returns an empty list for no input', () => {
    expect(layoutEventCalendarLanes([])).toEqual([])
  })
})

describe('layoutEventCalendarDay', () => {
  it('positions segments as fractions of the visible window', () => {
    const bounds = { dayStartMinutes: 8 * H, dayEndMinutes: 18 * H }
    const { timed: perDay } = splitEventCalendarEvents(
      [timed('a', '2026-10-12', 9 * H, 11 * H), timed('b', '2026-10-12', 10 * H, 12 * H)],
      WEEK,
      bounds,
    )
    const laid = layoutEventCalendarDay(perDay[1], bounds)
    expect(laid[0]).toMatchObject({ top: 0.1, height: 0.2, lane: { left: 0, width: 0.5 } })
    expect(laid[1]).toMatchObject({ top: 0.2, height: 0.2, lane: { left: 0.5, width: 0.5 } })
  })
})

describe('stackEventCalendarSpans', () => {
  const span = (id: string, startIndex: number, endIndex: number) => ({
    event: allDay(id, '2026-10-12', '2026-10-13'),
    startIndex,
    endIndex,
    continuesBefore: false,
    continuesAfter: false,
  })

  it('stacks overlapping bars into rows and reuses free rows', () => {
    const stack = stackEventCalendarSpans([span('a', 0, 2), span('b', 1, 3), span('c', 3, 4), span('d', 5, 6)])
    const rows = Object.fromEntries(stack.segments.map((s) => [s.event.id, s.row]))
    expect(rows).toEqual({ a: 0, b: 1, c: 0, d: 0 })
    expect(stack.rowCount).toBe(2)
  })

  it('places the longer bar first when starts tie', () => {
    const stack = stackEventCalendarSpans([span('short', 0, 0), span('long', 0, 3)])
    expect(stack.segments.map((s) => [s.event.id, s.row])).toEqual([
      ['long', 0],
      ['short', 1],
    ])
  })

  it('needs no rows for no bars', () => {
    expect(stackEventCalendarSpans([])).toEqual({ segments: [], rowCount: 0 })
  })
})

describe('splitEventCalendarMonthEvents', () => {
  it('lists an event on every day it touches, with continuation flags', () => {
    const cells = splitEventCalendarMonthEvents(
      [allDay('trip', '2026-10-12', '2026-10-15'), timed('late', '2026-10-15', 23 * H, H, '2026-10-16')],
      WEEK,
    )
    expect(cells.map((c) => c.map((i) => i.event.id))).toEqual([[], ['trip'], ['trip'], ['trip'], ['late'], ['late'], []])
    expect(cells[1][0]).toMatchObject({ allDay: true, continuesBefore: false, continuesAfter: true })
    expect(cells[3][0]).toMatchObject({ continuesBefore: true, continuesAfter: false })
    expect(cells[4][0]).toMatchObject({ allDay: false, continuesAfter: true })
  })

  it('orders all-day items before timed ones', () => {
    const cells = splitEventCalendarMonthEvents(
      [timed('standup', '2026-10-12', 9 * H, 9 * H + 15), allDay('holiday', '2026-10-12', '2026-10-13')],
      WEEK,
    )
    expect(cells[1].map((i) => i.event.id)).toEqual(['holiday', 'standup'])
  })
})

describe('getEventCalendarOverflow', () => {
  it('shows everything when it fits', () => {
    expect(getEventCalendarOverflow(0, 3)).toEqual({ visibleCount: 0, hiddenCount: 0 })
    expect(getEventCalendarOverflow(3, 3)).toEqual({ visibleCount: 3, hiddenCount: 0 })
  })

  it('reserves one row for "+N more" when it does not fit', () => {
    expect(getEventCalendarOverflow(4, 3)).toEqual({ visibleCount: 2, hiddenCount: 2 })
    expect(getEventCalendarOverflow(10, 3)).toEqual({ visibleCount: 2, hiddenCount: 8 })
  })

  it('clamps nonsense limits to one row', () => {
    expect(getEventCalendarOverflow(2, 0)).toEqual({ visibleCount: 0, hiddenCount: 2 })
    expect(getEventCalendarOverflow(1, -5)).toEqual({ visibleCount: 1, hiddenCount: 0 })
    expect(getEventCalendarOverflow(-1, 3)).toEqual({ visibleCount: 0, hiddenCount: 0 })
  })
})
