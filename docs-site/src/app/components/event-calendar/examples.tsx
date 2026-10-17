'use client'

import * as React from 'react'
import {
  EventCalendar,
  type EventCalendarCreateRange,
  type EventCalendarDateTime,
  type EventCalendarEvent,
  type EventCalendarView,
} from '@refraction-ui/react-event-calendar'

/**
 * A fixed "now" keeps the server and client render identical. In an app,
 * compute it from the user's time zone (see the usage snippet on the page).
 */
const NOW: EventCalendarDateTime = { date: '2026-10-14', minutes: 10 * 60 + 30 }

const at = (date: string, hours: number, minutes = 0): EventCalendarDateTime => ({
  date,
  minutes: hours * 60 + minutes,
})

const SAMPLE_EVENTS: EventCalendarEvent[] = [
  {
    id: 'offsite',
    title: 'Team offsite',
    allDay: true,
    start: at('2026-10-12', 0),
    end: at('2026-10-14', 0),
    color: 'success',
    category: 'Team',
  },
  {
    id: 'holiday',
    title: 'Public holiday',
    allDay: true,
    start: at('2026-10-16', 0),
    end: at('2026-10-17', 0),
    color: 'muted',
  },
  { id: 'standup-mon', title: 'Standup', start: at('2026-10-12', 9), end: at('2026-10-12', 9, 15), color: 'info', category: 'Team' },
  { id: 'standup-tue', title: 'Standup', start: at('2026-10-13', 9), end: at('2026-10-13', 9, 15), color: 'info', category: 'Team' },
  { id: 'standup-wed', title: 'Standup', start: at('2026-10-14', 9), end: at('2026-10-14', 9, 15), color: 'info', category: 'Team' },
  { id: 'review', title: 'Design review', start: at('2026-10-14', 9), end: at('2026-10-14', 10, 30), color: 'primary', category: 'Product' },
  { id: 'interview', title: 'Interview', start: at('2026-10-14', 9, 30), end: at('2026-10-14', 10, 30), color: 'warning', category: 'Hiring' },
  { id: '1on1', title: '1:1 with Priya', start: at('2026-10-14', 13), end: at('2026-10-14', 13, 30), color: 'tertiary' },
  { id: 'focus', title: 'Focus time', start: at('2026-10-15', 10), end: at('2026-10-15', 12), color: 'accent', category: 'Focus' },
  { id: 'launch', title: 'Launch window', start: at('2026-10-15', 22), end: at('2026-10-16', 1), color: 'destructive', category: 'On call' },
  { id: 'planning', title: 'Sprint planning', start: at('2026-10-19', 14), end: at('2026-10-19', 15, 30), color: 'primary', category: 'Product' },
  { id: 'retro', title: 'Retro', start: at('2026-10-23', 16), end: at('2026-10-23', 17), color: 'secondary', category: 'Team' },
]

const BUSY_DAY: EventCalendarEvent[] = Array.from({ length: 5 }, (_, i) => ({
  id: `busy-${i}`,
  title: `Customer call ${i + 1}`,
  start: at('2026-10-21', 9 + i),
  end: at('2026-10-21', 10 + i),
  color: 'info' as const,
  category: 'Sales',
}))

interface EventCalendarExamplesProps {
  section: 'week' | 'month' | 'day' | 'interactive' | 'workweek'
}

export function EventCalendarExamples({ section }: EventCalendarExamplesProps) {
  if (section === 'week') {
    return <EventCalendar events={SAMPLE_EVENTS} now={NOW} defaultView="week" dayStartHour={7} dayEndHour={23} />
  }

  if (section === 'month') {
    return (
      <EventCalendar events={[...SAMPLE_EVENTS, ...BUSY_DAY]} now={NOW} defaultView="month" maxEventsPerCell={3} />
    )
  }

  if (section === 'day') {
    return <EventCalendar events={SAMPLE_EVENTS} now={NOW} defaultView="day" dayStartHour={8} dayEndHour={18} />
  }

  if (section === 'workweek') {
    return (
      <EventCalendar
        events={SAMPLE_EVENTS}
        now={NOW}
        weekStartsOn={1}
        dayStartHour={8}
        dayEndHour={18}
        slotMinutes={15}
        locale="en-GB"
      />
    )
  }

  if (section === 'interactive') {
    return <InteractiveExample />
  }

  return null
}

function describeRange(range: EventCalendarCreateRange): string {
  const time = (value: EventCalendarDateTime) =>
    `${String(Math.floor(value.minutes / 60)).padStart(2, '0')}:${String(value.minutes % 60).padStart(2, '0')}`
  return range.allDay
    ? `all day from ${range.start.date} until ${range.end.date}`
    : `${range.start.date} ${time(range.start)}–${time(range.end)}`
}

function InteractiveExample() {
  const [events, setEvents] = React.useState<EventCalendarEvent[]>(SAMPLE_EVENTS)
  const [view, setView] = React.useState<EventCalendarView>('week')
  const [date, setDate] = React.useState(NOW.date)
  const [status, setStatus] = React.useState('Click or drag an empty slot to add an event.')
  const nextId = React.useRef(1)

  const handleCreate = (range: EventCalendarCreateRange) => {
    const id = `new-${nextId.current++}`
    setEvents((current) => [
      ...current,
      { id, title: 'New event', ...range, color: 'primary', category: 'Draft' },
    ])
    setStatus(`Created "New event", ${describeRange(range)}.`)
  }

  return (
    <div className="space-y-3">
      <EventCalendar
        events={events}
        now={NOW}
        view={view}
        onViewChange={setView}
        date={date}
        onDateChange={setDate}
        dayStartHour={8}
        dayEndHour={20}
        onCreate={handleCreate}
        onSelectEvent={(event) => setStatus(`Selected "${event.title}".`)}
      />
      <p role="status" className="text-sm text-muted-foreground">
        {status}
      </p>
    </div>
  )
}
