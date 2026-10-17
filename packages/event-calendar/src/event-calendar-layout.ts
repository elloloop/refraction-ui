import {
  EVENT_CALENDAR_MINUTES_PER_DAY,
  toEventCalendarAbsoluteMinutes,
  toEventCalendarDayNumber,
  type EventCalendarDate,
  type EventCalendarDateTime,
} from './event-calendar-date.js'

/**
 * Event colour as a semantic token name. Each maps to a solid token fill with
 * its paired foreground, so contrast holds in every theme. Colour is never the
 * only signal — events always show their title and time, and `category` text.
 */
export type EventCalendarColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'info'
  | 'destructive'
  | 'muted'

/** A calendar event in display-zone wall-clock time. `end` is exclusive. */
export interface EventCalendarEvent {
  /** Stable unique id. */
  id: string
  /** Title shown on the event and used in its accessible name. */
  title: string
  /** Start (inclusive), already converted to the display zone. */
  start: EventCalendarDateTime
  /** End (exclusive), already converted to the display zone. */
  end: EventCalendarDateTime
  /** Render in the all-day row (and as a day chip in month view). */
  allDay?: boolean
  /** Token name for the event's colour. */
  color?: EventCalendarColor
  /** Text label for what the colour means (e.g. "Focus time"); shown and announced. */
  category?: string
}

/** Default minimum rendered height of a timed event, so very short events stay clickable and readable. */
export const EVENT_CALENDAR_DEFAULT_MIN_EVENT_MINUTES = 30

/** Visible time window of a day column, in minutes since midnight. */
export interface EventCalendarDayBounds {
  /** First visible minute (inclusive). */
  dayStartMinutes: number
  /** Last visible minute (exclusive). */
  dayEndMinutes: number
}

/** A day-column piece of a timed event. Minutes are relative to that day's midnight. */
export interface EventCalendarTimedSegment {
  event: EventCalendarEvent
  /** Index into the visible days. */
  dayIndex: number
  /** Visible start minute (clipped to the day bounds). */
  startMinutes: number
  /** Visible end minute (clipped; at least the minimum event height). */
  endMinutes: number
  /** The event started before this visible piece (previous day or above the window). */
  continuesBefore: boolean
  /** The event ends after this visible piece (next day or below the window). */
  continuesAfter: boolean
}

/** A horizontal bar in the all-day row, spanning visible day columns. */
export interface EventCalendarSpanSegment {
  event: EventCalendarEvent
  /** First visible day index covered (inclusive). */
  startIndex: number
  /** Last visible day index covered (inclusive). */
  endIndex: number
  /** The event started before the visible range. */
  continuesBefore: boolean
  /** The event ends after the visible range. */
  continuesAfter: boolean
}

/** Day bounds of an event: first and last calendar day it touches (day numbers). */
export interface EventCalendarEventDays {
  startAbsolute: number
  endAbsolute: number
  firstDay: number
  lastDay: number
}

/**
 * Absolute bounds plus the first and last days an event touches. `end` is
 * exclusive, so an event ending exactly at midnight does not touch the next
 * day. An `end` before `start` is treated as a zero-length event at `start`.
 */
export function getEventCalendarEventDays(event: EventCalendarEvent): EventCalendarEventDays {
  const startAbsolute = toEventCalendarAbsoluteMinutes(event.start)
  const endAbsolute = Math.max(startAbsolute, toEventCalendarAbsoluteMinutes(event.end))
  const firstDay = Math.floor(startAbsolute / EVENT_CALENDAR_MINUTES_PER_DAY)
  const lastDay = Math.max(
    firstDay,
    Math.floor((endAbsolute - 1) / EVENT_CALENDAR_MINUTES_PER_DAY),
  )
  return { startAbsolute, endAbsolute, firstDay, lastDay }
}

/**
 * Whether an event belongs in the all-day row rather than the time grid:
 * flagged `allDay`, or lasting a full day or more (a 3-day conference drawn as
 * three full-height columns would bury everything else).
 */
export function isEventCalendarAllDayRowEvent(event: EventCalendarEvent): boolean {
  if (event.allDay) return true
  const { startAbsolute, endAbsolute } = getEventCalendarEventDays(event)
  return endAbsolute - startAbsolute >= EVENT_CALENDAR_MINUTES_PER_DAY
}

