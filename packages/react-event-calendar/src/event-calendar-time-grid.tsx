import * as React from 'react'
import {
  eventCalendarAllDayCellVariants,
  eventCalendarColumnHeaderVariants,
  eventCalendarDayNumberVariants,
  eventCalendarFractionToSlot,
  eventCalendarGutterClass,
  eventCalendarNowLineClass,
  eventCalendarPreviewClass,
  eventCalendarRowClass,
  eventCalendarSlotVariants,
  eventCalendarSrOnlyClass,
  eventCalendarTimeGridClass,
  eventCalendarTimeGridHeadClass,
  EVENT_CALENDAR_MINUTES_PER_HOUR,
  EVENT_CALENDAR_MINUTES_PER_DAY,
  type EventCalendarCreateRange,
  type EventCalendarCursor,
  type EventCalendarModel,
  type EventCalendarPositionedSegment,
} from '@refraction-ui/event-calendar'
import { cn } from '@refraction-ui/shared'
import { EventCalendarEventButton, type EventCalendarEventWiring } from './event-calendar-event.js'
import {
  getEventCalendarDragRange,
  isEventCalendarControlTarget,
  isEventCalendarPrimaryPress,
  type EventCalendarDragApi,
} from './use-event-calendar-drag.js'

/** Height of one hour of the time grid. */
const HOUR_HEIGHT_REM = 4
/** Height of one all-day bar plus its gap. */
const ALL_DAY_ROW_REM = 1.75
/** Inset that keeps adjacent events visibly separate. */
const EVENT_GAP = '0.125rem'
/** Where the now line lands when the grid scrolls to it (fraction of the viewport from the top). */
const NOW_SCROLL_ANCHOR = 1 / 3
const PERCENT = 100

/** Focus key of an event piece drawn in a time-grid day column. */
export function timedFocusKey(segment: EventCalendarPositionedSegment): string {
  return `${segment.event.id}@${segment.dayIndex}`
}

/** Focus key of an all-day bar. */
export function allDayFocusKey(eventId: string): string {
  return `${eventId}@all-day`
}

export interface EventCalendarTimeGridProps {
  model: EventCalendarModel
  titleId: string
  cursor: EventCalendarCursor
  wiring: EventCalendarEventWiring
  drag: EventCalendarDragApi
  onCursorChange: (cursor: EventCalendarCursor) => void
  onGridKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void
}

function percent(fraction: number): string {
  return `${fraction * PERCENT}%`
}

/** End minute of a create preview within its day (an end at next-day midnight is the day's end). */
function previewEnd(range: EventCalendarCreateRange, date: string): number {
  return range.end.date === date ? range.end.minutes : EVENT_CALENDAR_MINUTES_PER_DAY
}

/** Index of the slot row containing a minute. */
function slotIndexOf(minutes: number, model: EventCalendarModel): number {
  return Math.floor((minutes - model.grid.dayStartMinutes) / model.grid.slotMinutes)
}

/**
 * Day / week time grid: a `role="grid"` whose rows are time slots and whose
 * columns are days, with a sticky head (day headers + all-day row). Events are
 * buttons inside the gridcell of the slot they start in, positioned from the
 * core's lane layout; the current-time line sits in its slot the same way.
 */
