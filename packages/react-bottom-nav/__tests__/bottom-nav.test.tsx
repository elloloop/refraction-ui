import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { BottomNav } from '../src/bottom-nav.js'

describe('BottomNav (React)', () => {
  it('renders a nav element', () => {
    const html = renderToString(React.createElement(BottomNav))
    expect(html).toContain('<nav')
  })

  it('applies navigation ARIA props', () => {
    const html = renderToString(React.createElement(BottomNav))
    expect(html).toContain('role="navigation"')
    expect(html).toContain('aria-label="Main navigation"')
  })

  it('renders tab items', () => {
    const tabs = [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' },
    ]
    const html = renderToString(React.createElement(BottomNav, { tabs }))
    expect(html).toContain('Home')
    expect(html).toContain('Search')
  })

  it('applies active state to current tab', () => {
    const tabs = [
      { label: 'Home', href: '/' },
      { label: 'Search', href: '/search' },
    ]
    const html = renderToString(
      React.createElement(BottomNav, { tabs, currentPath: '/search' }),
    )
    expect(html).toContain('aria-current="page"')
  })

  it('applies md:hidden for mobile-only display', () => {
    const html = renderToString(React.createElement(BottomNav))
    expect(html).toContain('md:hidden')
  })

  it('renders tab with icon', () => {
    const tabs = [{ label: 'Home', href: '/', icon: 'H' }]
    const html = renderToString(React.createElement(BottomNav, { tabs }))
    expect(html).toContain('H')
    expect(html).toContain('aria-hidden="true"')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(BottomNav, { className: 'my-nav' }),
    )
    expect(html).toContain('my-nav')
  })
})
