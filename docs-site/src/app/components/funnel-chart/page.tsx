import { FunnelChartExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const props = [
  {
    name: "steps",
    type: "{ id: string; label: string; description?: string; value: number }[]",
    description: "The funnel steps, top first.",
  },
  {
    name: "formatValue",
    type: "(value: number) => string",
    default: "toLocaleString",
    description: "Formats counts.",
  },
  {
    name: "formatPercent",
    type: "(percent: number) => string",
    default: "'25.0%'",
    description: "Formats a 0–100 percent.",
  },
  {
    name: "minBarPercent",
    type: "number",
    default: "6",
    description: "Smallest bar width in percent, so tiny steps stay visible.",
  },
  {
    name: "shareLabel",
    type: "(share: string) => string",
    default: "'… of top'",
    description: "Copy for a step's share of the top step.",
  },
  {
    name: "conversionLabel",
    type: "(percent: string) => string",
    default: "'… continue'",
    description: "Copy for the continue-rate between steps.",
  },
  {
    name: "droppedLabel",
    type: "(count: string) => string",
    default: "'−… dropped'",
    description: "Copy for the count lost between steps.",
  },
  {
    name: "className",
    type: "string",
    description: "Merged onto the root <ol>.",
  },
]

const usageCode = "import { FunnelChart } from '@refraction-ui/react'\n\nexport function CheckoutFunnel() {\n  return (\n    <FunnelChart\n      aria-label=\"Checkout funnel\"\n      steps={[\n        { id: 'visit', label: 'Visitors', value: 12400 },\n        { id: 'signup', label: 'Sign-ups', value: 3100 },\n        { id: 'buy', label: 'Purchases', value: 420 },\n      ]}\n    />\n  )\n}"

const astroUsageCode = "---\nimport { FunnelChart } from '@refraction-ui/astro'\n---\n\n<FunnelChart\n  aria-label=\"Checkout funnel\"\n  steps={[\n    { id: 'visit', label: 'Visitors', value: 12400 },\n    { id: 'signup', label: 'Sign-ups', value: 3100 },\n  ]}\n/>"

export default function FunnelChartPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Funnel Chart</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A vertical conversion funnel: one bar per step, filled to its share of the first step, with the continue-rate and drop-off between each pair of steps. It renders an ordered list, so every figure is real text.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">Steps with optional descriptions.</p>
        <FunnelChartExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Custom copy and formatting</h2>
        <p className="text-sm text-muted-foreground">Every label and number format is a prop, for localisation.</p>
        <FunnelChartExamples section="custom-copy" />
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
