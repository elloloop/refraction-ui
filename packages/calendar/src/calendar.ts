import type { AccessibilityProps } from '@elloloop/shared'
import { generateId } from '@elloloop/shared'

export interface CalendarProps {
  /** Selected date (controlled) */
  value?: Date
  /** Default selected date (uncontrolled) */
  defaultValue?: Date
  /** Callback when a date is selected */
  onSelect?: (date: Date) => void
  /** Displayed month (controlled) */
  month?: Date
  /** Callback when the displayed month changes */
  onMonthChange?: (month: Date) => void
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Specific dates to disable */
  disabledDates?: Date[]
}

export interface CalendarDay {
  /** The date this cell represents */
  date: Date
  /** Whether the date is today */
  isToday: boolean
  /** Whether the date is currently selected */
  isSelected: boolean
  /** Whether the date belongs to the currently displayed month */
  isCurrentMonth: boolean
  /** Whether the date is disabled */
  isDisabled: boolean
}

export interface CalendarState {
  /** The currently displayed month */
  currentMonth: Date
  /** The currently selected date, if any */
  selectedDate: Date | undefined
}

export interface CalendarAPI {
  /** Current calendar state */
  state: CalendarState
  /** Array of day objects for the current month grid (always 42: 6 weeks x 7 days) */
  days: CalendarDay[]
  /** Navigate to the previous month */
  prevMonth(): void
  /** Navigate to the next month */
  nextMonth(): void
  /** Select a date */
  select(date: Date): void
  /** ARIA attributes for the calendar grid */
  ariaProps: Partial<AccessibilityProps> & Record<string, unknown>
  /** Get ARIA attributes for a specific day cell */
  getDayAriaProps(day: CalendarDay): Partial<AccessibilityProps> & Record<string, unknown>
  /** Generated IDs */
  ids: {
    grid: string
    label: string
  }
}

/** Check if two dates represent the same calendar day */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Get the first day of a month */
function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/** Get day names */
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function createCalendar(props: CalendarProps = {}): CalendarAPI {
  const {
    value: controlledValue,
    defaultValue,
    onSelect,
    month: controlledMonth,
    onMonthChange,
    minDate,
    maxDate,
    disabledDates = [],
  } = props

  const today = new Date()

  // Determine selected date
  const selectedDate = controlledValue ?? defaultValue

  // Determine current displayed month
  const currentMonth = controlledMonth
    ? startOfMonth(controlledMonth)
    : selectedDate
      ? startOfMonth(selectedDate)
      : startOfMonth(today)

  const gridId = generateId('rfr-calendar')
  const labelId = generateId('rfr-calendar-label')

  function isDateDisabled(date: Date): boolean {
    if (minDate && date < startOfDay(minDate)) return true
    if (maxDate && date > endOfDay(maxDate)) return true
    return disabledDates.some((d) => isSameDay(d, date))
  }

  function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  function endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
  }

  /** Build the 42-cell grid for the current month view */
  function buildDays(): CalendarDay[] {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const first = new Date(year, month, 1)
    // Day of week the month starts on (0 = Sunday)
    const startDow = first.getDay()

    // Start from the Sunday before (or on) the first
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
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        isCurrentMonth: date.getMonth() === month,
        isDisabled: isDateDisabled(date),
      })
    }
    return days
  }

  function prevMonth(): void {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    onMonthChange?.(prev)
  }

  function nextMonth(): void {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    onMonthChange?.(next)
  }

  function select(date: Date): void {
    if (!isDateDisabled(date)) {
      onSelect?.(date)
    }
  }

  const ariaProps: Partial<AccessibilityProps> & Record<string, unknown> = {
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
      'aria-label': `${DAY_NAMES[day.date.getDay()]}, ${day.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    }
  }

  return {
    state: {
      currentMonth,
      selectedDate,
    },
    days: buildDays(),
    prevMonth,
    nextMonth,
    select,
    ariaProps,
    getDayAriaProps,
    ids: {
      grid: gridId,
      label: labelId,
    },
  }
}
