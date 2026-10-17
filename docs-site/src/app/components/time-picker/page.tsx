import { TimePickerExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const timePickerProps = [
  {
    name: 'value',
    type: 'number | null',
    description: 'Controlled value in minutes since midnight (`570` is 9:30); `null` is empty.',
  },
  {
    name: 'defaultValue',
    type: 'number | null',
    default: 'null',
    description: 'Initial value for uncontrolled usage.',
  },
  {
    name: 'onValueChange',
    type: '(value: number | null) => void',
    description: 'Called with the newly committed value (`null` when cleared).',
  },
  {
    name: 'step',
    type: 'number',
    default: '15',
    description: 'Minutes between suggestions and arrow-key steps.',
  },
  {
    name: 'min',
    type: 'number',
    default: '0',
    description: 'Earliest allowed time (minutes since midnight).',
  },
  {
    name: 'max',
    type: 'number',
    default: '1439',
    description: 'Latest allowed time (minutes since midnight).',
  },
  {
    name: 'start',
    type: 'number',
    description:
      'Reference start for an end-time picker: suggestions begin one step after it and show durations, e.g. "10:30 (30 min)".',
  },
  {
    name: 'locale',
    type: 'string',
    description:
      "BCP 47 locale whose preferred 12- or 24-hour clock is used. Defaults to the runtime locale: the server render and hydration use en-US's clock so the markup matches, then the runtime locale's clock takes over. Pass it (or `hourCycle`) to render the final clock on the server.",
  },
  {
    name: 'hourCycle',
    type: '12 | 24',
    description: "Force a 12- or 24-hour clock instead of the locale's.",
  },
  {
    name: 'meridiemLabels',
    type: '{ am: string; pm: string }',
    default: "{ am: 'AM', pm: 'PM' }",
    description: 'Day-period labels for the 12-hour clock; also accepted when parsing.',
  },
  {
    name: 'formatDuration',
    type: '(minutes: number) => string',
    default: '"1 h 30 min"',
    description: 'Formats the durations shown after `start`.',
  },
  {
    name: 'invalidMessage',
    type: "string | ((reason: 'unparseable' | 'out-of-range') => string)",
    description: 'Message for a rejected entry. Defaults to an English hint naming the format or range.',
  },
  {
    name: 'listLabel',
    type: 'string',
    default: "'Suggested times'",
    description: 'Accessible name of the suggestion list.',
  },
  {
    name: 'name',
    type: 'string',
    description: 'Adds a hidden form field submitting the value as 24-hour `HH:mm`.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the field.',
  },
  {
    name: 'readOnly',
    type: 'boolean',
    default: 'false',
    description: 'Shows the value without allowing edits, steps or suggestions.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Classes for the root wrapper (set the width here).',
  },
  {
    name: '...props',
    type: 'React.InputHTMLAttributes<HTMLInputElement>',
    description:
      'Other input attributes (`id`, `placeholder`, `aria-label`, `aria-describedby`, …) and the `ref` go to the text field.',
  },
]

const usageCode = `import { TimePicker } from '@refraction-ui/react'

export function MeetingTimes() {
  const [start, setStart] = React.useState<number | null>(10 * 60)
  const [end, setEnd] = React.useState<number | null>(10 * 60 + 30)

  return (
    <>
      <label htmlFor="start">Starts</label>
      <TimePicker id="start" value={start} onValueChange={setStart} />

      <label htmlFor="end">Ends</label>
      <TimePicker
        id="end"
        value={end}
        onValueChange={setEnd}
        start={start ?? undefined}
        min={start === null ? undefined : start + 1}
      />
    </>
  )
}`

const helpersCode = `import { parseTime, formatTime, suggestTimes } from '@refraction-ui/react'

parseTime('9:30pm')                    // 1290
parseTime('25:00')                     // null
formatTime(1290, { hourCycle: 12 })    // '9:30 PM'
suggestTimes({ start: 600, step: 30, max: 690 }).map((o) => o.label)
// ['10:30 (30 min)', '11:00 (1 h)', '11:30 (1 h 30 min)']`

export default function TimePickerPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Time Picker</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A time-of-day field for scheduling: type it however you like (&quot;930&quot;,
          &quot;9:30pm&quot;, &quot;21:30&quot;), step it with the arrow keys, or pick from
          suggestions. End-time suggestions show the duration from the start.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Values are minutes since midnight, with no dates or time zones. Type a time and press
          Enter or Tab; the entry is reformatted. With the list closed, ↑ and ↓ step by 15
          minutes.
        </p>
        <TimePickerExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Range and step</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>min</code> and <code className={code}>max</code> bound the
          suggestions, clamp the arrow keys and reject typed times outside the range.{' '}
          <code className={code}>step</code> sets both the suggestion interval and the
          arrow-key step.
        </p>
        <TimePickerExamples section="range" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Meeting start and end</h2>
        <p className="text-sm text-muted-foreground">
          Pass the start to the end picker as <code className={code}>start</code>: its
          suggestions begin one step later and show the duration. Set{' '}
          <code className={code}>min</code> as well so an end before the start is rejected.
        </p>
        <TimePickerExamples section="meeting" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Locale</h2>
        <p className="text-sm text-muted-foreground">
          The clock follows the locale&apos;s preference from{' '}
          <code className={code}>Intl.DateTimeFormat</code>. Typed entries are understood in
          either form. Pass <code className={code}>hourCycle</code> to force one, and{' '}
          <code className={code}>meridiemLabels</code> to localise AM/PM. Without{' '}
          <code className={code}>locale</code>, the server renders en-US&apos;s 12-hour clock
          and the browser switches to its own locale&apos;s clock right after hydration, with no
          hydration mismatch.
        </p>
        <TimePickerExamples section="locale" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Validation</h2>
        <p className="text-sm text-muted-foreground">
          A time that cannot be parsed, or is out of range, is kept so the user can fix it.
          The field is marked <code className={code}>aria-invalid</code> and a message
          explains the problem. Escape restores the last valid time.
        </p>
        <TimePickerExamples section="invalid" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
        <p className="text-sm text-muted-foreground">
          The parsing, formatting and suggestion rules are exported as pure functions:
        </p>
        <CodeBlock frameworks={{ react: helpersCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Follows the ARIA 1.2 editable combobox pattern: the input has{' '}
            <code className={code}>role=&quot;combobox&quot;</code>,{' '}
            <code className={code}>aria-expanded</code> and{' '}
            <code className={code}>aria-controls</code>. Focus stays in the input, and{' '}
            <code className={code}>aria-activedescendant</code> points at the active suggestion.
          </li>
          <li>
            Keyboard: with the list closed, ↑ and ↓ step the time. Alt+↓, typing or a click
            opens the list. With the list open, ↑ and ↓ move through the suggestions and Alt+↑
            closes it. Enter commits, and Escape reverts and closes. When Escape has nothing to
            undo, it passes through to an enclosing dialog.
          </li>
          <li>
            Name the field with a <code className={code}>&lt;label htmlFor&gt;</code> or{' '}
            <code className={code}>aria-label</code>. The list is named by{' '}
            <code className={code}>listLabel</code>.
          </li>
          <li>
            A rejected entry sets <code className={code}>aria-invalid</code> and is described by
            a text message in a polite live region. The red border is not the only signal.
          </li>
          <li>
            The current value is marked <code className={code}>aria-selected</code> and shows a
            check mark. The active suggestion has an inset ring as well as a fill, so neither
            state relies on colour alone.
          </li>
          <li>
            A visible <code className={code}>focus-visible</code> ring, rem-based text, and a list
            fade that only runs when motion is allowed (
            <code className={code}>prefers-reduced-motion</code>).
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={timePickerProps} />
      </section>
    </div>
  )
}
