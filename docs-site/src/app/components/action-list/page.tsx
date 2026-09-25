import { ActionListExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const props = [
  {
    name: "ActionList",
    type: "React.HTMLAttributes<HTMLUListElement>",
    description: "The list (<ul>). Give it an aria-label when the surrounding heading does not name it.",
  },
  {
    name: "title",
    type: "React.ReactNode",
    description: "ActionListItem: primary line (required).",
  },
  {
    name: "description",
    type: "React.ReactNode",
    description: "ActionListItem: optional supporting line.",
  },
  {
    name: "meta",
    type: "React.ReactNode",
    description: "ActionListItem: optional tertiary line (owner, tags, ids).",
  },
  {
    name: "trailing",
    type: "React.ReactNode",
    description: "ActionListItem: optional trailing column (dates, sizes, counts).",
  },
  {
    name: "density",
    type: "'default' | 'compact'",
    default: "'default'",
    description: "ActionListItem: row padding.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "ActionListItem: disables the row button.",
  },
  {
    name: "onClick",
    type: "React.MouseEventHandler<HTMLButtonElement>",
    description: "ActionListItem: all other button props go to the row button, which also receives the ref.",
  },
]

const usageCode = "import { ActionList, ActionListItem } from '@refraction-ui/react'\n\nexport function Reports({ reports, open }) {\n  return (\n    <ActionList aria-label=\"Reports\">\n      {reports.map((r) => (\n        <ActionListItem\n          key={r.id}\n          title={r.name}\n          description={r.summary}\n          trailing={r.updated}\n          onClick={() => open(r.id)}\n        />\n      ))}\n    </ActionList>\n  )\n}"

const astroUsageCode = "---\nimport { ActionList, ActionListItem } from '@refraction-ui/astro'\n---\n\n<ActionList aria-label=\"Reports\">\n  <ActionListItem title=\"Quarterly report\" description=\"Revenue by region\" trailing=\"Updated 2h ago\" />\n</ActionList>"

export default function ActionListPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Action List</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A vertical list whose rows are each one action — open, select, go to. Every row is a native button, so it is reachable with Tab and activated with Enter or Space, unlike a clickable table row.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">Rows with a title, a supporting line and a trailing column.</p>
        <ActionListExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Compact density</h2>
        <p className="text-sm text-muted-foreground">Tighter rows for dense panels and sidebars.</p>
        <ActionListExamples section="compact" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Disabled rows</h2>
        <p className="text-sm text-muted-foreground">A disabled row stays visible but cannot be activated.</p>
        <ActionListExamples section="disabled" />
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
