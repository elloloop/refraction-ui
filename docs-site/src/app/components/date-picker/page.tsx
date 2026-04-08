import { DatePickerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
const datePickerProps = [
  { name: 'value', type: 'Date', description: 'Selected date/time.' },
  { name: 'onChange', type: '(date: Date) => void', description: 'Callback when date changes.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const usageCode = `import { DatePicker } from '@refraction-ui/react-date-picker'
export function MyComponent() {
  const [date, setDate] = useState<Date>()
  return <DatePicker value={date} onChange={setDate} />
}`
export default function DatePickerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Date Picker</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A date picker with calendar dropdown and optional time selection.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/date-picker</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Click to open the calendar and select a date.</p>
        <DatePickerExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock code={usageCode} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={datePickerProps} /></section>
    </div>
  )
}
