import {
  EVENT_CALENDAR_DAYS_PER_WEEK,
  formatEventCalendarDate,
  fromEventCalendarDayNumber,
  formatEventCalendarDateRange,
  formatEventCalendarTime,
  normalizeEventCalendarDateTime,
  type EventCalendarDate,
  type EventCalendarDateTime,
  type EventCalendarWeekday,
} from './event-calendar-date.js'
import {
  EVENT_CALENDAR_DEFAULT_MAX_EVENTS_PER_CELL,
  getEventCalendarEventDays,
  getEventCalendarOverflow,
  layoutEventCalendarDay,
  splitEventCalendarEvents,
  splitEventCalendarMonthEvents,
  stackEventCalendarSpans,
  type EventCalendarEvent,
  type EventCalendarMonthItem,
  type EventCalendarPositionedSegment,
  type EventCalendarSpanStack,
} from './event-calendar-layout.js'
import {
  EVENT_CALENDAR_DEFAULT_WEEK_STARTS_ON,
  getEventCalendarNowPosition,
  getEventCalendarSlotStarts,
  getEventCalendarVisibleDays,
  isEventCalendarHour,
  resolveEventCalendarTimeGrid,
  type EventCalendarNowPosition,
  type EventCalendarTimeGrid,
  type EventCalendarView,
} from './event-calendar-navigation.js'

/** Default locale for all `Intl` formatting. */
export const EVENT_CALENDAR_DEFAULT_LOCALE = 'en-US'

/** Every user-visible / announced string, overridable for i18n. */
export interface EventCalendarLabels {
  /** Accessible name of the whole calendar region. */
  calendar: string
  /** Text of the "go to today" button. */
  today: string
  /** Accessible name of the previous-period button. */
  previous: (view: EventCalendarView) => string
  /** Accessible name of the next-period button. */
  next: (view: EventCalendarView) => string
  /** Accessible name of the view switch group. */
  viewSwitch: string
  /** Text of each view option. */
  views: Record<EventCalendarView, string>
  /** Label of the all-day row and of single-day all-day events. */
  allDay: string
  /** Column header above the hour labels. */
  time: string
  /** Visible text of a month cell's overflow control. */
  more: (count: number) => string
  /** Accessible name of a month cell's overflow control. */
  showMore: (count: number, dayLabel: string) => string
  /** Event count appended to a month cell's accessible name. */
  eventCount: (count: number) => string
}

export const EVENT_CALENDAR_DEFAULT_LABELS: EventCalendarLabels = {
  calendar: 'Calendar',
  today: 'Today',
  previous: (view) => `Previous ${view}`,
  next: (view) => `Next ${view}`,
  viewSwitch: 'Calendar view',
  views: { day: 'Day', week: 'Week', month: 'Month' },
  allDay: 'All day',
  time: 'Time',
  more: (count) => `+${count} more`,
  showMore: (count, dayLabel) => `Show ${count} more ${count === 1 ? 'event' : 'events'} on ${dayLabel}`,
  eventCount: (count) => (count === 0 ? 'No events' : `${count} ${count === 1 ? 'event' : 'events'}`),
}

/** Merge partial label overrides onto the defaults. */
export function resolveEventCalendarLabels(
  labels: Partial<EventCalendarLabels> = {},
): EventCalendarLabels {
  return {
    ...EVENT_CALENDAR_DEFAULT_LABELS,
    ...labels,
    views: { ...EVENT_CALENDAR_DEFAULT_LABELS.views, ...labels.views },
  }
}

const LONG_DAY: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}
const SHORT_WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'short' }
const DAY_OF_MONTH: Intl.DateTimeFormatOptions = { day: 'numeric' }
const MONTH_DAY: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
const MONTH_YEAR: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' }
const WEEK_RANGE: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }

/** Long accessible label for a day, e.g. "Monday, October 12, 2026". */
export function formatEventCalendarDayLabel(date: EventCalendarDate, locale: string): string {
  return formatEventCalendarDate(date, locale, LONG_DAY)
}

/** Header title for the visible period ("October 2026", "Oct 11 – 17, 2026", or a long day). */
export function formatEventCalendarTitle(
  view: EventCalendarView,
  date: EventCalendarDate,
  days: readonly EventCalendarDate[],
  locale: string,
): string {
  switch (view) {
    case 'day':
      return formatEventCalendarDayLabel(date, locale)
    case 'week':
      return formatEventCalendarDateRange(days[0], days[days.length - 1], locale, WEEK_RANGE)
    case 'month':
      return formatEventCalendarDate(date, locale, MONTH_YEAR)
  }
}

