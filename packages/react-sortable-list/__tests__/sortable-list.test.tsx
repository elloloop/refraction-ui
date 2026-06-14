import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { SortableList } from '../src/sortable-list.js'

interface Item {
  id: string
  label: string
}

const items: Item[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
]

const render = (props: Partial<React.ComponentProps<typeof SortableList<Item>>> = {}) =>
  renderToString(
    React.createElement(SortableList<Item>, {
      items,
      getKey: (item) => item.id,
      renderItem: (item) => React.createElement('span', null, item.label),
      ...props,
    }),
  )

describe('SortableList (SSR)', () => {
  it('renders role=list on the container', () => {
    const html = render()
    expect(html).toContain('role="list"')
  })

  it('renders one role=listitem per item', () => {
    const html = render()
    expect((html.match(/role="listitem"/g) ?? []).length).toBe(items.length)
  })

  it('renders a grip button (aria-label="Reorder item") per row', () => {
    const html = render()
    expect((html.match(/aria-label="Reorder item"/g) ?? []).length).toBe(
      items.length,
    )
  })

  it('renders item content via renderItem', () => {
    const html = render()
    expect(html).toContain('Alpha')
    expect(html).toContain('Beta')
    expect(html).toContain('Gamma')
  })

  it('applies a custom className to the container', () => {
    const html = render({ className: 'my-custom-list' })
    expect(html).toContain('my-custom-list')
  })

  it('applies data-component attribute', () => {
    const html = render()
    expect(html).toContain('data-component="sortable-list"')
  })
})
