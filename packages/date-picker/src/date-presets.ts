import { isDateOutOfRange, startOfDay } from './date-picker.js'

/** A day of the week, numbered as `Date.prototype.getDay()` numbers it: 0 is Sunday, 6 is Saturday. */
export type DatePickerWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * A date offered as one click next to the picker, such as "Tomorrow".
 *
 * A preset is data rather than a function, so a server can render it and the
 * browser can resolve it later against the reader's own "today". Its date is
 * found by starting from today, moving to the next `weekday` when one is
 * given, then adding `days`.
 */
export interface DatePreset {
  /** Stable identifier, unique within one picker. */
  id: string
  /** Visible text, already in the reader's language. */
  label: string
  /** Whole days to add (default 0). */
  days?: number
  /** Move first to the next occurrence of this weekday after today; today itself never counts. */
  weekday?: DatePickerWeekday
}

/** Visible text of the built-in presets, for translation. */
export interface DatePresetLabels {
  today: string
  tomorrow: string
  nextWeek: string
}

export const DEFAULT_DATE_PRESET_LABELS: Readonly<DatePresetLabels> = Object.freeze({
  today: 'Today',
  tomorrow: 'Tomorrow',
  nextWeek: 'Next week',
})

/** Accessible name of the group of preset buttons. */
export const DEFAULT_DATE_PRESETS_LABEL = 'Date shortcuts'

/** Monday, as in ISO 8601 and most of the world; pass 0 for locales whose weeks start on Sunday. */
export const DEFAULT_WEEK_STARTS_ON: DatePickerWeekday = 1

export interface DefaultDatePresetOptions {
  /** Translated labels; any label left out keeps its English default. */
  labels?: Partial<DatePresetLabels>
  /** First day of the week in the reader's locale. "Next week" picks the next one. */
  weekStartsOn?: DatePickerWeekday
}

/** "Today", "Tomorrow" and "Next week" (the first day of next week), with ids `today`, `tomorrow` and `next-week`. */
export function createDefaultDatePresets(options: DefaultDatePresetOptions = {}): DatePreset[] {
  const labels = options.labels ?? {}
  return [
    { id: 'today', label: labels.today ?? DEFAULT_DATE_PRESET_LABELS.today, days: 0 },
    { id: 'tomorrow', label: labels.tomorrow ?? DEFAULT_DATE_PRESET_LABELS.tomorrow, days: 1 },
    {
      id: 'next-week',
      label: labels.nextWeek ?? DEFAULT_DATE_PRESET_LABELS.nextWeek,
      weekday: options.weekStartsOn ?? DEFAULT_WEEK_STARTS_ON,
    },
  ]
}

function assertValidPreset(preset: DatePreset): void {
  if (preset.days !== undefined && !Number.isInteger(preset.days)) {
    throw new RangeError(`Date preset "${preset.id}": days must be a whole number, got ${preset.days}`)
  }
  const { weekday } = preset
  if (weekday !== undefined && !(Number.isInteger(weekday) && weekday >= 0 && weekday <= 6)) {
    throw new RangeError(`Date preset "${preset.id}": weekday must be 0 (Sunday) to 6 (Saturday), got ${weekday}`)
  }
}

/**
 * Throw if a preset list cannot be resolved: an id used twice, `days` that is
 * not a whole number, or a `weekday` outside 0 to 6. Lets a server reject a
 * bad list when it renders, before any browser resolves it.
 */
export function assertValidDatePresets(presets: readonly DatePreset[]): void {
  const ids = new Set<string>()
  for (const preset of presets) {
    if (ids.has(preset.id)) {
      throw new Error(`Date preset ids must be unique; "${preset.id}" appears more than once`)
    }
    ids.add(preset.id)
    assertValidPreset(preset)
  }
}

/** The day a preset stands for, at midnight local time, given today's date. */
export function resolveDatePreset(preset: DatePreset, today: Date): Date {
  assertValidPreset(preset)
  const start = startOfDay(today)
  let offset = preset.days ?? 0
  if (preset.weekday !== undefined) {
    // 1 to 7 days ahead: tomorrow when it is that weekday, a week ahead when today is.
    offset += ((preset.weekday - start.getDay() + 6) % 7) + 1
  }
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset)
}

export interface ResolvedDatePreset extends DatePreset {
  /** The day the preset stands for, at midnight local time. */
  date: Date
  /** The day falls outside `minDate`/`maxDate`, so the preset cannot be chosen. */
  disabled: boolean
}

export interface DatePresetContext {
  /** The reader's current date. */
  today: Date
  minDate?: Date
  maxDate?: Date
}

/** Resolve every preset against today and the allowed range. Ids must be unique. */
export function resolveDatePresets(
  presets: readonly DatePreset[],
  { today, minDate, maxDate }: DatePresetContext,
): ResolvedDatePreset[] {
  assertValidDatePresets(presets)
  return presets.map((preset) => {
    const date = resolveDatePreset(preset, today)
    return { ...preset, date, disabled: isDateOutOfRange(date, minDate, maxDate) }
  })
}
