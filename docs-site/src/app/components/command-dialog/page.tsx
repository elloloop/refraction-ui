import { CommandDialogExamples } from './examples'
import { PropsTable } from '@/components/props-table'
import { CodeBlock } from '@/components/code-block'
import { InstallCommand } from '@/components/install-command'

const code = 'text-xs bg-muted px-1 rounded'

const commandDialogProps = [
  { name: 'open', type: 'boolean', description: 'Controlled open state.' },
  { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state when uncontrolled.' },
  {
    name: 'onOpenChange',
    type: '(open: boolean) => void',
    description: 'Called when the shortcut, Escape, the overlay or a selection opens or closes the dialog.',
  },
  {
    name: 'shortcut',
    type: 'string | false',
    default: "'Mod+K'",
    description:
      'Toggle shortcut through `useShortcut`. `Mod` is ⌘ on Apple platforms and Ctrl elsewhere — only one is bound. Explicit `Ctrl+K` / `Meta+K` bind exactly that. `false` disables it.',
  },
  {
    name: 'platform',
    type: "'mac' | 'other'",
    description:
      'Which keyboard `Mod` targets. Detected from `navigator` after mount when omitted (Ctrl until then, including SSR); pass it to pin the behaviour, e.g. in tests.',
  },
  {
    name: 'groups',
    type: 'CommandDialogGroupData[]',
    description: 'Results for the current query: `{ id, heading, scope?, items }`. The caller searches, sync or async.',
  },
  {
    name: 'groupOrder',
    type: 'string[]',
    description: 'Group ids in display order, so results that resolve in any order keep stable headings.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows the loading status row and marks the list `aria-busy`.',
  },
  {
    name: 'onQueryChange',
    type: '(query: string) => void',
    description: "Called with the raw input text on every change, and with `''` when the dialog closes.",
  },
  {
    name: 'filters',
    type: 'CommandDialogFilter[]',
    description: 'Filter chips `{ id, label }`. An "All" chip is added first. Items match a chip by `scope`.',
  },
  { name: 'activeFilter', type: 'string', description: 'Controlled active chip id.' },
  { name: 'defaultActiveFilter', type: 'string', default: "'all'", description: 'Initial chip id when uncontrolled.' },
  { name: 'onActiveFilterChange', type: '(filterId: string) => void', description: 'Called with the chip the user picked.' },
  { name: 'allFilterLabel', type: 'string', default: "'All'", description: 'Label of the implicit "All" chip.' },
  { name: 'filtersLabel', type: 'string', default: "'Filter results'", description: 'Accessible name of the chip group.' },
  { name: 'recentItems', type: 'CommandDialogItemData[]', description: 'Controlled recent items, most recent first.' },
  { name: 'defaultRecentItems', type: 'CommandDialogItemData[]', description: 'Initial recent items when uncontrolled.' },
  {
    name: 'onRecentItemsChange',
    type: '(items: CommandDialogItemData[]) => void',
    description: 'Called after a selection with the chosen item moved to the front, duplicates removed, capped at `maxRecentItems`.',
  },
  { name: 'maxRecentItems', type: 'number', default: '5', description: 'How many recent items are kept and shown.' },
  { name: 'recentHeading', type: 'string', default: "'Recent'", description: 'Heading of the recent-items section.' },
  {
    name: 'onSelect',
    type: '(item: CommandDialogItemData) => void',
    description: 'Called with the chosen item (its `scope` resolved from the group). The dialog then closes.',
  },
  { name: 'title', type: 'string', default: "'Search'", description: 'Accessible name of the dialog and the search input.' },
  { name: 'placeholder', type: 'string', default: "'Search or jump to…'", description: 'Input placeholder.' },
  { name: 'emptyLabel', type: 'string', default: "'No results found.'", description: 'Shown when there is nothing to list and nothing loading.' },
  { name: 'loadingLabel', type: 'string', default: "'Searching…'", description: 'Status text while `loading`.' },
  {
    name: 'formatResultCount',
    type: '(count: number) => string',
    default: "'1 result' / 'n results'",
    description: 'Screen-reader announcement of the result count while a query is typed.',
  },
  { name: 'className', type: 'string', description: 'Additional classes for the dialog panel.' },
]

const itemProps = [
  { name: 'id', type: 'string', description: 'Unique id. An id appears once in the list; the first occurrence wins.' },
  { name: 'label', type: 'string', description: 'Primary text, highlighted against the query.' },
  { name: 'description', type: 'string', description: 'Secondary text, also highlighted.' },
  { name: 'scope', type: 'string', description: "Filter-chip id. Falls back to the group's `scope`." },
  { name: 'icon', type: 'React.ReactNode', description: 'Decorative leading icon or avatar (hidden from assistive tech).' },
  { name: 'disabled', type: 'boolean', description: 'Shown but not selectable.' },
]

const usageCode = `import { CommandDialog } from '@refraction-ui/react'

export function WorkspaceSearch() {
  const [query, setQuery] = React.useState('')
  const [recents, setRecents] = React.useState([])
  const { data: groups, isLoading } = useSearch(query) // your data layer

  return (
    <CommandDialog
      title="Search workspace"
      filters={[
        { id: 'people', label: 'People' },
        { id: 'messages', label: 'Messages' },
        { id: 'files', label: 'Files' },
      ]}
      groups={groups}
      groupOrder={['people', 'messages', 'files']}
      loading={isLoading}
      onQueryChange={setQuery}
      recentItems={recents}
      onRecentItemsChange={setRecents}
      onSelect={(item) => router.push(\`/open/\${item.id}\`)}
    />
  )
}`

export default function CommandDialogPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Component
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Dialog</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          A command palette in a dialog for search and quick switching. It opens with ⌘K on macOS and
          iOS or Ctrl+K elsewhere, scopes results with filter chips, keeps recent items, and shows grouped results — sync or
          async — with the matches highlighted. It composes the existing Command, Dialog,
          HighlightText and keyboard-shortcut components rather than re-implementing them.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Basic</h2>
        <p className="text-sm text-muted-foreground">
          Press ⌘K (macOS) or Ctrl+K (Windows, Linux) anywhere on this page (or use the button). Type to search, use the chips
          to scope to people, messages or files, and pick a result: it appears under{' '}
          <em>Recent</em> next time.
        </p>
        <CommandDialogExamples section="basic" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Async results</h2>
        <p className="text-sm text-muted-foreground">
          The caller owns search: react to <code className={code}>onQueryChange</code>, set{' '}
          <code className={code}>loading</code> while the request is in flight, then pass the{' '}
          <code className={code}>groups</code>. <code className={code}>groupOrder</code> keeps the
          headings stable whichever source answers first.
        </p>
        <CommandDialogExamples section="async" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Without a shortcut</h2>
        <p className="text-sm text-muted-foreground">
          Pass <code className={code}>shortcut={'{false}'}</code> when another palette already owns
          ⌘K, or a custom binding such as <code className={code}>{"shortcut=\"Mod+J\""}</code>. With
          no <code className={code}>filters</code> the chip row is not rendered.
        </p>
        <CommandDialogExamples section="no-shortcut" />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand frameworkPackages={{ react: '@refraction-ui/react' }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: usageCode }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Accessibility</h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            A modal <code className={code}>role=&quot;dialog&quot;</code> named by a visually hidden
            title. Focus moves to the search input on open, Tab is trapped inside, and focus returns
            to whatever was focused before (the opener) when it closes.
          </li>
          <li>
            Results use Command&apos;s listbox pattern: focus stays in the input, ↑/↓ move the active
            option through <code className={code}>aria-activedescendant</code>, Enter selects,
            Escape closes.
          </li>
          <li>
            Filter chips are a <code className={code}>role=&quot;radiogroup&quot;</code> — exactly
            one scope is active, &quot;All&quot; included — with a single Tab stop after the input;
            arrow keys, Home and End move and select. The active chip is filled, bold and carries a
            check mark, so it is not shown by colour alone.
          </li>
          <li>
            A polite live region announces &quot;Searching…&quot; while loading and the result count
            once a query has run, because highlight marks are not reliably announced.
          </li>
          <li>
            Every control has a visible <code className={code}>focus-visible</code> ring; the
            spinner and transitions stop under <code className={code}>prefers-reduced-motion</code>.
            Item icons are decorative and hidden from assistive tech.
          </li>
          <li>
            <code className={code}>Mod+K</code> binds ⌘K on Apple platforms and Ctrl+K elsewhere —
            never both — and prevents the browser&apos;s own binding for that one combination. So
            Ctrl+K keeps deleting to the end of the line in macOS text fields. Pass{' '}
            <code className={code}>platform</code> to override detection, or an explicit{' '}
            <code className={code}>shortcut=&quot;Ctrl+K&quot;</code> to bind exactly that.
          </li>
        </ul>
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props</h2>
        <PropsTable props={commandDialogProps} />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">CommandDialogItemData</h2>
        <PropsTable props={itemProps} />
      </section>
    </div>
  )
}
