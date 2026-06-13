import { RatingScaleExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const ratingScaleProps = [
  {
    name: 'value',
    type: 'number',
    description: 'Controlled selected value.',
  },
  {
    name: 'defaultValue',
    type: 'number',
    description: 'Initial value for uncontrolled usage.',
  },
  {
    name: 'onValueChange',
    type: '(value: number) => void',
    description: 'Called with the newly selected value.',
  },
  {
    name: 'count',
    type: 'number',
    default: '5',
    description: 'Number of points (1..count). Ignored when `points` is given.',
  },
  {
    name: 'points',
    type: 'RatingScalePoint[]',
    description:
      'Explicit points with accessible labels: `{ value, label? }`. Overrides `count`.',
  },
  {
    name: 'minLabel',
    type: 'React.ReactNode',
    description: 'Label shown before the scale (the low end).',
  },
  {
    name: 'maxLabel',
    type: 'React.ReactNode',
    description: 'Label shown after the scale (the high end).',
  },
  {
    name: 'size',
    type: "'sm' | 'md'",
    default: "'md'",
    description: 'Visual size of the points.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables the whole scale.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply.',
  },
]

const usageCode = `import { RatingScale } from '@refraction-ui/react'

export function MyComponent() {
  const [value, setValue] = React.useState(3)

  return (
    <RatingScale
      value={value}
      onValueChange={setValue}
      count={5}
      minLabel="Never seen this"
      maxLabel="Could write it from memory"
      aria-label="Confidence"
    />
  )
}`

export default function RatingScalePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Rating Scale</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A single-select ordinal rating / Likert control with radio semantics,
          roving keyboard navigation, and optional end labels — for confidence
          checks, surveys, and self-assessments.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          A 1–5 scale. Use arrow keys, Home, and End to move the selection — it
          clamps at the ends rather than wrapping.
        </p>
        <RatingScaleExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">End labels</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">minLabel</code> and{' '}
          <code className="text-xs bg-muted px-1 rounded">maxLabel</code> to anchor
          the extremes of the scale.
        </p>
        <RatingScaleExamples section="labeled" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Controlled with custom points</h2>
        <p className="text-sm text-muted-foreground">
          Provide <code className="text-xs bg-muted px-1 rounded">points</code> with
          per-point accessible labels for a labeled Likert prompt.
        </p>
        <RatingScaleExamples section="controlled" />
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
        <PropsTable props={ratingScaleProps} />
      </section>
    </div>
  )
}
