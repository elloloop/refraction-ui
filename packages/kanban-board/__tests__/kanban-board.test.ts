import { describe, it, expect } from 'vitest'
import {
  createKanbanBoard,
  cardsByColumn,
  visibleAndOverflow,
  type KanbanColumnDef,
} from '../src/index.js'

const columns: KanbanColumnDef[] = [
  { id: 'applied', title: 'Applied' },
  { id: 'screen', title: 'Phone Screen' },
  { id: 'offer', title: 'Offer' },
]

interface Card {
  id: string
  name: string
  columnId: string
}

const cards: Card[] = [
  { id: '1', name: 'Alice', columnId: 'applied' },
  { id: '2', name: 'Bob', columnId: 'screen' },
  { id: '3', name: 'Carol', columnId: 'applied' },
  { id: '4', name: 'Dave', columnId: 'screen' },
]

describe('cardsByColumn', () => {
  it('buckets cards into their respective columns', () => {
    const map = cardsByColumn(cards, (c) => c.columnId, columns)
    expect(map.get('applied')?.map((c) => c.id)).toEqual(['1', '3'])
    expect(map.get('screen')?.map((c) => c.id)).toEqual(['2', '4'])
  })

  it('keeps empty arrays for columns with no cards', () => {
    const map = cardsByColumn(cards, (c) => c.columnId, columns)
    expect(map.get('offer')).toEqual([])
  })

  it('preserves column order in the map', () => {
    const map = cardsByColumn(cards, (c) => c.columnId, columns)
    expect([...map.keys()]).toEqual(['applied', 'screen', 'offer'])
  })

  it('silently drops cards referencing unknown columns', () => {
    const extra: Card[] = [
      ...cards,
      { id: '5', name: 'Eve', columnId: 'unknown' },
    ]
    const map = cardsByColumn(extra, (c) => c.columnId, columns)
    const allCards = [...map.values()].flat()
    expect(allCards.find((c) => c.id === '5')).toBeUndefined()
  })
})

describe('visibleAndOverflow', () => {
  it('returns all cards and overflow 0 when count <= cap', () => {
    const { visible, overflow } = visibleAndOverflow([1, 2, 3], 5)
    expect(visible).toEqual([1, 2, 3])
    expect(overflow).toBe(0)
  })

  it('returns exactly cap cards and correct overflow count when over cap', () => {
    const { visible, overflow } = visibleAndOverflow([1, 2, 3, 4, 5, 6, 7], 5)
    expect(visible).toHaveLength(5)
    expect(overflow).toBe(2)
  })

  it('defaults cap to 5', () => {
    const arr = [1, 2, 3, 4, 5, 6]
    const { visible, overflow } = visibleAndOverflow(arr)
    expect(visible).toHaveLength(5)
    expect(overflow).toBe(1)
  })

  it('handles empty list', () => {
    const { visible, overflow } = visibleAndOverflow([], 5)
    expect(visible).toEqual([])
    expect(overflow).toBe(0)
  })
})

describe('createKanbanBoard', () => {
  it('returns role="group" aria prop', () => {
    const { ariaProps } = createKanbanBoard()
    expect(ariaProps.role).toBe('group')
  })

  it('includes a board aria-label', () => {
    const { ariaProps } = createKanbanBoard()
    expect(ariaProps['aria-label']).toBe('Board')
  })

  it('emits data-component attribute', () => {
    const { dataAttributes } = createKanbanBoard()
    expect(dataAttributes['data-component']).toBe('kanban-board')
  })
})
