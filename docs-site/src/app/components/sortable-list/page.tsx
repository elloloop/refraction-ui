import { SortableListExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const sortableListProps = [
  {
    name: 'items',
    type: 'T[]',
    description: 'The ordered array of items to render.',
  },
  {
    name: 'getKey',
    type: '(item: T, index: number) => string | number',
    description: 'Return a stable key for each item (used as the React key).',
  },
  {
    name: 'renderItem',
    type: '(item: T, meta: { index: number; dragHandleProps: DragHandleProps }) => ReactNode',
    description:
      'Render the row content. Spread `dragHandleProps` onto your custom grip element if you choose to render your own.',
  },
  {
    name: 'onReorder',
    type: '(items: T[]) => void',
    description:
      'Called with the new items array after a drag or keyboard reorder.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Disables all drag and keyboard reordering.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the list container.',
  },
]

const usageCode = `import { SortableList } from '@refraction-ui/react'

const [items, setItems] = React.useState([
  { id: '1', label: 'Phone Screen' },
  { id: '2', label: 'Technical Interview' },
  { id: '3', label: 'Final Interview' },
])

return (
  <SortableList
    items={items}
    getKey={(item) => item.id}
    onReorder={setItems}
    renderItem={(item) => <span>{item.label}</span>}
  />
)`

export default function SortableListPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sortable List</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A generic, accessible drag-to-reorder vertical list. Rows are moved
          via a grip handle using native HTML5 drag-and-drop or the keyboard
          (↑/↓, Home/End), firing{' '}
          <code className="text-xs bg-muted px-1 rounded">onReorder</code> with
          the updated items array.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic reorder</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className="text-xs bg-muted px-1 rounded">items</code>,{' '}
          <code className="text-xs bg-muted px-1 rounded">getKey</code>, and{' '}
          <code className="text-xs bg-muted px-1 rounded">renderItem</code>.
          Drag the grip handle (three horizontal lines) to reorder rows.
        </p>
        <SortableListExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">With custom row content</h2>
        <p className="text-sm text-muted-foreground">
          <code className="text-xs bg-muted px-1 rounded">renderItem</code>{' '}
          receives the item and a{' '}
          <code className="text-xs bg-muted px-1 rounded">meta</code> object.
          Compose any content — badges, actions, truncated text — inside the
          row.
        </p>
        <SortableListExamples section="custom-row" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Keyboard reorder</h2>
        <p className="text-sm text-muted-foreground">
          Focus a grip handle and press ↑/↓ to move an item one position, or
          Home/End to jump it to the top or bottom. Navigation clamps at the
          ends and never wraps.
        </p>
        <SortableListExamples section="keyboard-note" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode, astro: '<!-- Astro renders a static list; use the React component for interactivity -->' }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={sortableListProps} />
      </section>
    </div>
  )
}
