import * as React from 'react'
import { datePickerTriggerStyles, formatDate } from '@refraction-ui/date-picker'
import { cn } from '@refraction-ui/shared'

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value?: Date
  onChange?: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  showTime?: boolean
  /** Display format for the selected-date text shown next to the input (e.g. 'DD/MM/YYYY'). The native input value itself stays ISO (`YYYY-MM-DD`). */
  format?: string
  placeholder?: string
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker({ value, onChange, minDate, maxDate, showTime = false, format, placeholder, className, disabled = false, ...props }, ref) {

    // Native date inputs expect YYYY-MM-DD or YYYY-MM-DDTHH:mm
    const dateToString = (date?: Date) => {
      if (!date) return ''
      // Need to adjust for local timezone so toISOString doesn't shift the day
      const offset = date.getTimezoneOffset() * 60000
      const localDate = new Date(date.getTime() - offset)
      const iso = localDate.toISOString()
      return showTime ? iso.slice(0, 16) : iso.slice(0, 10)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return
      if (e.target.value) {
        onChange(new Date(e.target.value))
      }
    }

    const input = (
      <input
        ref={ref}
        type={showTime ? 'datetime-local' : 'date'}
        className={cn(datePickerTriggerStyles, 'justify-start text-left font-normal w-[280px]', className)}
        value={dateToString(value)}
        min={dateToString(minDate)}
        max={dateToString(maxDate)}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        {...props}
      />
    )

    // A custom display format cannot be honored by the native input itself
    // (the browser locale controls its presentation), so the formatted date
    // renders as adjacent text via the core's formatter.
    if (!format || !value) {
      return input
    }

    return (
      <>
        {input}
        <span className="text-sm text-muted-foreground">{formatDate(value, format, showTime)}</span>
      </>
    )
  }
)