/**
 * Chronological order used everywhere events are listed: start, then
 * all-day-row events first, then longer first, then id (a stable tiebreak so
 * server and client render identical order).
 */
export function compareEventCalendarEvents(a: EventCalendarEvent, b: EventCalendarEvent): number {
  const aDays = getEventCalendarEventDays(a)
  const bDays = getEventCalendarEventDays(b)
  const aAllDay = isEventCalendarAllDayRowEvent(a)
  const bAllDay = isEventCalendarAllDayRowEvent(b)
  // All-day-row events are ordered by day, ahead of that day's timed events.
  const aKey = aAllDay ? aDays.firstDay * EVENT_CALENDAR_MINUTES_PER_DAY : aDays.startAbsolute
  const bKey = bAllDay ? bDays.firstDay * EVENT_CALENDAR_MINUTES_PER_DAY : bDays.startAbsolute
  if (aKey !== bKey) return aKey - bKey
  if (aAllDay !== bAllDay) return aAllDay ? -1 : 1
  const aLength = aDays.endAbsolute - aDays.startAbsolute
  const bLength = bDays.endAbsolute - bDays.startAbsolute
  if (aLength !== bLength) return bLength - aLength
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

/** Events in {@link compareEventCalendarEvents} order (input untouched). */
export function sortEventCalendarEvents(events: readonly EventCalendarEvent[]): EventCalendarEvent[] {
  return [...events].sort(compareEventCalendarEvents)
}

export interface EventCalendarSplitOptions extends EventCalendarDayBounds {
  /** Minimum rendered duration of a timed segment. */
  minEventMinutes?: number
}

export interface EventCalendarSplit {
  /** All-day-row bars clipped to the visible days. */
  allDay: EventCalendarSpanSegment[]
  /** Timed segments per visible day index. */
  timed: EventCalendarTimedSegment[][]
}

function timedSegmentForDay(
  event: EventCalendarEvent,
  bounds: EventCalendarEventDays,
  dayNumber: number,
  dayIndex: number,
  options: Required<EventCalendarSplitOptions>,
): EventCalendarTimedSegment | null {
  const midnight = dayNumber * EVENT_CALENDAR_MINUTES_PER_DAY
  const rawStart = Math.max(bounds.startAbsolute, midnight) - midnight
  const rawEnd = Math.min(bounds.endAbsolute, midnight + EVENT_CALENDAR_MINUTES_PER_DAY) - midnight
  const visualEnd = Math.max(rawEnd, rawStart + options.minEventMinutes)
  if (rawStart >= options.dayEndMinutes || visualEnd <= options.dayStartMinutes) return null
  const startMinutes = Math.max(rawStart, options.dayStartMinutes)
  const endMinutes = Math.min(visualEnd, options.dayEndMinutes)
  return {
    event,
    dayIndex,
    startMinutes,
    endMinutes,
    continuesBefore: bounds.startAbsolute < midnight + startMinutes,
    continuesAfter: bounds.endAbsolute > midnight + endMinutes,
  }
}

/**
 * Split events across the visible days: all-day / multi-day events become
 * bars in the all-day row; timed events are cut at midnight into one segment
 * per day they touch, then clipped to the visible day window.
 */
export function splitEventCalendarEvents(
  events: readonly EventCalendarEvent[],
  days: readonly EventCalendarDate[],
  options: EventCalendarSplitOptions,
): EventCalendarSplit {
  const resolved: Required<EventCalendarSplitOptions> = {
    minEventMinutes: EVENT_CALENDAR_DEFAULT_MIN_EVENT_MINUTES,
    ...options,
  }
  const allDay: EventCalendarSpanSegment[] = []
  const timed: EventCalendarTimedSegment[][] = days.map(() => [])
  if (days.length === 0) return { allDay, timed }

  const rangeFirst = toEventCalendarDayNumber(days[0])
  const rangeLast = rangeFirst + days.length - 1

  for (const event of sortEventCalendarEvents(events)) {
    const bounds = getEventCalendarEventDays(event)
    if (bounds.lastDay < rangeFirst || bounds.firstDay > rangeLast) continue

    if (isEventCalendarAllDayRowEvent(event)) {
      allDay.push({
        event,
        startIndex: Math.max(bounds.firstDay, rangeFirst) - rangeFirst,
        endIndex: Math.min(bounds.lastDay, rangeLast) - rangeFirst,
        continuesBefore: bounds.firstDay < rangeFirst,
        continuesAfter: bounds.lastDay > rangeLast,
      })
      continue
    }

    const from = Math.max(bounds.firstDay, rangeFirst)
    const to = Math.min(bounds.lastDay, rangeLast)
    for (let dayNumber = from; dayNumber <= to; dayNumber++) {
      const dayIndex = dayNumber - rangeFirst
      const segment = timedSegmentForDay(event, bounds, dayNumber, dayIndex, resolved)
      if (segment) timed[dayIndex].push(segment)
    }
  }
  return { allDay, timed }
}

// ---------------------------------------------------------------------------
// Lane layout — the classic cluster → column → expand algorithm
// ---------------------------------------------------------------------------

/** An interval to lay out. `end` is exclusive. */
export interface EventCalendarLaneInput {
  start: number
  end: number
}

/** Placement of one interval inside its overlap cluster. */
export interface EventCalendarLane {
  /** Zero-based column within the cluster. */
  column: number
  /** Number of columns in the cluster. */
  columns: number
  /** Columns this interval may occupy (≥1) after expanding into free neighbours. */
  span: number
  /** Left edge as a fraction of the day width (`column / columns`). */
  left: number
  /** Width as a fraction of the day width (`span / columns`). */
  width: number
}

function overlaps(a: EventCalendarLaneInput, b: EventCalendarLaneInput): boolean {
  return a.start < b.end && b.start < a.end
}

function layoutCluster(
  items: readonly EventCalendarLaneInput[],
  cluster: readonly number[],
  lanes: EventCalendarLane[],
): void {
  // 1. Column assignment: first column whose last interval has ended.
  const columnEnds: number[] = []
  const columnOf = new Map<number, number>()
  for (const index of cluster) {
    const item = items[index]
    let column = columnEnds.findIndex((end) => end <= item.start)
    if (column === -1) {
      column = columnEnds.length
      columnEnds.push(item.end)
    } else {
      columnEnds[column] = item.end
    }
    columnOf.set(index, column)
  }

  // 2. Expansion: grow right across columns with nothing overlapping.
  const columns = columnEnds.length
  for (const index of cluster) {
    const column = columnOf.get(index) as number
    let span = 1
    for (let next = column + 1; next < columns; next++) {
      const blocked = cluster.some(
        (other) => columnOf.get(other) === next && overlaps(items[index], items[other]),
      )
      if (blocked) break
      span++
    }
    lanes[index] = { column, columns, span, left: column / columns, width: span / columns }
  }
}

/**
 * Lay out possibly-overlapping intervals into side-by-side lanes.
 *
 * 1. Sort by start (longer first on ties) and cut into **clusters** of
 *    transitively overlapping intervals.
 * 2. Within a cluster, place each interval in the **first column** that is
 *    free at its start; the cluster's column count sets the lane width.
 * 3. **Expand** each interval rightwards across columns that hold nothing
 *    overlapping it, so a lone event beside a busy column uses the space.
 *
 * Returns one lane per input, in input order.
 */
export function layoutEventCalendarLanes(
  items: readonly EventCalendarLaneInput[],
): EventCalendarLane[] {
  const order = items
    .map((_, index) => index)
    .sort((a, b) => items[a].start - items[b].start || items[b].end - items[a].end || a - b)

  const lanes: EventCalendarLane[] = new Array(items.length)
  let cluster: number[] = []
  let clusterEnd = -Infinity
  for (const index of order) {
    const item = items[index]
    if (cluster.length > 0 && item.start >= clusterEnd) {
      layoutCluster(items, cluster, lanes)
      cluster = []
      clusterEnd = -Infinity
    }
    cluster.push(index)
    clusterEnd = Math.max(clusterEnd, item.end)
  }
  if (cluster.length > 0) layoutCluster(items, cluster, lanes)
  return lanes
}

/** A timed segment with its lane and its position as fractions of the day column. */
export interface EventCalendarPositionedSegment extends EventCalendarTimedSegment {
  lane: EventCalendarLane
  /** Top edge as a fraction of the visible day window (0–1). */
  top: number
  /** Height as a fraction of the visible day window (0–1). */
  height: number
}

/** Lane-layout one day's timed segments and position them within the day window. */
export function layoutEventCalendarDay(
  segments: readonly EventCalendarTimedSegment[],
  bounds: EventCalendarDayBounds,
): EventCalendarPositionedSegment[] {
  const windowMinutes = bounds.dayEndMinutes - bounds.dayStartMinutes
  const lanes = layoutEventCalendarLanes(
    segments.map((segment) => ({ start: segment.startMinutes, end: segment.endMinutes })),
  )
  return segments.map((segment, index) => ({
    ...segment,
    lane: lanes[index],
    top: (segment.startMinutes - bounds.dayStartMinutes) / windowMinutes,
    height: (segment.endMinutes - segment.startMinutes) / windowMinutes,
  }))
}

// ---------------------------------------------------------------------------
// All-day row stacking
// ---------------------------------------------------------------------------

/** An all-day bar with the row it is stacked into. */
export interface EventCalendarStackedSpan extends EventCalendarSpanSegment {
  /** Zero-based row in the all-day area. */
  row: number
}

export interface EventCalendarSpanStack {
  segments: EventCalendarStackedSpan[]
  /** Number of rows needed. */
  rowCount: number
}

/**
 * Stack all-day bars into rows: earliest start first (longer first on ties),
 * each into the first row that is free from its start column.
 */
export function stackEventCalendarSpans(
  spans: readonly EventCalendarSpanSegment[],
): EventCalendarSpanStack {
  const ordered = [...spans].sort(
    (a, b) =>
      a.startIndex - b.startIndex ||
      b.endIndex - b.startIndex - (a.endIndex - a.startIndex) ||
      compareEventCalendarEvents(a.event, b.event),
  )
  const rowEnds: number[] = []
  const segments = ordered.map((span) => {
    let row = rowEnds.findIndex((end) => end < span.startIndex)
    if (row === -1) {
      row = rowEnds.length
      rowEnds.push(span.endIndex)
    } else {
      rowEnds[row] = span.endIndex
    }
    return { ...span, row }
  })
  return { segments, rowCount: rowEnds.length }
}

// ---------------------------------------------------------------------------
// Month cells
// ---------------------------------------------------------------------------

/** One event as listed inside a month day cell. */
export interface EventCalendarMonthItem {
  event: EventCalendarEvent
  /** Drawn as an all-day chip (all-day or ≥ 24 h) rather than a timed entry. */
  allDay: boolean
  /** The event started on an earlier day. */
  continuesBefore: boolean
  /** The event continues on a later day. */
  continuesAfter: boolean
}

/**
 * Per-day event lists for month cells. Every event appears in each day it
 * touches (with continuation flags), in chronological order.
 */
export function splitEventCalendarMonthEvents(
  events: readonly EventCalendarEvent[],
  days: readonly EventCalendarDate[],
): EventCalendarMonthItem[][] {
  const cells: EventCalendarMonthItem[][] = days.map(() => [])
  if (days.length === 0) return cells
  const rangeFirst = toEventCalendarDayNumber(days[0])
  const rangeLast = rangeFirst + days.length - 1

  for (const event of sortEventCalendarEvents(events)) {
    const bounds = getEventCalendarEventDays(event)
    const allDay = isEventCalendarAllDayRowEvent(event)
    const from = Math.max(bounds.firstDay, rangeFirst)
    const to = Math.min(bounds.lastDay, rangeLast)
    for (let dayNumber = from; dayNumber <= to; dayNumber++) {
      cells[dayNumber - rangeFirst].push({
        event,
        allDay,
        continuesBefore: dayNumber > bounds.firstDay,
        continuesAfter: dayNumber < bounds.lastDay,
      })
    }
  }
  return cells
}

/** Default number of event rows a month cell shows before collapsing into "+N more". */
export const EVENT_CALENDAR_DEFAULT_MAX_EVENTS_PER_CELL = 3

export interface EventCalendarOverflow {
  /** How many items to render. */
  visibleCount: number
  /** How many are folded into the "+N more" control (0 = no control). */
  hiddenCount: number
}

/**
 * "+N more" overflow for a cell with room for `maxVisible` rows. When the
 * items do not fit, one row is given to the "+N more" control, so the cell
 * never grows past `maxVisible` rows.
 */
export function getEventCalendarOverflow(count: number, maxVisible: number): EventCalendarOverflow {
  const rows = Math.max(1, Math.floor(maxVisible))
  const total = Math.max(0, count)
  if (total <= rows) return { visibleCount: total, hiddenCount: 0 }
  const visibleCount = rows - 1
  return { visibleCount, hiddenCount: total - visibleCount }
}