function formatMoment(value: EventCalendarDateTime, locale: string): string {
  const normal = normalizeEventCalendarDateTime(value)
  return `${formatEventCalendarDate(normal.date, locale, MONTH_DAY)}, ${formatEventCalendarTime(normal.minutes, locale)}`
}

/**
 * Human time text for an event: "9:00 AM – 10:00 AM", "All day",
 * "All day, Oct 12 – 14", or "Oct 12, 10:00 PM – Oct 13, 2:00 AM" when a
 * timed event crosses midnight.
 */
export function formatEventCalendarEventTime(
  event: EventCalendarEvent,
  locale: string,
  labels: Pick<EventCalendarLabels, 'allDay'> = EVENT_CALENDAR_DEFAULT_LABELS,
): string {
  const days = getEventCalendarEventDays(event)
  if (event.allDay) {
    if (days.firstDay === days.lastDay) return labels.allDay
    const first = fromEventCalendarDayNumber(days.firstDay)
    const last = fromEventCalendarDayNumber(days.lastDay)
    return `${labels.allDay}, ${formatEventCalendarDateRange(first, last, locale, MONTH_DAY)}`
  }
  const start = normalizeEventCalendarDateTime(event.start)
  const end = normalizeEventCalendarDateTime(event.end)
  if (days.firstDay === days.lastDay) {
    // An end of exactly midnight belongs to the same day and reads "12:00 AM".
    return `${formatEventCalendarTime(start.minutes, locale)} – ${formatEventCalendarTime(end.minutes, locale)}`
  }
  return `${formatMoment(start, locale)} – ${formatMoment(end, locale)}`
}

/**
 * Accessible name of an event: title, time range, day (for single-day
 * events) and category — so meaning never rests on the colour alone.
 */
export function getEventCalendarEventLabel(
  event: EventCalendarEvent,
  locale: string,
  labels: Pick<EventCalendarLabels, 'allDay'> = EVENT_CALENDAR_DEFAULT_LABELS,
): string {
  const days = getEventCalendarEventDays(event)
  const parts = [event.title, formatEventCalendarEventTime(event, locale, labels)]
  if (days.firstDay === days.lastDay) {
    parts.push(formatEventCalendarDayLabel(normalizeEventCalendarDateTime(event.start).date, locale))
  }
  if (event.category) parts.push(event.category)
  return parts.join(', ')
}

/** A visible day with its display strings. */
export interface EventCalendarDayInfo {
  date: EventCalendarDate
  /** Long accessible label, e.g. "Monday, October 12, 2026". */
  label: string
  /** Short weekday, e.g. "Mon". */
  weekday: string
  /** Day-of-month number text, e.g. "12". */
  dayOfMonth: string
  /** Short month + day for month-boundary cells, e.g. "Nov 1". */
  monthDay: string
  /** `date` is `now`'s date. */
  isToday: boolean
  /** Month view only: the day belongs to a neighbouring month. */
  isOutsideMonth: boolean
}

/** A row of the time grid. */
export interface EventCalendarSlotInfo {
  /** Slot start, minutes since midnight. */
  minutes: number
  /** Locale time text, e.g. "9:30 AM". */
  label: string
  /** Whole-hour rows show their label; others keep it for screen readers only. */
  isHour: boolean
}

/** A month day cell with its events and overflow. */
export interface EventCalendarMonthCell {
  day: EventCalendarDayInfo
  /** Every event touching the day, in order. */
  items: EventCalendarMonthItem[]
  /** The items to render (the rest fold into "+N more"). */
  visible: EventCalendarMonthItem[]
  /** Count behind the "+N more" control (0 = no control). */
  hiddenCount: number
}

/** Display strings for one event. */
export interface EventCalendarEventText {
  /** Visible time text. */
  time: string
  /** Full accessible name. */
  label: string
}

export interface EventCalendarOptions {
  view: EventCalendarView
  /** Anchor date of the visible period. */
  date: EventCalendarDate
  /** Current moment in the display zone (drives "today" and the now line). */
  now: EventCalendarDateTime
  events: readonly EventCalendarEvent[]
  weekStartsOn?: EventCalendarWeekday
  locale?: string
  dayStartHour?: number
  dayEndHour?: number
  slotMinutes?: number
  maxEventsPerCell?: number
  labels?: Partial<EventCalendarLabels>
}

