export { default as DatePicker } from './DatePicker.astro'

// Re-export what callers need to build the DatePicker `presets` prop:
// "Today", "Tomorrow" and "Next week", with translated labels.
export {
  createDefaultDatePresets,
  DEFAULT_DATE_PRESET_LABELS,
  DEFAULT_DATE_PRESETS_LABEL,
  DEFAULT_WEEK_STARTS_ON,
  type DatePreset,
  type DatePresetLabels,
  type DefaultDatePresetOptions,
  type DatePickerWeekday,
} from '@refraction-ui/date-picker'
