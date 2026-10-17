import * as React from 'react'
import {
  EVENT_CALENDAR_VIEWS,
  createEventCalendar,
  eventCalendarHeaderClass,
  eventCalendarNavClass,
  eventCalendarNavIconClass,
  eventCalendarSnapToSlot,
  eventCalendarTitleClass,
  eventCalendarVariants,
  getEventCalendarDayRange,
  getEventCalendarEventFocusIndex,
  getEventCalendarKeyboardTarget,
  getEventCalendarSlotRange,
  resolveEventCalendarTimeGrid,
  stepEventCalendarDate,
  type EventCalendarColor,
  type EventCalendarCreateRange,
  type EventCalendarCursor,
  type EventCalendarDate,
  type EventCalendarDateTime,
  type EventCalendarEvent,
  type EventCalendarLabels,
  type EventCalendarModel,
  type EventCalendarView,
  type EventCalendarWeekday,
} from '@refraction-ui/event-calendar'
import { Button } from '@refraction-ui/react-button'
import { SegmentedControl, SegmentedControlItem } from '@refraction-ui/react-segmented-control'
import { cn } from '@refraction-ui/shared'
import { EventCalendarMonthGrid, monthFocusKey } from './event-calendar-month-grid.js'
import { EventCalendarTimeGrid, allDayFocusKey, timedFocusKey } from './event-calendar-time-grid.js'
import type { EventCalendarEventWiring } from './event-calendar-event.js'
import { useEventCalendarDrag } from './use-event-calendar-drag.js'

export type {
  EventCalendarColor,
  EventCalendarCreateRange,
  EventCalendarDate,
  EventCalendarDateTime,
  EventCalendarEvent,
  EventCalendarLabels,
  EventCalendarView,
  EventCalendarWeekday,
}

const DEFAULT_VIEW: EventCalendarView = 'week'
const CREATE_KEYS = new Set(['Enter', ' '])

export interface EventCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Events in display-zone wall-clock time (`{ date: 'YYYY-MM-DD', minutes }`). */
  events: EventCalendarEvent[]
  /** The current moment in the display zone. Drives "today", the Today button and the now line. */
  now: EventCalendarDateTime
  /** Controlled view. */
  view?: EventCalendarView
  /** Initial view for uncontrolled usage. */
  defaultView?: EventCalendarView
  /** Called when the view switch (or "+N more") changes the view. */
  onViewChange?: (view: EventCalendarView) => void
  /** Controlled anchor date of the visible period. */
  date?: EventCalendarDate
  /** Initial anchor date for uncontrolled usage (defaults to `now.date`). */
  defaultDate?: EventCalendarDate
  /** Called when today / previous / next / keyboard paging changes the anchor date. */
  onDateChange?: (date: EventCalendarDate) => void
  /** Called with the snapped range when an empty slot or day is clicked, dragged, or activated with Enter / Space. */
  onCreate?: (range: EventCalendarCreateRange) => void
  /** Called when an event is clicked or activated. */
  onSelectEvent?: (event: EventCalendarEvent) => void
  /** First day of the week, `0` = Sunday. */
  weekStartsOn?: EventCalendarWeekday
  /** BCP 47 locale for all dates and times. */
  locale?: string
  /** First visible hour of the time grid. */
  dayStartHour?: number
  /** End of the time grid (exclusive hour). */
  dayEndHour?: number
  /** Slot length in minutes — grid spacing and the snapping step for create. */
  slotMinutes?: number
  /** Event rows a month cell shows before collapsing into "+N more". */
  maxEventsPerCell?: number
  /** Overrides for visible and announced strings. */
  labels?: Partial<EventCalendarLabels>
}

function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange: ((next: T) => void) | undefined,
): [T, (next: T) => void] {
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const isControlled = value !== undefined
  const set = React.useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )
  return [isControlled ? (value as T) : internal, set]
}

