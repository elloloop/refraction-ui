import { RadioExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const radioGroupProps = [
  {
    name: 'value',
    type: 'string',
    description: 'Controlled selected value. Pair with `onValueChange`.',
  },
  {
    name: 'defaultValue',
    type: 'string',
    description: 'Initial selected value when uncontrolled.',
  },
  {
    name: 'onValueChange',
    type: '(value: string) => void',
    description: 'Called with the newly selected value.',
  },
  {
    name: 'name',
    type: 'string',
    description: 'Form field name shared by the group.',
  },
  {
    name: 'orientation',
    type: "'vertical' | 'horizontal'",
    default: "'vertical'",
    description: 'Layout direction of the items.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables every item in the group.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the group container.',
  },
]

const radioItemProps = [
  {
    name: 'value',
    type: 'string',
    description: 'Unique value this item selects. Required.',
  },
  {
    name: 'children',
    type: 'React.ReactNode',
    description: 'Label content rendered beside the radio circle.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables just this item.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the item label.',
  },
]

const usageCode = `import { RadioGroup, RadioItem } from '@refraction-ui/react'

export function MyComponent() {
  return (
    <RadioGroup defaultValue="standard" name="shipping">
      <RadioItem value="standard">Standard — 5-7 business days</RadioItem>
      <RadioItem value="express">Express — 2-3 business days</RadioItem>
      <RadioItem value="overnight">Overnight — next business day</RadioItem>
    </RadioGroup>
  )
}`

export default function RadioPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Radio</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A single-select group of radio options with full keyboard and ARIA support.
          Built on the headless{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/radio</code> core.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Compose <code className="text-xs bg-muted px-1 rounded">RadioItem</code>s inside a{' '}
          <code className="text-xs bg-muted px-1 rounded">RadioGroup</code>. Use{' '}
          <code className="text-xs bg-muted px-1 rounded">defaultValue</code> for uncontrolled state.
        </p>
        <RadioExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-radio" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Horizontal</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">orientation=&quot;horizontal&quot;</code> to lay items out in a row.
        </p>
        <RadioExamples section="horizontal" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Controlled</h2>
        <p className="text-sm text-muted-foreground">
          Drive the selection from state with <code className="text-xs bg-muted px-1 rounded">value</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">onValueChange</code>.
        </p>
        <RadioExamples section="controlled" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Disabled</h2>
        <p className="text-sm text-muted-foreground">
          Disable the whole group via <code className="text-xs bg-muted px-1 rounded">RadioGroup</code> or a single option via{' '}
          <code className="text-xs bg-muted px-1 rounded">RadioItem</code>.
        </p>
        <RadioExamples section="disabled" />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">RadioGroup props</h2>
        <PropsTable props={radioGroupProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">RadioItem props</h2>
        <PropsTable props={radioItemProps} />
      </section>
    </div>
  )
}
