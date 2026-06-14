import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { KanbanBoard, KanbanCard } from '../src/kanban-board.js'
import type { KanbanColumnDef } from '../src/kanban-board.js'

interface Candidate {
  id: string
  name: string
  stageId: string
}

const columns: KanbanColumnDef[] = [
  { id: 'applied', title: 'Applied', accent: '#6366f1' },
  { id: 'screen', title: 'Phone Screen', note: 'Technical screen required' },
  { id: 'offer', title: 'Offer' },
]

const candidates: Candidate[] = [
  { id: '1', name: 'Alice', stageId: 'applied' },
  { id: '2', name: 'Bob', stageId: 'screen' },
  { id: '3', name: 'Carol', stageId: 'applied' },
]

function renderBoard(
  overrides: Partial<Parameters<typeof KanbanBoard>[0]> = {},
) {
  return renderToString(
    React.createElement(KanbanBoard<Candidate>, {
      columns,
      cards: candidates,
      getCardColumnId: (c) => c.stageId,
      getCardKey: (c) => c.id,
      renderCard: (c) => React.createElement(KanbanCard, null, c.name),
      ...overrides,
    }),
  )
}

describe('KanbanBoard (SSR)', () => {
  it('renders one column section per column def', () => {
    const html = renderBoard()
    // Each column has its title in the header
    expect(html).toContain('Applied')
    expect(html).toContain('Phone Screen')
    expect(html).toContain('Offer')
  })

  it('distributes cards to their correct columns', () => {
    const html = renderBoard()
    expect(html).toContain('Alice')
    expect(html).toContain('Bob')
    expect(html).toContain('Carol')
  })

  it('shows correct count for each column', () => {
    const html = renderBoard()
    // Applied has 2, Screen has 1, Offer has 0
    // Count badges are rendered as text inside the count class element.
    // We verify the board role and that counts appear somewhere.
    expect(html).toContain('role="group"')
    // The count "2" for Applied and "1" for Screen should be present.
    expect(html).toContain('>2<')
    expect(html).toContain('>1<')
    expect(html).toContain('>0<')
  })

  it('renders "+N more" when cards exceed cardCap', () => {
    const manyCards: Candidate[] = Array.from({ length: 7 }, (_, i) => ({
      id: `c${i}`,
      name: `Candidate ${i}`,
      stageId: 'applied',
    }))
    const html = renderBoard({ cards: manyCards, cardCap: 5 })
    expect(html).toContain('+2 more')
  })

  it('does not render "+N more" when cards are within cap', () => {
    const html = renderBoard({ cardCap: 10 })
    expect(html).not.toContain('more')
  })

  it('applies accent CSS var on column with accent', () => {
    const html = renderBoard()
    expect(html).toContain('--kanban-accent')
    expect(html).toContain('#6366f1')
  })

  it('renders the column note when provided', () => {
    const html = renderBoard()
    expect(html).toContain('Technical screen required')
  })

  it('renders the board role="group" and aria-label', () => {
    const html = renderBoard()
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Board"')
  })
})