/** Everything an adapter needs to render one view, computed purely from options. */
export interface EventCalendarModel {
  view: EventCalendarView
  date: EventCalendarDate
  weekStartsOn: EventCalendarWeekday
  locale: string
  labels: EventCalendarLabels
  grid: EventCalendarTimeGrid
  /** Header title for the period. */
  title: string
  /** The visible days (month view: every cell, row-major). */
  days: EventCalendarDayInfo[]
  /** Time-grid rows (day / week views). */
  slots: EventCalendarSlotInfo[]
  /** All-day row bars, stacked (day / week views). */
  allDay: EventCalendarSpanStack
  /** Positioned timed segments per visible day (day / week views). */
  timed: EventCalendarPositionedSegment[][]
  /** Current-time line, if visible (day / week views). */
  now: EventCalendarNowPosition | null
  /** Month rows of cells (month view). */
  weeks: EventCalendarMonthCell[][]
  /** Display strings for an event (memoised per id). */
  describeEvent: (event: EventCalendarEvent) => EventCalendarEventText
  /** Root ARIA attributes (`role="region"` + label). */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

function buildDayInfo(
  date: EventCalendarDate,
  options: { locale: string; now: EventCalendarDateTime; month: string | null },
): EventCalendarDayInfo {
  const { locale } = options
  return {
    date,
    label: formatEventCalendarDayLabel(date, locale),
    weekday: formatEventCalendarDate(date, locale, SHORT_WEEKDAY),
    dayOfMonth: formatEventCalendarDate(date, locale, DAY_OF_MONTH),
    monthDay: formatEventCalendarDate(date, locale, MONTH_DAY),
    isToday: date === normalizeEventCalendarDateTime(options.now).date,
    isOutsideMonth: options.month !== null && !date.startsWith(options.month),
  }
}

const YEAR_MONTH_LENGTH = 'YYYY-MM'.length

/**
 * Build the complete, framework-agnostic view model of an event calendar.
 *
 * Pure: the same options always give the same model (no clock reads, no ids).
 * Adapters render `days` / `slots` / `allDay` / `timed` / `now` for the time
 * grid, or `weeks` for the month grid, and own only interaction state.
 */
export function createEventCalendar(options: EventCalendarOptions): EventCalendarModel {
  const {
    view,
    date,
    now,
    events,
    weekStartsOn = EVENT_CALENDAR_DEFAULT_WEEK_STARTS_ON,
    locale = EVENT_CALENDAR_DEFAULT_LOCALE,
    maxEventsPerCell = EVENT_CALENDAR_DEFAULT_MAX_EVENTS_PER_CELL,
  } = options
  const labels = resolveEventCalendarLabels(options.labels)
  const grid = resolveEventCalendarTimeGrid(options)
  const visible = getEventCalendarVisibleDays(view, date, weekStartsOn)
  const month = view === 'month' ? date.slice(0, YEAR_MONTH_LENGTH) : null
  const days = visible.map((day) => buildDayInfo(day, { locale, now, month }))

  const textCache = new Map<string, EventCalendarEventText>()
  const describeEvent = (event: EventCalendarEvent): EventCalendarEventText => {
    let text = textCache.get(event.id)
    if (!text) {
      text = {
        time: formatEventCalendarEventTime(event, locale, labels),
        label: getEventCalendarEventLabel(event, locale, labels),
      }
      textCache.set(event.id, text)
    }
    return text
  }

  const base = {
    view,
    date,
    weekStartsOn,
    locale,
    labels,
    grid,
    title: formatEventCalendarTitle(view, date, visible, locale),
    days,
    describeEvent,
    ariaProps: { role: 'region', 'aria-label': labels.calendar },
    dataAttributes: { 'data-view': view },
  }

  if (view === 'month') {
    const items = splitEventCalendarMonthEvents(events, visible)
    const cells = days.map((day, index): EventCalendarMonthCell => {
      const overflow = getEventCalendarOverflow(items[index].length, maxEventsPerCell)
      return {
        day,
        items: items[index],
        visible: items[index].slice(0, overflow.visibleCount),
        hiddenCount: overflow.hiddenCount,
      }
    })
    const weeks: EventCalendarMonthCell[][] = []
    for (let start = 0; start < cells.length; start += EVENT_CALENDAR_DAYS_PER_WEEK) {
      weeks.push(cells.slice(start, start + EVENT_CALENDAR_DAYS_PER_WEEK))
    }
    return { ...base, slots: [], allDay: { segments: [], rowCount: 0 }, timed: [], now: null, weeks }
  }

  const split = splitEventCalendarEvents(events, visible, grid)
  return {
    ...base,
    slots: getEventCalendarSlotStarts(grid).map((minutes) => ({
      minutes,
      label: formatEventCalendarTime(minutes, locale),
      isHour: isEventCalendarHour(minutes),
    })),
    allDay: stackEventCalendarSpans(split.allDay),
    timed: split.timed.map((segments) => layoutEventCalendarDay(segments, grid)),
    now: getEventCalendarNowPosition(now, visible, grid),
    weeks: [],
  }
}
