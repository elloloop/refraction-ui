/**
 * Clock-free, timezone-safe date arithmetic for the event calendar.
 *
 * Every value here is a *plain wall-clock* value that the caller has already
 * converted into the display time zone: a calendar date `'YYYY-MM-DD'` plus a
 * count of minutes since that date's midnight. The core therefore never needs
 * to know which zone it is drawing — a day is always 24 h of wall-clock time —
 * and the server (often UTC) and the browser (the user's zone) always agree,
 * so SSR output hydrates cleanly. The only `Date` objects built here are
 * UTC-anchored (`Date.UTC`) and read back with `getUTC*` / `timeZone: 'UTC'`,
 * which makes them pure functions of their inputs.
 */

/** A calendar date in ISO form, `'YYYY-MM-DD'`, in the display time zone. */
export type EventCalendarDate = string

/** A wall-clock moment: a display-zone date plus minutes since its midnight. */
export interface EventCalendarDateTime {
  /** The display-zone calendar date, `'YYYY-MM-DD'`. */
  date: EventCalendarDate
  /** Minutes since that date's midnight (0–1440; overflow is normalised). */
  minutes: number
}

/** Day of the week, `0` = Sunday … `6` = Saturday (matches `Date#getDay`). */
export type EventCalendarWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export const EVENT_CALENDAR_MINUTES_PER_HOUR = 60
export const EVENT_CALENDAR_HOURS_PER_DAY = 24
export const EVENT_CALENDAR_MINUTES_PER_DAY =
  EVENT_CALENDAR_HOURS_PER_DAY * EVENT_CALENDAR_MINUTES_PER_HOUR
export const EVENT_CALENDAR_DAYS_PER_WEEK = 7

const MS_PER_MINUTE = 60_000
const MS_PER_DAY = EVENT_CALENDAR_MINUTES_PER_DAY * MS_PER_MINUTE
const MONTHS_PER_YEAR = 12
const YEAR_DIGITS = 4
const TWO_DIGITS = 2
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const ISO_DATE_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/
/** The UTC zone every formatter uses, so the host machine's zone never leaks in. */
const UTC_ZONE = 'UTC'

function pad(value: number, width: number): string {
  return String(value).padStart(width, '0')
}

/**
 * Days since 1970-01-01 for an ISO date. Throws a `RangeError` for malformed
 * or impossible dates (`'2026-02-30'`) so bad caller data fails loudly instead
 * of silently drawing an event on the wrong day.
 */
