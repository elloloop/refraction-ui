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

// ---------------------------------------------------------------
// Additional SSR coverage (active matching, filtering, structure)
// ---------------------------------------------------------------

describe('Sidebar – active state matching (React)', () => {
  const sections = [
    {
      title: 'Main',
      items: [
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
      ],
    },
  ]

  it('marks an item active for nested paths (prefix match)', () => {
    const html = renderToString(
      React.createElement(Sidebar, {
        sections,
        currentPath: '/dashboard/settings',
      }),
    )
    expect(html).toContain('aria-current="page"')
  })

  it('marks the root href active only on the exact root path', () => {
    const onRoot = renderToString(
      React.createElement(Sidebar, { sections, currentPath: '/' }),
    )
    const onDashboard = renderToString(
      React.createElement(Sidebar, { sections, currentPath: '/dashboard' }),
    )

    const rootActive = onRoot.match(/aria-current="page"/g) ?? []
    const dashActive = onDashboard.match(/aria-current="page"/g) ?? []
    expect(rootActive).toHaveLength(1)
    expect(dashActive).toHaveLength(1)
    // On /dashboard the root link must not steal the active state.
    const dashLink = onDashboard.match(/<a href="\/dashboard"[^>]*aria-current="page"/)
    expect(dashLink).toBeTruthy()
    const rootLink = onDashboard.match(/<a href="\/"[^>]*aria-current="page"/)
    expect(rootLink).toBeNull()
  })

  it('renders no aria-current when nothing matches', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections, currentPath: '/elsewhere' }),
    )
    expect(html).not.toContain('aria-current')
  })

  it('styles active and inactive items differently', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections, currentPath: '/dashboard' }),
    )
    expect(html).toContain('text-accent-foreground')
    expect(html).toContain('text-muted-foreground')
  })
})

describe('Sidebar – role filtering (React)', () => {
  const sections = [
    {
      title: 'Admin',
      items: [{ label: 'Users', href: '/users', roles: ['admin'] }],
    },
    {
      title: 'General',
      items: [{ label: 'Public', href: '/public' }],
    },
  ]

  it('drops a section entirely when every item is filtered out', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections, userRoles: [] }),
    )
    expect(html).not.toContain('Admin')
    expect(html).not.toContain('Users')
    expect(html).toContain('General')
    expect(html).toContain('Public')
  })

  it('shows restricted items to users with the role', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections, userRoles: ['admin'] }),
    )
    expect(html).toContain('Admin')
    expect(html).toContain('Users')
  })

  it('shows items with no role restriction to everyone', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections, userRoles: ['viewer'] }),
    )
    expect(html).toContain('Public')
    expect(html).not.toContain('Users')
  })
})

describe('Sidebar – structure and mobile behavior (React)', () => {
  const sections = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'D' },
        { label: 'Settings', href: '/settings' },
      ],
    },
    {
      title: 'Help',
      items: [{ label: 'Docs', href: '/docs' }],
    },
  ]

  it('is hidden below the md breakpoint', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections }),
    )
    expect(html).toContain('hidden')
    expect(html).toContain('md:flex')
    expect(html).toContain('border-r')
  })

  it('renders section titles as uppercase headings', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections }),
    )
    expect(html).toContain('<h3')
    expect(html).toContain('uppercase')
    expect(html).toContain('tracking-wider')
    expect(html).toContain('Help')
  })

  it('renders items as list entries with links', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections }),
    )
    expect(html).toContain('<ul')
    expect(html).toContain('<li')
    expect(html).toContain('href="/docs"')
  })

  it('only renders aria-hidden wrappers for items that have icons', () => {
    const html = renderToString(
      React.createElement(Sidebar, { sections }),
    )
    const hiddenSpans = html.match(/aria-hidden="true"/g) ?? []
    expect(hiddenSpans).toHaveLength(1)
  })

  it('forwards extra props to the aside element', () => {
    const html = renderToString(
      React.createElement(Sidebar, { id: 'nav', 'data-testid': 'sidebar' }),
    )
    expect(html).toContain('id="nav"')
    expect(html).toContain('data-testid="sidebar"')
  })
})
