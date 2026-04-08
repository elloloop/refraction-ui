import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Sidebar } from '../src/sidebar.js'

describe('Sidebar (React)', () => {
  const sampleSections = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'D' },
        { label: 'Settings', href: '/settings' },
      ],
    },
  ]

  it('renders an aside element', () => {
    const html = renderToString(React.createElement(Sidebar))
    expect(html).toContain('<aside')
  })

  it('applies sidebar ARIA props', () => {
    const html = renderToString(React.createElement(Sidebar))
    expect(html).toContain('role="navigation"')
    expect(html).toContain('aria-label="Sidebar"')
  })

  it('renders sections with titles', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections: sampleSections }),
    )
    expect(html).toContain('Main')
  })

  it('renders items with links', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections: sampleSections }),
    )
    expect(html).toContain('Dashboard')
    expect(html).toContain('Settings')
    expect(html).toContain('href="/dashboard"')
  })

  it('applies active state', () => {
    const html = renderToString(
      React.createElement(Sidebar, {
        sections: sampleSections,
        currentPath: '/dashboard',
      }),
    )
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('bg-accent')
  })

  it('renders icon with aria-hidden', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections: sampleSections }),
    )
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('D')
  })

  it('hides labels when collapsed', () => {
    const html = renderToString(
      React.createElement(Sidebar, {
        sections: sampleSections,
        collapsed: true,
      }),
    )
    // Section title hidden when collapsed
    expect(html).not.toContain('Main')
    // Item labels hidden when collapsed
    expect(html).not.toContain('Dashboard')
    // But icons still render
    expect(html).toContain('D')
  })

  it('applies collapsed width', () => {
    const html = renderToString(
      React.createElement(Sidebar, { collapsed: true }),
    )
    expect(html).toContain('w-16')
  })

  it('applies expanded width by default', () => {
    const html = renderToString(React.createElement(Sidebar))
    expect(html).toContain('w-64')
  })

  it('filters items by user roles', () => {
    const sections = [
      {
        title: 'Admin',
        items: [
          { label: 'Users', href: '/users', roles: ['admin'] },
          { label: 'Public', href: '/public' },
        ],
      },
    ]
    const html = renderToString(
      React.createElement(Sidebar, { sections, userRoles: [] }),
    )
    expect(html).not.toContain('Users')
    expect(html).toContain('Public')
  })

  it('applies hidden md:flex classes', () => {
    const html = renderToString(React.createElement(Sidebar))
    expect(html).toContain('md:flex')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(Sidebar, { className: 'my-sidebar' }),
    )
    expect(html).toContain('my-sidebar')
  })
})