export function toEventCalendarDayNumber(date: EventCalendarDate): number {
  const match = ISO_DATE_PATTERN.exec(date)
  if (!match) throw new RangeError(`Invalid calendar date "${date}" (expected YYYY-MM-DD)`)
  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const utc = new Date(Date.UTC(year, month, day))
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month ||
    utc.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date "${date}"`)
  }
  return Math.round(utc.getTime() / MS_PER_DAY)
}

/** Inverse of {@link toEventCalendarDayNumber}. */
export function fromEventCalendarDayNumber(dayNumber: number): EventCalendarDate {
  const utc = new Date(dayNumber * MS_PER_DAY)
  return [
    pad(utc.getUTCFullYear(), YEAR_DIGITS),
    pad(utc.getUTCMonth() + 1, TWO_DIGITS),
    pad(utc.getUTCDate(), TWO_DIGITS),
  ].join('-')
}

/** `date` shifted by `days` (negative goes back). */
export function addEventCalendarDays(date: EventCalendarDate, days: number): EventCalendarDate {
  return fromEventCalendarDayNumber(toEventCalendarDayNumber(date) + days)
}

/** Whole days from `from` to `to` (`to - from`). */
export function diffEventCalendarDays(from: EventCalendarDate, to: EventCalendarDate): number {
  return toEventCalendarDayNumber(to) - toEventCalendarDayNumber(from)
}

/**
 * `date` shifted by `months`, clamping the day to the target month's length
 * (Jan 31 + 1 month → Feb 28/29) so month paging never skips a month.
 */
export function addEventCalendarMonths(date: EventCalendarDate, months: number): EventCalendarDate {
  const { year, month, day } = splitEventCalendarDate(date)
  const absoluteMonth = year * MONTHS_PER_YEAR + (month - 1) + months
  const targetYear = Math.floor(absoluteMonth / MONTHS_PER_YEAR)
  const targetMonth = absoluteMonth - targetYear * MONTHS_PER_YEAR
  const daysInTarget = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate()
  return [
    pad(targetYear, YEAR_DIGITS),
    pad(targetMonth + 1, TWO_DIGITS),
    pad(Math.min(day, daysInTarget), TWO_DIGITS),
  ].join('-')
}

/** Year, 1-based month and day of an ISO date (validated). */
export function splitEventCalendarDate(date: EventCalendarDate): {
  year: number
  month: number
  day: number
} {
  toEventCalendarDayNumber(date)
  const [year, month, day] = date.split('-').map(Number)
  return { year, month, day }
}

/** First day of the month containing `date`. */
export function startOfEventCalendarMonth(date: EventCalendarDate): EventCalendarDate {
  return `${date.slice(0, 'YYYY-MM'.length)}-01`
}

/** Last day of the month containing `date`. */
export function endOfEventCalendarMonth(date: EventCalendarDate): EventCalendarDate {
  return addEventCalendarDays(addEventCalendarMonths(startOfEventCalendarMonth(date), 1), -1)
}

/** Day of the week of `date` (`0` = Sunday). */
export function getEventCalendarWeekday(date: EventCalendarDate): EventCalendarWeekday {
  // 1970-01-01 was a Thursday (weekday 4).
  const EPOCH_WEEKDAY = 4
  const dayNumber = toEventCalendarDayNumber(date)
  const weekday =
    (((dayNumber + EPOCH_WEEKDAY) % EVENT_CALENDAR_DAYS_PER_WEEK) + EVENT_CALENDAR_DAYS_PER_WEEK) %
    EVENT_CALENDAR_DAYS_PER_WEEK
  return weekday as EventCalendarWeekday
}

/** The first day of the week containing `date`, for a configurable week start. */
export function startOfEventCalendarWeek(
  date: EventCalendarDate,
  weekStartsOn: EventCalendarWeekday,
): EventCalendarDate {
  const offset =
    (getEventCalendarWeekday(date) - weekStartsOn + EVENT_CALENDAR_DAYS_PER_WEEK) %
    EVENT_CALENDAR_DAYS_PER_WEEK
  return addEventCalendarDays(date, -offset)
}

/** Minutes since 1970-01-01T00:00 (display zone) — a total order over moments. */
export function toEventCalendarAbsoluteMinutes(value: EventCalendarDateTime): number {
  return toEventCalendarDayNumber(value.date) * EVENT_CALENDAR_MINUTES_PER_DAY + value.minutes
}

/** Inverse of {@link toEventCalendarAbsoluteMinutes}. */
export function fromEventCalendarAbsoluteMinutes(absolute: number): EventCalendarDateTime {
  const dayNumber = Math.floor(absolute / EVENT_CALENDAR_MINUTES_PER_DAY)
  return {
    date: fromEventCalendarDayNumber(dayNumber),
    minutes: absolute - dayNumber * EVENT_CALENDAR_MINUTES_PER_DAY,
  }
}

/**
 * Carry minute overflow into the date: `{ '2026-10-17', 1440 }` becomes
 * `{ '2026-10-18', 0 }` and negative minutes borrow from the previous day.
 */
export function normalizeEventCalendarDateTime(value: EventCalendarDateTime): EventCalendarDateTime {
  return fromEventCalendarAbsoluteMinutes(toEventCalendarAbsoluteMinutes(value))
}

/** Negative / zero / positive ordering of two moments. */
export function compareEventCalendarDateTime(
  a: EventCalendarDateTime,
  b: EventCalendarDateTime,
): number {
  return toEventCalendarAbsoluteMinutes(a) - toEventCalendarAbsoluteMinutes(b)
}

/**
 * Parse a local ISO date-time without offset, `'2026-10-17T09:30'`, into a
 * wall-clock value. A convenience for callers who have already formatted their
 * zoned instants in the display zone (e.g. with `Intl` or Temporal).
 */
export function parseEventCalendarDateTime(value: string): EventCalendarDateTime {
  const match = ISO_DATE_TIME_PATTERN.exec(value)
  if (!match) {
    throw new RangeError(`Invalid calendar date-time "${value}" (expected YYYY-MM-DDTHH:mm)`)
  }
  const hours = Number(match[2])
  const minutes = Number(match[3])
  if (hours > EVENT_CALENDAR_HOURS_PER_DAY || minutes >= EVENT_CALENDAR_MINUTES_PER_HOUR) {
    throw new RangeError(`Invalid calendar time in "${value}"`)
  }
  toEventCalendarDayNumber(match[1])
  return normalizeEventCalendarDateTime({
    date: match[1],
    minutes: hours * EVENT_CALENDAR_MINUTES_PER_HOUR + minutes,
  })
}

/** Inverse of {@link parseEventCalendarDateTime} (`'YYYY-MM-DDTHH:mm'`). */
export function formatEventCalendarDateTime(value: EventCalendarDateTime): string {
  const normal = normalizeEventCalendarDateTime(value)
  const hours = Math.floor(normal.minutes / EVENT_CALENDAR_MINUTES_PER_HOUR)
  const minutes = normal.minutes % EVENT_CALENDAR_MINUTES_PER_HOUR
  return `${normal.date}T${pad(hours, TWO_DIGITS)}:${pad(minutes, TWO_DIGITS)}`
}

// ---------------------------------------------------------------------------
// Locale formatting (Intl, pinned to UTC so the host zone never matters)
// ---------------------------------------------------------------------------

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone: UTC_ZONE })
    formatterCache.set(key, formatter)
  }
  return formatter
}

/**
 * ICU emits narrow / thin no-break spaces (U+202F, U+2009) in times and ranges,
 * and which one depends on the ICU version — a classic server/client
 * hydration mismatch. Normalise them to plain spaces.
 */
function normalizeSpaces(text: string): string {
  return text.replace(/[\u202f\u2009\u00a0]/g, ' ')
}

function dateToUtc(date: EventCalendarDate): Date {
  return new Date(toEventCalendarDayNumber(date) * MS_PER_DAY)
}

/** Format a calendar date with `Intl` options (UTC-pinned, whitespace-normalised). */
export function formatEventCalendarDate(
  date: EventCalendarDate,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return normalizeSpaces(getFormatter(locale, options).format(dateToUtc(date)))
}

/** Format a range of two calendar dates with `Intl#formatRange`. */
export function formatEventCalendarDateRange(
  from: EventCalendarDate,
  to: EventCalendarDate,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return normalizeSpaces(getFormatter(locale, options).formatRange(dateToUtc(from), dateToUtc(to)))
}

const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }

/** Format minutes-since-midnight as a locale time, e.g. `570` → `"9:30 AM"`. */
export function formatEventCalendarTime(minutes: number, locale: string): string {
  return normalizeSpaces(getFormatter(locale, TIME_FORMAT).format(new Date(minutes * MS_PER_MINUTE)))
}
