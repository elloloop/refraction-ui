import { CalendarExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

const calendarProps = [
  { name: 'value', type: 'Date', description: 'Selected date (controlled).' },
  { name: 'defaultValue', type: 'Date', description: 'Initial selected date (uncontrolled).' },
  { name: 'onSelect', type: '(date: Date) => void', description: 'Callback when a date is selected.' },
  { name: 'month', type: 'Date', description: 'Controlled displayed month.' },
  { name: 'onMonthChange', type: '(month: Date) => void', description: 'Callback when month changes.' },
  { name: 'minDate', type: 'Date', description: 'Minimum selectable date.' },
  { name: 'maxDate', type: 'Date', description: 'Maximum selectable date.' },
  { name: 'disabledDates', type: 'Date[]', description: 'Array of specific disabled dates.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { Calendar } from '@refraction-ui/react-calendar'

export function MyComponent() {
  const [date, setDate] = useState<Date>()
  return <Calendar value={date} onSelect={setDate} />
}`

export default function CalendarPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Calendar</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A month-view calendar with date selection, navigation, and disabled date support.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/calendar</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Click a date to select it. Navigate months with the arrow buttons.</p>
        <CalendarExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={calendarProps} />
      </section>
    </div>
  )
}
