'use client'

import * as React from 'react'
import {
  CommandDialog,
  type CommandDialogGroupData,
  type CommandDialogItemData,
} from '@refraction-ui/react-command-dialog'
import { Button } from '@refraction-ui/react-button'

interface CommandDialogExamplesProps {
  section: 'basic' | 'async' | 'no-shortcut'
}

/** Simulated network latency for the async example. */
const SEARCH_DELAY_MS = 600

const FILTERS = [
  { id: 'people', label: 'People' },
  { id: 'messages', label: 'Messages' },
  { id: 'files', label: 'Files' },
]

const GROUP_ORDER = ['people', 'messages', 'files']

function Initials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
      {initials}
    </span>
  )
}

const PEOPLE: CommandDialogItemData[] = [
  { id: 'p-ada', label: 'Ada Lovelace', description: 'Engineering', icon: <Initials name="Ada Lovelace" /> },
  { id: 'p-alan', label: 'Alan Turing', description: 'Research', icon: <Initials name="Alan Turing" /> },
  { id: 'p-grace', label: 'Grace Hopper', description: 'Platform', icon: <Initials name="Grace Hopper" /> },
]

const MESSAGES: CommandDialogItemData[] = [
  { id: 'm-launch', label: 'Launch checklist is ready for review', description: '#release · Ada' },
  { id: 'm-standup', label: 'Standup moved to 10:30', description: '#general · Grace' },
]

const FILES: CommandDialogItemData[] = [
  { id: 'f-roadmap', label: 'Roadmap Q4.pdf', description: 'Shared by Alan' },
  { id: 'f-brand', label: 'Brand guidelines.fig', description: 'Design' },
]

function matches(item: CommandDialogItemData, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return `${item.label} ${item.description ?? ''}`.toLowerCase().includes(needle)
}

/** The caller owns search: here a local filter, in an app a request. */
function searchWorkspace(query: string): CommandDialogGroupData[] {
  return [
    { id: 'people', heading: 'People', scope: 'people', items: PEOPLE.filter((i) => matches(i, query)) },
    { id: 'messages', heading: 'Messages', scope: 'messages', items: MESSAGES.filter((i) => matches(i, query)) },
    { id: 'files', heading: 'Files', scope: 'files', items: FILES.filter((i) => matches(i, query)) },
  ]
}

export function CommandDialogExamples({ section }: CommandDialogExamplesProps) {
  if (section === 'basic') return <BasicExample />
  if (section === 'async') return <AsyncExample />
  if (section === 'no-shortcut') return <NoShortcutExample />
  return null
}

function Picked({ item }: { item: CommandDialogItemData | null }) {
  return (
    <p className="text-sm text-muted-foreground" aria-live="polite">
      {item ? `Opened: ${item.label}` : 'Nothing opened yet.'}
    </p>
  )
}

function BasicExample() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [recents, setRecents] = React.useState<CommandDialogItemData[]>([{ ...FILES[0], scope: 'files' }])
  const [picked, setPicked] = React.useState<CommandDialogItemData | null>(null)

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Search workspace
        </Button>
        <span className="text-sm text-muted-foreground">
          or press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">⌘K</kbd>{' '}
          on macOS,{' '}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Ctrl+K</kbd>{' '}
          elsewhere
        </span>
      </div>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search workspace"
        placeholder="Search people, messages and files…"
        filters={FILTERS}
        groups={searchWorkspace(query)}
        groupOrder={GROUP_ORDER}
        onQueryChange={setQuery}
        recentItems={recents}
        onRecentItemsChange={setRecents}
        onSelect={setPicked}
      />
      <Picked item={picked} />
    </div>
  )
}

function AsyncExample() {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [groups, setGroups] = React.useState<CommandDialogGroupData[]>([])
  const [picked, setPicked] = React.useState<CommandDialogItemData | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const handleQueryChange = (query: string) => {
    clearTimeout(timer.current)
    if (!query.trim()) {
      setLoading(false)
      setGroups([])
      return
    }
    setLoading(true)
    timer.current = setTimeout(() => {
      // Resolve out of display order on purpose: groupOrder keeps headings stable.
      setGroups(searchWorkspace(query).reverse())
      setLoading(false)
    }, SEARCH_DELAY_MS)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Search (async)
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        shortcut={false}
        title="Search the archive"
        placeholder="Type to search…"
        filters={FILTERS}
        groups={groups}
        groupOrder={GROUP_ORDER}
        loading={loading}
        onQueryChange={handleQueryChange}
        emptyLabel="Type a name, message or file."
        onSelect={setPicked}
      />
      <Picked item={picked} />
    </div>
  )
}

function NoShortcutExample() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [picked, setPicked] = React.useState<CommandDialogItemData | null>(null)

  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-4">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Jump to a person
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        shortcut={false}
        title="Jump to a person"
        placeholder="Find a teammate…"
        groups={[{ id: 'people', heading: 'People', items: PEOPLE.filter((i) => matches(i, query)) }]}
        onQueryChange={setQuery}
        onSelect={setPicked}
      />
      <Picked item={picked} />
    </div>
  )
}
