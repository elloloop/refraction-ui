export {
  EventCalendar,
  type EventCalendarProps,
  type EventCalendarColor,
  type EventCalendarCreateRange,
  type EventCalendarDate,
  type EventCalendarDateTime,
  type EventCalendarEvent,
  type EventCalendarLabels,
  type EventCalendarView,
  type EventCalendarWeekday,
} from './event-calendar.js'

// Re-export the headless core's caller-facing helpers (parsing, ranges, labels, styles).
export {
  EVENT_CALENDAR_VIEWS,
  EVENT_CALENDAR_DEFAULT_LABELS,
  EVENT_CALENDAR_DEFAULT_SLOT_MINUTES,
  EVENT_CALENDAR_DEFAULT_MAX_EVENTS_PER_CELL,
  parseEventCalendarDateTime,
  formatEventCalendarDateTime,
  addEventCalendarDays,
  getEventCalendarVisibleDays,
  createEventCalendar,
  layoutEventCalendarLanes,
  eventCalendarEventVariants,
} from '@refraction-ui/event-calendar'