/** Focus keys of every rendered event, in chronological reading order. */
function getEventFocusOrder(model: EventCalendarModel): string[] {
  if (model.view === 'month') {
    return model.weeks
      .flat()
      .flatMap((cell) => cell.visible.map((item) => monthFocusKey(item.event.id, cell.day.date)))
  }
  const bars = [...model.allDay.segments]
    .sort((a, b) => a.startIndex - b.startIndex || a.row - b.row)
    .map((segment) => allDayFocusKey(segment.event.id))
  return [...bars, ...model.timed.flat().map(timedFocusKey)]
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  const LEFT_PATH = 'M15 18l-6-6 6-6'
  const RIGHT_PATH = 'M9 18l6-6-6-6'
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === 'left' ? LEFT_PATH : RIGHT_PATH} />
    </svg>
  )
}

/**
 * EventCalendar — day, week and month views of meetings.
 *
 * Clock-free: pass `now` and events already converted to the display time
 * zone. Layout (lanes for overlaps, all-day stacking, "+N more") comes from
 * the pure `@refraction-ui/event-calendar` core; this adapter renders it and
 * owns interaction: a keyboard cursor over days / slots, click-or-drag create
 * (`onCreate`), event selection (`onSelectEvent`), arrow keys between events,
 * and controlled / uncontrolled `view` and `date`.
 */
