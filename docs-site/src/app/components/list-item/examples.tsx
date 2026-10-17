'use client'

import * as React from 'react'
import { ListItem, ListItemGroup, ListItemAction } from '@refraction-ui/react-list-item'
import { Avatar, AvatarFallback } from '@refraction-ui/react-avatar'
import { Badge } from '@refraction-ui/react-badge'

type Section = 'conversations' | 'picker' | 'multiselect' | 'density' | 'truncation'

interface ListItemExamplesProps {
  section: Section
}

interface Conversation {
  id: string
  name: string
  preview: string
  time: string
  unread: number
}

const CONVERSATIONS: Conversation[] = [
  { id: 'ada', name: 'Ada Lovelace', preview: 'The engine notes are ready for review', time: '09:41', unread: 3 },
  { id: 'grace', name: 'Grace Hopper', preview: 'Found the bug — it was a moth', time: '08:15', unread: 0 },
  { id: 'design', name: 'Design crit', preview: 'Linus: shipping the new tokens today', time: 'Mon', unread: 12 },
  { id: 'margaret', name: 'Margaret Hamilton', preview: 'Priority displays are go', time: 'Sun', unread: 0 },
]

const PEOPLE = ['Ada Lovelace', 'Grace Hopper', 'Linus Torvalds', 'Margaret Hamilton', 'Katherine Johnson']

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

function PersonAvatar({ name }: { name: string }) {
  return (
    <Avatar size="md">
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}

function MarkReadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M2 12l5 5L18 6M12 17l1 1 9-11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** A visual check box; selection itself is announced by `aria-selected`. */
function CheckIndicator({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={
        checked
          ? 'inline-flex size-5 items-center justify-center rounded border border-primary bg-primary text-primary-foreground'
          : 'inline-flex size-5 items-center justify-center rounded border border-input bg-background'
      }
    >
      {checked && (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

function unreadLabel(c: Conversation): string {
  return c.unread > 0 ? `${c.name}, ${c.unread} unread, ${c.time}: ${c.preview}` : `${c.name}, ${c.time}: ${c.preview}`
}

function ConversationsExample() {
  const [current, setCurrent] = React.useState('ada')
  const [conversations, setConversations] = React.useState(CONVERSATIONS)
  const markRead = (id: string) =>
    setConversations((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  return (
    <div className="max-w-sm rounded-xl border border-border bg-card p-2">
      <nav aria-label="Conversations">
        <ListItemGroup context="navigation">
          {conversations.map((c) => (
            <ListItem
              key={c.id}
              leading={<PersonAvatar name={c.name} />}
              title={c.name}
              meta={c.time}
              subtitle={c.preview}
              trailing={c.unread > 0 ? <Badge aria-hidden="true">{c.unread}</Badge> : undefined}
              emphasized={c.unread > 0}
              selected={current === c.id}
              onTap={() => setCurrent(c.id)}
              semanticLabel={unreadLabel(c)}
              action={
                <ListItemAction
                  aria-label={`Mark ${c.name} as read`}
                  disabled={c.unread === 0}
                  onClick={() => markRead(c.id)}
                >
                  <MarkReadIcon />
                </ListItemAction>
              }
            />
          ))}
        </ListItemGroup>
      </nav>
    </div>
  )
}

function PickerExample() {
  const [value, setValue] = React.useState('Grace Hopper')
  return (
    <div className="max-w-sm space-y-3 rounded-xl border border-border bg-card p-2">
      <p id="list-item-picker-label" className="px-3 pt-2 text-sm font-medium text-foreground">
        Assign reviewer
      </p>
      <ListItemGroup context="listbox" aria-labelledby="list-item-picker-label">
        {PEOPLE.map((name) => (
          <ListItem
            key={name}
            leading={<PersonAvatar name={name} />}
            title={name}
            subtitle={`${name.split(' ')[0].toLowerCase()}@example.com`}
            selected={value === name}
            onTap={() => setValue(name)}
          />
        ))}
      </ListItemGroup>
      <p className="px-3 pb-2 text-sm text-muted-foreground">Selected: {value}</p>
    </div>
  )
}

function MultiselectExample() {
  const [chosen, setChosen] = React.useState<string[]>(['Ada Lovelace'])
  const toggle = (name: string) =>
    setChosen((c) => (c.includes(name) ? c.filter((n) => n !== name) : [...c, name]))
  return (
    <div className="max-w-sm rounded-xl border border-border bg-card p-2">
      <ListItemGroup context="listbox" multiselectable aria-label="Invite people">
        {PEOPLE.map((name) => (
          <ListItem
            key={name}
            density="compact"
            leading={<PersonAvatar name={name} />}
            title={name}
            trailing={<CheckIndicator checked={chosen.includes(name)} />}
            selected={chosen.includes(name)}
            onTap={() => toggle(name)}
          />
        ))}
      </ListItemGroup>
    </div>
  )
}

function DensityExample() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(['comfortable', 'compact'] as const).map((density) => (
        <div key={density} className="rounded-xl border border-border bg-card p-2">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{density}</p>
          <ListItemGroup context="navigation">
            {CONVERSATIONS.slice(0, 2).map((c) => (
              <ListItem
                key={c.id}
                density={density}
                leading={<PersonAvatar name={c.name} />}
                title={c.name}
                meta={c.time}
                subtitle={c.preview}
                onTap={() => {}}
              />
            ))}
          </ListItemGroup>
        </div>
      ))}
    </div>
  )
}

function TruncationExample() {
  return (
    <div className="w-64 rounded-xl border border-border bg-card p-2">
      <ListItemGroup context="navigation">
        <ListItem
          leading={<PersonAvatar name="Platform Engineering" />}
          title="Platform engineering, infrastructure and developer experience"
          meta="Yesterday"
          subtitle="Katherine: the migration plan is in the doc, please leave comments before Friday"
          trailing={<Badge aria-hidden="true">99+</Badge>}
          emphasized
          onTap={() => {}}
          semanticLabel="Platform engineering, infrastructure and developer experience, 99+ unread"
        />
      </ListItemGroup>
    </div>
  )
}

export function ListItemExamples({ section }: ListItemExamplesProps) {
  switch (section) {
    case 'conversations':
      return <ConversationsExample />
    case 'picker':
      return <PickerExample />
    case 'multiselect':
      return <MultiselectExample />
    case 'density':
      return <DensityExample />
    case 'truncation':
      return <TruncationExample />
    default:
      return null
  }
}
