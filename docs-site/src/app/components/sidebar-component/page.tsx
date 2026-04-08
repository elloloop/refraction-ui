import { SidebarExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

const sidebarProps = [
  { name: 'sections', type: 'SidebarSection[]', description: 'Array of sections with title and items.' },
  { name: 'currentPath', type: 'string', description: 'Current pathname for active item highlighting.' },
  { name: 'collapsed', type: 'boolean', default: 'false', description: 'Whether the sidebar is collapsed.' },
  { name: 'userRoles', type: 'string[]', description: 'User roles for visibility-based filtering.' },
  { name: 'className', type: 'string', description: 'Additional CSS classes.' },
]

const usageCode = `import { Sidebar } from '@refraction-ui/react-sidebar'

export function MyComponent() {
  return (
    <Sidebar
      sections={[
        {
          title: 'Navigation',
          items: [
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings', href: '/settings' },
          ],
        },
      ]}
      currentPath="/dashboard"
    />
  )
}`

export default function SidebarPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sidebar</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A vertical navigation panel with sections, items, and active state. Supports collapsed mode and role-based visibility.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded-md">@refraction-ui/sidebar</code> core.
        </p>
      </div>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Sidebar with grouped sections and active item highlighting.</p>
        <SidebarExamples section="basic" />
      </section>
      <div className="h-px bg-border" />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={sidebarProps} />
      </section>
    </div>
  )
}
