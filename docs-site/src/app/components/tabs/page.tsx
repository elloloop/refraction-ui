import { TabsExample } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'

const tabsProps = [
  {
    name: 'value',
    type: 'string',
    description: 'Controlled active tab value.',
  },
  {
    name: 'defaultValue',
    type: 'string',
    default: "''",
    description: 'Initial tab for uncontrolled usage.',
  },
  {
    name: 'onValueChange',
    type: '(value: string) => void',
    description: 'Callback when the active tab changes.',
  },
  {
    name: 'orientation',
    type: "'horizontal' | 'vertical'",
    default: "'horizontal'",
    description: 'Orientation of the tab list.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes on the root element.',
  },
]

const subComponents = [
  {
    name: 'TabsList',
    type: 'HTMLAttributes<HTMLDivElement>',
    description: 'Container for tab triggers with role="tablist".',
  },
  {
    name: 'TabsTrigger',
    type: 'ButtonHTMLAttributes & { value: string }',
    description: 'Tab button. The value prop links it to its content panel.',
  },
  {
    name: 'TabsContent',
    type: 'HTMLAttributes<HTMLDivElement> & { value: string }',
    description: 'Tab panel. Only renders when its value matches the active tab.',
  },
]

const usageCode = `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@refraction-ui/react'

export function MyTabs() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p>Overview content here.</p>
      </TabsContent>
      <TabsContent value="features">
        <p>Features content here.</p>
      </TabsContent>
      <TabsContent value="api">
        <p>API reference here.</p>
      </TabsContent>
    </Tabs>
  )
}`

export default function TabsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tabs</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A tabbed interface with compound components, ARIA support, and keyboard navigation.
          Uses the headless <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">@refraction-ui/tabs</code> core.
        </p>
      </div>

      {/* Live Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Live Example</h2>
        <p className="text-sm text-muted-foreground">
          Click the tabs to switch between panels. The active tab is highlighted.
        </p>
        <TabsExample />
      </section>

      {/* Code */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Usage</h2>
        <CodeBlock code={usageCode} />
      </section>

      {/* Props */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Tabs Props</h2>
        <PropsTable props={tabsProps} />
      </section>

      {/* Sub-components */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Compound Components</h2>
        <PropsTable
          props={subComponents.map((c) => ({
            name: c.name,
            type: c.type,
            description: c.description,
          }))}
        />
      </section>
    </div>
  )
}
