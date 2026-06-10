import { ComboboxExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const comboboxProps = [
  {
    name: 'options',
    type: 'ComboboxOption[]',
    description:
      'Array of `{ value, label, disabled? }`. When provided, items are auto-rendered inside `ComboboxList`.',
  },
  {
    name: 'value',
    type: 'string',
    description: 'Controlled selected value. Pair with `onValueChange`.',
  },
  {
    name: 'defaultValue',
    type: 'string',
    description: 'Initial value for uncontrolled usage.',
  },
  {
    name: 'onValueChange',
    type: '(value: string) => void',
    description: 'Called when the selection changes.',
  },
  {
    name: 'open / defaultOpen',
    type: 'boolean',
    description: 'Controlled / uncontrolled open state of the popover.',
  },
  {
    name: 'onOpenChange',
    type: '(open: boolean) => void',
    description: 'Called when the popover opens or closes.',
  },
  {
    name: 'filter',
    type: '(option: ComboboxOption, query: string) => boolean',
    description: 'Custom filter predicate. Defaults to case-insensitive label substring match.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the whole combobox.',
  },
]

const usageCode = `import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
} from '@refraction-ui/react'

const options = [
  { value: 'next', label: 'Next.js' },
  { value: 'astro', label: 'Astro' },
]

export function FrameworkPicker() {
  return (
    <Combobox options={options}>
      <ComboboxTrigger placeholder="Select a framework..." />
      <ComboboxContent>
        <ComboboxInput placeholder="Search..." />
        <ComboboxList />
        <ComboboxEmpty>No framework found.</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  )
}`

export default function ComboboxPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Combobox</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A searchable select with text-based filtering. Supports both controlled and uncontrolled
          modes, and either an <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">options</code> prop
          or fully composed <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">ComboboxItem</code> children.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Options prop</h2>
        <p className="text-sm text-muted-foreground">
          Pass an <code className="text-xs bg-muted px-1 rounded">options</code> array and items render
          automatically. Disabled options are skipped during keyboard navigation.
        </p>
        <ComboboxExamples section="options" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Composed items</h2>
        <p className="text-sm text-muted-foreground">
          For full control, compose <code className="text-xs bg-muted px-1 rounded">ComboboxItem</code> children
          inside <code className="text-xs bg-muted px-1 rounded">ComboboxList</code>.
        </p>
        <ComboboxExamples section="composed" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-combobox" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={comboboxProps} />
      </section>
    </div>
  )
}
