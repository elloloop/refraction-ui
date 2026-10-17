'use client'

import * as React from 'react'
import { NavItem } from '@refraction-ui/react-nav-item'

interface NavItemExamplesProps {
  section: 'basic' | 'counts' | 'collapsed' | 'links' | 'live'
}

/** Minimal inline icons so the examples carry no icon-library dependency. */
function ChatIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function TaskIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" fillOpacity={filled ? 0.25 : 0} />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function CallIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  )
}

/** Stand-in live indicator; any node works (e.g. the LiveDot component). */
function LiveIndicator() {
  return <span aria-hidden="true" className="block size-2.5 rounded-full bg-destructive ring-2 ring-background" />
}

interface Destination {
  id: string
  label: string
  count?: number
  Icon: (props: { filled?: boolean }) => React.ReactElement
}

const destinations: Destination[] = [
  { id: 'chats', label: 'Chats', count: 2, Icon: ChatIcon },
  { id: 'tasks', label: 'Tasks', count: 140, Icon: TaskIcon },
  { id: 'calls', label: 'Calls', Icon: CallIcon },
]

function SelectableList({ collapsed = false }: { collapsed?: boolean }) {
  const [current, setCurrent] = React.useState('chats')
  return (
    <nav aria-label="Workspace" className={collapsed ? 'inline-flex flex-col gap-2' : 'flex w-64 flex-col gap-1'}>
      {destinations.map(({ id, label, count, Icon }) => (
        <NavItem
          key={id}
          label={label}
          count={count}
          collapsed={collapsed}
          selected={current === id}
          icon={<Icon />}
          activeIcon={<Icon filled />}
          onTap={() => setCurrent(id)}
        />
      ))}
    </nav>
  )
}

export function NavItemExamples({ section }: NavItemExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <SelectableList />
      </div>
    )
  }

  if (section === 'counts') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex w-64 flex-col gap-1">
          <NavItem label="Mentions" count={7} icon={<ChatIcon />} />
          <NavItem label="Inbox" count={1200} icon={<ChatIcon />} />
          <NavItem label="Alerts" count={12} maxCount={9} icon={<TaskIcon />} />
          <NavItem
            label="Tâches"
            count={3}
            icon={<TaskIcon />}
            formatCountLabel={(n) => `${n} ouvertes`}
          />
        </div>
      </div>
    )
  }

  if (section === 'collapsed') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <SelectableList collapsed />
      </div>
    )
  }

  if (section === 'links') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <nav aria-label="Docs" className="flex w-64 flex-col gap-1">
          <NavItem asChild label="Chats" count={2} selected icon={<ChatIcon />} activeIcon={<ChatIcon filled />}>
            <a href="#chats" />
          </NavItem>
          <NavItem asChild label="Calls" icon={<CallIcon />}>
            <a href="#calls" />
          </NavItem>
        </nav>
      </div>
    )
  }

  if (section === 'live') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-start gap-8">
          <div className="flex w-64 flex-col gap-1">
            <NavItem
              label="Standup"
              icon={<CallIcon />}
              liveDot={<LiveIndicator />}
              semanticLabel="Standup, call in progress"
            />
          </div>
          <div className="inline-flex flex-col gap-2">
            <NavItem
              label="Standup"
              collapsed
              icon={<CallIcon />}
              liveDot={<LiveIndicator />}
              semanticLabel="Standup, call in progress"
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
