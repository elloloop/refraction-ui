import * as React from 'react'
import {
  datePickerTriggerStyles,
  datePickerPresetsStyles,
  datePickerPresetStyles,
  formatDate,
  isDateOutOfRange,
  resolveDatePreset,
  resolveDatePresets,
  withTimeOf,
  DEFAULT_DATE_PRESETS_LABEL,
  type DatePreset,
} from '@refraction-ui/date-picker'
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
  /**
   * One-click dates shown under the input, in order: `createDefaultDatePresets()`
   * gives "Today", "Tomorrow" and "Next week", and callers can add their own.
   * Labels are shown as given, so pass them already translated. Choosing one
   * calls `onChange` with that day; with `showTime`, the time already chosen is kept.
   */
  presets?: readonly DatePreset[]
  /** Accessible name of the group of presets (default: "Date shortcuts"). */
  presetsLabel?: string
  /**
   * The reader's current date, which presets resolve against. Default: the
   * current date when rendering, and again when a preset is chosen. Pass it
   * when server-rendering presets next to `minDate`/`maxDate`, so the server
   * and the browser agree on which ones are disabled.
   */
  today?: Date
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      onChange,
      minDate,
      maxDate,
      showTime = false,
      format,
      placeholder,
      presets,
      presetsLabel = DEFAULT_DATE_PRESETS_LABEL,
      today,
      className,
      disabled = false,
      id,
      ...props
    },
    ref,
  ) {
    const generatedId = React.useId()

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

    // Presets point at the input they fill, so it needs an id.
    const inputId = id ?? (presets?.length ? generatedId : undefined)

    const input = (
      <input
        ref={ref}
        id={inputId}
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

    // Resolved on every render against the reader's date, so a disabled
    // preset reflects minDate/maxDate as of now.
    const presetItems = presets?.length
      ? resolveDatePresets(presets, { today: today ?? new Date(), minDate, maxDate })
      : []

    // Resolve again when chosen: a page left open past midnight must not pick
    // yesterday's "Tomorrow".
    const choosePreset = (preset: DatePreset) => {
      const day = resolveDatePreset(preset, today ?? new Date())
      if (isDateOutOfRange(day, minDate, maxDate)) return
      onChange?.(showTime ? withTimeOf(day, value) : day)
    }

    const presetGroup =
      presetItems.length > 0 ? (
        <div role="group" aria-label={presetsLabel} className={datePickerPresetsStyles} data-rfr-datepicker-presets="">
          {presetItems.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={datePickerPresetStyles}
              data-rfr-datepicker-preset={preset.id}
              aria-controls={inputId}
              disabled={disabled || Boolean(props.readOnly) || preset.disabled}
              onClick={() => choosePreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      ) : null

    // A custom display format cannot be honored by the native input itself
    // (the browser locale controls its presentation), so the formatted date
    // renders as adjacent text via the core's formatter.
    const display =
      format && value ? (
        <span className="text-sm text-muted-foreground">{formatDate(value, format, showTime)}</span>
      ) : null

    if (!display && !presetGroup) {
      return input
    }

    return (
      <>
        {input}
        {display}
        {presetGroup}
      </>
    )
  }
)
