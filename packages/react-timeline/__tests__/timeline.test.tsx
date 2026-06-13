import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Timeline } from '../src/timeline.js'
import type { TimelineItemData } from '../src/timeline.js'

const items: TimelineItemData[] = [
  { id: '1', title: 'Project kick-off', time: '9:00 AM', status: 'done' },
  { id: '2', title: 'Design review', time: '10:30 AM', status: 'current' },
  { id: '3', title: 'Development sprint', status: 'upcoming' },
]

const render = (props: React.ComponentProps<typeof Timeline>) =>
  renderToString(React.createElement(Timeline, props))

describe('Timeline (SSR)', () => {
  it('renders role="list" on the container', () => {
    const html = render({ items })
    expect(html).toContain('role="list"')
  })

  it('renders one role="listitem" per item', () => {
    const html = render({ items })
    expect((html.match(/role="listitem"/g) ?? []).length).toBe(items.length)
  })

  it('renders all item titles', () => {
    const html = render({ items })
    expect(html).toContain('Project kick-off')
    expect(html).toContain('Design review')
    expect(html).toContain('Development sprint')
  })

  it('renders time labels when provided', () => {
    const html = render({ items })
    expect(html).toContain('9:00 AM')
    expect(html).toContain('10:30 AM')
  })

  it('applies data-orientation="vertical" by default', () => {
    const html = render({ items })
    expect(html).toContain('data-orientation="vertical"')
  })

  it('applies data-orientation="horizontal" when specified', () => {
    const html = render({ items, orientation: 'horizontal' })
    expect(html).toContain('data-orientation="horizontal"')
  })

  it('applies data-status to each item', () => {
    const html = render({ items })
    expect(html).toContain('data-status="done"')
    expect(html).toContain('data-status="current"')
    expect(html).toContain('data-status="upcoming"')
  })

  it('falls back to data-status="default" for items without a status', () => {
    const html = render({ items: [{ id: '1', title: 'Event' }] })
    expect(html).toContain('data-status="default"')
  })

  it('renders description when provided', () => {
    const html = render({
      items: [{ id: '1', title: 'Event', description: 'Some details' }],
    })
    expect(html).toContain('Some details')
  })
})
