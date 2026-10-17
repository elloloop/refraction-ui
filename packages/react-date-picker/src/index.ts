export { DatePicker, type DatePickerProps } from './date-picker.js'

// Re-export headless types for convenience
export {
  type DatePickerProps as CoreDatePickerProps,
  type DatePickerAPI,
  type DatePickerState,
  type DatePickerView,
  type CalendarDay,
  datePickerTriggerStyles,
  datePickerDropdownStyles,
  datePickerDayVariants,
  datePickerTimeStyles,
  datePickerTimeInputStyles,
  datePickerPresetsStyles,
  datePickerPresetStyles,
  createDefaultDatePresets,
  DEFAULT_DATE_PRESET_LABELS,
  DEFAULT_DATE_PRESETS_LABEL,
  DEFAULT_WEEK_STARTS_ON,
  type DatePreset,
  type DatePresetLabels,
  type DefaultDatePresetOptions,
  type DatePickerWeekday,
} from '@refraction-ui/date-picker'
