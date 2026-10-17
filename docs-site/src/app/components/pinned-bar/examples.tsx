'use client'

import * as React from 'react'
import {
  PinnedBar,
  locatePinnedBarIndex,
  type PinnedBarItem,
} from '@refraction-ui/react-pinned-bar'

export type PinnedBarExampleSection = 'basic' | 'unpin' | 'collapsed' | 'single' | 'labels'

interface PinnedBarExamplesProps {
  section: PinnedBarExampleSection
}

const PINS: PinnedBarItem[] = [
  { id: 'p1', author: 'Ada Lovelace', snippet: 'Standup moves to 10:30 from Monday — calendar invite updated.' },
  {
    id: 'p2',
    author: 'Grace Hopper',
    snippet:
      'Release checklist lives in the wiki under Engineering → Releases. Please tick your section before Thursday so we can cut the branch.',
  },
  { id: 'p3', author: 'Alan Turing', snippet: 'Migration plan for the auth service is ready for review.' },
  { id: 'p4', author: 'Katherine Johnson', snippet: 'On-call rota for October is pinned here.' },
  { id: 'p5', author: 'Margaret Hamilton', snippet: 'Incident retro notes: action items assigned.' },
]

/** A stand-in conversation so the bar sits where it would in an app. */
function Conversation({ bar, status }: { bar: React.ReactNode; status?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-2 text-sm font-semibold text-foreground">
        # engineering
      </div>
      {bar}
      <div className="space-y-2 p-4 text-sm text-muted-foreground">
        <p>Messages appear here…</p>
        {status && (
          <p className="text-foreground" aria-live="polite">
            {status}
          </p>
        )}
      </div>
    </div>
  )
}

export function PinnedBarExamples({ section }: PinnedBarExamplesProps) {
  if (section === 'basic') return <BasicExample />
  if (section === 'unpin') return <UnpinExample />
  if (section === 'collapsed') return <CollapsedExample />
  if (section === 'single') {
    return <Conversation bar={<PinnedBar items={PINS.slice(0, 1)} onOpen={() => {}} />} />
  }
  if (section === 'labels') {
    return (
      <Conversation
        bar={
          <PinnedBar
            items={PINS}
            defaultIndex={1}
            labels={{
              region: 'Messages épinglés',
              previous: 'Message épinglé précédent',
              next: 'Message épinglé suivant',
              collapse: 'Réduire',
              expand: 'Développer',
              position: (current, total) => `${current}/${total}`,
              collapsedSummary: (total) => `${total} épinglés`,
              announcement: (item, position) => `Épinglé ${position}. ${item.author} : ${item.snippet}`,
            }}
          />
        }
      />
    )
  }
  return null
}

function BasicExample() {
  const [status, setStatus] = React.useState<string>()
  return (
    <Conversation
      status={status}
      bar={
        <PinnedBar
          items={PINS}
          onOpen={(item) => setStatus(`Jumped to ${item.author}'s message.`)}
          onOpenList={() => setStatus('Opened the list of all pinned messages.')}
        />
      }
    />
  )
}

function UnpinExample() {
  const [items, setItems] = React.useState(PINS)
  const [index, setIndex] = React.useState(PINS.length - 1)
  return (
    <div className="space-y-3">
      <Conversation
        bar={
          items.length > 0 ? (
            <PinnedBar
              items={items}
              index={index}
              onIndexChange={setIndex}
              onUnpin={(item) => {
                const remaining = items.filter((i) => i.id !== item.id)
                setItems(remaining)
                // Stay on the slot the removed pin occupied (clamped to the new last pin).
                setIndex(Math.max(locatePinnedBarIndex(remaining, { id: item.id, index }), 0))
              }}
            />
          ) : null
        }
        status={items.length === 0 ? 'No pinned messages.' : undefined}
      />
      <button
        type="button"
        className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        onClick={() => {
          setItems(PINS)
          setIndex(PINS.length - 1)
        }}
      >
        Reset pins
      </button>
    </div>
  )
}

function CollapsedExample() {
  const [collapsed, setCollapsed] = React.useState(true)
  return (
    <div className="space-y-3">
      <Conversation
        bar={<PinnedBar items={PINS} collapsed={collapsed} onCollapsedChange={setCollapsed} />}
      />
      <p className="text-sm text-muted-foreground">
        Collapsed: <span className="font-medium text-foreground">{collapsed ? 'yes' : 'no'}</span>
      </p>
    </div>
  )
}
