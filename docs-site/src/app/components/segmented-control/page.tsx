import { SegmentedControlExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const segmentedControlProps = [
  {
    name: 'value',
    type: 'string',
    description: 'Controlled selected item value. Pair with onValueChange.',
  },
  {
    name: 'defaultValue',
    type: 'string',
    description: 'Initial selected value for uncontrolled usage.',
  },
  {
    name: 'onValueChange',
    type: '(value: string) => void',
    description: 'Called with the newly selected item value.',
  },
  {
    name: 'size',
    type: "'sm' | 'md'",
    default: "'md'",
    description: 'Visual size of the control.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the radiogroup container.',
  },
]

const itemProps = [
  {
    name: 'value',
    type: 'string',
    description:
      'Value identifying this item; selected when it matches the group value.',
  },
  {
    name: 'children',
    type: 'ReactNode',
    description: 'Item content. May include a leading icon before the label.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the radio item.',
  },
]

const usageCode = `import {
  SegmentedControl,
  SegmentedControlItem,
} from '@refraction-ui/react-segmented-control'

export function MyComponent() {
  const [view, setView] = useState('week')
  return (
    <SegmentedControl aria-label="View range" value={view} onValueChange={setView}>
      <SegmentedControlItem value="day">Day</SegmentedControlItem>
      <SegmentedControlItem value="week">Week</SegmentedControlItem>
      <SegmentedControlItem value="month">Month</SegmentedControlItem>
    </SegmentedControl>
  )
}`

export default function SegmentedControlPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Segmented Control
        </h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A pill-shaped single-select control for switching between a small set
          of mutually exclusive options. Uses radio semantics
          (<code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">role=&quot;radiogroup&quot;</code>)
          with roving tabindex and full arrow-key navigation.
        </p>
      </div>

      {/* Live Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Basic
        </h2>
        <p className="text-sm text-muted-foreground">
          Controlled selection via <code className="text-xs bg-muted px-1 rounded">value</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">onValueChange</code>. Arrow keys move
          between options; Home/End jump to the first/last.
        </p>
        <SegmentedControlExamples section="basic" />
      </section>

      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Installation
        </h2>
        <InstallCommand packageName="@refraction-ui/react-segmented-control" />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Usage
        </h2>
        <CodeBlock
          frameworks={{
            react: usageCode,
            astro: '<!-- Astro implementation pending -->',
          }}
        />
      </section>

      <div className="h-px bg-border" />

      {/* Sizes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Sizes
        </h2>
        <p className="text-sm text-muted-foreground">
          Two sizes: <code className="text-xs bg-muted px-1 rounded">sm</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">md</code> (default).
        </p>
        <SegmentedControlExamples section="sizes" />
      </section>

      {/* With icons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          With icons
        </h2>
        <p className="text-sm text-muted-foreground">
          Place a leading icon before the label as part of the item children.
        </p>
        <SegmentedControlExamples section="icons" />
      </section>

      <div className="h-px bg-border" />

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          SegmentedControl props
        </h2>
        <PropsTable props={segmentedControlProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          SegmentedControlItem props
        </h2>
        <PropsTable props={itemProps} />
      </section>
    </div>
  )
}
