import * as React from 'react'
import {
  createCalendar,
  calendarVariants,
  dayVariants,
  type CalendarProps as CoreCalendarProps,
  type CalendarDay,
} from '@refraction-ui/calendar'
import { cn } from '@refraction-ui/shared'

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export interface CalendarProps extends CoreCalendarProps {
  className?: string
  children?: React.ReactNode
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function Calendar({
  className,
  value,
  defaultValue,
  onSelect,
  month,
  onMonthChange,
  minDate,
  maxDate,
  disabledDates,
}: CalendarProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState<Date | undefined>(defaultValue)
  const [uncontrolledMonth, setUncontrolledMonth] = React.useState<Date>(
    () => month ?? value ?? defaultValue ?? new Date(),
  )

  const isValueControlled = value !== undefined
  const isMonthControlled = month !== undefined

  const selectedValue = isValueControlled ? value : uncontrolledValue
  const displayMonth = isMonthControlled ? month : uncontrolledMonth

  const handleSelect = React.useCallback(
    (date: Date) => {
      if (!isValueControlled) {
        setUncontrolledValue(date)
      }
      onSelect?.(date)
    },
    [isValueControlled, onSelect],
  )

  const handleMonthChange = React.useCallback(
    (m: Date) => {
      if (!isMonthControlled) {
        setUncontrolledMonth(m)
      }
      onMonthChange?.(m)
    },
    [isMonthControlled, onMonthChange],
  )

  const api = createCalendar({
    value: selectedValue,
    month: displayMonth,
    onSelect: handleSelect,
    onMonthChange: handleMonthChange,
    minDate,
    maxDate,
    disabledDates,
  })

  function getDayState(day: CalendarDay): 'selected' | 'today' | 'disabled' | 'outside' | 'default' {
    if (day.isDisabled) return 'disabled'
    if (day.isSelected) return 'selected'
    if (!day.isCurrentMonth) return 'outside'
    if (day.isToday) return 'today'
    return 'default'
  }

  const monthLabel = `${MONTH_NAMES[api.state.currentMonth.getMonth()]} ${api.state.currentMonth.getFullYear()}`

  return React.createElement(
    'div',
    {
      className: cn(calendarVariants(), className),
      ...api.ariaProps,
    },
    // Header row: prev, month label, next
    React.createElement(CalendarHeader, {
      label: monthLabel,
      labelId: api.ids.label,
      onPrevMonth: api.prevMonth,
      onNextMonth: api.nextMonth,
    }),
    // Day-of-week headers
    React.createElement(
      'div',
      {
        className: 'grid grid-cols-7 gap-1 mb-1',
        role: 'row',
      },
      DAY_HEADERS.map((d) =>
        React.createElement(
          'div',
          {
            key: d,
            className: 'text-center text-xs font-medium text-muted-foreground h-9 flex items-center justify-center',
            role: 'columnheader',
            'aria-label': d,
          },
          d,
        ),
      ),
    ),
    // Day grid
    React.createElement(
      'div',
      {
        className: 'grid grid-cols-7 gap-1',
        role: 'rowgroup',
      },
      api.days.map((day, i) => {
        const dayAriaProps = api.getDayAriaProps(day)
        const state = getDayState(day)
        return React.createElement(
          'button',
          {
            key: i,
            type: 'button',
            className: dayVariants({ state }),
            disabled: day.isDisabled,
            onClick: () => api.select(day.date),
            ...dayAriaProps,
          },
          day.date.getDate(),
        )
      }),
    ),
  )
}

Calendar.displayName = 'Calendar'

// ---------------------------------------------------------------------------
// CalendarHeader
// ---------------------------------------------------------------------------

export interface CalendarHeaderProps {
  label: string
  labelId: string
  onPrevMonth: () => void
  onNextMonth: () => void
  className?: string
}

export function CalendarHeader({
  label,
  labelId,
  onPrevMonth,
  onNextMonth,
  className,
}: CalendarHeaderProps) {
  return React.createElement(
    'div',
    {
      className: cn('flex items-center justify-between mb-2', className),
    },
    React.createElement(
      'button',
      {
        type: 'button',
        'aria-label': 'Previous month',
        onClick: onPrevMonth,
        className: 'inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent',
      },
      '\u2039',
    ),
    React.createElement(
      'div',
      {
        id: labelId,
        className: 'text-sm font-medium',
        'aria-live': 'polite',
      },
      label,
    ),
    React.createElement(
      'button',
      {
        type: 'button',
        'aria-label': 'Next month',
        onClick: onNextMonth,
        className: 'inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent',
      },
      '\u203A',
    ),
  )
}

CalendarHeader.displayName = 'CalendarHeader'
