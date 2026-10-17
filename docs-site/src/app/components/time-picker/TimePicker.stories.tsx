import { TimePickerExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Inputs/TimePicker' }
export default meta

export const Basic = { render: () => <TimePickerExamples section="basic" /> }
export const MinMaxAndStep = { render: () => <TimePickerExamples section="range" /> }
export const MeetingStartAndEnd = { render: () => <TimePickerExamples section="meeting" /> }
export const LocaleHourCycle = { render: () => <TimePickerExamples section="locale" /> }
export const Validation = { render: () => <TimePickerExamples section="invalid" /> }
