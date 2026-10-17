import * as React from 'react'
import { EventCalendarExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const eventCalendarProps = [
  {
    name: 'events',
    type: 'EventCalendarEvent[]',
    description: 'Events in display-zone wall-clock time. See "Event shape" below.',
  },
  {
    name: 'now',
    type: '{ date: string; minutes: number }',
    description:
      'The current moment in the display zone. Drives today, the Today button and the current-time line. The component never reads the clock.',
  },
  {
    name: 'view',
    type: "'day' | 'week' | 'month'",
    description: 'Controlled view.',
  },
  {
    name: 'defaultView',
    type: "'day' | 'week' | 'month'",
    default: "'week'",
    description: 'Initial view for uncontrolled usage.',
  },
  {
    name: 'onViewChange',
    type: '(view: EventCalendarView) => void',
    description: 'Called when the view switch or a "+N more" control changes the view.',
  },
  {
    name: 'date',
    type: 'string',
    description: "Controlled anchor date of the visible period ('YYYY-MM-DD').",
  },
  {
    name: 'defaultDate',
    type: 'string',
    default: 'now.date',
    description: 'Initial anchor date for uncontrolled usage.',
  },
  {
    name: 'onDateChange',
    type: '(date: string) => void',
    description: 'Called when Today, previous, next, "+N more" or keyboard paging changes the anchor date.',
  },
  {
    name: 'onCreate',
    type: '(range: { start; end; allDay: boolean }) => void',
    description:
      'Called with the snapped range when an empty slot or day is clicked, dragged across, or activated with Enter / Space. `end` is exclusive.',
  },
  {
    name: 'onSelectEvent',
    type: '(event: EventCalendarEvent) => void',
    description: 'Called when an event is clicked or activated with Enter / Space.',
  },
  {
    name: 'weekStartsOn',
    type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
    default: '0',
    description: 'First day of the week (0 = Sunday) for the week view and the month grid.',
  },
  {
    name: 'locale',
    type: 'string',
    default: "'en-US'",
    description: 'BCP 47 locale for every date and time label.',
  },
  {
    name: 'dayStartHour',
    type: 'number',
    default: '0',
    description: 'First visible hour of the time grid (0–23).',
  },
  {
    name: 'dayEndHour',
    type: 'number',
    default: '24',
    description: 'End of the time grid, exclusive (1–24).',
  },
  {
    name: 'slotMinutes',
    type: 'number',
    default: '30',
    description: 'Slot length: grid spacing, keyboard step and the snapping step for click / drag create.',
  },
  {
    name: 'maxEventsPerCell',
    type: 'number',
    default: '3',
    description: 'Rows a month cell shows; when more events fall on the day, the last row becomes "+N more".',
  },
  {
    name: 'labels',
    type: 'Partial<EventCalendarLabels>',
    description:
      'Overrides for visible and announced strings (today, previous/next, view names, all day, "+N more", event counts).',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the root.',
  },
]

const eventShape = [
  { name: 'id', type: 'string', description: 'Stable unique id.' },
  { name: 'title', type: 'string', description: 'Shown on the event and used in its accessible name.' },
  {
    name: 'start',
    type: '{ date: string; minutes: number }',
    description: 'Start (inclusive) in the display zone: a date plus minutes since its midnight.',
  },
  {
    name: 'end',
    type: '{ date: string; minutes: number }',
    description: 'End (exclusive). An event ending at midnight does not touch the next day.',
  },
  {
    name: 'allDay',
    type: 'boolean',
    description: 'Render in the all-day row. Timed events of 24 hours or more go there too.',
  },
  {
    name: 'color',
    type: "'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'info' | 'destructive' | 'muted'",
    default: "'primary'",
    description: 'Semantic token name for the fill; each uses its paired foreground token.',
  },
  {
    name: 'category',
    type: 'string',
    description: 'Text for what the colour means (e.g. "Focus"). Shown on the event and announced.',
  },
]

const usageCode = `import { EventCalendar, type EventCalendarDateTime } from '@refraction-ui/react'

// Convert an instant into wall-clock time in the user's zone once, at the edge.
function toWallClock(instant: Date, timeZone: string): EventCalendarDateTime {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    })
      .formatToParts(instant)
      .map((part) => [part.type, part.value]),
  )
  return {
    date: \`\${parts.year}-\${parts.month}-\${parts.day}\`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

export function TeamCalendar({ meetings, timeZone }) {
  const now = toWallClock(new Date(), timeZone)
  const events = meetings.map((m) => ({
    id: m.id,
    title: m.title,
    start: toWallClock(new Date(m.startsAt), timeZone),
    end: toWallClock(new Date(m.endsAt), timeZone),
    color: m.isFocus ? 'accent' : 'primary',
    category: m.isFocus ? 'Focus' : undefined,
  }))

  return (
    <EventCalendar
      events={events}
      now={now}
      weekStartsOn={1}
      dayStartHour={7}
      dayEndHour={21}
      onCreate={({ start, end, allDay }) => openNewMeetingDialog({ start, end, allDay })}
      onSelectEvent={(event) => openMeeting(event.id)}
    />
  )
}`

function Code({ children }: { children: React.ReactNode }) {
  return <code className="text-xs bg-muted px-1 rounded">{children}</code>
}

export default function EventCalendarPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Event Calendar</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Day, week and month views of meetings. Overlapping events are laid out in lanes by a pure,
          unit-tested core; empty slots create events by click or drag; and the whole thing is
          clock-free — you pass <Code>now</Code> and events already converted to the display time zone.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Week</h2>
        <p className="text-sm text-muted-foreground">
          The time grid with an all-day row and the current-time line. Overlapping events share the
          column side by side and expand into free space; an event crossing midnight is split across
          both days.
        </p>
        <EventCalendarExamples section="week" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Month</h2>
        <p className="text-sm text-muted-foreground">
          Day cells list their events; when more fall on a day than{' '}
          <Code>maxEventsPerCell</Code> allows, the last row becomes a{' '}
          &ldquo;+N more&rdquo; button that opens that day.
        </p>
        <EventCalendarExamples section="month" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Day</h2>
        <p className="text-sm text-muted-foreground">
          A single day, limited to business hours with <Code>dayStartHour</Code> and{' '}
          <Code>dayEndHour</Code>. Events outside the window are clipped.
        </p>
        <EventCalendarExamples section="day" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Monday start, 15-minute slots</h2>
        <p className="text-sm text-muted-foreground">
          <Code>weekStartsOn</Code>, <Code>slotMinutes</Code> and <Code>locale</Code> shape the grid
          and every label.
        </p>
        <EventCalendarExamples section="workweek" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Create and select (controlled)</h2>
        <p className="text-sm text-muted-foreground">
          Click or drag across empty slots (or the all-day row, or month cells) to get a snapped range
          in <Code>onCreate</Code>; click an event for <Code>onSelectEvent</Code>. <Code>view</Code> and{' '}
          <Code>date</Code> are controlled here.
        </p>
        <EventCalendarExamples section="interactive" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <p className="text-sm text-muted-foreground">
          Times are plain wall-clock values — <Code>{'{ date: \'YYYY-MM-DD\', minutes }'}</Code> — already in
          the zone you display. Converting once at the edge keeps day boundaries, DST and server
          rendering correct: the calendar never guesses a zone.
        </p>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The calendar is a labelled region. The header has a Today button, previous / next buttons
            named for the view (&ldquo;Next week&rdquo;) with a 44&nbsp;px hit area, a view switch with
            radio semantics, and a title that is a polite live region, so paging is announced.
          </li>
          <li>
            Month view is a <Code>role=&quot;grid&quot;</Code> of weeks and days; day and week views are a grid of
            time slots by day with column headers (today carries <Code>aria-current=&quot;date&quot;</Code>) and hour
            row headers. One cell is in the tab order.
          </li>
          <li>
            In the grid, arrow keys move between days (and between slots in the time grid, or weeks
            in month view); Home / End go to the first / last day of the week (first / last slot in day
            view); PageUp / PageDown move a whole period, and the view pages when the cursor leaves it.
            Enter or Space creates an event for the focused slot or day.
          </li>
          <li>
            Events are buttons named with title, time range, day and category (&ldquo;Standup, 9:00 AM –
            9:15 AM, Wednesday, October 14, 2026, Team&rdquo;). On an event, the arrow keys move to the
            previous / next event in time order, Home / End to the first / last, and Escape returns to
            the grid.
          </li>
          <li>
            Colour is never the only signal: events show their title, time and category text; today is
            circled; days from neighbouring months are labelled with their month. Every part has a visible
            focus ring, text is rem-based, transitions stop under <Code>prefers-reduced-motion</Code>, and
            all colours are theme tokens, so light, dark and system themes work.
          </li>
          <li>
            Drag-create uses pointer events. On touch screens a tap creates a single slot; a drag scrolls
            the grid instead, and keyboard creation is always available.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={eventCalendarProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Event shape</h2>
        <PropsTable props={eventShape} />
      </section>
    </div>
  )
}
