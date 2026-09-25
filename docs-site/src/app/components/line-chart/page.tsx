import { LineChartExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const props = [
  {
    name: "series",
    type: "{ id: string; name: string; color?: string; data: number[] }[]",
    description: "Series to plot on one shared y-scale. color defaults to --chart-1…5 by position.",
  },
  {
    name: "labels",
    type: "string[]",
    description: "One category label per data point.",
  },
  {
    name: "ariaLabel",
    type: "string",
    description: "Accessible name of the chart image (required).",
  },
  {
    name: "height",
    type: "number",
    default: "230",
    description: "Rendered height in px (also the viewBox height).",
  },
  {
    name: "width",
    type: "number",
    default: "760",
    description: "viewBox width; the chart always stretches to its container.",
  },
  {
    name: "formatValue",
    type: "(value: number) => string",
    default: "rounds",
    description: "Formats values in the tooltip.",
  },
  {
    name: "formatTick",
    type: "(value: number) => string",
    description: "Formats y-axis ticks. Defaults to formatValue.",
  },
  {
    name: "area",
    type: "boolean",
    default: "single series only",
    description: "Fill the area under each line.",
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "true",
    description: "Show the legend under the chart.",
  },
  {
    name: "className",
    type: "string",
    description: "Merged onto the root element.",
  },
]

const usageCode = "import { LineChart } from '@refraction-ui/react'\n\nexport function RevenueChart() {\n  return (\n    <LineChart\n      ariaLabel=\"Revenue by month\"\n      labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}\n      series={[{ id: 'revenue', name: 'Revenue', data: [12, 18, 15, 24, 28, 35] }]}\n      formatValue={(v) => `$${v}k`}\n    />\n  )\n}"

const astroUsageCode = "---\nimport { LineChart } from '@refraction-ui/astro'\n---\n\n<!-- Static SVG: no hover tooltip in Astro -->\n<LineChart\n  ariaLabel=\"Revenue by month\"\n  labels={['Jan', 'Feb', 'Mar']}\n  series={[{ id: 'revenue', name: 'Revenue', data: [12, 18, 15] }]}\n/>"

export default function LineChartPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Line Chart</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A responsive multi-series line chart. Every series shares one y-scale so they stay comparable, the SVG stretches to its container, and a hover or keyboard crosshair shows every series at that point. Use the lower-level Charts primitives when you need a custom composition.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Single series</h2>
        <p className="text-sm text-muted-foreground">One series fills the area under its line by default.</p>
        <LineChartExamples section="single" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Multiple series</h2>
        <p className="text-sm text-muted-foreground">Series share one y-scale; colours default to the theme chart palette. Focus the chart and use the arrow keys to move the crosshair.</p>
        <LineChartExamples section="multi" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Formatted values</h2>
        <p className="text-sm text-muted-foreground">formatValue formats the tooltip; formatTick formats the y-axis.</p>
        <LineChartExamples section="formatted" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: astroUsageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={props} />
      </section>
    </div>
  )
}
