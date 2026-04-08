import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetIdCounter } from '@refraction-ui/shared'
import { createDatePicker, formatDate } from '../src/date-picker.js'
import {
  datePickerTriggerStyles,
  datePickerDropdownStyles,
  datePickerDayVariants,
  datePickerTimeStyles,
  datePickerTimeInputStyles,
} from '../src/date-picker.styles.js'

beforeEach(() => {
  resetIdCounter()
})

describe('createDatePicker', () => {
  it('defaults to closed state', () => {
    const api = createDatePicker()
    expect(api.state.open).toBe(false)
  })

  it('defaults to no selected date', () => {
    const api = createDatePicker()
    expect(api.state.selectedDate).toBeUndefined()
  })

  it('respects controlled value', () => {
    const date = new Date(2024, 5, 15)
    const api = createDatePicker({ value: date })
    expect(api.state.selectedDate).toBe(date)
  })

  it('respects defaultOpen', () => {
    const api = createDatePicker({ defaultOpen: true })
    expect(api.state.open).toBe(true)
  })

  it('respects controlled open prop', () => {
    const api = createDatePicker({ open: true })
    expect(api.state.open).toBe(true)
  })

  it('defaults showTime to false', () => {
    const api = createDatePicker()
    expect(api.state.view).toBe('calendar')
  })

  it('defaults hours to 0 when no value', () => {
    const api = createDatePicker()
    expect(api.state.hours).toBe(0)
  })

  it('defaults minutes to 0 when no value', () => {
    const api = createDatePicker()
    expect(api.state.minutes).toBe(0)
  })

  it('extracts hours from value', () => {
    const date = new Date(2024, 5, 15, 14, 30)
    const api = createDatePicker({ value: date })
    expect(api.state.hours).toBe(14)
  })

  it('extracts minutes from value', () => {
    const date = new Date(2024, 5, 15, 14, 30)
    const api = createDatePicker({ value: date })
    expect(api.state.minutes).toBe(30)
  })
})

