'use client'

import * as React from 'react'
import { ThreadSummary, type ThreadSummaryAvatar } from '@refraction-ui/react-thread-summary'

interface ThreadSummaryExamplesProps {
  section: 'basic' | 'in-message' | 'narrow' | 'sizes'
}

const repliers: ThreadSummaryAvatar[] = [
  { id: 'ada', name: 'Ada Lovelace' },
  { id: 'grace', name: 'Grace Hopper' },
  { id: 'alan', name: 'Alan Turing' },
  { id: 'kat', name: 'Katherine Johnson' },
]

export function ThreadSummaryExamples({ section }: ThreadSummaryExamplesProps) {
  if (section === 'basic') return <BasicExample />
  if (section === 'in-message') return <InMessageExample />

  if (section === 'narrow') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="w-48 rounded-md border border-dashed border-border p-2">
          <ThreadSummary
            avatars={repliers}
            label="12 replies"
            detail="Last reply 2 h ago"
          />
        </div>
      </div>
    )
  }

  if (section === 'sizes') {
    return (
      <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-start gap-3">
        <ThreadSummary avatars={repliers} label="4 replies" detail="xs (default)" />
        <ThreadSummary avatars={repliers} label="4 replies" detail="sm" avatarSize="sm" />
        <ThreadSummary
          avatars={repliers}
          label="4 replies"
          detail="sm, maxAvatars 4"
          avatarSize="sm"
          maxAvatars={4}
        />
      </div>
    )
  }

  return null
}

function BasicExample() {
  const [opened, setOpened] = React.useState(0)
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-3">
      <ThreadSummary
        avatars={repliers}
        label="12 replies"
        detail="Last reply 2 h ago"
        onTap={() => setOpened((n) => n + 1)}
      />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {`Thread opened ${opened} ${opened === 1 ? 'time' : 'times'}`}
      </p>
    </div>
  )
}

function InMessageExample() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="rounded-xl border border-border bg-card p-8 space-y-3">
      <div className="flex flex-col items-start gap-1">
        <p className="text-sm font-semibold text-foreground">Ada Lovelace</p>
        <p className="text-sm text-foreground">
          Draft of the launch post is up — comments welcome before Friday.
        </p>
        <ThreadSummary
          avatars={repliers.slice(0, 2)}
          label="3 replies"
          detail="Last reply yesterday"
          semanticLabel="Open thread on Ada's message, 3 replies, last reply yesterday"
          onTap={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="-ml-1.5"
        />
      </div>
      {open && (
        <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
          The thread panel would open here.
        </p>
      )}
    </div>
  )
}
