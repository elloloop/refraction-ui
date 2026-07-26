import { FileTreeExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const fileTreeProps = [
  {
    name: 'nodes',
    type: 'FileTreeNode[]',
    description:
      'Root-level nodes. Each node is `{ id, label, children?, disabled? }`; nodes with `children` render as expandable folders.',
  },
  {
    name: 'expandedIds',
    type: 'string[]',
    description: 'Controlled expanded node ids. Pair with `onExpandedChange`.',
  },
  {
    name: 'defaultExpandedIds',
    type: 'string[]',
    description: 'Uncontrolled initial expanded node ids.',
  },
  {
    name: 'selectedId',
    type: 'string | null',
    description: 'Controlled selected node id. Pair with `onSelectionChange`.',
  },
  {
    name: 'defaultSelectedId',
    type: 'string | null',
    description: 'Uncontrolled initial selected node id.',
  },
  {
    name: 'onExpandedChange',
    type: '(ids: string[]) => void',
    description: 'Called whenever the expanded set changes (click, ArrowRight/ArrowLeft).',
  },
  {
    name: 'onSelectionChange',
    type: '(id: string | null) => void',
    description: 'Called whenever the selection changes (click, Enter, Space).',
  },
]

const usageCode = `import { FileTree, type FileTreeNode } from '@refraction-ui/react'

const nodes: FileTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [{ id: 'src/index.ts', label: 'index.ts' }],
  },
  { id: 'package.json', label: 'package.json' },
]

export function MyComponent() {
  return <FileTree nodes={nodes} defaultExpandedIds={['src']} />
}`

export default function FileTreePage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="mb-2 flex items-center gap-3">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">File Tree</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
          A hierarchical view of files and folders with expand/collapse, selection, and keyboard
          navigation (WAI-ARIA treeview).
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground">
          A typical file tree nests folders and files with indentation per depth level. Arrow keys
          move between rows; ArrowRight/ArrowLeft expand and collapse folders; Enter selects.
        </p>
        <FileTreeExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react', astro: '@refraction-ui/astro' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation pending -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={fileTreeProps} />
      </section>
    </div>
  )
}
