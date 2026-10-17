import { describe, it, expect } from 'vitest'
import {
  parseTime,
  formatTime,
  formatTimePickerDuration,
  resolveHourCycle,
  clampTime,
  isTimeInRange,
  stepTime,
  suggestTimes,
  findNearestTimeOptionIndex,
  resolveTimeInput,
  getTimePickerInvalidMessage,
  getTimePickerKeyAction,
  getNextTimeOptionIndex,
  createTimePicker,
  timePickerInputVariants,
  timePickerOptionVariants,
  TIME_PICKER_MAX_TIME,
  TIME_PICKER_DEFAULT_LOCALE,
} from '../src/index.js'

const t = (h: number, m = 0) => h * 60 + m

describe('parseTime', () => {
  it.each([
    ['930', t(9, 30)],
    ['0930', t(9, 30)],
    ['2130', t(21, 30)],
    ['9', t(9)],
    ['21', t(21)],
    ['0', 0],
    ['9:30', t(9, 30)],
    ['21:30', t(21, 30)],
    ['9.30', t(9, 30)],
    ['9 30', t(9, 30)],
    ['9h30', t(9, 30)],
    [' 9 : 30 ', t(9, 30)],
    ['9:30pm', t(21, 30)],
    ['9:30PM', t(21, 30)],
    ['9.30 PM', t(21, 30)],
    ['9:30 a.m.', t(9, 30)],
    ['9p', t(21)],
    ['9 am', t(9)],
    ['930pm', t(21, 30)],
    ['12am', 0],
    ['12:15 am', t(0, 15)],
    ['12pm', t(12)],
    ['12:45pm', t(12, 45)],
    ['1pm', t(13)],
    ['23:59', TIME_PICKER_MAX_TIME],
    ['00:00', 0],
  ])('parses %j', (input, expected) => {
    expect(parseTime(input)).toBe(expected)
  })

  it.each([
    '',
    '   ',
    'abc',
    '25:00',
    '24:00',
    '9:75',
    '9:60',
    '13pm',
    '0am',
    '9:5',
    '12345',
    '9:30:00',
    '-1',
    'pm',
  ])('rejects %j', (input) => {
    expect(parseTime(input)).toBeNull()
  })

  it('recognises custom localised day-period labels', () => {
    const labels = { am: 'a. m.', pm: 'p. m.' }
    expect(parseTime('9:30 p. m.', { labels })).toBe(t(21, 30))
    expect(parseTime('12 a. m.', { labels })).toBe(0)
    // English forms keep working alongside custom labels.
    expect(parseTime('9:30pm', { labels })).toBe(t(21, 30))
  })
})

describe('formatTime', () => {
  it('defaults to a zero-padded 24-hour clock', () => {
    expect(formatTime(t(9, 30))).toBe('09:30')
    expect(formatTime(t(21, 5))).toBe('21:05')
    expect(formatTime(0)).toBe('00:00')
  })

  it('renders a 12-hour clock with day-period labels', () => {
    const opts = { hourCycle: 12 as const }
    expect(formatTime(0, opts)).toBe('12:00 AM')
    expect(formatTime(t(9, 30), opts)).toBe('9:30 AM')
    expect(formatTime(t(12), opts)).toBe('12:00 PM')
    expect(formatTime(t(21, 30), opts)).toBe('9:30 PM')
  })

  it('uses custom labels', () => {
    expect(formatTime(t(21), { hourCycle: 12, labels: { am: 'a. m.', pm: 'p. m.' } })).toBe(
      '9:00 p. m.',
    )
  })

  it('wraps values outside one day onto the clock face', () => {
    expect(formatTime(t(25))).toBe('01:00')
    expect(formatTime(-15)).toBe('23:45')
  })

  it('round-trips through parseTime for every minute of the day', () => {
    for (let m = 0; m <= TIME_PICKER_MAX_TIME; m++) {
      expect(parseTime(formatTime(m))).toBe(m)
      expect(parseTime(formatTime(m, { hourCycle: 12 }))).toBe(m)
    }
  })
})

