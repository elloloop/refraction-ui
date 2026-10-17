/**
 * A time of day, as whole minutes since midnight (`0` = 00:00, `1439` = 23:59).
 *
 * The core is deliberately date-free: no `Date`, no time zones, no DST. A
 * meeting "starts at 9:30" regardless of which day it is, so the value is just
 * an integer that adapters can store, compare and do arithmetic on.
 */
export type MinutesSinceMidnight = number

/** Clock convention used to display a time. */
export type TimePickerHourCycle = 12 | 24

/** Day-period labels for the 12-hour clock (e.g. `AM`/`PM`, `a. m.`/`p. m.`). */
export interface TimePickerMeridiemLabels {
  am: string
  pm: string
}

/** Why a typed entry was rejected. */
export type TimePickerInvalidReason = 'unparseable' | 'out-of-range'

/** Turns a duration in minutes into a short label such as `1 h 30 min`. */
export type TimePickerDurationFormatter = (minutes: number) => string

const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const HOURS_PER_HALF_DAY = 12
const MINUTES_PER_DAY = MINUTES_PER_HOUR * HOURS_PER_DAY
const MAX_MINUTE_OF_HOUR = MINUTES_PER_HOUR - 1
/** Digits of a compact entry that belong to the minutes ("930" → "9" + "30"). */
const COMPACT_MINUTE_DIGITS = 2

/** First and last representable times of day. */
export const TIME_PICKER_MIN_TIME: MinutesSinceMidnight = 0
export const TIME_PICKER_MAX_TIME: MinutesSinceMidnight = MINUTES_PER_DAY - 1
/** Default distance between suggestions and arrow-key steps, in minutes. */
export const TIME_PICKER_DEFAULT_STEP = 15

/**
 * Locale whose clock is rendered when none is given and the runtime's cannot
 * be used yet — on the server and during hydration — so both sides agree.
 * Matches the `en-US` default of the other date/time components.
 */
export const TIME_PICKER_DEFAULT_LOCALE = 'en-US'

export const TIME_PICKER_DEFAULT_MERIDIEM_LABELS: TimePickerMeridiemLabels = {
  am: 'AM',
  pm: 'PM',
}

/* ─── Parsing ──────────────────────────────────────────────────── */

export interface ParseTimeOptions {
  /**
   * Extra day-period labels to recognise (e.g. localised `a. m.`). The English
   * `am`/`pm`/`a`/`p` forms are always accepted.
   */
  labels?: TimePickerMeridiemLabels
}

type Meridiem = 'am' | 'pm'

/** `9:30`, `9.30`, `9 30`, `9h30`. */
const SEPARATED_TIME = /^(\d{1,2})(?:\s*[:.h]\s*|\s+)(\d{2})$/
/** `9`, `21`, `930`, `0930`, `2130`. */
const COMPACT_TIME = /^\d{1,4}$/
/** Trailing `am`, `a.m.`, `a`, `p m`, … */
const ENGLISH_MERIDIEM = /([ap])\.?\s*(?:m\.?)?$/

function stripMeridiem(
  text: string,
  labels: TimePickerMeridiemLabels | undefined,
): { body: string; meridiem: Meridiem | null } {
  // Custom labels first: a localised "p. m." would otherwise be half-matched.
  if (labels) {
    for (const meridiem of ['am', 'pm'] as const) {
      const label = labels[meridiem].trim().toLowerCase()
      if (label && text.endsWith(label)) {
        return { body: text.slice(0, -label.length).trim(), meridiem }
      }
    }
  }
  const match = ENGLISH_MERIDIEM.exec(text)
  if (!match) return { body: text, meridiem: null }
  return {
    body: text.slice(0, match.index).trim(),
    meridiem: match[1] === 'a' ? 'am' : 'pm',
  }
}

function splitHoursAndMinutes(body: string): { hours: number; minutes: number } | null {
  const separated = SEPARATED_TIME.exec(body)
  if (separated) {
    return { hours: Number(separated[1]), minutes: Number(separated[2]) }
  }
  if (!COMPACT_TIME.test(body)) return null
  if (body.length <= COMPACT_MINUTE_DIGITS) {
    return { hours: Number(body), minutes: 0 }
  }
  const cut = body.length - COMPACT_MINUTE_DIGITS
  return { hours: Number(body.slice(0, cut)), minutes: Number(body.slice(cut)) }
}

function toTwentyFourHour(hours: number, meridiem: Meridiem | null): number | null {
  if (meridiem === null) return hours < HOURS_PER_DAY ? hours : null
  if (hours < 1 || hours > HOURS_PER_HALF_DAY) return null
  const base = hours % HOURS_PER_HALF_DAY // 12am → 0, 12pm → 0 (+12 below)
  return meridiem === 'pm' ? base + HOURS_PER_HALF_DAY : base
}

