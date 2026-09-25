import { TableExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const props = [
  {
    name: "density",
    type: "'compact' | 'default'",
    default: "'default'",
    description: "Table: cell padding for every cell.",
  },
  {
    name: "headTone",
    type: "'default' | 'eyebrow'",
    default: "'default'",
    description: "Table: header cell look; eyebrow is small uppercase tracked text.",
  },
  {
    name: "fixed",
    type: "boolean",
    default: "false",
    description: "Table: fixed layout — column widths come from the header row.",
  },
  {
    name: "containerClassName",
    type: "string",
    description: "Table: class for the horizontal scroll container.",
  },
  {
    name: "align",
    type: "'start' | 'center' | 'end'",
    default: "'start'",
    description: "TableHead / TableCell: horizontal alignment.",
  },
  {
    name: "numeric",
    type: "boolean",
    default: "false",
    description: "TableCell: tabular figures, no wrapping.",
  },
  {
    name: "scope",
    type: "string",
    default: "'col'",
    description: "TableHead: defaults to col.",
  },
]

const usageCode = "import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@refraction-ui/react'\n\nexport function Orders({ orders }) {\n  return (\n    <Table>\n      <TableHeader>\n        <TableRow>\n          <TableHead>Customer</TableHead>\n          <TableHead align=\"end\">Total</TableHead>\n        </TableRow>\n      </TableHeader>\n      <TableBody>\n        {orders.map((o) => (\n          <TableRow key={o.id}>\n            <TableCell><a href={`/customers/${o.customerId}`}>{o.customer}</a></TableCell>\n            <TableCell align=\"end\" numeric>{o.total}</TableCell>\n          </TableRow>\n        ))}\n      </TableBody>\n    </Table>\n  )\n}"

const astroUsageCode = "---\nimport { Table, TableRow, TableHead, TableCell } from '@refraction-ui/astro'\n---\n\n<Table>\n  <thead><TableRow><TableHead>Customer</TableHead><TableHead align=\"end\">Total</TableHead></TableRow></thead>\n  <tbody><TableRow><TableCell>Ada Lovelace</TableCell><TableCell align=\"end\" numeric>$1,200.00</TableCell></TableRow></tbody>\n</Table>"

export default function TablePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Table</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Composable, semantic table primitives — Table, TableHeader, TableBody, TableRow, TableHead, TableCell and TableCaption map one-to-one to the HTML elements, so cells can hold any component. Use DataTable when you want sorting and filtering driven by column definitions.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">Cells hold components; numeric columns align to the end with tabular figures.</p>
        <TableExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Compact, eyebrow headers</h2>
        <p className="text-sm text-muted-foreground">density and headTone on the root apply to every cell.</p>
        <TableExamples section="compact" />
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
