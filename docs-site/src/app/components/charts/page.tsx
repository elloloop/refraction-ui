import { ChartsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const chartProps = [
  {
    name: 'width',
    type: 'number',
    default: '600',
    description: 'Overall width of the SVG canvas in pixels.',
  },
  {
    name: 'height',
    type: 'number',
    default: '400',
    description: 'Overall height of the SVG canvas in pixels.',
  },
  {
    name: 'margin',
    type: 'Partial<Margin>',
    description: 'Inner padding `{ top, right, bottom, left }` reserved for axes and labels.',
  },
  {
    name: 'children',
    type: 'ReactNode',
    description: 'Chart primitives (`Bars`, `Line`, `Circles`, axes) rendered inside the chart context.',
  },
]

const seriesProps = [
  {
    name: 'data',
    type: 'T[]',
    description: 'Array of datum objects to plot.',
  },
  {
    name: 'x',
    type: '(d: T) => string | number',
    description: 'Accessor returning the x value for a datum (`string` for `Bars`, `number` for `Line`/`Circles`).',
  },
  {
    name: 'y',
    type: '(d: T) => number',
    description: 'Accessor returning the y value for a datum.',
  },
  {
    name: 'fill / stroke',
    type: 'string',
    default: "'currentColor'",
    description: 'Color of the rendered marks. Inherits text color via `currentColor`.',
  },
]

const usageCode = `import { Chart, Bars } from '@refraction-ui/react'

const data = [
  { month: 'Jan', value: 32 },
  { month: 'Feb', value: 48 },
  { month: 'Mar', value: 41 },
]

export function Revenue() {
  return (
    <Chart width={520} height={280} margin={{ top: 16, right: 16, bottom: 32, left: 32 }}>
      <Bars data={data} x={(d) => d.month} y={(d) => d.value} fill="currentColor" />
    </Chart>
  )
}`

export default function ChartsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Charts</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Composable SVG chart primitives. A <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">Chart</code> provides
          scales and dimensions through context; primitives like <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">Bars</code>,{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">Line</code>, and{' '}
          <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">PieChart</code> consume it.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Bar chart</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">Bars</code> renders a band-scaled bar for each datum.
        </p>
        <ChartsExamples section="bars" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Line chart</h2>
        <p className="text-sm text-muted-foreground">
          Compose <code className="text-xs bg-muted px-1 rounded">Line</code> with{' '}
          <code className="text-xs bg-muted px-1 rounded">Circles</code> to add point markers.
        </p>
        <ChartsExamples section="line" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Pie chart</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">PieChart</code> is self-contained — it draws its own
          arcs and accepts a custom <code className="text-xs bg-muted px-1 rounded">colors</code> palette.
        </p>
        <ChartsExamples section="pie" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-charts" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Chart props</h2>
        <PropsTable props={chartProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Series props (Bars / Line / Circles)</h2>
        <PropsTable props={seriesProps} />
      </section>
    </div>
  )
}
