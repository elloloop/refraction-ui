import {
  EVENT_CALENDAR_DAYS_PER_WEEK,
  EVENT_CALENDAR_HOURS_PER_DAY,
  EVENT_CALENDAR_MINUTES_PER_HOUR,
  addEventCalendarDays,
  addEventCalendarMonths,
  diffEventCalendarDays,
  endOfEventCalendarMonth,
  normalizeEventCalendarDateTime,
  startOfEventCalendarMonth,
  startOfEventCalendarWeek,
  type EventCalendarDate,
  type EventCalendarDateTime,
  type EventCalendarWeekday,
} from './event-calendar-date.js'
import type { EventCalendarDayBounds } from './event-calendar-layout.js'

/** The three calendar views. */
export type EventCalendarView = 'day' | 'week' | 'month'

/** Every view, in the order the view switch shows them. */
export const EVENT_CALENDAR_VIEWS: readonly EventCalendarView[] = ['day', 'week', 'month']

/** Default first day of the week (Sunday). */
export const EVENT_CALENDAR_DEFAULT_WEEK_STARTS_ON: EventCalendarWeekday = 0

/** Default slot length — the grid line spacing and the snapping step for click/drag create. */
export const EVENT_CALENDAR_DEFAULT_SLOT_MINUTES = 30

/** Default first visible hour of the time grid. */
export const EVENT_CALENDAR_DEFAULT_DAY_START_HOUR = 0

/** Default end of the time grid (exclusive hour). */
export const EVENT_CALENDAR_DEFAULT_DAY_END_HOUR = EVENT_CALENDAR_HOURS_PER_DAY

// ---------------------------------------------------------------------------
// Ranges
// ---------------------------------------------------------------------------

function daysFrom(start: EventCalendarDate, count: number): EventCalendarDate[] {
  return Array.from({ length: count }, (_, index) => addEventCalendarDays(start, index))
}

/**
 * Weeks covering the month containing `date`, each starting on `weekStartsOn`.
 * Between four and six rows — only as many as the month needs.
 */
export function getEventCalendarMonthWeeks(
  date: EventCalendarDate,
  weekStartsOn: EventCalendarWeekday,
): EventCalendarDate[][] {
  const gridStart = startOfEventCalendarWeek(startOfEventCalendarMonth(date), weekStartsOn)
  const lastWeekStart = startOfEventCalendarWeek(endOfEventCalendarMonth(date), weekStartsOn)
  const weekCount = diffEventCalendarDays(gridStart, lastWeekStart) / EVENT_CALENDAR_DAYS_PER_WEEK + 1
  return Array.from({ length: weekCount }, (_, week) =>
    daysFrom(addEventCalendarDays(gridStart, week * EVENT_CALENDAR_DAYS_PER_WEEK), EVENT_CALENDAR_DAYS_PER_WEEK),
  )
}

/** The days a view shows for an anchor date (a month view includes leading/trailing days). */
export function getEventCalendarVisibleDays(
  view: EventCalendarView,
  date: EventCalendarDate,
  weekStartsOn: EventCalendarWeekday,
): EventCalendarDate[] {
  switch (view) {
    case 'day':
      return [date]
    case 'week':
      return daysFrom(startOfEventCalendarWeek(date, weekStartsOn), EVENT_CALENDAR_DAYS_PER_WEEK)
    case 'month':
      return getEventCalendarMonthWeeks(date, weekStartsOn).flat()
  }
}

/** The anchor date one view-period before (`-1`) or after (`1`) `date`. */
export function stepEventCalendarDate(
  view: EventCalendarView,
  date: EventCalendarDate,
  direction: -1 | 1,
): EventCalendarDate {
  switch (view) {
    case 'day':
      return addEventCalendarDays(date, direction)
    case 'week':
      return addEventCalendarDays(date, direction * EVENT_CALENDAR_DAYS_PER_WEEK)
    case 'month':
      return addEventCalendarMonths(date, direction)
  }
}

// ---------------------------------------------------------------------------
// Time window and slots
// ---------------------------------------------------------------------------

/** Resolved time-grid geometry: the visible window plus the slot (snap) step. */
export interface EventCalendarTimeGrid extends EventCalendarDayBounds {
  slotMinutes: number
}

