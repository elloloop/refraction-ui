import type { AccessibilityProps, KeyboardHandlerMap } from '@refraction-ui/shared'
import { generateId, Keys } from '@refraction-ui/shared'

export type DatePickerView = 'calendar' | 'time'

export interface DatePickerProps {
  /** Selected date (controlled) */
  value?: Date
  /** Callback when value changes */
  onChange?: (date: Date) => void
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Show time selection */
  showTime?: boolean
  /** Display format string */
  format?: string
  /** Placeholder text */
  placeholder?: string
  /** Whether the picker is open (controlled) */
  open?: boolean
  /** Default open state */
  defaultOpen?: boolean
  /** Callback when open changes */
  onOpenChange?: (open: boolean) => void
}

export interface DatePickerState {
  open: boolean
  selectedDate: Date | undefined
  view: DatePickerView
  hours: number
  minutes: number
  currentMonth: Date
}

export interface CalendarDay {
  date: Date
  isToday: boolean
  isSelected: boolean
  isCurrentMonth: boolean
  isDisabled: boolean
}

export interface DatePickerAPI {
  /** Current state */
  state: DatePickerState
  /** Calendar days grid (42 cells) */
  days: CalendarDay[]
  /** Open the picker */
  openPicker(): void
  /** Close the picker */
  closePicker(): void
  /** Toggle the picker */
  togglePicker(): void
  /** Select a date from calendar */
  selectDate(date: Date): void
  /** Set hours */
  setHours(hours: number): void
  /** Set minutes */
  setMinutes(minutes: number): void
  /** Navigate to previous month */
  prevMonth(): void
  /** Navigate to next month */
  nextMonth(): void
  /** Switch between calendar and time views */
  setView(view: DatePickerView): void
  /** Format the selected date for display */
  formatDisplay(): string
  /** ARIA attributes for the trigger input */
  triggerProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** ARIA attributes for the dropdown */
  dropdownProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** ARIA props for the calendar grid */
  gridProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** Get ARIA props for a day cell */
  getDayAriaProps(day: CalendarDay): Partial<AccessibilityProps> & Record<string, unknown>
  /** Keyboard handlers */
  keyboardHandlers: KeyboardHandlerMap
  /** Generated IDs */
  ids: {
    trigger: string
    dropdown: string
    grid: string
    label: string
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

export function formatDate(date: Date | undefined, format: string, showTime: boolean): string {
  if (!date) return ''
  const year = date.getFullYear()
  const month = padZero(date.getMonth() + 1)
  const day = padZero(date.getDate())
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())

  let result = format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)

  if (showTime) {
    result = result.replace('HH', hours).replace('mm', minutes)
  }

  return result
}

export function createDatePicker(props: DatePickerProps = {}): DatePickerAPI {
  const {
    value,
    onChange,
    minDate,
    maxDate,
    showTime = false,
    format = showTime ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD',
    placeholder = 'Select date...',
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
  } = props

  const today = new Date()
  let internalOpen = controlledOpen ?? defaultOpen
  let currentMonth = value ? startOfMonth(value) : startOfMonth(today)
  let view: DatePickerView = 'calendar'
  const hours = value ? value.getHours() : 0
  const minutes = value ? value.getMinutes() : 0

  const triggerId = generateId('rfr-datepicker-trigger')
  const dropdownId = generateId('rfr-datepicker-dropdown')
  const gridId = generateId('rfr-datepicker-grid')
  const labelId = generateId('rfr-datepicker-label')

  function isOpen(): boolean {
    if (controlledOpen !== undefined) return controlledOpen
    return internalOpen
  }

  function isDateDisabled(date: Date): boolean {
    if (minDate && date < startOfDay(minDate)) return true
    if (maxDate && date > endOfDay(maxDate)) return true
    return false
  }

  function buildDays(): CalendarDay[] {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const first = new Date(year, month, 1)
    const startDow = first.getDay()
    const gridStart = new Date(year, month, 1 - startDow)

    const days: CalendarDay[] = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + i,
      )
      days.push({
        date,
        isToday: isSameDay(date, today),
        isSelected: value ? isSameDay(date, value) : false,
        isCurrentMonth: date.getMonth() === month,
        isDisabled: isDateDisabled(date),
      })
    }
    return days
  }

  function openPicker(): void {
    internalOpen = true
    onOpenChange?.(true)
  }

  function closePicker(): void {
    internalOpen = false
    onOpenChange?.(false)
  }

  function togglePicker(): void {
    if (isOpen()) {
      closePicker()
    } else {
      openPicker()
    }
  }

  function selectDate(date: Date): void {
    if (isDateDisabled(date)) return
    const newDate = new Date(date)
    if (value) {
      newDate.setHours(value.getHours())
      newDate.setMinutes(value.getMinutes())
    }
    onChange?.(newDate)
    if (!showTime) {
      closePicker()
    }
  }

  function setHours(h: number): void {
    if (h < 0 || h > 23) return
    const newDate = value ? new Date(value) : new Date()
    newDate.setHours(h)
    onChange?.(newDate)
  }

  function setMinutes(m: number): void {
    if (m < 0 || m > 59) return
    const newDate = value ? new Date(value) : new Date()
    newDate.setMinutes(m)
    onChange?.(newDate)
  }

  function prevMonth(): void {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
  }

  function nextMonth(): void {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
  }

  function setView(v: DatePickerView): void {
    view = v
  }

  function formatDisplay(): string {
    return value ? formatDate(value, format, showTime) : placeholder
  }

  const keyboardHandlers: KeyboardHandlerMap = {
    [Keys.Escape]: (e) => {
      e.preventDefault()
      closePicker()
    },
  }

  const triggerProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    'aria-expanded': isOpen(),
    'aria-controls': dropdownId,
    'aria-haspopup': 'dialog',
    id: triggerId,
    role: 'combobox',
  }

  const dropdownProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': labelId,
    id: dropdownId,
  }

  const gridProps: Partial<AccessibilityProps> & Record<string, unknown> = {
    role: 'grid',
    'aria-labelledby': labelId,
    id: gridId,
  }

  function getDayAriaProps(day: CalendarDay): Partial<AccessibilityProps> & Record<string, unknown> {
    return {
      role: 'gridcell',
      'aria-selected': day.isSelected,
      'aria-disabled': day.isDisabled,
      'aria-current': day.isToday ? ('date' as const) : undefined,
      'aria-label': `${DAY_NAMES[day.date.getDay()]}, ${day.date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`,
    }
  }

  return {
    state: {
      open: isOpen(),
      selectedDate: value,
      view,
      hours,
      minutes,
      currentMonth,
    },
    days: buildDays(),
    openPicker,
    closePicker,
    togglePicker,
    selectDate,
    setHours,
    setMinutes,
    prevMonth,
    nextMonth,
    setView,
    formatDisplay,
    triggerProps,
    dropdownProps,
    gridProps,
    getDayAriaProps,
    keyboardHandlers,
    ids: {
      trigger: triggerId,
      dropdown: dropdownId,
      grid: gridId,
      label: labelId,
    },
  }
}
