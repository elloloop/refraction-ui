import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@elloloop/shared'
import { createCalendar } from '../src/calendar.js'
import { calendarVariants, dayVariants } from '../src/calendar.styles.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createCalendar', () => {
  it('defaults to current month when no props', () => {
    const api = createCalendar()
    const now = new Date()
    expect(api.state.currentMonth.getMonth()).toBe(now.getMonth())
    expect(api.state.currentMonth.getFullYear()).toBe(now.getFullYear())
  })

  it('defaults selectedDate to undefined', () => {
    const api = createCalendar()
    expect(api.state.selectedDate).toBeUndefined()
  })

  it('respects value prop for selectedDate', () => {
    const date = new Date(2025, 5, 15)
    const api = createCalendar({ value: date })
    expect(api.state.selectedDate).toBe(date)
  })

  it('respects defaultValue prop', () => {
    const date = new Date(2025, 3, 10)
    const api = createCalendar({ defaultValue: date })
    expect(api.state.selectedDate).toBe(date)
  })

  it('respects month prop for currentMonth', () => {
    const month = new Date(2024, 0, 1)
    const api = createCalendar({ month })
    expect(api.state.currentMonth.getMonth()).toBe(0)
    expect(api.state.currentMonth.getFullYear()).toBe(2024)
  })
})

describe('day generation', () => {
  it('generates exactly 42 days (6 weeks)', () => {
    const api = createCalendar({ month: new Date(2025, 0, 1) })
    expect(api.days).toHaveLength(42)
  })

  it('marks days in the current month', () => {
    const api = createCalendar({ month: new Date(2025, 0, 1) })
    const janDays = api.days.filter((d) => d.isCurrentMonth)
    expect(janDays).toHaveLength(31) // January has 31 days
  })

  it('marks days outside the current month', () => {
    const api = createCalendar({ month: new Date(2025, 0, 1) })
    const outsideDays = api.days.filter((d) => !d.isCurrentMonth)
    expect(outsideDays.length).toBe(42 - 31) // 42 total - 31 jan days
  })

  it('marks today correctly', () => {
    const today = new Date()
    const api = createCalendar({ month: today })
    const todayDays = api.days.filter((d) => d.isToday)
    expect(todayDays).toHaveLength(1)
    expect(todayDays[0].date.getDate()).toBe(today.getDate())
  })

  it('marks selected date', () => {
    const value = new Date(2025, 5, 15)
    const api = createCalendar({ value, month: new Date(2025, 5, 1) })
    const selected = api.days.filter((d) => d.isSelected)
    expect(selected).toHaveLength(1)
    expect(selected[0].date.getDate()).toBe(15)
  })

  it('starts the grid on a Sunday', () => {
    const api = createCalendar({ month: new Date(2025, 0, 1) })
    expect(api.days[0].date.getDay()).toBe(0) // Sunday
  })
})

describe('navigation', () => {
  it('calls onMonthChange with previous month on prevMonth', () => {
    const onMonthChange = vi.fn()
    const api = createCalendar({ month: new Date(2025, 5, 1), onMonthChange })
    api.prevMonth()
    expect(onMonthChange).toHaveBeenCalledTimes(1)
    const called = onMonthChange.mock.calls[0][0] as Date
    expect(called.getMonth()).toBe(4) // May
    expect(called.getFullYear()).toBe(2025)
  })

  it('calls onMonthChange with next month on nextMonth', () => {
    const onMonthChange = vi.fn()
    const api = createCalendar({ month: new Date(2025, 5, 1), onMonthChange })
    api.nextMonth()
    expect(onMonthChange).toHaveBeenCalledTimes(1)
    const called = onMonthChange.mock.calls[0][0] as Date
    expect(called.getMonth()).toBe(6) // July
    expect(called.getFullYear()).toBe(2025)
  })

  it('wraps from January to December of previous year', () => {
    const onMonthChange = vi.fn()
    const api = createCalendar({ month: new Date(2025, 0, 1), onMonthChange })
    api.prevMonth()
    const called = onMonthChange.mock.calls[0][0] as Date
    expect(called.getMonth()).toBe(11) // December
    expect(called.getFullYear()).toBe(2024)
  })

  it('wraps from December to January of next year', () => {
    const onMonthChange = vi.fn()
    const api = createCalendar({ month: new Date(2025, 11, 1), onMonthChange })
    api.nextMonth()
    const called = onMonthChange.mock.calls[0][0] as Date
    expect(called.getMonth()).toBe(0) // January
    expect(called.getFullYear()).toBe(2026)
  })
})

describe('selection', () => {
  it('calls onSelect when selecting a date', () => {
    const onSelect = vi.fn()
    const api = createCalendar({ onSelect, month: new Date(2025, 5, 1) })
    const date = new Date(2025, 5, 15)
    api.select(date)
    expect(onSelect).toHaveBeenCalledWith(date)
  })

  it('does not call onSelect for disabled dates', () => {
    const onSelect = vi.fn()
    const disabled = new Date(2025, 5, 15)
    const api = createCalendar({
      onSelect,
      month: new Date(2025, 5, 1),
      disabledDates: [disabled],
    })
    api.select(disabled)
    expect(onSelect).not.toHaveBeenCalled()
  })
})

