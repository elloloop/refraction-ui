export {
  Calendar,
  CalendarHeader,
  type CalendarProps,
  type CalendarHeaderProps,
} from './calendar.js'

// Re-export headless types for convenience
export {
  type CalendarProps as CoreCalendarProps,
  type CalendarAPI,
  type CalendarDay,
  type CalendarState,
  calendarVariants,
  dayVariants,
} from '@refraction-ui/calendar'
