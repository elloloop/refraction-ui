import { RadialGaugeExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const radialGaugeProps = [
  {
    name: 'value',
    type: 'number',
    description: 'Current gauge value (required).',
  },
  {
    name: 'min',
    type: 'number',
    default: '0',
    description: 'Minimum possible value.',
  },
  {
    name: 'max',
    type: 'number',
    default: '100',
    description: 'Maximum possible value.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Visual size of the gauge (80 / 120 / 160 px diameter).',
  },
  {
    name: 'thickness',
    type: 'number',
    default: '8',
    description: 'Stroke thickness of the track and arc in pixels.',
  },
  {
    name: 'label',
    type: 'React.ReactNode',
    description:
      'Primary center label. Overrides the default numeric value display.',
  },
  {
    name: 'sublabel',
    type: 'React.ReactNode',
    description: 'Secondary label rendered below the primary label.',
  },
  {
    name: 'zones',
    type: 'GaugeZone[]',
    description:
      'Threshold zones that colour the arc: `{ upTo: number; tone: "default"|"success"|"warning"|"danger" }[]`. Sorted internally; first zone whose `upTo >= value` wins.',
  },
  {
    name: 'showValue',
    type: 'boolean',
    default: 'true',
    description:
      'Show the numeric value in the center when no explicit label is provided.',
  },
  {
    name: 'aria-label',
    type: 'string',
    description: 'Accessible name for the gauge (`role="meter"`).',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes applied to the SVG element.',
  },
]

const usageCode = `import { RadialGauge } from '@refraction-ui/react'

export function ScoreCard() {
  return (
    <RadialGauge
      value={78}
      sublabel="Score"
      zones={[
        { upTo: 33, tone: 'danger' },
        { upTo: 66, tone: 'warning' },
        { upTo: 100, tone: 'success' },
      ]}
      aria-label="78 out of 100"
    />
  )
}`

const astroCode = `---
import { RadialGauge } from '@refraction-ui/astro-radial-gauge/src/RadialGauge.astro'
---

<RadialGauge
  value={78}
  sublabel="Score"
  zones={[
    { upTo: 33, tone: 'danger' },
    { upTo: 66, tone: 'warning' },
    { upTo: 100, tone: 'success' },
  ]}
  aria-label="78 out of 100"
/>`

export default function RadialGaugePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Radial Gauge</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A circular progress / gauge component that maps a numeric value to a
          proportional arc. Supports semantic zone colouring (success / warning /
          danger), configurable center labels, and three sizes — ideal for score
          cards, interview report rings, and dashboard KPIs.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Pass a <code className="text-xs bg-muted px-1 rounded">value</code> between{' '}
          <code className="text-xs bg-muted px-1 rounded">min</code> (0) and{' '}
          <code className="text-xs bg-muted px-1 rounded">max</code> (100). The arc
          length and center number update automatically. Add a{' '}
          <code className="text-xs bg-muted px-1 rounded">sublabel</code> to annotate
          the unit.
        </p>
        <RadialGaugeExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          With zones / thresholds
        </h2>
        <p className="text-sm text-muted-foreground">
          Pass a <code className="text-xs bg-muted px-1 rounded">zones</code> array to
          colour the arc based on where the value falls. Zones are sorted internally;
          the first zone whose{' '}
          <code className="text-xs bg-muted px-1 rounded">upTo &ge; value</code> wins.
          Use the slider to see the colour change live.
        </p>
        <RadialGaugeExamples section="zones" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Sizes</h2>
        <p className="text-sm text-muted-foreground">
          Three sizes are available:{' '}
          <code className="text-xs bg-muted px-1 rounded">sm</code> (80 px),{' '}
          <code className="text-xs bg-muted px-1 rounded">md</code> (120 px, default),
          and <code className="text-xs bg-muted px-1 rounded">lg</code> (160 px). Font
          sizes for labels scale with the ring.
        </p>
        <RadialGaugeExamples section="sizes" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: astroCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={radialGaugeProps} />
      </section>
    </div>
  )
}
