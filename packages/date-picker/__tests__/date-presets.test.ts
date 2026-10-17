import { describe, it, expect } from 'vitest'
import {
  assertValidDatePresets,
  createDefaultDatePresets,
  resolveDatePreset,
  resolveDatePresets,
  DEFAULT_DATE_PRESET_LABELS,
  DEFAULT_DATE_PRESETS_LABEL,
  DEFAULT_WEEK_STARTS_ON,
  isDateOutOfRange,
  withTimeOf,
  datePickerPresetsStyles,
  datePickerPresetStyles,
  type DatePreset,
} from '../src/index.js'

// Saturday 17 October 2026, mid-afternoon: presets resolve to whole days.
const SATURDAY = new Date(2026, 9, 17, 15, 42, 7)

/** Local calendar day as YYYY-MM-DD, so failures read as dates. */
function day(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

describe('createDefaultDatePresets', () => {
  it('offers Today, Tomorrow and Next week, in that order', () => {
    expect(createDefaultDatePresets()).toEqual([
      { id: 'today', label: 'Today', days: 0 },
      { id: 'tomorrow', label: 'Tomorrow', days: 1 },
      { id: 'next-week', label: 'Next week', weekday: 1 },
    ])
  })

  it('uses translated labels and keeps the default for any left out', () => {
    const presets = createDefaultDatePresets({ labels: { today: 'Hoy', nextWeek: 'La semana que viene' } })
    expect(presets.map((preset) => preset.label)).toEqual(['Hoy', 'Tomorrow', 'La semana que viene'])
  })

  it('starts "Next week" on the given first day of the week', () => {
    const [, , nextWeek] = createDefaultDatePresets({ weekStartsOn: 0 })
    expect(nextWeek).toEqual({ id: 'next-week', label: 'Next week', weekday: 0 })
  })

  it('exposes its defaults', () => {
    expect(DEFAULT_DATE_PRESET_LABELS).toEqual({ today: 'Today', tomorrow: 'Tomorrow', nextWeek: 'Next week' })
    expect(Object.isFrozen(DEFAULT_DATE_PRESET_LABELS)).toBe(true)
    expect(DEFAULT_DATE_PRESETS_LABEL).toBe('Date shortcuts')
    expect(DEFAULT_WEEK_STARTS_ON).toBe(1)
  })
})

describe('resolveDatePreset', () => {
  const [today, tomorrow, nextWeek] = createDefaultDatePresets()

  it('resolves Today and Tomorrow to midnight of those days', () => {
    const resolved = resolveDatePreset(today, SATURDAY)
    expect(resolved).toEqual(new Date(2026, 9, 17))
    expect(resolveDatePreset(tomorrow, SATURDAY)).toEqual(new Date(2026, 9, 18))
  })

  it('does not change the date it is given', () => {
    const now = new Date(SATURDAY)
    resolveDatePreset(tomorrow, now)
    expect(now).toEqual(SATURDAY)
  })

  it('crosses month and year ends', () => {
    expect(day(resolveDatePreset(tomorrow, new Date(2026, 11, 31, 23, 59)))).toBe('2027-01-01')
    expect(day(resolveDatePreset(tomorrow, new Date(2028, 1, 28)))).toBe('2028-02-29')
  })

  it('stays on midnight across a daylight-saving change', () => {
    // Clocks change on 1 November 2026 in North America and on 5 April 2026 in
    // New Zealand; run under TZ=America/New_York or Pacific/Auckland to cross one.
    for (const [from, expected] of [
      [new Date(2026, 9, 31, 22), '2026-11-02'],
      [new Date(2026, 3, 4, 22), '2026-04-06'],
    ] as const) {
      const resolved = resolveDatePreset(nextWeek, from)
      expect(day(resolved)).toBe(expected)
      expect([resolved.getHours(), resolved.getMinutes()]).toEqual([0, 0])
    }
  })

  it('resolves Next week to the coming Monday from every day of a week', () => {
    // Monday 12 to Sunday 18 October 2026 all lead to Monday 19 October,
    // except that from Monday 19 itself the next one is a week later.
    for (let date = 12; date <= 18; date++) {
      expect(day(resolveDatePreset(nextWeek, new Date(2026, 9, date, 9)))).toBe('2026-10-19')
    }
    expect(day(resolveDatePreset(nextWeek, new Date(2026, 9, 19, 9)))).toBe('2026-10-26')
  })

  it('resolves Next week to the coming Sunday when weeks start on Sunday', () => {
    const [, , sundayStart] = createDefaultDatePresets({ weekStartsOn: 0 })
    expect(day(resolveDatePreset(sundayStart, SATURDAY))).toBe('2026-10-18')
    expect(day(resolveDatePreset(sundayStart, new Date(2026, 9, 18)))).toBe('2026-10-25')
  })

  it('combines a weekday with days, and accepts days in the past', () => {
    const mondayAfterNext: DatePreset = { id: 'monday-after-next', label: 'Monday after next', weekday: 1, days: 7 }
    const yesterday: DatePreset = { id: 'yesterday', label: 'Yesterday', days: -1 }
    expect(day(resolveDatePreset(mondayAfterNext, SATURDAY))).toBe('2026-10-26')
    expect(day(resolveDatePreset(yesterday, new Date(2026, 0, 1)))).toBe('2025-12-31')
  })

  it.each([1.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects days of %s', (days) => {
    expect(() => resolveDatePreset({ id: 'odd', label: 'Odd', days }, SATURDAY)).toThrow(
      new RangeError(`Date preset "odd": days must be a whole number, got ${days}`),
    )
  })

  it.each([-1, 7, 2.5])('rejects weekday %s', (weekday) => {
    const preset = { id: 'odd', label: 'Odd', weekday } as unknown as DatePreset
    expect(() => resolveDatePreset(preset, SATURDAY)).toThrow(
      new RangeError(`Date preset "odd": weekday must be 0 (Sunday) to 6 (Saturday), got ${weekday}`),
    )
  })
})

describe('resolveDatePresets', () => {
  it('keeps each preset, in order, with its date and whether it can be chosen', () => {
    expect(resolveDatePresets(createDefaultDatePresets(), { today: SATURDAY })).toEqual([
      { id: 'today', label: 'Today', days: 0, date: new Date(2026, 9, 17), disabled: false },
      { id: 'tomorrow', label: 'Tomorrow', days: 1, date: new Date(2026, 9, 18), disabled: false },
      { id: 'next-week', label: 'Next week', weekday: 1, date: new Date(2026, 9, 19), disabled: false },
    ])
  })

  it('disables presets outside the allowed range, whose ends are whole days', () => {
    const disabled = (minDate?: Date, maxDate?: Date) =>
      resolveDatePresets(createDefaultDatePresets(), { today: SATURDAY, minDate, maxDate }).map(
        (preset) => preset.disabled,
      )
    // A minimum later in the day still allows the whole of that day.
    expect(disabled(new Date(2026, 9, 18, 18, 30))).toEqual([true, false, false])
    // A maximum early in the day still allows the whole of that day.
    expect(disabled(undefined, new Date(2026, 9, 18, 0, 1))).toEqual([false, false, true])
    expect(disabled(new Date(2026, 9, 17), new Date(2026, 9, 17))).toEqual([false, true, true])
  })

  it('does not change the presets it is given', () => {
    const presets = createDefaultDatePresets()
    const copy = structuredClone(presets)
    resolveDatePresets(presets, { today: SATURDAY })
    expect(presets).toEqual(copy)
  })

  it('rejects two presets with the same id', () => {
    const presets: DatePreset[] = [
      { id: 'soon', label: 'Soon', days: 2 },
      { id: 'soon', label: 'Later', days: 3 },
    ]
    expect(() => resolveDatePresets(presets, { today: SATURDAY })).toThrow(
      'Date preset ids must be unique; "soon" appears more than once',
    )
  })
})

describe('assertValidDatePresets', () => {
  it('accepts the defaults and caller-defined presets', () => {
    expect(() =>
      assertValidDatePresets([...createDefaultDatePresets(), { id: 'friday', label: 'Friday', weekday: 5 }]),
    ).not.toThrow()
  })

  it('rejects a duplicate id or an invalid preset anywhere in the list', () => {
    expect(() => assertValidDatePresets([...createDefaultDatePresets(), { id: 'today', label: 'Again' }])).toThrow(
      'Date preset ids must be unique; "today" appears more than once',
    )
    expect(() => assertValidDatePresets([...createDefaultDatePresets(), { id: 'soon', label: 'Soon', days: 0.5 }])).toThrow(
      RangeError,
    )
  })
})

describe('withTimeOf', () => {
  it('keeps the hours and minutes of the source', () => {
    expect(withTimeOf(new Date(2026, 9, 18), new Date(2026, 0, 2, 14, 30, 45))).toEqual(new Date(2026, 9, 18, 14, 30))
  })

  it('copies the date when there is no source', () => {
    const date = new Date(2026, 9, 18)
    const result = withTimeOf(date)
    expect(result).toEqual(date)
    expect(result).not.toBe(date)
  })
})

describe('isDateOutOfRange', () => {
  it('compares whole days and treats a missing end as open', () => {
    const min = new Date(2026, 9, 17, 12)
    const max = new Date(2026, 9, 18, 6)
    expect(isDateOutOfRange(new Date(2026, 9, 16, 23, 59), min, max)).toBe(true)
    expect(isDateOutOfRange(new Date(2026, 9, 17), min, max)).toBe(false)
    expect(isDateOutOfRange(new Date(2026, 9, 18, 23, 59), min, max)).toBe(false)
    expect(isDateOutOfRange(new Date(2026, 9, 19), min, max)).toBe(true)
    expect(isDateOutOfRange(new Date(1999, 0, 1))).toBe(false)
  })
})

describe('preset styles', () => {
  it('lays the presets out in a wrapping row', () => {
    expect(datePickerPresetsStyles).toContain('flex-wrap')
  })

  it('gives each preset a visible focus ring and a disabled look', () => {
    expect(datePickerPresetStyles).toContain('focus-visible:ring-2')
    expect(datePickerPresetStyles).toContain('focus-visible:ring-ring')
    expect(datePickerPresetStyles).toContain('disabled:opacity-50')
    expect(datePickerPresetStyles).toContain('motion-reduce:transition-none')
  })
})
