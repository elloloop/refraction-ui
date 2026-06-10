import { FileTreeExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const fileTreeProps = [
  {
    name: 'FileTree',
    type: 'React.FC',
    description:
      'Renders a hierarchical file/folder tree. The component is an early-stage primitive — the props API (nodes, selection, expand/collapse) is still being finalized.',
  },
]

const usageCode = `import { FileTree } from '@refraction-ui/react'

export function MyComponent() {
  return <FileTree />
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
          A hierarchical view of files and folders. This is an early-stage primitive — the example below shows the
          intended layout while the props API is finalized.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground">
          A typical file tree nests folders and files with indentation per depth level.
        </p>
        <FileTreeExamples section="basic" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-file-tree" />
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
