import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Pagination } from '../src/pagination.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(Pagination, props))

describe('Pagination (SSR)', () => {
  it('renders a navigation landmark with prev/next and every page for small totals', () => {
    const html = render({ totalPages: 5 })
    expect(html).toContain('role="navigation"')
    expect(html).toContain('aria-label="Pagination"')
    expect(html).toContain('Previous')
    expect(html).toContain('Next')
    for (const n of [1, 2, 3, 4, 5]) expect(html).toContain(`>${n}</button>`)
    expect(html).not.toContain('…')
  })

  it('marks the current page and disables previous on page 1', () => {
    const html = render({ page: 1, totalPages: 5 })
    expect((html.match(/aria-current="page"/g) ?? []).length).toBe(1)
    expect(html).toContain('aria-label="Previous page" disabled=""')
    expect(html).not.toContain('aria-label="Next page" disabled=""')
  })

  it('disables next on the last page', () => {
    const html = render({ page: 5, totalPages: 5 })
    expect(html).toContain('aria-label="Next page" disabled=""')
  })

  it('renders ellipses for large totals', () => {
    const html = render({ page: 5, totalPages: 20 })
    expect((html.match(/…/g) ?? []).length).toBe(2)
    expect(html).toContain('>1</button>')
    expect(html).toContain('>20</button>')
    expect(html).not.toContain('>3</button>')
  })

  it('renders children instead of the generated controls when provided', () => {
    const html = renderToString(
      React.createElement(
        Pagination,
        { totalPages: 5 },
        React.createElement('button', null, 'Custom'),
      ),
    )
    expect(html).toContain('Custom')
    expect(html).not.toContain('Previous')
    expect(html).toContain('role="navigation"')
  })
})
