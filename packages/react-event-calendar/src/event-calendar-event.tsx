import * as React from 'react'
import {
  eventCalendarEventMetaClass,
  eventCalendarEventTitleClass,
  eventCalendarEventVariants,
  type EventCalendarEvent,
  type EventCalendarEventText,
} from '@refraction-ui/event-calendar'

/** Shared wiring every rendered event needs from the calendar root. */
export interface EventCalendarEventWiring {
  /** Register the button under its focus key (for arrow-key roving between events). */
  register: (key: string, node: HTMLButtonElement | null) => void
  onSelect: (event: EventCalendarEvent) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, key: string, date: string) => void
}

export interface EventCalendarEventButtonProps {
  event: EventCalendarEvent
  text: EventCalendarEventText
  layout: 'timed' | 'bar' | 'chip'
  /** Unique key of this rendered piece (an event may render once per day). */
  focusKey: string
  /** Day this piece is drawn on (Escape returns the keyboard cursor there). */
  date: string
  wiring: EventCalendarEventWiring
  continuesBefore?: boolean
  continuesAfter?: boolean
  /** Short leading text for chips (e.g. the start time). */
  lead?: string
  style?: React.CSSProperties
}

/**
 * One event as a button. Its accessible name is the full description
 * (title, time range, day, category); the visible text repeats title, time
 * and category, so the colour fill is never the only signal.
 */
export function EventCalendarEventButton({
  event,
  text,
  layout,
  focusKey,
  date,
  wiring,
  continuesBefore = false,
  continuesAfter = false,
  lead,
  style,
}: EventCalendarEventButtonProps) {
  const register = React.useCallback(
    (node: HTMLButtonElement | null) => wiring.register(focusKey, node),
    [wiring, focusKey],
  )
  const color = event.color ?? 'primary'
  const meta = layout === 'timed' ? [text.time, event.category].filter(Boolean).join(' · ') : event.category

  return (
    <button
      ref={register}
      type="button"
      aria-label={text.label}
      data-event-key={focusKey}
      data-event-id={event.id}
      data-color={color}
      className={eventCalendarEventVariants({ color, layout })}
      style={style}
      onClick={() => wiring.onSelect(event)}
      onKeyDown={(keyEvent) => wiring.onKeyDown(keyEvent, focusKey, date)}
    >
      {continuesBefore && <span aria-hidden="true">{'‹'}</span>}
      {lead && layout !== 'timed' && <span className="shrink-0 tabular-nums">{lead}</span>}
      <span className={eventCalendarEventTitleClass}>{event.title}</span>
      {meta && <span className={eventCalendarEventMetaClass}>{meta}</span>}
      {continuesAfter && (
        <span aria-hidden="true" className="ml-auto">
          {'›'}
        </span>
      )}
    </button>
  )
}
