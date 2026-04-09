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
} from '@refraction-ui/date-picker'