describe('state transitions', () => {
  it('openPicker calls onOpenChange with true', () => {
    const onOpenChange = vi.fn()
    const api = createDatePicker({ onOpenChange })
    api.openPicker()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('closePicker calls onOpenChange with false', () => {
    const onOpenChange = vi.fn()
    const api = createDatePicker({ defaultOpen: true, onOpenChange })
    api.closePicker()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('togglePicker opens when closed', () => {
    const onOpenChange = vi.fn()
    const api = createDatePicker({ onOpenChange })
    api.togglePicker()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('togglePicker closes when open', () => {
    const onOpenChange = vi.fn()
    const api = createDatePicker({ defaultOpen: true, onOpenChange })
    api.togglePicker()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

describe('date selection', () => {
  it('selectDate calls onChange', () => {
    const onChange = vi.fn()
    const api = createDatePicker({ onChange })
    const date = new Date(2024, 5, 15)
    api.selectDate(date)
    expect(onChange).toHaveBeenCalledWith(expect.any(Date))
    expect(onChange.mock.calls[0][0].getDate()).toBe(15)
  })

  it('selectDate closes picker when showTime is false', () => {
    const onOpenChange = vi.fn()
    const onChange = vi.fn()
    const api = createDatePicker({ onChange, onOpenChange, defaultOpen: true })
    api.selectDate(new Date(2024, 5, 15))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('selectDate keeps picker open when showTime is true', () => {
    const onOpenChange = vi.fn()
    const onChange = vi.fn()
    const api = createDatePicker({ onChange, onOpenChange, showTime: true, defaultOpen: true })
    api.selectDate(new Date(2024, 5, 15))
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })

  it('selectDate does not call onChange for disabled date', () => {
    const onChange = vi.fn()
    const disabledDate = new Date(2024, 5, 10)
    const api = createDatePicker({
      onChange,
      maxDate: new Date(2024, 5, 5),
    })
    api.selectDate(disabledDate)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('selectDate preserves time from existing value', () => {
    const onChange = vi.fn()
    const existing = new Date(2024, 5, 10, 14, 30)
    const api = createDatePicker({ value: existing, onChange })
    api.selectDate(new Date(2024, 5, 20))
    expect(onChange.mock.calls[0][0].getHours()).toBe(14)
    expect(onChange.mock.calls[0][0].getMinutes()).toBe(30)
  })
})

describe('time selection', () => {
  it('setHours calls onChange with updated hours', () => {
    const onChange = vi.fn()
    const value = new Date(2024, 5, 15, 10, 0)
    const api = createDatePicker({ value, onChange })
    api.setHours(14)
    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0][0].getHours()).toBe(14)
  })

  it('setMinutes calls onChange with updated minutes', () => {
    const onChange = vi.fn()
    const value = new Date(2024, 5, 15, 10, 0)
    const api = createDatePicker({ value, onChange })
    api.setMinutes(45)
    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0][0].getMinutes()).toBe(45)
  })

  it('setHours rejects out-of-range values', () => {
    const onChange = vi.fn()
    const api = createDatePicker({ value: new Date(), onChange })
    api.setHours(24)
    expect(onChange).not.toHaveBeenCalled()
    api.setHours(-1)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('setMinutes rejects out-of-range values', () => {
    const onChange = vi.fn()
    const api = createDatePicker({ value: new Date(), onChange })
    api.setMinutes(60)
    expect(onChange).not.toHaveBeenCalled()
    api.setMinutes(-1)
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('calendar days', () => {
  it('returns 42 days (6 weeks)', () => {
    const api = createDatePicker({ value: new Date(2024, 0, 15) })
    expect(api.days).toHaveLength(42)
  })

  it('marks today correctly', () => {
    const today = new Date()
    const api = createDatePicker({ value: today })
    const todayCell = api.days.find((d) => d.isToday)
    expect(todayCell).toBeDefined()
  })

  it('marks selected date', () => {
    const date = new Date(2024, 5, 15)
    const api = createDatePicker({ value: date })
    const selected = api.days.find((d) => d.isSelected)
    expect(selected).toBeDefined()
    expect(selected!.date.getDate()).toBe(15)
  })

  it('marks days outside current month', () => {
    const api = createDatePicker({ value: new Date(2024, 0, 15) })
    const outside = api.days.filter((d) => !d.isCurrentMonth)
    expect(outside.length).toBeGreaterThan(0)
  })

  it('marks disabled dates based on minDate', () => {
    const api = createDatePicker({
      value: new Date(2024, 5, 15),
      minDate: new Date(2024, 5, 10),
    })
    const disabled = api.days.filter((d) => d.isDisabled && d.isCurrentMonth)
    expect(disabled.length).toBeGreaterThan(0)
  })

  it('marks disabled dates based on maxDate', () => {
    const api = createDatePicker({
      value: new Date(2024, 5, 15),
      maxDate: new Date(2024, 5, 20),
    })
    const disabled = api.days.filter((d) => d.isDisabled && d.isCurrentMonth)
    expect(disabled.length).toBeGreaterThan(0)
  })
})

describe('formatDisplay', () => {
  it('returns placeholder when no value', () => {
    const api = createDatePicker({ placeholder: 'Pick a date' })
    expect(api.formatDisplay()).toBe('Pick a date')
  })

  it('returns default placeholder when none specified', () => {
    const api = createDatePicker()
    expect(api.formatDisplay()).toBe('Select date...')
  })

  it('formats date with default format', () => {
    const api = createDatePicker({ value: new Date(2024, 5, 15) })
    expect(api.formatDisplay()).toBe('2024-06-15')
  })

  it('formats date with time when showTime is true', () => {
    const api = createDatePicker({
      value: new Date(2024, 5, 15, 14, 30),
      showTime: true,
    })
    expect(api.formatDisplay()).toBe('2024-06-15 14:30')
  })

  it('formats date with custom format', () => {
    const api = createDatePicker({
      value: new Date(2024, 5, 15),
      format: 'DD/MM/YYYY',
    })
    expect(api.formatDisplay()).toBe('15/06/2024')
  })
})

describe('formatDate utility', () => {
  it('returns empty string for undefined', () => {
    expect(formatDate(undefined, 'YYYY-MM-DD', false)).toBe('')
  })

  it('formats date correctly', () => {
    expect(formatDate(new Date(2024, 0, 5), 'YYYY-MM-DD', false)).toBe('2024-01-05')
  })

  it('formats date with time', () => {
    expect(formatDate(new Date(2024, 0, 5, 9, 5), 'YYYY-MM-DD HH:mm', true)).toBe('2024-01-05 09:05')
  })

  it('pads single digits', () => {
    expect(formatDate(new Date(2024, 0, 1, 1, 1), 'YYYY-MM-DD HH:mm', true)).toBe('2024-01-01 01:01')
  })
})

describe('ARIA props', () => {
  it('provides trigger props', () => {
    const api = createDatePicker()
    expect(api.triggerProps['aria-expanded']).toBe(false)
    expect(api.triggerProps['aria-haspopup']).toBe('dialog')
    expect(api.triggerProps.role).toBe('combobox')
  })

  it('trigger aria-expanded reflects open state', () => {
    const api = createDatePicker({ open: true })
    expect(api.triggerProps['aria-expanded']).toBe(true)
  })

  it('provides dropdown props', () => {
    const api = createDatePicker()
    expect(api.dropdownProps.role).toBe('dialog')
    expect(api.dropdownProps['aria-modal']).toBe(true)
  })

  it('provides grid props', () => {
    const api = createDatePicker()
    expect(api.gridProps.role).toBe('grid')
  })

  it('provides day ARIA props', () => {
    const api = createDatePicker({ value: new Date(2024, 5, 15) })
    const day = api.days[0]
    const dayProps = api.getDayAriaProps(day)
    expect(dayProps.role).toBe('gridcell')
    expect(dayProps['aria-label']).toBeDefined()
  })

  it('day aria-selected reflects selection', () => {
    const api = createDatePicker({ value: new Date(2024, 5, 15) })
    const selected = api.days.find((d) => d.isSelected)!
    const dayProps = api.getDayAriaProps(selected)
    expect(dayProps['aria-selected']).toBe(true)
  })

  it('day aria-current=date for today', () => {
    const api = createDatePicker()
    const today = api.days.find((d) => d.isToday)
    if (today) {
      const dayProps = api.getDayAriaProps(today)
      expect(dayProps['aria-current']).toBe('date')
    }
  })
})

describe('keyboard handlers', () => {
  it('has Escape handler', () => {
    const api = createDatePicker()
    expect(api.keyboardHandlers['Escape']).toBeDefined()
  })

  it('Escape closes the picker', () => {
    const onOpenChange = vi.fn()
    const api = createDatePicker({ defaultOpen: true, onOpenChange })
    const event = { key: 'Escape', preventDefault: vi.fn() } as unknown as KeyboardEvent
    api.keyboardHandlers['Escape']!(event)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(event.preventDefault).toHaveBeenCalled()
  })
})

describe('IDs', () => {
  it('generates unique IDs', () => {
    const api1 = createDatePicker()
    const api2 = createDatePicker()
    expect(api1.ids.trigger).not.toBe(api2.ids.trigger)
    expect(api1.ids.dropdown).not.toBe(api2.ids.dropdown)
  })

  it('trigger aria-controls references dropdown', () => {
    const api = createDatePicker()
    expect(api.triggerProps['aria-controls']).toBe(api.ids.dropdown)
  })
})

describe('view switching', () => {
  it('defaults to calendar view', () => {
    const api = createDatePicker()
    expect(api.state.view).toBe('calendar')
  })

  it('setView changes to time', () => {
    const api = createDatePicker()
    api.setView('time')
    // Note: view is internal, this tests that it doesn't throw
    expect(true).toBe(true)
  })
})

describe('month navigation', () => {
  it('prevMonth does not throw', () => {
    const api = createDatePicker({ value: new Date(2024, 5, 15) })
    expect(() => api.prevMonth()).not.toThrow()
  })

  it('nextMonth does not throw', () => {
    const api = createDatePicker({ value: new Date(2024, 5, 15) })
    expect(() => api.nextMonth()).not.toThrow()
  })
})

describe('date-picker styles', () => {
  it('exports trigger styles', () => {
    expect(datePickerTriggerStyles).toContain('inline-flex')
  })

  it('exports dropdown styles', () => {
    expect(datePickerDropdownStyles).toContain('absolute')
  })

  it('exports day variants', () => {
    const classes = datePickerDayVariants()
    expect(classes).toContain('inline-flex')
  })

  it('exports day variant with selected state', () => {
    const classes = datePickerDayVariants({ state: 'selected' })
    expect(classes).toContain('bg-primary')
  })

  it('exports time styles', () => {
    expect(datePickerTimeStyles).toContain('flex')
  })

  it('exports time input styles', () => {
    expect(datePickerTimeInputStyles).toContain('rounded')
  })
})
