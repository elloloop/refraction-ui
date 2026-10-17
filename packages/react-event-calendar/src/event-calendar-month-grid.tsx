import * as React from 'react'
import {
  eventCalendarDayNumberVariants,
  eventCalendarMonthCellVariants,
  eventCalendarMonthColumnHeaderClass,
  eventCalendarMonthGridClass,
  eventCalendarMonthHeadClass,
  eventCalendarMoreClass,
  eventCalendarRowClass,
  formatEventCalendarTime,
  normalizeEventCalendarDateTime,
  type EventCalendarCursor,
  type EventCalendarDate,
  type EventCalendarModel,
  type EventCalendarMonthItem,
} from '@refraction-ui/event-calendar'
import { cn } from '@refraction-ui/shared'
import { EventCalendarEventButton, type EventCalendarEventWiring } from './event-calendar-event.js'
import {
  isEventCalendarControlTarget,
  isEventCalendarPrimaryPress,
  type EventCalendarDragApi,
} from './use-event-calendar-drag.js'

const FIRST_OF_MONTH = '01'

/** Focus key of an event chip in a month cell. */
export function monthFocusKey(eventId: string, date: EventCalendarDate): string {
  return `${eventId}@${date}`
}

export interface EventCalendarMonthGridProps {
  model: EventCalendarModel
  titleId: string
  cursor: EventCalendarCursor
  wiring: EventCalendarEventWiring
  drag: EventCalendarDragApi
  onCursorChange: (cursor: EventCalendarCursor) => void
  onGridKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void
  onShowMore: (date: EventCalendarDate) => void
}

function chipLead(item: EventCalendarMonthItem, model: EventCalendarModel): string | undefined {
  if (item.allDay || item.continuesBefore) return undefined
  return formatEventCalendarTime(normalizeEventCalendarDateTime(item.event.start).minutes, model.locale)
}

/**
 * Month view: a `role="grid"` of week rows and day gridcells. Each cell lists
 * its events as buttons (up to the overflow limit) and a "+N more" control
 * that opens the day view.
 */
export function EventCalendarMonthGrid({
  model,
  titleId,
  cursor,
  wiring,
  drag,
  onCursorChange,
  onGridKeyDown,
  onShowMore,
}: EventCalendarMonthGridProps) {
  const dayDrag = drag.drag?.kind === 'day' ? drag.drag : null

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isEventCalendarPrimaryPress(event) || isEventCalendarControlTarget(event.target)) return
    const cell = (event.target as Element).closest<HTMLElement>('[data-date]')
    if (!cell) return
    const date = cell.dataset.date as string
    onCursorChange({ ...cursor, date })
    drag.begin({ kind: 'day', anchor: date, current: date })
  }

  const handlePointerOver = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dayDrag) return
    const cell = (event.target as Element).closest<HTMLElement>('[data-date]')
    if (cell) drag.moveDay(cell.dataset.date as string)
  }

  const isInDrag = (date: string): boolean => {
    if (!dayDrag) return false
    const [from, to] = [dayDrag.anchor, dayDrag.current].sort()
    return date >= from && date <= to
  }

  const headerDays = model.weeks[0]?.map((cell) => cell.day) ?? []

  return (
    <div
      role="grid"
      aria-labelledby={titleId}
      aria-readonly="true"
      data-month-grid=""
      className={eventCalendarMonthGridClass}
      onKeyDown={onGridKeyDown}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
    >
      <div role="rowgroup">
        <div role="row" className={eventCalendarMonthHeadClass}>
          {headerDays.map((day) => (
            <div key={day.date} role="columnheader" className={eventCalendarMonthColumnHeaderClass}>
              {day.weekday}
            </div>
          ))}
        </div>
      </div>
      <div role="rowgroup">
        {model.weeks.map((week) => (
          <div key={week[0].day.date} role="row" className={eventCalendarRowClass}>
            {week.map((cell) => {
              const { day } = cell
              const isCursor = cursor.date === day.date
              const showMonth = day.date.endsWith(`-${FIRST_OF_MONTH}`)
              return (
                <div
                  key={day.date}
                  role="gridcell"
                  tabIndex={isCursor ? 0 : -1}
                  data-cursor={isCursor ? '' : undefined}
                  data-date={day.date}
                  data-outside={day.isOutsideMonth ? '' : undefined}
                  aria-label={`${day.label}, ${model.labels.eventCount(cell.items.length)}`}
                  aria-current={day.isToday ? 'date' : undefined}
                  className={eventCalendarMonthCellVariants({
                    outside: day.isOutsideMonth ? 'true' : 'false',
                    preview: isInDrag(day.date) ? 'true' : 'false',
                  })}
                  onFocus={(event) => {
                    if (event.target === event.currentTarget && !isCursor) onCursorChange({ ...cursor, date: day.date })
                  }}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      eventCalendarDayNumberVariants({
                        today: day.isToday ? 'true' : 'false',
                        shape: showMonth ? 'pill' : 'circle',
                      }),
                      'self-start',
                    )}
                  >
                    {showMonth ? day.monthDay : day.dayOfMonth}
                  </span>
                  {cell.visible.map((item) => (
                    <EventCalendarEventButton
                      key={item.event.id}
                      event={item.event}
                      text={model.describeEvent(item.event)}
                      layout="chip"
                      focusKey={monthFocusKey(item.event.id, day.date)}
                      date={day.date}
                      wiring={wiring}
                      lead={chipLead(item, model)}
                      continuesBefore={item.continuesBefore}
                      continuesAfter={item.continuesAfter}
                    />
                  ))}
                  {cell.hiddenCount > 0 && (
                    <button
                      type="button"
                      className={eventCalendarMoreClass}
                      aria-label={model.labels.showMore(cell.hiddenCount, day.label)}
                      onClick={() => onShowMore(day.date)}
                    >
                      {model.labels.more(cell.hiddenCount)}
                    </button>
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