export const EventCalendar = React.forwardRef<HTMLDivElement, EventCalendarProps>(
  function EventCalendar(
    {
      events,
      now,
      view: viewProp,
      defaultView = DEFAULT_VIEW,
      onViewChange,
      date: dateProp,
      defaultDate,
      onDateChange,
      onCreate,
      onSelectEvent,
      weekStartsOn,
      locale,
      dayStartHour,
      dayEndHour,
      slotMinutes,
      maxEventsPerCell,
      labels,
      className,
      ...props
    },
    ref,
  ) {
    const [view, setView] = useControllable(viewProp, defaultView, onViewChange)
    const [date, setDate] = useControllable(dateProp, defaultDate ?? now.date, onDateChange)
    const titleId = React.useId()
    const rootRef = React.useRef<HTMLDivElement | null>(null)

    const model = React.useMemo(
      () =>
        createEventCalendar({
          view,
          date,
          now,
          events,
          weekStartsOn,
          locale,
          dayStartHour,
          dayEndHour,
          slotMinutes,
          maxEventsPerCell,
          labels,
        }),
      [view, date, now, events, weekStartsOn, locale, dayStartHour, dayEndHour, slotMinutes, maxEventsPerCell, labels],
    )
    const { grid } = model

    // Keyboard cursor: kept across renders, but always resolved into the visible range.
    const [cursorState, setCursorState] = React.useState<EventCalendarCursor>(() => ({
      date: defaultDate ?? dateProp ?? now.date,
      minutes: eventCalendarSnapToSlot(now.minutes, resolveEventCalendarTimeGrid({ dayStartHour, dayEndHour, slotMinutes })),
    }))
    const visibleDates = React.useMemo(() => model.days.map((day) => day.date), [model])
    const cursor: EventCalendarCursor = {
      date: visibleDates.includes(cursorState.date) ? cursorState.date : date,
      minutes: eventCalendarSnapToSlot(cursorState.minutes, grid),
    }

    // Focus follows the cursor only after a keyboard move, never on plain re-renders.
    const pendingFocus = React.useRef(false)
    React.useEffect(() => {
      if (!pendingFocus.current) return
      pendingFocus.current = false
      rootRef.current?.querySelector<HTMLElement>('[data-cursor]')?.focus()
    })

    const moveCursor = (next: EventCalendarCursor, focus: boolean) => {
      setCursorState(next)
      if (!visibleDates.includes(next.date)) setDate(next.date)
      if (focus) pendingFocus.current = true
    }

    const drag = useEventCalendarDrag(grid, onCreate)

    const handleGridKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      // Only the cursor cell navigates; keys on events and buttons inside it are theirs.
      if (!(event.target instanceof HTMLElement) || !event.target.hasAttribute('data-cursor')) return
      if (CREATE_KEYS.has(event.key)) {
        event.preventDefault()
        onCreate?.(
          view === 'month'
            ? getEventCalendarDayRange(cursor.date, cursor.date)
            : getEventCalendarSlotRange(cursor.date, cursor.minutes, cursor.minutes, grid),
        )
        return
      }
      const target = getEventCalendarKeyboardTarget(cursor, event.key, { view, weekStartsOn: model.weekStartsOn, grid })
      if (!target) return
      event.preventDefault()
      moveCursor(target, true)
    }

    // Event wiring is stable across renders; it reads the latest state through a ref.
    const eventRefs = React.useRef(new Map<string, HTMLButtonElement>())
    const latest = React.useRef({ order: [] as string[], onSelectEvent, moveCursor, cursor })
    latest.current = { order: getEventFocusOrder(model), onSelectEvent, moveCursor, cursor }
    const wiring = React.useMemo<EventCalendarEventWiring>(
      () => ({
        register: (key, node) => {
          if (node) eventRefs.current.set(key, node)
          else eventRefs.current.delete(key)
        },
        onSelect: (event) => latest.current.onSelectEvent?.(event),
        onKeyDown: (keyEvent, key, eventDate) => {
          const { order, moveCursor: move, cursor: current } = latest.current
          if (keyEvent.key === 'Escape') {
            keyEvent.preventDefault()
            keyEvent.stopPropagation()
            move({ ...current, date: eventDate }, true)
            return
          }
          const next = getEventCalendarEventFocusIndex(order.indexOf(key), keyEvent.key, order.length)
          if (next === null) return
          keyEvent.preventDefault()
          keyEvent.stopPropagation()
          eventRefs.current.get(order[next])?.focus()
        },
      }),
      [],
    )

    const goToToday = () => {
      setDate(now.date)
      setCursorState((current) => ({ ...current, date: now.date }))
    }
    const step = (direction: -1 | 1) => setDate(stepEventCalendarDate(view, date, direction))
    const showDay = (day: EventCalendarDate) => {
      setCursorState((current) => ({ ...current, date: day }))
      setDate(day)
      setView('day')
    }

    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const gridProps = {
      model,
      titleId,
      cursor,
      wiring,
      drag,
      onCursorChange: (next: EventCalendarCursor) => setCursorState(next),
      onGridKeyDown: handleGridKeyDown,
    }

    return (
      <div
        ref={mergedRef}
        className={cn(eventCalendarVariants({ view }), className)}
        {...model.ariaProps}
        {...model.dataAttributes}
        {...props}
      >
        <div className={eventCalendarHeaderClass}>
          <div className={eventCalendarNavClass}>
            <Button
              variant="outline"
              className="focus-visible:ring-ring focus-visible:ring-offset-background"
              onClick={goToToday}
            >
              {model.labels.today}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={model.labels.previous(view)}
              className={cn(eventCalendarNavIconClass, 'focus-visible:ring-ring focus-visible:ring-offset-background')}
              onClick={() => step(-1)}
            >
              <ChevronIcon direction="left" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={model.labels.next(view)}
              className={cn(eventCalendarNavIconClass, 'focus-visible:ring-ring focus-visible:ring-offset-background')}
              onClick={() => step(1)}
            >
              <ChevronIcon direction="right" />
            </Button>
          </div>
          <h2 id={titleId} aria-live="polite" className={eventCalendarTitleClass}>
            {model.title}
          </h2>
          <SegmentedControl
            value={view}
            onValueChange={(next) => setView(next as EventCalendarView)}
            aria-label={model.labels.viewSwitch}
          >
            {EVENT_CALENDAR_VIEWS.map((option) => (
              <SegmentedControlItem key={option} value={option}>
                {model.labels.views[option]}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>
        {view === 'month' ? (
          <EventCalendarMonthGrid {...gridProps} onShowMore={showDay} />
        ) : (
          <EventCalendarTimeGrid {...gridProps} />
        )}
      </div>
    )
  },
)