describe('formatTimePickerDuration', () => {
  it.each([
    [0, '0 min'],
    [30, '30 min'],
    [60, '1 h'],
    [90, '1 h 30 min'],
    [150, '2 h 30 min'],
  ])('%i → %s', (minutes, label) => {
    expect(formatTimePickerDuration(minutes)).toBe(label)
  })
})

describe('resolveHourCycle', () => {
  it('reads the locale preference from Intl', () => {
    expect(resolveHourCycle('en-US')).toBe(12)
    expect(resolveHourCycle('en-GB')).toBe(24)
    expect(resolveHourCycle('de-DE')).toBe(24)
  })

  it('defaults server rendering to a fixed 12-hour locale', () => {
    expect(TIME_PICKER_DEFAULT_LOCALE).toBe('en-US')
    expect(resolveHourCycle(TIME_PICKER_DEFAULT_LOCALE)).toBe(12)
  })

  it('honours a Unicode hour-cycle extension', () => {
    expect(resolveHourCycle('en-US-u-hc-h23')).toBe(24)
    expect(resolveHourCycle('en-GB-u-hc-h12')).toBe(12)
  })
})

describe('clampTime / isTimeInRange', () => {
  it('clamps into the range (default: the whole day)', () => {
    expect(clampTime(-5)).toBe(0)
    expect(clampTime(2000)).toBe(TIME_PICKER_MAX_TIME)
    expect(clampTime(t(8), { min: t(9), max: t(17) })).toBe(t(9))
    expect(clampTime(t(18), { min: t(9), max: t(17) })).toBe(t(17))
  })

  it('checks inclusive bounds', () => {
    expect(isTimeInRange(t(9), { min: t(9), max: t(17) })).toBe(true)
    expect(isTimeInRange(t(17), { min: t(9), max: t(17) })).toBe(true)
    expect(isTimeInRange(t(17, 1), { min: t(9), max: t(17) })).toBe(false)
  })
})

describe('stepTime', () => {
  it('steps by the default 15 minutes', () => {
    expect(stepTime(t(10), 1)).toBe(t(10, 15))
    expect(stepTime(t(10), -1)).toBe(t(9, 45))
  })

  it('snaps off-grid values to the neighbouring grid line', () => {
    expect(stepTime(t(10, 7), 1)).toBe(t(10, 15))
    expect(stepTime(t(10, 7), -1)).toBe(t(10))
  })

  it('honours a custom step', () => {
    expect(stepTime(t(10), 1, { step: 30 })).toBe(t(10, 30))
    expect(stepTime(t(10), -1, { step: 5 })).toBe(t(9, 55))
  })

  it('anchors the grid to a start time', () => {
    expect(stepTime(t(10, 10), 1, { start: t(10, 10), step: 15 })).toBe(t(10, 25))
  })

  it('clamps to min and max', () => {
    const range = { min: t(9), max: t(17) }
    expect(stepTime(t(17), 1, range)).toBe(t(17))
    expect(stepTime(t(9), -1, range)).toBe(t(9))
    expect(stepTime(t(16, 50), 1, { ...range, step: 30 })).toBe(t(17))
    expect(stepTime(TIME_PICKER_MAX_TIME, 1)).toBe(TIME_PICKER_MAX_TIME)
    expect(stepTime(0, -1)).toBe(0)
  })

  it('starts an empty value at the range edge in the step direction', () => {
    expect(stepTime(null, 1, { min: t(9, 5) })).toBe(t(9, 15))
    expect(stepTime(null, -1, { max: t(17, 50) })).toBe(t(17, 45))
    expect(stepTime(null, 1)).toBe(0)
  })

  it.each([0, -15, 1.5, Number.NaN])('rejects step %s', (step) => {
    expect(() => stepTime(t(10), 1, { step })).toThrow(RangeError)
  })
})

