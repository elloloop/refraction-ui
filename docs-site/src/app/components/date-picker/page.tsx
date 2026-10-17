import { DatePickerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'
const datePickerProps = [
  { name: 'value', type: 'Date', description: 'Selected date/time.' },
  { name: 'onChange', type: '(date: Date) => void', description: 'Callback when date changes.' },
  { name: 'format', type: 'string', description: "Display format for the selected-date text shown next to the input (e.g. 'DD/MM/YYYY'). The native input value stays ISO." },
  { name: 'minDate', type: 'Date', description: 'Earliest day that can be chosen. Presets that fall before it are disabled.' },
  { name: 'maxDate', type: 'Date', description: 'Latest day that can be chosen. Presets that fall after it are disabled.' },
  { name: 'showTime', type: 'boolean', default: 'false', description: 'Pick a time as well as a date. A preset keeps the time already chosen.' },
  { name: 'presets', type: 'readonly DatePreset[]', description: 'One-click dates shown under the input, in order. createDefaultDatePresets() gives Today, Tomorrow and Next week.' },
  { name: 'presetsLabel', type: 'string', default: "'Date shortcuts'", description: 'Accessible name of the group of presets. Pass it translated.' },
  { name: 'today', type: 'Date', default: 'the current date', description: 'The date presets resolve against. Pass it when server-rendering presets with minDate or maxDate, so the server and the browser agree on which are disabled.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]
const datePresetFields = [
  { name: 'id', type: 'string', description: 'Stable identifier, unique within one picker.' },
  { name: 'label', type: 'string', description: 'Visible text, already in the reader\'s language.' },
  { name: 'weekday', type: '0 | 1 | 2 | 3 | 4 | 5 | 6', description: 'Move first to the next occurrence of this weekday (0 is Sunday). Today itself never counts.' },
  { name: 'days', type: 'number', default: '0', description: 'Whole days to add, after moving to the weekday if one is given.' },
]
const defaultPresetOptions = [
  { name: 'labels', type: 'Partial<{ today, tomorrow, nextWeek }>', default: 'English', description: 'Translated labels. Any label left out keeps its English default.' },
  { name: 'weekStartsOn', type: '0 | 1 | 2 | 3 | 4 | 5 | 6', default: '1 (Monday)', description: 'First day of the week in the reader\'s locale. Next week is the next one of these.' },
]
const usageCode = `import { DatePicker } from '@refraction-ui/react'
export function MyComponent() {
  const [date, setDate] = useState<Date>()
  return <DatePicker value={date} onChange={setDate} />
}`
const presetsCode = `import { DatePicker, createDefaultDatePresets, type DatePreset } from '@refraction-ui/react'

const presets: DatePreset[] = [
  // Today, Tomorrow and Next week, with labels from your translations.
  ...createDefaultDatePresets({
    labels: { today: t('today'), tomorrow: t('tomorrow'), nextWeek: t('nextWeek') },
    weekStartsOn: 1,
  }),
  // Your own: the next Friday, and two weeks from today.
  { id: 'next-friday', label: t('nextFriday'), weekday: 5 },
  { id: 'in-two-weeks', label: t('inTwoWeeks'), days: 14 },
]

export function DueDate() {
  const [date, setDate] = useState<Date>()
  return <DatePicker value={date} onChange={setDate} presets={presets} presetsLabel={t('dateShortcuts')} />
}`
const presetsAstroCode = `---
import { DatePicker, createDefaultDatePresets } from '@refraction-ui/astro'

const presets = [
  ...createDefaultDatePresets({ labels: { today: 'Hoy', tomorrow: 'Mañana', nextWeek: 'La próxima semana' } }),
  { id: 'in-two-weeks', label: 'En dos semanas', days: 14 },
]
---
<!-- Presets resolve in the browser, so a statically built page stays correct. -->
<DatePicker name="due" presets={presets} presetsLabel="Atajos de fecha" />
<script>
  // Choosing a preset fires input and change on the input, like typing a date.
  document.addEventListener('rfr-date-change', (event) => console.log(event.detail.date))
</script>`
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
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Click to open the calendar and select a date.</p>
        <DatePickerExamples section="basic" />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Presets</h2>
        <p className="text-sm text-muted-foreground">
          One-click dates under the input. Each preset is a button after the input in the tab order, so
          Tab reaches it and Enter or Space chooses it. Labels are shown as given: pass them translated.
          A preset outside <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">minDate</code> or{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">maxDate</code> is disabled, and each
          resolves again when chosen, so a page left open past midnight still picks the right day.
        </p>
        <DatePickerExamples section="presets" />
        <CodeBlock frameworks={{ react: presetsCode, astro: presetsAstroCode }} />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2><CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} /></section>
      <section className="space-y-4"><h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2><PropsTable props={datePickerProps} /></section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">DatePreset</h2>
        <p className="text-sm text-muted-foreground">
          A preset is data, not a function, so a server can render it and the browser resolves it against the
          reader&apos;s own date: start from today, move to the next <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">weekday</code> if
          one is given, then add <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">days</code>.
        </p>
        <PropsTable props={datePresetFields} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">createDefaultDatePresets(options)</h2>
        <PropsTable props={defaultPresetOptions} />
      </section>
    </div>
  )
}
