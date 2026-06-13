import { EditorTabsExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const editorTabsProps = [
  {
    name: 'tabs',
    type: 'EditorTabData[]',
    description:
      'The list of tab entries. Each entry: `{ id, label, icon?, dirty?, closable? }`.',
  },
  {
    name: 'activeId',
    type: 'string',
    description: 'The id of the currently active tab (controlled).',
  },
  {
    name: 'onSelect',
    type: '(id: string) => void',
    description: 'Called when the user clicks or navigates to a tab.',
  },
  {
    name: 'onClose',
    type: '(id: string) => void',
    description: 'Called when the user clicks the close button on a closable tab.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes to apply to the tab bar container.',
  },
]

const usageCode = `import { EditorTabs } from '@refraction-ui/react'
import type { EditorTabData } from '@refraction-ui/react'

const tabs: EditorTabData[] = [
  { id: 'solution', label: 'solution.py', icon: '🐍', dirty: true, closable: true },
  { id: 'tests',    label: 'tests.py',    icon: '🧪', closable: true },
  { id: 'notes',    label: 'notes.md',    icon: '📝', closable: true },
]

export function IDE() {
  const [activeId, setActiveId] = React.useState('solution')
  const [openTabs, setOpenTabs] = React.useState(tabs)

  const handleClose = (id: string) => {
    const remaining = openTabs.filter((t) => t.id !== id)
    setOpenTabs(remaining)
    if (activeId === id && remaining.length > 0) setActiveId(remaining[0].id)
  }

  return (
    <EditorTabs
      tabs={openTabs}
      activeId={activeId}
      onSelect={setActiveId}
      onClose={handleClose}
    />
  )
}`

export default function EditorTabsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Editor Tabs</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          An IDE-style open-file tab bar with active highlighting, dirty-state
          indicators, close buttons, and full keyboard navigation — built for
          mock-interview and code-editor surfaces.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          A minimal tab bar with icons and labels. Click a tab to activate it.
        </p>
        <EditorTabsExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With dirty indicator and close button</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="text-xs bg-muted px-1 rounded">dirty</code> to show an amber dot
          for unsaved changes. Set <code className="text-xs bg-muted px-1 rounded">closable</code> to
          show a close button that calls <code className="text-xs bg-muted px-1 rounded">onClose</code>.
        </p>
        <EditorTabsExamples section="dirty-close" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Keyboard navigation</h2>
        <p className="text-sm text-muted-foreground">
          The tab bar uses roving tabindex. Once focused, use arrow keys to move
          between tabs — wrapping at the ends — and Home/End to jump to the
          first/last tab.
        </p>
        <EditorTabsExamples section="keyboard" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={editorTabsProps} />
      </section>
    </div>
  )
}
