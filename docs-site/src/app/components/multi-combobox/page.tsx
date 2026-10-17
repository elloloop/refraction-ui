import { MultiComboboxExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const multiComboboxProps = [
  {
    name: 'options',
    type: 'T[]',
    description:
      'Options to offer: `{ value, label, disabled? }`, extendable with your own fields. For async search pass the current results.',
  },
  {
    name: 'value',
    type: 'T[]',
    description: 'Controlled selection (compared by `value`).',
  },
  {
    name: 'defaultValue',
    type: 'T[]',
    description: 'Initial selection for uncontrolled usage.',
  },
  {
    name: 'onValueChange',
    type: '(value: T[]) => void',
    description: 'Called with the next selection.',
  },
  {
    name: 'query',
    type: 'string',
    description: 'Controlled query (the text typed in the field).',
  },
  {
    name: 'onQueryChange',
    type: '(query: string) => void',
    description: 'Called on every query change — load async options from here.',
  },
  {
    name: 'filter',
    type: '((option: T, query: string) => boolean) | false',
    default: 'label contains query',
    description:
      'Local filter. Pass `false` when `options` are already filtered (e.g. server results).',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a loading row and sets `aria-busy` on the listbox.',
  },
  {
    name: 'onCreate',
    type: '(query: string) => T | void',
    description:
      'Enables a "Create <query>" item. Return an option to add it; return nothing to handle creation yourself.',
  },
  {
    name: 'max',
    type: 'number',
    description:
      'Maximum number of selected options. Once reached, unselected options are disabled and a note is shown.',
  },
  {
    name: 'renderOptionLeading',
    type: '(option: T) => React.ReactNode',
    description: 'Leading content for each option row, e.g. an avatar.',
  },
  {
    name: 'placeholder',
    type: 'string',
    description: 'Input placeholder.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the input and the chip remove buttons.',
  },
  {
    name: 'name',
    type: 'string',
    description: 'Form field name; renders one hidden input per selected value.',
  },
  {
    name: 'inputId',
    type: 'string',
    description: 'Id for the text input so a `<label htmlFor>` can name it.',
  },
  {
    name: 'aria-label',
    type: 'string',
    description: 'Accessible name for the input and listbox.',
  },
  {
    name: 'aria-labelledby',
    type: 'string',
    description: 'Id(s) of the element(s) naming the input and listbox.',
  },
  {
    name: 'aria-describedby',
    type: 'string',
    description: 'Id(s) of the element(s) describing the input.',
  },
  {
    name: 'messages',
    type: 'Partial<MultiComboboxMessages>',
    description:
      'Override user-facing strings: `remove`, `create`, `loading`, `empty`, `maxReached`, `added`, `removed`, `selectedCount`, `selectedListLabel`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the root element.',
  },
]

const usageCode = `import { MultiCombobox } from '@refraction-ui/react'

export function InvitePeople() {
  const [query, setQuery] = React.useState('')
  const [invitees, setInvitees] = React.useState([])
  // Your own data hook — the component never fetches.
  const { results, isLoading } = usePeopleSearch(query)

  return (
    <MultiCombobox
      aria-label="Invite people"
      options={results}
      filter={false}
      loading={isLoading}
      query={query}
      onQueryChange={setQuery}
      value={invitees}
      onValueChange={setInvitees}
      max={10}
      renderOptionLeading={(person) => <Avatar size="xs">…</Avatar>}
    />
  )
}`

const code = (text: string) => <code className="text-xs bg-muted px-1 rounded">{text}</code>

export default function MultiComboboxPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Multi Combobox</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Pick several options from a searchable list — selected values become
          removable chips inside the field. Built for inviting people or starting
          a group conversation, with async results, an optional create item and
          an optional maximum.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Type to filter, use the arrow keys and Enter to toggle options, and
          Backspace on an empty field to remove the last chip. Use{' '}
          {code('renderOptionLeading')} for an avatar per option.
        </p>
        <MultiComboboxExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Async search</h2>
        <p className="text-sm text-muted-foreground">
          The component never fetches. Listen to {code('onQueryChange')}, load
          results yourself, and pass them back as {code('options')} with{' '}
          {code('loading')} and {code('filter={false}')} so they are shown as given.
        </p>
        <MultiComboboxExamples section="async" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Create from query</h2>
        <p className="text-sm text-muted-foreground">
          Passing {code('onCreate')} adds a “Create …” item when the query matches
          no existing label. Return the new option to select it.
        </p>
        <MultiComboboxExamples section="creatable" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Maximum</h2>
        <p className="text-sm text-muted-foreground">
          With {code('max')}, unselected options are disabled once the limit is
          reached and a note says so; selected options can still be removed.
        </p>
        <MultiComboboxExamples section="max" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Controlled</h2>
        <p className="text-sm text-muted-foreground">
          Control the selection with {code('value')} and {code('onValueChange')}.
          With {code('name')} the selection is submitted with a form.
        </p>
        <MultiComboboxExamples section="controlled" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            The input is an ARIA 1.2 {code('role="combobox"')} controlling a{' '}
            {code('role="listbox"')} with {code('aria-multiselectable="true"')}. Focus
            stays in the input; the active option is exposed with{' '}
            {code('aria-activedescendant')}.
          </li>
          <li>
            Keys: ArrowDown / ArrowUp open the list and move (wrapping), Home / End
            jump to the first / last option, Enter toggles the active option, Escape
            closes the list (or clears the query when it is closed), Backspace on an
            empty query removes the last chip.
          </li>
          <li>
            Each chip has a remove button named “Remove &lt;label&gt;” with a 44px
            touch target and a visible focus ring.
          </li>
          <li>
            Selection changes, and attempts past the maximum, are announced through a
            polite live region. Selected options show a checkmark as well as{' '}
            {code('aria-selected')}, so selection is not conveyed by colour alone.
          </li>
          <li>
            Name the control with a visible {code('<label htmlFor>')} plus{' '}
            {code('inputId')}, or with {code('aria-label')} /{' '}
            {code('aria-labelledby')}. Animations stop under{' '}
            {code('prefers-reduced-motion')}.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={multiComboboxProps} />
      </section>
    </div>
  )
}