/**
 * Forgiving parser for a typed time of day.
 *
 * Accepts `930`, `0930`, `9`, `9:30`, `9.30`, `21:30`, `9:30pm`, `9.30 PM`,
 * `12am` (midnight), `12pm` (noon), `9p`, `9 a.m.`. Without a day period the
 * entry is read as 24-hour. Returns `null` for anything that is not a real
 * time (`25:00`, `9:75`, `13pm`, `abc`) — never a guessed value.
 */
export function parseTime(
  input: string,
  options: ParseTimeOptions = {},
): MinutesSinceMidnight | null {
  const text = input.trim().toLowerCase()
  if (!text) return null

  const { body, meridiem } = stripMeridiem(text, options.labels)
  const parts = splitHoursAndMinutes(body)
  if (!parts || parts.minutes > MAX_MINUTE_OF_HOUR) return null

  const hours = toTwentyFourHour(parts.hours, meridiem)
  if (hours === null) return null
  return hours * MINUTES_PER_HOUR + parts.minutes
}

/* ─── Formatting ───────────────────────────────────────────────── */

export interface FormatTimeOptions {
  /** `12` → `9:30 PM`; `24` → `21:30`. Default `24`. */
  hourCycle?: TimePickerHourCycle
  /** Day-period labels for the 12-hour clock. Default `AM`/`PM`. */
  labels?: TimePickerMeridiemLabels
}

