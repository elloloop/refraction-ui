import { DataTableExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const dataTableProps = [
  { name: 'columns', type: 'ColumnDef<T>[]', description: 'Column definitions with id, header, accessor, sortable, filterable.' },
  { name: 'data', type: 'T[]', description: 'Array of data rows.' },
  { name: 'sortBy', type: 'string', description: 'Controlled sort column.' },
  { name: 'sortDir', type: "'asc' | 'desc'", default: "'asc'", description: 'Sort direction.' },
  { name: 'onSort', type: '(columnId: string, direction: SortDirection) => void', description: 'Callback on sort change.' },
  { name: 'filters', type: 'Record<string, string>', description: 'Controlled filter values.' },
  { name: 'emptyMessage', type: 'string', default: "'No data available'", description: 'Message when table is empty.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { DataTable } from '@refraction-ui/react-data-table'

export function MyComponent() {
  return (
    <DataTable
      columns={[
        { id: 'name', header: 'Name', accessor: (r) => r.name, sortable: true },
        { id: 'email', header: 'Email', accessor: (r) => r.email },
      ]}
      data={users}
    />
  )
}`

export default function DataTablePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Data Table</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A sortable, filterable data table with column definitions and empty state.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/data-table</code> core.
        </p>
      </div>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Click column headers to sort. Use the filter row to search.</p>
        <DataTableExamples section="basic" />
      </section>
      {/* Install */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-data-table" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->', angular: '<!-- Angular implementation pending -->', vue: '<!-- Vue implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={dataTableProps} />
      </section>
    </div>
  )
}
