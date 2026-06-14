'use client'

import * as React from 'react'
import { KanbanBoard, KanbanCard } from '@refraction-ui/react-kanban-board'
import type { KanbanColumnDef } from '@refraction-ui/react-kanban-board'

interface Candidate {
  id: string
  name: string
  role: string
  stageId: string
}

interface KanbanBoardExamplesProps {
  section: 'basic' | 'accents' | 'overflow'
}

const baseColumns: KanbanColumnDef[] = [
  { id: 'applied', title: 'Applied' },
  { id: 'screen', title: 'Phone Screen' },
  { id: 'interview', title: 'Interview' },
  { id: 'offer', title: 'Offer' },
]

const baseCards: Candidate[] = [
  { id: '1', name: 'Alice Chen', role: 'Eng II', stageId: 'applied' },
  { id: '2', name: 'Bob Okafor', role: 'Senior Eng', stageId: 'applied' },
  { id: '3', name: 'Carol Rivera', role: 'Eng I', stageId: 'screen' },
  { id: '4', name: 'Dave Kim', role: 'Staff Eng', stageId: 'interview' },
  { id: '5', name: 'Eve Patel', role: 'Eng II', stageId: 'offer' },
]

function CandidateCard({
  card,
  clickable = false,
  onClick,
}: {
  card: Candidate
  clickable?: boolean
  onClick?: () => void
}) {
  return (
    <KanbanCard clickable={clickable} onClick={onClick}>
      <p className="font-medium text-foreground leading-snug">{card.name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{card.role}</p>
    </KanbanCard>
  )
}

export function KanbanBoardExamples({ section }: KanbanBoardExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-6 overflow-x-auto">
        <KanbanBoard<Candidate>
          columns={baseColumns}
          cards={baseCards}
          getCardColumnId={(c) => c.stageId}
          getCardKey={(c) => c.id}
          renderCard={(c) => <CandidateCard card={c} />}
          cardCap={5}
        />
      </div>
    )
  }

  if (section === 'accents') {
    const accentColumns: KanbanColumnDef[] = [
      { id: 'applied', title: 'Applied', accent: '#6366f1' },
      {
        id: 'screen',
        title: 'Phone Screen',
        accent: '#f59e0b',
        note: 'Schedule via Calendly',
      },
      { id: 'interview', title: 'Interview', accent: '#06b6d4' },
      { id: 'offer', title: 'Offer', accent: '#22c55e', note: 'Comp approval required' },
    ]
    return (
      <div className="rounded-xl border border-border bg-card p-6 overflow-x-auto">
        <KanbanBoard<Candidate>
          columns={accentColumns}
          cards={baseCards}
          getCardColumnId={(c) => c.stageId}
          getCardKey={(c) => c.id}
          renderCard={(c) => <CandidateCard card={c} clickable />}
          cardCap={5}
        />
      </div>
    )
  }

  if (section === 'overflow') {
    return <OverflowExample />
  }

  return null
}

function OverflowExample() {
  const [expanded, setExpanded] = React.useState<string | null>(null)

  const manyCards: Candidate[] = [
    ...baseCards,
    { id: '6', name: 'Frank Wu', role: 'Eng II', stageId: 'applied' },
    { id: '7', name: 'Grace Liu', role: 'Senior Eng', stageId: 'applied' },
    { id: '8', name: 'Hana Müller', role: 'Eng III', stageId: 'applied' },
  ]

  const cap = expanded === 'applied' ? 999 : 3

  return (
    <div className="space-y-3">
      {expanded && (
        <p className="text-sm text-muted-foreground">
          Showing all cards in <strong>{expanded}</strong> column.
        </p>
      )}
      <div className="rounded-xl border border-border bg-card p-6 overflow-x-auto">
        <KanbanBoard<Candidate>
          columns={baseColumns}
          cards={manyCards}
          getCardColumnId={(c) => c.stageId}
          getCardKey={(c) => c.id}
          renderCard={(c) => <CandidateCard card={c} />}
          cardCap={cap}
          onShowMore={(colId) => setExpanded(colId)}
        />
      </div>
    </div>
  )
}
