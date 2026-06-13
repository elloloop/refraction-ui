import { describe, it, expect } from 'vitest'
import {
  createTimeline,
  getTimelineItemAria,
  resolveTimelineItems,
} from '../src/index.js'

describe('resolveTimelineItems', () => {
  it('fills missing status with "default"', () => {
    const items = [{ id: '1', title: 'Start' }]
    const resolved = resolveTimelineItems(items)
    expect(resolved[0].status).toBe('default')
  })

  it('preserves explicit status values', () => {
    const items = [
      { id: '1', title: 'Past', status: 'done' as const },
      { id: '2', title: 'Now', status: 'current' as const },
      { id: '3', title: 'Later', status: 'upcoming' as const },
    ]
    const resolved = resolveTimelineItems(items)
    expect(resolved.map((i) => i.status)).toEqual(['done', 'current', 'upcoming'])
  })

  it('fills missing time and description with empty strings', () => {
    const resolved = resolveTimelineItems([{ id: '1', title: 'Event' }])
    expect(resolved[0].time).toBe('')
    expect(resolved[0].description).toBe('')
  })

  it('preserves provided time and description', () => {
    const resolved = resolveTimelineItems([
      { id: '1', title: 'Event', time: '10:00 AM', description: 'Details here' },
    ])
    expect(resolved[0].time).toBe('10:00 AM')
    expect(resolved[0].description).toBe('Details here')
  })

  it('returns an empty array for empty input', () => {
    expect(resolveTimelineItems([])).toEqual([])
  })
})

describe('createTimeline', () => {
  it('defaults to vertical orientation', () => {
    const { ariaProps, dataAttributes } = createTimeline()
    expect(ariaProps.role).toBe('list')
    expect(dataAttributes['data-orientation']).toBe('vertical')
  })

  it('emits horizontal data attribute when orientation is horizontal', () => {
    const { dataAttributes } = createTimeline({ orientation: 'horizontal' })
    expect(dataAttributes['data-orientation']).toBe('horizontal')
  })

  it('always emits role="list"', () => {
    expect(createTimeline({ orientation: 'vertical' }).ariaProps.role).toBe('list')
    expect(createTimeline({ orientation: 'horizontal' }).ariaProps.role).toBe('list')
  })
})

describe('getTimelineItemAria', () => {
  it('returns role="listitem"', () => {
    expect(getTimelineItemAria().role).toBe('listitem')
  })
})
