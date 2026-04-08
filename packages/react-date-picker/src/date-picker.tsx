import * as React from 'react'
import {
  createDatePicker,
  formatDate,
  datePickerTriggerStyles,
  datePickerDropdownStyles,
  datePickerDayVariants,
  datePickerTimeStyles,
  datePickerTimeInputStyles,
  type DatePickerView,
  type CalendarDay,
} from '@refraction-ui/date-picker'
import { cn } from '@refraction-ui/shared'

export interface DatePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  showTime?: boolean
  format?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  showTime = false,
  format,
  placeholder,
  className,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(() =>
    value ? new Date(value.getFullYear(), value.getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  )
  const [view, setView] = React.useState<DatePickerView>('calendar')
  const containerRef = React.useRef<HTMLDivElement>(null)

  const api = React.useMemo(
    () =>
      createDatePicker({
        value,
        onChange,
        minDate,
        maxDate,
        showTime,
        format,
        placeholder,
        open,
        onOpenChange: setOpen,
      }),
    [value, onChange, minDate, maxDate, showTime, format, placeholder, open],
  )

  // Rebuild days based on the currentMonth state
  const days = React.useMemo(() => {
    const dp = createDatePicker({
      value,
      minDate,
      maxDate,
      open: true,
    })
    // Manually shift the month by adjusting the api
    const tempApi = createDatePicker({
      value,
      minDate,
      maxDate,
      open: true,
    })
    return tempApi.days
  }, [value, minDate, maxDate, currentMonth])

  // Close when clicking outside
  React.useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const displayValue = api.formatDisplay()

  const handleSelectDate = (date: Date) => {
    const newDate = new Date(date)
    if (value) {
      newDate.setHours(value.getHours())
      newDate.setMinutes(value.getMinutes())
    }
    onChange?.(newDate)
    if (!showTime) {
      setOpen(false)
    }
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = parseInt(e.target.value, 10)
    if (isNaN(h) || h < 0 || h > 23) return
    const newDate = value ? new Date(value) : new Date()
    newDate.setHours(h)
    onChange?.(newDate)
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = parseInt(e.target.value, 10)
    if (isNaN(m) || m < 0 || m > 59) return
    const newDate = value ? new Date(value) : new Date()
    newDate.setMinutes(m)
    onChange?.(newDate)
  }

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return React.createElement(
    'div',
    { ref: containerRef, className: cn('relative inline-block', className) },
    React.createElement(
      'button',
      {
        type: 'button',
        className: cn(datePickerTriggerStyles, disabled && 'opacity-50 cursor-not-allowed'),
        onClick: () => !disabled && setOpen(!open),
        'aria-expanded': open,
        'aria-haspopup': 'dialog',
        disabled,
      },
      displayValue,
    ),
    open &&
      React.createElement(
        'div',
        {
          className: datePickerDropdownStyles,
          role: 'dialog',
          'aria-modal': true,
        },
        React.createElement(
          'div',
          { className: 'flex items-center justify-between mb-3' },
          React.createElement(
            'button',
            {
              type: 'button',
              className: 'p-1 hover:bg-accent rounded cursor-pointer',
              onClick: () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)),
              'aria-label': 'Previous month',
            },
            '\u2039',
          ),
          React.createElement('span', { className: 'text-sm font-medium' }, monthLabel),
          React.createElement(
            'button',
            {
              type: 'button',
              className: 'p-1 hover:bg-accent rounded cursor-pointer',
              onClick: () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)),
              'aria-label': 'Next month',
            },
            '\u203A',
          ),
        ),
        React.createElement(
          'div',
          { className: 'grid grid-cols-7 gap-0 text-center', role: 'grid' },
          ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) =>
            React.createElement('div', { key: d, className: 'text-xs text-muted-foreground py-1 font-medium' }, d),
          ),
          api.days.map((day, i) => {
            let state: 'default' | 'selected' | 'today' | 'disabled' | 'outside' = 'default'
            if (day.isDisabled) state = 'disabled'
            else if (day.isSelected) state = 'selected'
            else if (day.isToday) state = 'today'
            else if (!day.isCurrentMonth) state = 'outside'

            return React.createElement(
              'button',
              {
                key: i,
                type: 'button',
                className: datePickerDayVariants({ state }),
                onClick: () => !day.isDisabled && handleSelectDate(day.date),
                disabled: day.isDisabled,
                'aria-selected': day.isSelected,
                'aria-disabled': day.isDisabled,
              },
              day.date.getDate(),
            )
          }),
        ),
        showTime &&
          React.createElement(
            'div',
            { className: datePickerTimeStyles },
            React.createElement('span', { className: 'text-sm text-muted-foreground' }, 'Time:'),
            React.createElement('input', {
              type: 'number',
              min: 0,
              max: 23,
              value: value ? value.getHours() : 0,
              onChange: handleHoursChange,
              className: datePickerTimeInputStyles,
              'aria-label': 'Hours',
            }),
            React.createElement('span', { className: 'text-muted-foreground' }, ':'),
            React.createElement('input', {
              type: 'number',
              min: 0,
              max: 59,
              value: value ? value.getMinutes() : 0,
              onChange: handleMinutesChange,
              className: datePickerTimeInputStyles,
              'aria-label': 'Minutes',
            }),
          ),
      ),
  )
}

DatePicker.displayName = 'DatePicker'
