import { EventCalendarExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Data Display/EventCalendar' }
export default meta

export const Week = { render: () => <EventCalendarExamples section="week" /> }
export const Month = { render: () => <EventCalendarExamples section="month" /> }
export const Day = { render: () => <EventCalendarExamples section="day" /> }
export const WorkWeek = { render: () => <EventCalendarExamples section="workweek" /> }
export const Interactive = {
  render: () => <EventCalendarExamples section="interactive" />,
}
