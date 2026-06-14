import { SlotPickerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const slotPickerProps = [
  {
    name: 'days',
    type: 'SlotDay[]',
    description:
      'Array of day chips to render. Each item has `id`, `weekday` (short label), and `dayNum`.',
  },
  {
    name: 'slotsByDay',
    type: 'Record<string, string[]>',
    description: 'Map of dayId → available time-slot strings for that day.',
  },
  {
    name: 'value',
    type: 'SlotSelection',
    description: 'Controlled selection (`{ dayId, slot }`).',
  },
  {
    name: 'defaultValue',
    type: 'SlotSelection',
    description: 'Initial selection for uncontrolled usage.',
  },
  {
    name: 'onChange',
    type: '(selection: SlotSelection) => void',
    description: 'Called when the user picks a day + slot pair.',
  },
  {
    name: 'timezoneLabel',
    type: 'string',
    description:
      'Optional timezone string shown beside the "Pick a time" heading (e.g. "Eastern Time").',
  },
  {
    name: 'disabledSlots',
    type: 'string[]',
    default: '[]',
    description:
      'Slot strings that are rendered as disabled (e.g. already-booked slots).',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the root element.',
  },
]

const usageCode = `import { SlotPicker } from '@refraction-ui/react'
import type { SlotDay, SlotSelection } from '@refraction-ui/react'

const days: SlotDay[] = [
  { id: '2024-06-10', weekday: 'Mon', dayNum: '10' },
  { id: '2024-06-11', weekday: 'Tue', dayNum: '11' },
]

const slotsByDay = {
  '2024-06-10': ['9:00 AM', '10:00 AM', '2:00 PM'],
  '2024-06-11': ['11:00 AM', '3:00 PM'],
}

export function BookingPicker() {
  const [selection, setSelection] = React.useState<SlotSelection>()

  return (
    <SlotPicker
      days={days}
      slotsByDay={slotsByDay}
      value={selection}
      onChange={setSelection}
      timezoneLabel="Eastern Time"
      aria-label="Book a time slot"
    />
  )
}`

export default function SlotPickerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Slot Picker</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A Calendly-style booking picker: a row of day chips and a grid of
          time slots for the chosen day. Distinct from Calendar/DatePicker —
          this selects an availability slot, not a calendar date.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Pick a day, then pick a time slot. The slot grid updates when you
          switch days.
        </p>
        <SlotPickerExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With timezone label</h2>
        <p className="text-sm text-muted-foreground">
          Pass{' '}
          <code className="text-xs bg-muted px-1 rounded">timezoneLabel</code>{' '}
          to show the user's timezone beside the "Pick a time" heading.
        </p>
        <SlotPickerExamples section="timezone" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Some slots disabled</h2>
        <p className="text-sm text-muted-foreground">
          Pass{' '}
          <code className="text-xs bg-muted px-1 rounded">disabledSlots</code>{' '}
          to mark already-booked or unavailable slots as non-interactive.
        </p>
        <SlotPickerExamples section="disabled-slots" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={slotPickerProps} />
      </section>
    </div>
  )
}