function padTwo(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * Normalise any integer-ish minute count onto the 24-hour clock face, so
 * `formatTime(1500)` is `01:00` rather than `25:00`.
 */
function wrapToDay(minutes: number): MinutesSinceMidnight {
  const whole = Math.floor(minutes)
  return ((whole % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
}

/** Render a time of day for display (`09:30`, or `9:30 AM` on a 12-hour clock). */
export function formatTime(
  minutes: MinutesSinceMidnight,
  options: FormatTimeOptions = {},
): string {
  const { hourCycle = 24, labels = TIME_PICKER_DEFAULT_MERIDIEM_LABELS } = options
  const value = wrapToDay(minutes)
  const hours = Math.floor(value / MINUTES_PER_HOUR)
  const mins = padTwo(value % MINUTES_PER_HOUR)

  if (hourCycle === 24) return `${padTwo(hours)}:${mins}`

  const clockHour = hours % HOURS_PER_HALF_DAY || HOURS_PER_HALF_DAY
  const period = hours < HOURS_PER_HALF_DAY ? labels.am : labels.pm
  return `${clockHour}:${mins} ${period}`
}

/**
 * Default duration label: `45 min`, `1 h`, `1 h 30 min`. Pass your own
 * {@link TimePickerDurationFormatter} to localise.
 */
export function formatTimePickerDuration(minutes: number): string {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR)
  const mins = minutes % MINUTES_PER_HOUR
  if (hours === 0) return `${mins} min`
  if (mins === 0) return `${hours} h`
  return `${hours} h ${mins} min`
}

/* ─── Locale ───────────────────────────────────────────────────── */

const TWELVE_HOUR_CYCLES = new Set(['h11', 'h12'])

/**
 * The hour cycle a locale prefers, from `Intl`'s own data
 * (`en-US` → 12, `en-GB`/`de-DE` → 24). The locale is injected so callers stay
 * deterministic; `undefined` means the runtime's default locale. Falls back to
 * 24 when the runtime does not report an hour cycle.
 */
export function resolveHourCycle(locale?: string | string[]): TimePickerHourCycle {
  const { hourCycle } = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions()
  return hourCycle !== undefined && TWELVE_HOUR_CYCLES.has(hourCycle) ? 12 : 24
}

/* ─── Range, stepping & suggestions ────────────────────────────── */

export interface TimePickerRange {
  /** Earliest allowed time. Default `0` (00:00). */
  min?: MinutesSinceMidnight
  /** Latest allowed time. Default `1439` (23:59). */
  max?: MinutesSinceMidnight
}

export interface TimePickerStepOptions extends TimePickerRange {
  /** Minutes between steps. Must be a positive integer. Default `15`. */
  step?: number
  /**
   * Reference time (e.g. a meeting's start) the step grid is anchored to.
   * Default: midnight.
   */
  start?: MinutesSinceMidnight
}

function assertValidStep(step: number): void {
  if (!Number.isInteger(step) || step <= 0) {
    throw new RangeError(`TimePicker step must be a positive integer, received ${step}`)
  }
}

function resolveRange({ min, max }: TimePickerRange): { min: number; max: number } {
  return { min: min ?? TIME_PICKER_MIN_TIME, max: max ?? TIME_PICKER_MAX_TIME }
}

/** Clamp a time into `[min, max]`. */
export function clampTime(
  value: MinutesSinceMidnight,
  range: TimePickerRange = {},
): MinutesSinceMidnight {
  const { min, max } = resolveRange(range)
  return Math.min(Math.max(value, min), max)
}

/** Whether a time lies within `[min, max]`. */
export function isTimeInRange(
  value: MinutesSinceMidnight,
  range: TimePickerRange = {},
): boolean {
  const { min, max } = resolveRange(range)
  return value >= min && value <= max
}

/**
 * Move a time one step up (`1`, later) or down (`-1`, earlier).
 *
 * Off-grid values snap to the neighbouring grid line first (10:07 ↑ → 10:15,
 * ↓ → 10:00, with a 15-minute step), like a native time input. The result is
 * clamped to `[min, max]`. An empty value starts at the first grid time at or
 * after `min` (↑) or the last one at or before `max` (↓).
 */
export function stepTime(
  value: MinutesSinceMidnight | null,
  direction: 1 | -1,
  options: TimePickerStepOptions = {},
): MinutesSinceMidnight {
  const { step = TIME_PICKER_DEFAULT_STEP, start = 0 } = options
  assertValidStep(step)
  const { min, max } = resolveRange(options)

  if (value === null) {
    const edge = direction === 1 ? min : max
    const snap = direction === 1 ? Math.ceil : Math.floor
    return clampTime(start + snap((edge - start) / step) * step, { min, max })
  }

  const offset = (value - start) / step
  const gridIndex = direction === 1 ? Math.floor(offset) + 1 : Math.ceil(offset) - 1
  return clampTime(start + gridIndex * step, { min, max })
}

export interface SuggestTimesOptions extends TimePickerStepOptions, FormatTimeOptions {
  /** Duration label formatter. Default {@link formatTimePickerDuration}. */
  formatDuration?: TimePickerDurationFormatter
}

/** One suggested time in the list. */
export interface TimePickerOption {
  value: MinutesSinceMidnight
  /** Formatted time alone, e.g. `10:30`. */
  timeLabel: string
  /** Minutes after `start`, or `null` without a start. */
  duration: number | null
  /** Formatted duration, e.g. `30 min`, or `null` without a start. */
  durationLabel: string | null
  /** Full accessible text, e.g. `10:30 (30 min)`. */
  label: string
}

/**
 * Suggested times every `step` minutes within `[min, max]`.
 *
 * Without `start` the grid is aligned to midnight (09:00, 09:15, …). With a
 * `start` — the end-time case — suggestions begin one step after it and each
 * carries its duration: `10:30 (30 min)`, `11:30 (1 h 30 min)`. The start
 * itself is not suggested, since a zero-length meeting is not an end time.
 */
export function suggestTimes(options: SuggestTimesOptions = {}): TimePickerOption[] {
  const {
    step = TIME_PICKER_DEFAULT_STEP,
    start,
    formatDuration = formatTimePickerDuration,
    hourCycle,
    labels,
  } = options
  assertValidStep(step)
  const { min, max } = resolveRange(options)

  const anchor = start ?? 0
  const lowest = start === undefined ? min : Math.max(min, start + step)
  const first = anchor + Math.ceil((lowest - anchor) / step) * step

  const result: TimePickerOption[] = []
  for (let value = first; value <= max; value += step) {
    const timeLabel = formatTime(value, { hourCycle, labels })
    const duration = start === undefined ? null : value - start
    const durationLabel = duration === null ? null : formatDuration(duration)
    result.push({
      value,
      timeLabel,
      duration,
      durationLabel,
      label: durationLabel === null ? timeLabel : `${timeLabel} (${durationLabel})`,
    })
  }
  return result
}

/** Index of the option closest to `value` (earlier wins a tie), or `-1`. */
export function findNearestTimeOptionIndex(
  options: readonly TimePickerOption[],
  value: MinutesSinceMidnight | null,
): number {
  if (value === null || options.length === 0) return -1
  let best = 0
  for (let i = 1; i < options.length; i++) {
    if (Math.abs(options[i].value - value) < Math.abs(options[best].value - value)) best = i
  }
  return best
}

/* ─── Committing typed text ────────────────────────────────────── */

export type TimePickerInputResult =
  | { status: 'empty' }
  | { status: 'valid'; value: MinutesSinceMidnight }
  | { status: 'invalid'; reason: TimePickerInvalidReason }

export interface ResolveTimeInputOptions extends TimePickerRange, ParseTimeOptions {}

/**
 * Decide what a typed entry means when the user commits it (Enter / blur):
 * empty clears, a parsable in-range time is accepted, anything else is
 * invalid with a reason the adapter can turn into a message.
 */
export function resolveTimeInput(
  text: string,
  options: ResolveTimeInputOptions = {},
): TimePickerInputResult {
  if (!text.trim()) return { status: 'empty' }
  const value = parseTime(text, options)
  if (value === null) return { status: 'invalid', reason: 'unparseable' }
  if (!isTimeInRange(value, options)) return { status: 'invalid', reason: 'out-of-range' }
  return { status: 'valid', value }
}

/** Example time used in the default "enter a time like …" message. */
const EXAMPLE_TIME: MinutesSinceMidnight = 9 * MINUTES_PER_HOUR + 30

export interface TimePickerMessageOptions extends TimePickerRange, FormatTimeOptions {}

/** Default English validation message for a rejected entry. */
export function getTimePickerInvalidMessage(
  reason: TimePickerInvalidReason,
  options: TimePickerMessageOptions = {},
): string {
  const format = (value: number) => formatTime(value, options)
  if (reason === 'unparseable') return `Enter a time like ${format(EXAMPLE_TIME)}.`
  const { min, max } = resolveRange(options)
  return `Choose a time between ${format(min)} and ${format(max)}.`
}

/* ─── Keyboard ─────────────────────────────────────────────────── */

export type TimePickerKeyAction =
  | 'step-up'
  | 'step-down'
  | 'open'
  | 'close'
  | 'next-option'
  | 'previous-option'
  | 'commit'
  | 'revert'

export interface TimePickerKeyState {
  /** Whether the suggestion list is showing. */
  open: boolean
  /** Whether Alt/Option is held (Alt+↓ opens, Alt+↑ closes — ARIA combobox). */
  altKey?: boolean
}

/**
 * Pure keyboard map shared by adapters.
 *
 * - List closed: ↑ steps later, ↓ steps earlier, Alt+↓ opens the list.
 * - List open: ↑/↓ move the active suggestion, Alt+↑ closes.
 * - Enter commits; Escape reverts the text and closes.
 *
 * Returns `null` for keys the picker leaves to the text field.
 */
export function getTimePickerKeyAction(
  key: string,
  { open, altKey = false }: TimePickerKeyState,
): TimePickerKeyAction | null {
  switch (key) {
    case 'Enter':
      return 'commit'
    case 'Escape':
      return 'revert'
    case 'ArrowDown':
      if (altKey) return open ? null : 'open'
      return open ? 'next-option' : 'step-down'
    case 'ArrowUp':
      if (altKey) return open ? 'close' : null
      return open ? 'previous-option' : 'step-up'
    default:
      return null
  }
}

/**
 * Next active suggestion index for an option-moving action. Clamps at the ends
 * (times are ordered; wrapping 23:45 → 00:00 would be surprising). From "no
 * active option" (`-1`), ↓ lands on the first and ↑ on the last.
 */
export function getNextTimeOptionIndex(
  current: number,
  action: 'next-option' | 'previous-option',
  count: number,
): number {
  if (count <= 0) return -1
  if (action === 'next-option') return current < 0 ? 0 : Math.min(current + 1, count - 1)
  return current < 0 ? count - 1 : Math.max(current - 1, 0)
}

/* ─── ARIA ─────────────────────────────────────────────────────── */

export interface TimePickerAriaOptions {
  /** Whether the suggestion list is showing. */
  open: boolean
  /** Whether the committed entry was rejected. */
  invalid: boolean
  /** Id of the listbox element. */
  listboxId: string
  /** Id of the active option, if any. */
  activeOptionId?: string
  /** Id of the validation message element. */
  messageId?: string
}

export interface TimePickerAPI {
  /** ARIA attributes for the text input (`role="combobox"`). */
  inputAriaProps: Record<string, string | number | boolean>
  /** ARIA attributes for the suggestion list (`role="listbox"`). */
  listboxAriaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic ARIA wiring for the ARIA 1.2 editable
 * combobox pattern: the input owns focus and points at the active option via
 * `aria-activedescendant`, so typing and list navigation never fight.
 */
export function createTimePicker(options: TimePickerAriaOptions): TimePickerAPI {
  const { open, invalid, listboxId, activeOptionId, messageId } = options

  const inputAriaProps: Record<string, string | number | boolean> = {
    role: 'combobox',
    'aria-autocomplete': 'list',
    'aria-haspopup': 'listbox',
    'aria-expanded': open,
    'aria-controls': listboxId,
  }
  if (open && activeOptionId) inputAriaProps['aria-activedescendant'] = activeOptionId
  if (invalid) inputAriaProps['aria-invalid'] = true
  if (invalid && messageId) inputAriaProps['aria-describedby'] = messageId

  return {
    inputAriaProps,
    listboxAriaProps: { role: 'listbox' },
    dataAttributes: {
      'data-state': open ? 'open' : 'closed',
      ...(invalid ? { 'data-invalid': '' } : {}),
    },
  }
}
