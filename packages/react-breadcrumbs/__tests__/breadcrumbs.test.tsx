import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Breadcrumbs } from '../src/breadcrumbs.js'

describe('Breadcrumbs (React)', () => {
  it('renders a nav element', () => {
    const items = [{ label: 'Home', href: '/' }]
    const html = renderToString(React.createElement(Breadcrumbs, { items }))
    expect(html).toContain('<nav')
  })

  it('applies breadcrumb ARIA label', () => {
    const items = [{ label: 'Home', href: '/' }]
    const html = renderToString(React.createElement(Breadcrumbs, { items }))
    expect(html).toContain('aria-label="Breadcrumb"')
  })

  it('renders an ordered list', () => {
    const items = [{ label: 'Home', href: '/' }]
    const html = renderToString(React.createElement(Breadcrumbs, { items }))
    expect(html).toContain('<ol')
  })

  it('renders breadcrumb items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Widget' },
    ]
    const html = renderToString(React.createElement(Breadcrumbs, { items }))
    expect(html).toContain('Home')
    expect(html).toContain('Products')
    expect(html).toContain('Widget')
  })

  it('renders separators between items', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
    ]
    const html = renderToString(React.createElement(Breadcrumbs, { items }))
    expect(html).toContain('aria-hidden="true"')
  })

  it('uses custom separator', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'About' },
    ]
    const html = renderToString(
      React.createElement(Breadcrumbs, { items, separator: '>' }),
    )
    expect(html).toContain('&gt;')
  })

  it('marks last item with aria-current=page', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current' },
    ]
    const html = renderToString(React.createElement(Breadcrumbs, { items }))
    expect(html).toContain('aria-current="page"')
  })

  it('renders links for non-last items with href', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Team' },
    ]
    const html = renderToString(React.createElement(Breadcrumbs, { items }))
    expect(html).toContain('href="/"')
    expect(html).toContain('href="/about"')
  })

  it('auto-generates from pathname', () => {
    const html = renderToString(
      React.createElement(Breadcrumbs, { pathname: '/products/widgets' }),
    )
    expect(html).toContain('Home')
    expect(html).toContain('Products')
    expect(html).toContain('Widgets')
  })

  it('applies active style to last item', () => {
    const items = [
      { label: 'Home', href: '/' },
      { label: 'Current' },
    ]
    const html = renderToString(React.createElement(Breadcrumbs, { items }))
    expect(html).toContain('font-medium')
  })

  it('applies custom className', () => {
    const items = [{ label: 'Home', href: '/' }]
    const html = renderToString(
      React.createElement(Breadcrumbs, { items, className: 'my-breadcrumbs' }),
    )
    expect(html).toContain('my-breadcrumbs')
  })
})
