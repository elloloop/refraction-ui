import { ListItemExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const listItemProps = [
  {
    name: 'title',
    type: 'React.ReactNode',
    description: 'Primary line (a name). Required. Truncates to one line with an ellipsis.',
  },
  {
    name: 'subtitle',
    type: 'React.ReactNode',
    description: 'Second line (a message preview). Truncates to one line with an ellipsis.',
  },
  {
    name: 'meta',
    type: 'React.ReactNode',
    description: 'Shown at the end of the title line (a time). Never truncated.',
  },
  {
    name: 'leading',
    type: 'React.ReactNode',
    description: 'Leading slot (an avatar or icon).',
  },
  {
    name: 'trailing',
    type: 'React.ReactNode',
    description:
      'Trailing slot (a count, a check indicator). Rendered inside the row control, so it must be non-interactive.',
  },
  {
    name: 'action',
    type: 'React.ReactNode',
    description:
      'A separate control (e.g. `ListItemAction`) rendered as a sibling of the row button. Navigation context only; not rendered in a listbox.',
  },
  {
    name: 'selected',
    type: 'boolean',
    default: 'false',
    description: 'Selected / current row: `aria-selected` in a listbox, `aria-current="true"` in navigation.',
  },
  {
    name: 'emphasized',
    type: 'boolean',
    default: 'false',
    description: 'Unread emphasis: bold title, subtitle and meta in full colour.',
  },
  {
    name: 'onTap',
    type: '() => void',
    description:
      'Activates the row (click, Enter, Space). In navigation, a row without it renders no button and is static.',
  },
  {
    name: 'semanticLabel',
    type: 'string',
    description: "Accessible name for the row's control, replacing its text content.",
  },
  {
    name: 'density',
    type: "'compact' | 'comfortable'",
    default: "'comfortable'",
    description: 'Row padding. Compact rows still keep a 44px minimum height.',
  },
  {
    name: 'context',
    type: "'listbox' | 'navigation'",
    default: "inherited, else 'navigation'",
    description: 'Overrides the context inherited from `ListItemGroup`.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the `<li>`. Other `<li>` attributes and the ref go there too.',
  },
]

const groupProps = [
  {
    name: 'context',
    type: "'listbox' | 'navigation'",
    description:
      'Required. `listbox`: `role="listbox"`, one tab stop, roving focus. `navigation`: `role="list"`, normal Tab order.',
  },
  {
    name: 'multiselectable',
    type: 'boolean',
    default: 'false',
    description: 'Listbox only: sets `aria-multiselectable` for multi-select pickers.',
  },
  {
    name: 'aria-label / aria-labelledby',
    type: 'string',
    description: 'Accessible name for the listbox. Required for a listbox.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes for the `<ul>`.',
  },
]

const actionProps = [
  {
    name: 'aria-label',
    type: 'string',
    description: 'Required. The action is icon-only, so it needs an accessible name.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS classes. All other `<button>` attributes are forwarded.',
  },
]

const navigationCode = `import { ListItem, ListItemGroup, ListItemAction } from '@refraction-ui/react'

export function Conversations({ items, currentId, onOpen, onMarkRead }) {
  return (
    <nav aria-label="Conversations">
      <ListItemGroup context="navigation">
        {items.map((c) => (
          <ListItem
            key={c.id}
            leading={<Avatar><AvatarFallback>{c.initials}</AvatarFallback></Avatar>}
            title={c.name}
            meta={c.time}
            subtitle={c.preview}
            trailing={c.unread > 0 ? <Badge aria-hidden="true">{c.unread}</Badge> : undefined}
            emphasized={c.unread > 0}
            selected={c.id === currentId}       // aria-current="true"
            onTap={() => onOpen(c.id)}
            semanticLabel={\`\${c.name}, \${c.unread} unread\`}
            action={
              <ListItemAction aria-label={\`Mark \${c.name} as read\`} onClick={() => onMarkRead(c.id)}>
                <CheckIcon aria-hidden="true" />
              </ListItemAction>
            }
          />
        ))}
      </ListItemGroup>
    </nav>
  )
}`

const listboxCode = `import { ListItem, ListItemGroup } from '@refraction-ui/react'

export function ReviewerPicker() {
  const [value, setValue] = React.useState('grace')

  return (
    <ListItemGroup context="listbox" aria-label="Assign reviewer">
      {people.map((p) => (
        <ListItem
          key={p.id}
          leading={<Avatar><AvatarFallback>{p.initials}</AvatarFallback></Avatar>}
          title={p.name}
          subtitle={p.email}
          selected={value === p.id}            // aria-selected
          onTap={() => setValue(p.id)}
        />
      ))}
    </ListItemGroup>
  )
}`

export default function ListItemPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">List Item</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A selectable row for conversation lists, people pickers and search results: a leading avatar, a
          title with a trailing time, a preview line, a trailing count or check, an optional separate action,
          and unread emphasis. Works as navigation (<code className={code}>aria-current</code>) or as a
          roving-focus listbox (<code className={code}>aria-selected</code>).
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Conversation list (navigation)</h2>
        <p className="text-sm text-muted-foreground">
          Wrap a <code className={code}>ListItemGroup context=&quot;navigation&quot;</code> in a{' '}
          <code className={code}>&lt;nav&gt;</code>. Each row is a native button and the current one carries{' '}
          <code className={code}>aria-current=&quot;true&quot;</code>. Unread rows use{' '}
          <code className={code}>emphasized</code>. The mark-as-read action is its own button beside the row,
          not inside it, so Tab reaches it separately.
        </p>
        <ListItemExamples section="conversations" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">People picker (listbox)</h2>
        <p className="text-sm text-muted-foreground">
          In <code className={code}>context=&quot;listbox&quot;</code> the group has one tab stop. Arrow Up /
          Down move focus (stopping at the ends), Home / End jump to the first / last option, and Enter, Space
          or a click calls <code className={code}>onTap</code>. Focus enters on the selected option.
        </p>
        <ListItemExamples section="picker" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Multi-select</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className={code}>multiselectable</code> and put a visual check indicator in{' '}
          <code className={code}>trailing</code>. Mark it <code className={code}>aria-hidden</code>: selection
          is announced by <code className={code}>aria-selected</code>, and a real checkbox inside an option would
          be a control inside a control.
        </p>
        <ListItemExamples section="multiselect" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Density</h2>
        <p className="text-sm text-muted-foreground">
          <code className={code}>comfortable</code> (default) and <code className={code}>compact</code>.
        </p>
        <ListItemExamples section="density" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Truncation</h2>
        <p className="text-sm text-muted-foreground">
          Title and subtitle each truncate to one line with an ellipsis; the meta and trailing slots never
          shrink, so the time and count stay visible in a narrow sidebar.
        </p>
        <ListItemExamples section="truncation" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage — navigation</h2>
        <CodeBlock code={navigationCode} frameworks={{ react: navigationCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage — listbox</h2>
        <CodeBlock code={listboxCode} frameworks={{ react: listboxCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">The context is always explicit.</strong> In a listbox the{' '}
            <code className={code}>&lt;li&gt;</code> is a <code className={code}>role=&quot;option&quot;</code> and{' '}
            <code className={code}>selected</code> sets <code className={code}>aria-selected</code>. In navigation
            the <code className={code}>&lt;li&gt;</code> holds a native <code className={code}>&lt;button&gt;</code>{' '}
            and <code className={code}>selected</code> sets <code className={code}>aria-current=&quot;true&quot;</code>.
          </li>
          <li>
            No control is nested inside another. Options have presentational children, so a listbox row has no{' '}
            <code className={code}>action</code> (passing one logs a warning and it is not rendered). In
            navigation the action is a sibling button with its own Tab stop.
          </li>
          <li>
            Listbox keyboard: one Tab stop for the whole list; Arrow Up / Down (clamped), Home and End move focus
            without changing the selection; Enter and Space activate. Name the listbox with{' '}
            <code className={code}>aria-label</code> or <code className={code}>aria-labelledby</code>.
          </li>
          <li>
            Unread state is shown by weight (bold title) as well as colour, and selection by a leading bar as well
            as a background. Include the unread count in <code className={code}>semanticLabel</code> so screen
            readers hear it too.
          </li>
          <li>
            Every row and the action show a <code className={code}>focus-visible</code> ring. Rows are at least
            44px tall, even when compact, and <code className={code}>ListItemAction</code> is a 44px target.
          </li>
          <li>
            Colour transitions stop under <code className={code}>prefers-reduced-motion</code>. Text sizes are
            rem-based and colours are theme tokens, so light, dark and system themes all work.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ListItem props</h2>
        <PropsTable props={listItemProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ListItemGroup props</h2>
        <PropsTable props={groupProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">ListItemAction props</h2>
        <PropsTable props={actionProps} />
      </section>
    </div>
  )
}