describe('suggestTimes', () => {
  it('lists every 15 minutes across the day by default', () => {
    const options = suggestTimes()
    expect(options).toHaveLength(96)
    expect(options[0]).toMatchObject({ value: 0, label: '00:00', duration: null })
    expect(options.at(-1)?.value).toBe(t(23, 45))
  })

  it('respects step, min and max (inclusive, aligned to midnight)', () => {
    const values = suggestTimes({ step: 30, min: t(9, 10), max: t(11) }).map((o) => o.value)
    expect(values).toEqual([t(9, 30), t(10), t(10, 30), t(11)])
  })

  it('formats labels on a 12-hour clock', () => {
    const [first] = suggestTimes({ min: t(13), max: t(13), hourCycle: 12 })
    expect(first.label).toBe('1:00 PM')
  })

  it('adds durations relative to a start time, excluding the start itself', () => {
    const options = suggestTimes({ start: t(10), step: 30, max: t(11, 30) })
    expect(options.map((o) => o.label)).toEqual([
      '10:30 (30 min)',
      '11:00 (1 h)',
      '11:30 (1 h 30 min)',
    ])
    expect(options[0]).toMatchObject({ timeLabel: '10:30', duration: 30, durationLabel: '30 min' })
  })

  it('aligns to an off-grid start and still honours min', () => {
    const values = suggestTimes({ start: t(10, 10), step: 15, min: t(10, 30), max: t(11) }).map(
      (o) => o.value,
    )
    expect(values).toEqual([t(10, 40), t(10, 55)])
  })

  it('accepts a custom duration formatter', () => {
    const [first] = suggestTimes({
      start: t(10),
      step: 45,
      max: t(10, 45),
      formatDuration: (m) => `${m}m`,
    })
    expect(first.label).toBe('10:45 (45m)')
  })

  it('returns nothing for an empty range', () => {
    expect(suggestTimes({ min: t(12), max: t(11) })).toEqual([])
  })

  it('rejects a non-positive step', () => {
    expect(() => suggestTimes({ step: 0 })).toThrow(RangeError)
  })
})

describe('findNearestTimeOptionIndex', () => {
  const options = suggestTimes({ step: 30, min: t(9), max: t(10) })

  it('finds the closest option, earlier on a tie', () => {
    expect(findNearestTimeOptionIndex(options, t(9, 40))).toBe(1)
    expect(findNearestTimeOptionIndex(options, t(9, 15))).toBe(0)
    expect(findNearestTimeOptionIndex(options, t(23))).toBe(2)
  })

  it('returns -1 for no value or no options', () => {
    expect(findNearestTimeOptionIndex(options, null)).toBe(-1)
    expect(findNearestTimeOptionIndex([], t(9))).toBe(-1)
  })
})

describe('resolveTimeInput', () => {
  const range = { min: t(9), max: t(17) }

  it('treats blank text as clearing the value', () => {
    expect(resolveTimeInput('  ', range)).toEqual({ status: 'empty' })
  })

  it('accepts a parsable in-range time', () => {
    expect(resolveTimeInput('2pm', range)).toEqual({ status: 'valid', value: t(14) })
  })

  it('rejects unparseable and out-of-range entries with a reason', () => {
    expect(resolveTimeInput('9:75', range)).toEqual({ status: 'invalid', reason: 'unparseable' })
    expect(resolveTimeInput('8am', range)).toEqual({ status: 'invalid', reason: 'out-of-range' })
  })

  it('passes custom labels to the parser', () => {
    expect(resolveTimeInput('2 p. m.', { labels: { am: 'a. m.', pm: 'p. m.' } })).toEqual({
      status: 'valid',
      value: t(14),
    })
  })
})

describe('getTimePickerInvalidMessage', () => {
  it('gives an example for unparseable input in the active hour cycle', () => {
    expect(getTimePickerInvalidMessage('unparseable', { hourCycle: 12 })).toBe(
      'Enter a time like 9:30 AM.',
    )
    expect(getTimePickerInvalidMessage('unparseable')).toBe('Enter a time like 09:30.')
  })

  it('names the allowed range for out-of-range input', () => {
    expect(
      getTimePickerInvalidMessage('out-of-range', { min: t(9), max: t(17), hourCycle: 12 }),
    ).toBe('Choose a time between 9:00 AM and 5:00 PM.')
  })
})

