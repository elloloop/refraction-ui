import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { VirtualList, type VirtualListProps } from '../src/index.js'

interface Row {
  id: string
  text: string
}

const ROWS: Row[] = Array.from({ length: 100 }, (_, i) => ({ id: `r${i}`, text: `Row ${i}` }))
const ESTIMATE = 40

function render(props: Partial<VirtualListProps<Row>> = {}) {
  return renderToString(
    <VirtualList<Row>
      items={ROWS}
      getItemKey={(row) => row.id}
      renderItem={(row) => <span>{row.text}</span>}
      estimatedItemSize={ESTIMATE}
      aria-label="History"
      {...props}
    />,
  )
}

/** Count rendered list items. */
function itemCount(html: string): number {
  return (html.match(/role="listitem"/g) ?? []).length
}

describe('VirtualList (SSR)', () => {
  it('renders a focusable, labelled list scroller with a focus ring', () => {
    const html = render()
    expect(html).toMatch(/^<div[^>]*role="list"/)
    expect(html).toContain('tabindex="0"')
    expect(html).toContain('aria-label="History"')
    expect(html).toContain('focus-visible:ring-2')
    expect(html).toContain('overflow-y-auto')
  })

  it('renders an initial window of the first items, not the whole list', () => {
    const html = render({ initialItemCount: 5 })
    expect(itemCount(html)).toBe(5)
    expect(html).toContain('Row 0')
    expect(html).toContain('Row 4')
    expect(html).not.toContain('Row 5<')
  })

  it('defaults the initial window to 10 items', () => {
    expect(itemCount(render())).toBe(10)
  })

  it('renders the last items for a bottom-anchored history', () => {
    const html = render({ anchor: 'end', initialItemCount: 3 })
    expect(itemCount(html)).toBe(3)
    expect(html).toContain('Row 97')
    expect(html).toContain('Row 99')
    expect(html).not.toContain('Row 96<')
    expect(html).toContain('data-anchor="end"')
    expect(html).toContain('data-at-end="true"')
  })

  it('gives every item its position in the full set', () => {
    const html = render({ initialItemCount: 2 })
    expect(html).toContain('aria-posinset="1"')
    expect(html).toContain('aria-posinset="2"')
    expect(html).toContain('aria-setsize="100"')
  })

  it('sizes the content from estimates and positions items by offset', () => {
    const html = render({ initialItemCount: 2 })
    expect(html).toContain(`height:${ROWS.length * ESTIMATE}px`)
    expect(html).toContain('top:0')
    expect(html).toContain(`top:${ESTIMATE}px`)
  })

  it('marks the sizer presentational in list mode so items belong to the list', () => {
    expect(render()).toContain('role="presentation"')
  })

  it('log role: a live log that holds a list, live while at the end', () => {
    const html = render({ role: 'log', anchor: 'end' })
    expect(html).toMatch(/^<div[^>]*role="log"/)
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain('aria-relevant="additions"')
    expect(html).toMatch(/role="list"/)
    expect(itemCount(html)).toBe(10)
  })

  it('log role on a top-anchored list starts quiet (not at the end yet)', () => {
    expect(render({ role: 'log' })).toContain('aria-live="off"')
  })

  it('renders an empty list without items', () => {
    const html = render({ items: [] })
    expect(itemCount(html)).toBe(0)
    expect(html).toContain('height:0')
  })

  it('merges className and itemClassName', () => {
    const html = render({ className: 'h-96 custom-scroller', itemClassName: 'px-4', initialItemCount: 1 })
    expect(html).toContain('custom-scroller')
    expect(html).toContain('h-96')
    expect(html).toMatch(/class="[^"]*absolute[^"]*px-4/)
  })

  it('passes through DOM attributes', () => {
    expect(render({ id: 'chat', 'aria-describedby': 'hint' } as Partial<VirtualListProps<Row>>)).toContain(
      'id="chat"',
    )
  })
})