export function EventCalendarTimeGrid({
  model,
  titleId,
  cursor,
  wiring,
  drag,
  onCursorChange,
  onGridKeyDown,
}: EventCalendarTimeGridProps) {
  const { grid, days, slots } = model
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const slotHeightRem = (grid.slotMinutes / EVENT_CALENDAR_MINUTES_PER_HOUR) * HOUR_HEIGHT_REM

  // Bring the current time into view when the visible period changes.
  const firstDay = days[0]?.date
  const hasNow = model.now !== null
  React.useEffect(() => {
    if (!hasNow) return
    const container = scrollRef.current
    const line = container?.querySelector<HTMLElement>('[data-now-line]')
    const cell = line?.parentElement
    if (!container || !cell) return
    container.scrollTop = Math.max(0, cell.offsetTop - container.clientHeight * NOW_SCROLL_ANCHOR)
  }, [firstDay, hasNow])

  const timedByCell = React.useMemo(() => {
    const map = new Map<string, EventCalendarPositionedSegment[]>()
    model.timed.forEach((segments, dayIndex) => {
      for (const segment of segments) {
        const key = `${dayIndex}:${slotIndexOf(segment.startMinutes, model)}`
        map.set(key, [...(map.get(key) ?? []), segment])
      }
    })
    return map
  }, [model])

  const nowSlot = model.now ? slotIndexOf(model.now.minutes, model) : -1

  const slotDrag = drag.drag?.kind === 'slot' ? drag.drag : null
  const slotPreview = slotDrag ? getEventCalendarDragRange(slotDrag, grid) : null
  const dayDrag = drag.drag?.kind === 'day' ? drag.drag : null

  const slotFromPointer = (clientY: number): number => {
    const rect = bodyRef.current?.getBoundingClientRect()
    if (!rect || rect.height === 0) return grid.dayStartMinutes
    return eventCalendarFractionToSlot((clientY - rect.top) / rect.height, grid)
  }

  const handleBodyPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isEventCalendarPrimaryPress(event) || isEventCalendarControlTarget(event.target)) return
    const cell = (event.target as Element).closest<HTMLElement>('[data-slot]')
    if (!cell) return
    const date = cell.dataset.date as string
    const minutes = Number(cell.dataset.slot)
    // Capture so the drag keeps tracking when the pointer leaves the column.
    event.currentTarget.setPointerCapture?.(event.pointerId)
    onCursorChange({ date, minutes })
    drag.begin({ kind: 'slot', date, anchor: minutes, current: minutes })
  }

  const handleBodyPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (slotDrag) drag.moveSlot(slotFromPointer(event.clientY))
  }

  const handleAllDayPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isEventCalendarPrimaryPress(event) || isEventCalendarControlTarget(event.target)) return
    const cell = (event.target as Element).closest<HTMLElement>('[data-all-day]')
    if (!cell) return
    const date = cell.dataset.date as string
    drag.begin({ kind: 'day', anchor: date, current: date })
  }

  const handleAllDayPointerOver = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dayDrag) return
    const cell = (event.target as Element).closest<HTMLElement>('[data-all-day]')
    if (cell) drag.moveDay(cell.dataset.date as string)
  }

  const isInDayDrag = (date: string): boolean => {
    if (!dayDrag) return false
    const [from, to] = [dayDrag.anchor, dayDrag.current].sort()
    return date >= from && date <= to
  }

  const allDayHeight = `${Math.max(1, model.allDay.rowCount) * ALL_DAY_ROW_REM}rem`

  return (
    <div
      ref={scrollRef}
      role="grid"
      aria-labelledby={titleId}
      aria-readonly="true"
      data-time-grid=""
      className={eventCalendarTimeGridClass}
      onKeyDown={onGridKeyDown}
    >
      <div role="rowgroup" className={eventCalendarTimeGridHeadClass}>
        <div role="row" className={eventCalendarRowClass}>
          <div role="columnheader" className={eventCalendarGutterClass}>
            <span className={eventCalendarSrOnlyClass}>{model.labels.time}</span>
          </div>
          {days.map((day) => (
            <div
              key={day.date}
              role="columnheader"
              aria-label={day.label}
              aria-current={day.isToday ? 'date' : undefined}
              className={eventCalendarColumnHeaderVariants({ today: day.isToday ? 'true' : 'false' })}
            >
              <span aria-hidden="true">{day.weekday}</span>
              <span
                aria-hidden="true"
                className={eventCalendarDayNumberVariants({ today: day.isToday ? 'true' : 'false' })}
              >
                {day.dayOfMonth}
              </span>
            </div>
          ))}
        </div>
        <div
          role="row"
          className={eventCalendarRowClass}
          onPointerDown={handleAllDayPointerDown}
          onPointerOver={handleAllDayPointerOver}
        >
          <div role="rowheader" className={cn(eventCalendarGutterClass, 'self-center')}>
            {model.labels.allDay}
          </div>
          {days.map((day, dayIndex) => (
            <div
              key={day.date}
              role="gridcell"
              data-all-day=""
              data-date={day.date}
              aria-label={`${model.labels.allDay}, ${day.label}`}
              className={eventCalendarAllDayCellVariants({ preview: isInDayDrag(day.date) ? 'true' : 'false' })}
              style={{ height: allDayHeight }}
            >
              {model.allDay.segments
                .filter((segment) => segment.startIndex === dayIndex)
                .map((segment) => {
                  const span = segment.endIndex - segment.startIndex + 1
                  return (
                    <EventCalendarEventButton
                      key={segment.event.id}
                      event={segment.event}
                      text={model.describeEvent(segment.event)}
                      layout="bar"
                      focusKey={allDayFocusKey(segment.event.id)}
                      date={day.date}
                      wiring={wiring}
                      continuesBefore={segment.continuesBefore}
                      continuesAfter={segment.continuesAfter}
                      style={{
                        top: `${segment.row * ALL_DAY_ROW_REM}rem`,
                        left: EVENT_GAP,
                        width: `calc(${span * PERCENT}% - 2 * ${EVENT_GAP})`,
                      }}
                    />
                  )
                })}
            </div>
          ))}
        </div>
      </div>

      <div
        ref={bodyRef}
        role="rowgroup"
        onPointerDown={handleBodyPointerDown}
        onPointerMove={handleBodyPointerMove}
      >
        {slots.map((slot, slotIndex) => (
          <div key={slot.minutes} role="row" className={eventCalendarRowClass} style={{ height: `${slotHeightRem}rem` }}>
            <div role="rowheader" className={cn(eventCalendarGutterClass, 'leading-none')}>
              <span className={slot.isHour ? undefined : eventCalendarSrOnlyClass}>{slot.label}</span>
            </div>
            {days.map((day, dayIndex) => {
              const isCursor = cursor.date === day.date && cursor.minutes === slot.minutes
              const segments = timedByCell.get(`${dayIndex}:${slotIndex}`) ?? []
              const showPreview =
                slotPreview !== null &&
                slotDrag?.date === day.date &&
                slotPreview.start.minutes === slot.minutes
              return (
                <div
                  key={day.date}
                  role="gridcell"
                  tabIndex={isCursor ? 0 : -1}
                  data-cursor={isCursor ? '' : undefined}
                  data-date={day.date}
                  data-slot={slot.minutes}
                  aria-label={`${day.label}, ${slot.label}`}
                  className={eventCalendarSlotVariants({ hour: slot.isHour ? 'true' : 'false' })}
                  onFocus={(event) => {
                    // Focus bubbling up from an event inside the cell does not move the cursor.
                    if (event.target === event.currentTarget && !isCursor) {
                      onCursorChange({ date: day.date, minutes: slot.minutes })
                    }
                  }}
                >
                  {segments.map((segment) => (
                    <EventCalendarEventButton
                      key={timedFocusKey(segment)}
                      event={segment.event}
                      text={model.describeEvent(segment.event)}
                      layout="timed"
                      focusKey={timedFocusKey(segment)}
                      date={day.date}
                      wiring={wiring}
                      style={{
                        top: percent((segment.startMinutes - slot.minutes) / grid.slotMinutes),
                        height: `calc(${percent((segment.endMinutes - segment.startMinutes) / grid.slotMinutes)} - ${EVENT_GAP})`,
                        left: `calc(${percent(segment.lane.left)} + ${EVENT_GAP})`,
                        width: `calc(${percent(segment.lane.width)} - 2 * ${EVENT_GAP})`,
                      }}
                    />
                  ))}
                  {model.now && model.now.dayIndex === dayIndex && nowSlot === slotIndex && (
                    <div
                      aria-hidden="true"
                      data-now-line=""
                      className={eventCalendarNowLineClass}
                      style={{
                        top: percent((model.now.minutes - slot.minutes) / grid.slotMinutes),
                      }}
                    />
                  )}
                  {showPreview && slotPreview && (
                    <div
                      aria-hidden="true"
                      data-create-preview=""
                      className={eventCalendarPreviewClass}
                      style={{
                        top: 0,
                        height: percent((previewEnd(slotPreview, day.date) - slot.minutes) / grid.slotMinutes),
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
