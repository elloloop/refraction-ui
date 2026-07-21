import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Navbar } from '../src/navbar.js'

describe('Navbar (React)', () => {
  it('renders a header element', () => {
    const html = renderToString(React.createElement(Navbar))
    expect(html).toContain('<header')
  })

  it('renders a nav element with ARIA props', () => {
    const html = renderToString(React.createElement(Navbar))
    expect(html).toContain('<nav')
    expect(html).toContain('role="navigation"')
    expect(html).toContain('aria-label="Main navigation"')
  })

  it('renders links', () => {
    const links = [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
    ]
    const html = renderToString(React.createElement(Navbar, { links }))
    expect(html).toContain('Home')
    expect(html).toContain('About')
    expect(html).toContain('href="/"')
    expect(html).toContain('href="/about"')
  })

  it('applies active link aria-current', () => {
    const links = [{ label: 'About', href: '/about' }]
    const html = renderToString(
      React.createElement(Navbar, { links, currentPath: '/about' }),
    )
    expect(html).toContain('aria-current="page"')
  })

  it('applies active link styles', () => {
    const links = [{ label: 'About', href: '/about' }]
    const html = renderToString(
      React.createElement(Navbar, { links, currentPath: '/about' }),
    )
    expect(html).toContain('text-foreground')
  })

  it('applies blur variant by default', () => {
    const html = renderToString(React.createElement(Navbar))
    expect(html).toContain('backdrop-blur')
  })

  it('applies solid variant', () => {
    const html = renderToString(
      React.createElement(Navbar, { variant: 'solid' }),
    )
    expect(html).not.toContain('backdrop-blur')
  })

  it('renders logo slot', () => {
    const html = renderToString(
      React.createElement(Navbar, { logo: React.createElement('span', null, 'Logo') }),
    )
    expect(html).toContain('Logo')
  })

  it('renders actions slot', () => {
    const html = renderToString(
      React.createElement(Navbar, {
        actions: React.createElement('button', null, 'Sign In'),
      }),
    )
    expect(html).toContain('Sign In')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(Navbar, { className: 'my-navbar' }),
    )
    expect(html).toContain('my-navbar')
  })
})

// ---------------------------------------------------------------
// Expanded SSR coverage
// ---------------------------------------------------------------

describe('Navbar – structure (React)', () => {
  it('renders links as list items inside a ul', () => {
    const links = [{ label: 'Home', href: '/' }]
    const html = renderToString(React.createElement(Navbar, { links }))
    expect(html).toContain('<ul')
    expect(html).toContain('<li')
    expect(html).toContain('<a')
  })

  it('hides the link list on mobile via CSS (no menu toggle button)', () => {
    const links = [{ label: 'Home', href: '/' }]
    const html = renderToString(React.createElement(Navbar, { links }))
    // Links collapse with `hidden md:flex`; the component renders no
    // hamburger/toggle button of its own.
    expect(html).toContain('hidden')
    expect(html).toContain('md:flex')
    expect(html).not.toContain('<button')
  })

  it('renders multiple links in order', () => {
    const links = [
      { label: 'Home', href: '/' },
      { label: 'Docs', href: '/docs' },
      { label: 'Blog', href: '/blog' },
    ]
    const html = renderToString(React.createElement(Navbar, { links }))
    const idxHome = html.indexOf('Home')
    const idxDocs = html.indexOf('Docs')
    const idxBlog = html.indexOf('Blog')
    expect(idxHome).toBeGreaterThan(-1)
    expect(idxHome).toBeLessThan(idxDocs)
    expect(idxDocs).toBeLessThan(idxBlog)
  })

  it('renders an empty link list when no links are provided', () => {
    const html = renderToString(React.createElement(Navbar))
    expect(html).toContain('<ul')
    expect(html).not.toContain('<li')
  })

  it('applies sticky positioning base classes', () => {
    const html = renderToString(React.createElement(Navbar))
    expect(html).toContain('sticky')
    expect(html).toContain('top-0')
    expect(html).toContain('z-40')
  })

  it('applies link typography classes', () => {
    const links = [{ label: 'Home', href: '/' }]
    const html = renderToString(React.createElement(Navbar, { links }))
    expect(html).toContain('text-sm')
    expect(html).toContain('font-medium')
  })

  it('spreads extra props onto the header element', () => {
    const html = renderToString(
      React.createElement(Navbar, { id: 'site-nav' }),
    )
    expect(html).toContain('id="site-nav"')
  })
})