describe('disabled dates', () => {
  it('marks specific disabled dates', () => {
    const disabled = [new Date(2025, 5, 10), new Date(2025, 5, 20)]
    const api = createCalendar({
      month: new Date(2025, 5, 1),
      disabledDates: disabled,
    })
    const disabledDays = api.days.filter((d) => d.isDisabled)
    expect(disabledDays.some((d) => d.date.getDate() === 10 && d.date.getMonth() === 5)).toBe(true)
    expect(disabledDays.some((d) => d.date.getDate() === 20 && d.date.getMonth() === 5)).toBe(true)
  })

  it('marks dates before minDate as disabled', () => {
    const api = createCalendar({
      month: new Date(2025, 5, 1),
      minDate: new Date(2025, 5, 10),
    })
    const june9 = api.days.find(
      (d) => d.date.getDate() === 9 && d.date.getMonth() === 5,
    )
    const june10 = api.days.find(
      (d) => d.date.getDate() === 10 && d.date.getMonth() === 5,
    )
    expect(june9?.isDisabled).toBe(true)
    expect(june10?.isDisabled).toBe(false)
  })

  it('marks dates after maxDate as disabled', () => {
    const api = createCalendar({
      month: new Date(2025, 5, 1),
      maxDate: new Date(2025, 5, 20),
    })
    const june20 = api.days.find(
      (d) => d.date.getDate() === 20 && d.date.getMonth() === 5,
    )
    const june21 = api.days.find(
      (d) => d.date.getDate() === 21 && d.date.getMonth() === 5,
    )
    expect(june20?.isDisabled).toBe(false)
    expect(june21?.isDisabled).toBe(true)
  })
})

describe('ARIA props', () => {
  it('provides grid aria props', () => {
    const api = createCalendar()
    expect(api.ariaProps.role).toBe('grid')
    expect(api.ariaProps['aria-labelledby']).toBe(api.ids.label)
    expect(api.ariaProps.id).toBe(api.ids.grid)
  })

  it('provides day aria props', () => {
    const api = createCalendar({ month: new Date(2025, 5, 1) })
    const day = api.days.find((d) => d.date.getDate() === 15 && d.isCurrentMonth)!
    const dayProps = api.getDayAriaProps(day)
    expect(dayProps.role).toBe('gridcell')
    expect(dayProps['aria-selected']).toBe(false)
    expect(dayProps['aria-disabled']).toBe(false)
    expect(dayProps['aria-label']).toContain('June')
    expect(dayProps['aria-label']).toContain('15')
  })

  it('marks today with aria-current=date', () => {
    const today = new Date()
    const api = createCalendar({ month: today })
    const todayDay = api.days.find((d) => d.isToday)!
    const dayProps = api.getDayAriaProps(todayDay)
    expect(dayProps['aria-current']).toBe('date')
  })

  it('marks selected day with aria-selected=true', () => {
    const value = new Date(2025, 5, 15)
    const api = createCalendar({ value, month: new Date(2025, 5, 1) })
    const selected = api.days.find((d) => d.isSelected)!
    const dayProps = api.getDayAriaProps(selected)
    expect(dayProps['aria-selected']).toBe(true)
  })

  it('marks disabled day with aria-disabled=true', () => {
    const disabled = [new Date(2025, 5, 15)]
    const api = createCalendar({
      month: new Date(2025, 5, 1),
      disabledDates: disabled,
    })
    const disDay = api.days.find(
      (d) => d.date.getDate() === 15 && d.date.getMonth() === 5,
    )!
    const dayProps = api.getDayAriaProps(disDay)
    expect(dayProps['aria-disabled']).toBe(true)
  })

  it('generates unique IDs', () => {
    const api = createCalendar()
    expect(api.ids.grid).toMatch(/^rfr-calendar-/)
    expect(api.ids.label).toMatch(/^rfr-calendar-label-/)
    expect(api.ids.grid).not.toBe(api.ids.label)
  })
})

describe('calendar styles', () => {
  it('exports calendarVariants', () => {
    const classes = calendarVariants()
    expect(classes).toContain('p-3')
    expect(classes).toContain('rounded-md')
  })

  it('exports dayVariants with states', () => {
    expect(dayVariants({ state: 'selected' })).toContain('bg-primary')
    expect(dayVariants({ state: 'today' })).toContain('bg-accent')
    expect(dayVariants({ state: 'disabled' })).toContain('cursor-not-allowed')
    expect(dayVariants({ state: 'outside' })).toContain('opacity-50')
    expect(dayVariants({ state: 'default' })).toContain('hover:bg-accent')
  })
})
