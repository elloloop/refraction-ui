import { ChecklistExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const checklistProps = [
  {
    name: 'items',
    type: 'ChecklistItemData[]',
    description: 'Controlled list of items.',
  },
  {
    name: 'defaultItems',
    type: 'ChecklistItemData[]',
    description: 'Initial items for uncontrolled usage.',
  },
  {
    name: 'onChange',
    type: '(items: ChecklistItemData[]) => void',
    description: 'Called with the updated items array after a toggle.',
  },
  {
    name: 'onItemToggle',
    type: '(id: string) => void',
    description: 'Called with the id of the toggled item.',
  },
  {
    name: 'showProgress',
    type: 'boolean',
    default: 'false',
    description: 'Show a "{completed}/{total} completed" summary below the list.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the container.',
  },
]

const usageCode = `import { Checklist } from '@refraction-ui/react'
import type { ChecklistItemData } from '@refraction-ui/react'

const ITEMS: ChecklistItemData[] = [
  { id: '1', label: 'Schedule kick-off meeting', checked: true },
  { id: '2', label: 'Prepare agenda', checked: false },
  { id: '3', label: 'Invite stakeholders', checked: false },
]

export function MyComponent() {
  const [items, setItems] = React.useState(ITEMS)

  return (
    <Checklist
      items={items}
      onChange={setItems}
      showProgress
    />
  )
}`

export default function ChecklistPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Checklist</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          An interactive task list with checkbox semantics, strikethrough
          completion styling, optional item descriptions, and a progress
          summary — designed for AI-captured action items.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Click any item to toggle it. Completed items receive a strikethrough
          and muted text. Pass <code className="text-xs bg-muted px-1 rounded">items</code> +{' '}
          <code className="text-xs bg-muted px-1 rounded">onChange</code> for controlled usage
          or <code className="text-xs bg-muted px-1 rounded">defaultItems</code> for uncontrolled.
        </p>
        <ChecklistExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With progress</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">showProgress</code> to display a
          "{'{'}completed{'}'}/{'{'}total{'}'} completed" summary beneath the list.
        </p>
        <ChecklistExamples section="progress" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With descriptions</h2>
        <p className="text-sm text-muted-foreground">
          Add a <code className="text-xs bg-muted px-1 rounded">description</code> field to any
          item for supplementary detail shown beneath the label.
        </p>
        <ChecklistExamples section="descriptions" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro implementation available via @refraction-ui/astro-checklist -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={checklistProps} />
      </section>
    </div>
  )
}