describe('Navbar – active route (React)', () => {
  it('marks the root link active only for the exact root path', () => {
    const links = [{ label: 'Home', href: '/' }]
    const html = renderToString(
      React.createElement(Navbar, { links, currentPath: '/about' }),
    )
    expect(html).not.toContain('aria-current')
  })

  it('marks a link active for nested routes (prefix match)', () => {
    const links = [{ label: 'Docs', href: '/docs' }]
    const html = renderToString(
      React.createElement(Navbar, { links, currentPath: '/docs/intro' }),
    )
    expect(html).toContain('aria-current="page"')
  })

  it('does not mark unrelated links active', () => {
    const links = [
      { label: 'Docs', href: '/docs' },
      { label: 'Blog', href: '/blog' },
    ]
    const html = renderToString(
      React.createElement(Navbar, { links, currentPath: '/docs' }),
    )
    // Exactly one active link: the docs one
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
  })

  it('styles inactive links as muted', () => {
    const links = [{ label: 'Blog', href: '/blog' }]
    const html = renderToString(
      React.createElement(Navbar, { links, currentPath: '/docs' }),
    )
    expect(html).toContain('text-muted-foreground')
  })

  it('defaults currentPath to / when omitted', () => {
    const links = [{ label: 'Home', href: '/' }]
    const html = renderToString(React.createElement(Navbar, { links }))
    expect(html).toContain('aria-current="page"')
  })
})

describe('Navbar – variants (React)', () => {
  it('applies the gradient variant', () => {
    const html = renderToString(
      React.createElement(Navbar, { variant: 'gradient' }),
    )
    expect(html).toContain('bg-gradient-to-b')
  })

  it('applies the transparent variant', () => {
    const html = renderToString(
      React.createElement(Navbar, { variant: 'transparent' }),
    )
    expect(html).toContain('bg-transparent')
    expect(html).toContain('border-transparent')
  })

  it('applies the solid variant background', () => {
    const html = renderToString(
      React.createElement(Navbar, { variant: 'solid' }),
    )
    expect(html).toContain('bg-background')
  })
})

describe('Navbar – slots (React)', () => {
  it('wraps the logo in a flex-shrink-0 container', () => {
    const html = renderToString(
      React.createElement(Navbar, {
        logo: React.createElement('span', null, 'Brand'),
      }),
    )
    expect(html).toContain('flex-shrink-0')
    expect(html).toContain('Brand')
  })

  it('renders actions inside a flex container', () => {
    const html = renderToString(
      React.createElement(Navbar, {
        actions: React.createElement('button', null, 'Sign In'),
      }),
    )
    expect(html).toContain('flex items-center gap-2')
    expect(html).toContain('Sign In')
  })

  it('renders logo, links, and actions together', () => {
    const links = [{ label: 'Docs', href: '/docs' }]
    const html = renderToString(
      React.createElement(Navbar, {
        links,
        logo: React.createElement('span', null, 'Brand'),
        actions: React.createElement('button', null, 'Sign In'),
      }),
    )
    expect(html).toContain('Brand')
    expect(html).toContain('Docs')
    expect(html).toContain('Sign In')
  })
})

describe('Navbar – keyboard navigation (React)', () => {
  it('renders every link as a natively focusable anchor with an href', () => {
    const links = [
      { label: 'Home', href: '/' },
      { label: 'Docs', href: '/docs' },
    ]
    const html = renderToString(React.createElement(Navbar, { links }))
    // Anchors with hrefs participate in tab order without extra wiring
    expect(html.match(/<a href="\/"/g)).toHaveLength(1)
    expect(html.match(/<a href="\/docs"/g)).toHaveLength(1)
  })
})
