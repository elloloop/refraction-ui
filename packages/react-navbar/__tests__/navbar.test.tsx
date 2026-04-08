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
