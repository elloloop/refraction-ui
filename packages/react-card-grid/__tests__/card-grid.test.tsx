import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { CardGrid } from '../src/card-grid.js'

// SSR suite — structure only. The card-grid core is currently hollow:
// `columns` is accepted but produces no column classes or attributes, so these
// tests pin the structural contract (data-slot, passthrough) rather than layout.

describe('CardGrid (React)', () => {
  it('renders a div with the card-grid data-slot', () => {
    const html = renderToString(React.createElement(CardGrid, null, 'content'))
    expect(html).toContain('<div')
    expect(html).toContain('data-slot="card-grid"')
    expect(html).toContain('content')
  })

  it('renders children', () => {
    const html = renderToString(
      React.createElement(
        CardGrid,
        null,
        React.createElement('article', null, 'Card A'),
        React.createElement('article', null, 'Card B'),
      ),
    )
    expect(html).toContain('Card A')
    expect(html).toContain('Card B')
    expect(html.match(/<article/g)?.length).toBe(2)
  })

  it('appends a custom className', () => {
    const html = renderToString(React.createElement(CardGrid, { className: 'my-grid' }, 'x'))
    expect(html).toContain('my-grid')
  })

  it('spreads additional HTML attributes onto the root', () => {
    const html = renderToString(
      React.createElement(CardGrid, { id: 'results', 'aria-label': 'Search results' }, 'x'),
    )
    expect(html).toContain('id="results"')
    expect(html).toContain('aria-label="Search results"')
  })

  it('accepts a columns prop and keeps the same structural contract', () => {
    const html = renderToString(React.createElement(CardGrid, { columns: 2 }, 'x'))
    expect(html).toContain('data-slot="card-grid"')
    // No column count leaks into attributes (hollow core today).
    expect(html).not.toContain('columns')
    expect(html).not.toContain('data-columns')
  })
})