describe('getTimePickerKeyAction', () => {
  it('steps with the arrows while the list is closed', () => {
    expect(getTimePickerKeyAction('ArrowUp', { open: false })).toBe('step-up')
    expect(getTimePickerKeyAction('ArrowDown', { open: false })).toBe('step-down')
  })

  it('moves the active option while the list is open', () => {
    expect(getTimePickerKeyAction('ArrowDown', { open: true })).toBe('next-option')
    expect(getTimePickerKeyAction('ArrowUp', { open: true })).toBe('previous-option')
  })

  it('opens with Alt+ArrowDown and closes with Alt+ArrowUp', () => {
    expect(getTimePickerKeyAction('ArrowDown', { open: false, altKey: true })).toBe('open')
    expect(getTimePickerKeyAction('ArrowUp', { open: true, altKey: true })).toBe('close')
    expect(getTimePickerKeyAction('ArrowDown', { open: true, altKey: true })).toBeNull()
    expect(getTimePickerKeyAction('ArrowUp', { open: false, altKey: true })).toBeNull()
  })

  it('commits on Enter and reverts on Escape in either state', () => {
    for (const open of [true, false]) {
      expect(getTimePickerKeyAction('Enter', { open })).toBe('commit')
      expect(getTimePickerKeyAction('Escape', { open })).toBe('revert')
    }
  })

  it('leaves other keys to the text field', () => {
    expect(getTimePickerKeyAction('a', { open: true })).toBeNull()
    expect(getTimePickerKeyAction('Home', { open: true })).toBeNull()
  })
})

describe('getNextTimeOptionIndex', () => {
  it('enters the list from either end', () => {
    expect(getNextTimeOptionIndex(-1, 'next-option', 5)).toBe(0)
    expect(getNextTimeOptionIndex(-1, 'previous-option', 5)).toBe(4)
  })

  it('moves and clamps at the ends', () => {
    expect(getNextTimeOptionIndex(2, 'next-option', 5)).toBe(3)
    expect(getNextTimeOptionIndex(4, 'next-option', 5)).toBe(4)
    expect(getNextTimeOptionIndex(0, 'previous-option', 5)).toBe(0)
  })

  it('returns -1 for an empty list', () => {
    expect(getNextTimeOptionIndex(0, 'next-option', 0)).toBe(-1)
  })
})

describe('createTimePicker', () => {
  it('builds closed combobox ARIA', () => {
    const api = createTimePicker({ open: false, invalid: false, listboxId: 'list' })
    expect(api.inputAriaProps).toEqual({
      role: 'combobox',
      'aria-autocomplete': 'list',
      'aria-haspopup': 'listbox',
      'aria-expanded': false,
      'aria-controls': 'list',
    })
    expect(api.listboxAriaProps).toEqual({ role: 'listbox' })
    expect(api.dataAttributes).toEqual({ 'data-state': 'closed' })
  })

  it('points at the active option only while open', () => {
    const open = createTimePicker({ open: true, invalid: false, listboxId: 'l', activeOptionId: 'o' })
    expect(open.inputAriaProps['aria-activedescendant']).toBe('o')
    const closed = createTimePicker({ open: false, invalid: false, listboxId: 'l', activeOptionId: 'o' })
    expect(closed.inputAriaProps['aria-activedescendant']).toBeUndefined()
  })

  it('marks an invalid entry and links the message', () => {
    const api = createTimePicker({ open: false, invalid: true, listboxId: 'l', messageId: 'm' })
    expect(api.inputAriaProps['aria-invalid']).toBe(true)
    expect(api.inputAriaProps['aria-describedby']).toBe('m')
    expect(api.dataAttributes['data-invalid']).toBe('')
  })
})

describe('styles', () => {
  it('switches the input border on the string invalid variant', () => {
    expect(timePickerInputVariants({ invalid: 'true' })).toContain('border-destructive')
    expect(timePickerInputVariants()).toContain('border-input')
    expect(timePickerInputVariants()).toContain('focus-visible:ring-2')
  })

  it('weights the selected option', () => {
    expect(timePickerOptionVariants({ selected: 'true' })).toContain('font-medium')
  })
})