export interface EventCalendarTimeGridOptions {
  dayStartHour?: number
  dayEndHour?: number
  slotMinutes?: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Validate and resolve the time-grid window. Hours are clamped to 0–24 and the
 * window to at least one hour; the slot step is clamped to 1 minute … the
 * window length, so the grid always has at least one slot.
 */
export function resolveEventCalendarTimeGrid(
  options: EventCalendarTimeGridOptions = {},
): EventCalendarTimeGrid {
  const startHour = clamp(
    Math.floor(options.dayStartHour ?? EVENT_CALENDAR_DEFAULT_DAY_START_HOUR),
    0,
    EVENT_CALENDAR_HOURS_PER_DAY - 1,
  )
  const endHour = clamp(
    Math.ceil(options.dayEndHour ?? EVENT_CALENDAR_DEFAULT_DAY_END_HOUR),
    startHour + 1,
    EVENT_CALENDAR_HOURS_PER_DAY,
  )
  const dayStartMinutes = startHour * EVENT_CALENDAR_MINUTES_PER_HOUR
  const dayEndMinutes = endHour * EVENT_CALENDAR_MINUTES_PER_HOUR
  const slotMinutes = clamp(
    Math.floor(options.slotMinutes ?? EVENT_CALENDAR_DEFAULT_SLOT_MINUTES),
    1,
    dayEndMinutes - dayStartMinutes,
  )
  return { dayStartMinutes, dayEndMinutes, slotMinutes }
}

/** Start minute of every slot in the window (a trailing partial slot is kept). */
export function getEventCalendarSlotStarts(grid: EventCalendarTimeGrid): number[] {
  const starts: number[] = []
  for (let minute = grid.dayStartMinutes; minute < grid.dayEndMinutes; minute += grid.slotMinutes) {
    starts.push(minute)
  }
  return starts
}

/** Fraction (0–1) of the visible window at which `minutes` falls (clamped). */
export function eventCalendarMinutesToFraction(minutes: number, grid: EventCalendarDayBounds): number {
  const window = grid.dayEndMinutes - grid.dayStartMinutes
  return clamp((minutes - grid.dayStartMinutes) / window, 0, 1)
}

/**
 * Snap a pointer position, as a fraction of the column height, to the start
 * of the slot under it. Used by click and drag create; positions outside the
 * column clamp to the first / last slot.
 */
export function eventCalendarFractionToSlot(fraction: number, grid: EventCalendarTimeGrid): number {
  const window = grid.dayEndMinutes - grid.dayStartMinutes
  const raw = clamp(fraction, 0, 1) * window
  const lastSlot = Math.floor((window - 1) / grid.slotMinutes)
  const slot = Math.min(Math.floor(raw / grid.slotMinutes), lastSlot)
  return grid.dayStartMinutes + slot * grid.slotMinutes
}

/** A proposed new event from click / drag / keyboard create. `end` is exclusive. */
export interface EventCalendarCreateRange {
  start: EventCalendarDateTime
  end: EventCalendarDateTime
  /** Created from the all-day row or a month cell. */
  allDay: boolean
}

/**
 * The time range covered by a drag between two slots of one day (either
 * direction). Both slots are included; a click is a drag of one slot.
 */
export function getEventCalendarSlotRange(
  date: EventCalendarDate,
  anchorSlot: number,
  currentSlot: number,
  grid: EventCalendarTimeGrid,
): EventCalendarCreateRange {
  const first = Math.min(anchorSlot, currentSlot)
  const last = Math.max(anchorSlot, currentSlot)
  const end = Math.min(last + grid.slotMinutes, grid.dayEndMinutes)
  return {
    start: normalizeEventCalendarDateTime({ date, minutes: first }),
    end: normalizeEventCalendarDateTime({ date, minutes: end }),
    allDay: false,
  }
}

/** The all-day range covered by a drag between two day cells (either direction). */
export function getEventCalendarDayRange(
  anchor: EventCalendarDate,
  current: EventCalendarDate,
): EventCalendarCreateRange {
  const forward = diffEventCalendarDays(anchor, current) >= 0
  const first = forward ? anchor : current
  const last = forward ? current : anchor
  return {
    start: { date: first, minutes: 0 },
    end: { date: addEventCalendarDays(last, 1), minutes: 0 },
    allDay: true,
  }
}

/** Where the current-time line sits: which visible day, and how far down (0–1). */
export interface EventCalendarNowPosition {
  dayIndex: number
  /** Minutes since that day's midnight. */
  minutes: number
  /** Distance down the visible window (0–1). */
  fraction: number
}

/**
 * Position of the current-time line, or `null` when `now` is not in the
 * visible days or falls outside the visible hours.
 */
export function getEventCalendarNowPosition(
  now: EventCalendarDateTime,
  days: readonly EventCalendarDate[],
  grid: EventCalendarDayBounds,
): EventCalendarNowPosition | null {
  const normal = normalizeEventCalendarDateTime(now)
  const dayIndex = days.indexOf(normal.date)
  if (dayIndex === -1) return null
  if (normal.minutes < grid.dayStartMinutes || normal.minutes >= grid.dayEndMinutes) return null
  return { dayIndex, minutes: normal.minutes, fraction: eventCalendarMinutesToFraction(normal.minutes, grid) }
}

// ---------------------------------------------------------------------------
// Keyboard
// ---------------------------------------------------------------------------

/** The keyboard cursor: a focused day, and (in time grids) a focused slot. */
export interface EventCalendarCursor {
  date: EventCalendarDate
  /** Slot start minute (ignored in month view). */
  minutes: number
}

export interface EventCalendarKeyboardOptions {
  view: EventCalendarView
  weekStartsOn: EventCalendarWeekday
  grid: EventCalendarTimeGrid
}

function withDate(cursor: EventCalendarCursor, date: EventCalendarDate): EventCalendarCursor {
  return { ...cursor, date }
}

function moveSlot(
  cursor: EventCalendarCursor,
  direction: -1 | 1,
  grid: EventCalendarTimeGrid,
): EventCalendarCursor {
  const slots = getEventCalendarSlotStarts(grid)
  const index = Math.max(0, slots.indexOf(eventCalendarSnapToSlot(cursor.minutes, grid)))
  return { ...cursor, minutes: slots[clamp(index + direction, 0, slots.length - 1)] }
}

/** Snap any minute value to the start of the slot containing it (clamped to the window). */
export function eventCalendarSnapToSlot(minutes: number, grid: EventCalendarTimeGrid): number {
  const window = grid.dayEndMinutes - grid.dayStartMinutes
  return eventCalendarFractionToSlot((minutes - grid.dayStartMinutes) / window, grid)
}

function weekEdge(
  cursor: EventCalendarCursor,
  edge: 'start' | 'end',
  weekStartsOn: EventCalendarWeekday,
): EventCalendarCursor {
  const start = startOfEventCalendarWeek(cursor.date, weekStartsOn)
  const LAST_DAY_OFFSET = EVENT_CALENDAR_DAYS_PER_WEEK - 1
  return withDate(cursor, edge === 'start' ? start : addEventCalendarDays(start, LAST_DAY_OFFSET))
}

function monthKey(cursor: EventCalendarCursor, key: string, options: EventCalendarKeyboardOptions) {
  switch (key) {
    case 'ArrowUp':
      return withDate(cursor, addEventCalendarDays(cursor.date, -EVENT_CALENDAR_DAYS_PER_WEEK))
    case 'ArrowDown':
      return withDate(cursor, addEventCalendarDays(cursor.date, EVENT_CALENDAR_DAYS_PER_WEEK))
    case 'Home':
      return weekEdge(cursor, 'start', options.weekStartsOn)
    case 'End':
      return weekEdge(cursor, 'end', options.weekStartsOn)
    default:
      return null
  }
}

function timeGridKey(cursor: EventCalendarCursor, key: string, options: EventCalendarKeyboardOptions) {
  const { grid } = options
  switch (key) {
    case 'ArrowUp':
      return moveSlot(cursor, -1, grid)
    case 'ArrowDown':
      return moveSlot(cursor, 1, grid)
    case 'Home':
      return options.view === 'week'
        ? weekEdge(cursor, 'start', options.weekStartsOn)
        : { ...cursor, minutes: grid.dayStartMinutes }
    case 'End':
      return options.view === 'week'
        ? weekEdge(cursor, 'end', options.weekStartsOn)
        : { ...cursor, minutes: getEventCalendarSlotStarts(grid).at(-1) as number }
    default:
      return null
  }
}

/**
 * Where a key press moves the keyboard cursor, or `null` when the key is not
 * a navigation key (so the adapter leaves the event alone).
 *
 * | Key                  | Month                 | Week                     | Day              |
 * |----------------------|-----------------------|--------------------------|------------------|
 * | ArrowLeft / Right    | ∓1 day                | ∓1 day                   | ∓1 day           |
 * | ArrowUp / Down       | ∓1 week               | ∓1 slot (clamped)        | ∓1 slot          |
 * | Home / End           | first / last of week  | first / last of week     | first / last slot|
 * | PageUp / PageDown    | ∓1 month              | ∓1 week                  | ∓1 day           |
 *
 * Moving past the visible range is allowed — the adapter pages the view so
 * the cursor stays visible.
 */
export function getEventCalendarKeyboardTarget(
  cursor: EventCalendarCursor,
  key: string,
  options: EventCalendarKeyboardOptions,
): EventCalendarCursor | null {
  switch (key) {
    case 'ArrowLeft':
      return withDate(cursor, addEventCalendarDays(cursor.date, -1))
    case 'ArrowRight':
      return withDate(cursor, addEventCalendarDays(cursor.date, 1))
    case 'PageUp':
      return withDate(cursor, stepEventCalendarDate(options.view, cursor.date, -1))
    case 'PageDown':
      return withDate(cursor, stepEventCalendarDate(options.view, cursor.date, 1))
    default:
      return options.view === 'month'
        ? monthKey(cursor, key, options)
        : timeGridKey(cursor, key, options)
  }
}

/**
 * Roving focus between the events of the view (in rendered order). Arrows
 * move to the previous / next event and clamp at the ends; Home / End jump to
 * the first / last. Returns `null` for other keys or when there are no events.
 */
export function getEventCalendarEventFocusIndex(
  current: number,
  key: string,
  count: number,
): number | null {
  if (count <= 0) return null
  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      return Math.min(current + 1, count - 1)
    case 'ArrowUp':
    case 'ArrowLeft':
      return Math.max(current - 1, 0)
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}

/** Whether a minute value is a whole hour (hour rows get a visible label). */
export function isEventCalendarHour(minutes: number): boolean {
  return minutes % EVENT_CALENDAR_MINUTES_PER_HOUR === 0
}

