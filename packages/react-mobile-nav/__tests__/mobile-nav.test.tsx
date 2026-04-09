import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import {
  MobileNav,
  MobileNavTrigger,
  MobileNavContent,
  MobileNavLink,
} from '../src/mobile-nav.js'

beforeEach(() => {
  resetIdCounter()
})

describe('MobileNav (React)', () => {
  it('renders a nav element', () => {
    const html = renderToString(
      React.createElement(MobileNav, null, 'nav content'),
    )
    expect(html).toContain('<nav')
    expect(html).toContain('nav content')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(MobileNav, { className: 'my-nav' }, 'content'),
    )
    expect(html).toContain('my-nav')
  })
})

describe('MobileNavTrigger (React)', () => {
  it('renders a button with aria attributes', () => {
    const html = renderToString(
      React.createElement(
        MobileNav,
        null,
        React.createElement(MobileNavTrigger),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('aria-controls')
    expect(html).toContain('aria-label="Toggle menu"')
  })

  it('reflects open state in aria-expanded', () => {
    const html = renderToString(
      React.createElement(
        MobileNav,
        { open: true },
        React.createElement(MobileNavTrigger),
      ),
    )
    expect(html).toContain('aria-expanded="true"')
  })

  it('renders default hamburger icon', () => {
    const html = renderToString(
      React.createElement(
        MobileNav,
        null,
        React.createElement(MobileNavTrigger),
      ),
    )
    expect(html).toContain('<svg')
    expect(html).toContain('aria-hidden="true"')
  })

  it('renders custom children instead of default icon', () => {
    const html = renderToString(
      React.createElement(
        MobileNav,
        null,
        React.createElement(MobileNavTrigger, null, 'Menu'),
      ),
    )
    expect(html).toContain('Menu')
    expect(html).not.toContain('<svg')
  })
})

describe('MobileNavContent (React)', () => {
  it('renders with role=menu and data-state=closed when closed', () => {
    const html = renderToString(
      React.createElement(
        MobileNav,
        null,
        React.createElement(MobileNavContent, null, 'Links'),
      ),
    )
    expect(html).toContain('role="menu"')
    expect(html).toContain('data-state="closed"')
    expect(html).toContain('Links')
  })

  it('renders with data-state=open when open', () => {
    const html = renderToString(
      React.createElement(
        MobileNav,
        { open: true },
        React.createElement(MobileNavContent, null, 'Links'),
      ),
    )
    expect(html).toContain('data-state="open"')
  })

  it('content id matches trigger aria-controls', () => {
    const html = renderToString(
      React.createElement(
        MobileNav,
        null,
        React.createElement(MobileNavTrigger),
        React.createElement(MobileNavContent, null, 'Links'),
      ),
    )
    // Extract the aria-controls value
    const controlsMatch = html.match(/aria-controls="([^"]+)"/)
    const idMatch = html.match(/id="([^"]+)"/)
    expect(controlsMatch).not.toBeNull()
    expect(idMatch).not.toBeNull()
    expect(controlsMatch![1]).toBe(idMatch![1])
  })
})

describe('MobileNavLink (React)', () => {
  it('renders an anchor with role=menuitem', () => {
    const html = renderToString(
      React.createElement(
        MobileNav,
        null,
        React.createElement(MobileNavContent, null,
          React.createElement(MobileNavLink, { href: '/about' }, 'About'),
        ),
      ),
    )
    expect(html).toContain('<a')
    expect(html).toContain('role="menuitem"')
    expect(html).toContain('href="/about"')
    expect(html).toContain('About')
  })
})
