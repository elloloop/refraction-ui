import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { LinkCard } from '../src/link-card.js'

describe('LinkCard (React SSR)', () => {
  it('renders an anchor element with the link-card data-slot', () => {
    const html = renderToString(React.createElement(LinkCard, { href: 'https://example.com' }))
    expect(html).toContain('<a')
    expect(html).toContain('data-slot="link-card"')
  })

  it('passes href through to the anchor', () => {
    const html = renderToString(React.createElement(LinkCard, { href: 'https://example.com/docs' }))
    expect(html).toContain('href="https://example.com/docs"')
  })

  it('renders children inside the anchor', () => {
    const html = renderToString(
      React.createElement(LinkCard, { href: 'https://example.com' }, 'Read the docs'),
    )
    expect(html).toContain('Read the docs')
  })

  it('passes through standard anchor attributes', () => {
    const html = renderToString(
      React.createElement(LinkCard, {
        href: 'https://example.com',
        target: '_blank',
        rel: 'noreferrer',
        'aria-label': 'External docs',
      }),
    )
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noreferrer"')
    expect(html).toContain('aria-label="External docs"')
  })

  it('applies a custom className', () => {
    const html = renderToString(
      React.createElement(LinkCard, { href: 'https://example.com', className: 'my-card' }),
    )
    expect(html).toContain('class="my-card"')
  })
})

describe('LinkCard asChild (React SSR)', () => {
  it('renders the child element with the link-card data-slot and merged classes', () => {
    const html = renderToString(
      React.createElement(
        LinkCard,
        { asChild: true, className: 'my-card' },
        React.createElement('a', { href: '/docs', className: 'router-link' }, 'Read the docs'),
      ),
    )
    expect(html).toContain('<a')
    expect(html).toContain('href="/docs"')
    expect(html).toContain('Read the docs')
    expect(html).toContain('data-slot="link-card"')
    expect(html).toContain('my-card')
    expect(html).toContain('router-link')
  })

  it('forwards remaining props onto the child', () => {
    const html = renderToString(
      React.createElement(
        LinkCard,
        { asChild: true, 'aria-label': 'Docs' } as React.ComponentProps<typeof LinkCard>,
        React.createElement('a', { href: '/docs' }, 'Docs'),
      ),
    )
    expect(html).toContain('aria-label="Docs"')
  })

  it('keeps the default anchor render when asChild is absent', () => {
    const html = renderToString(React.createElement(LinkCard, { href: 'https://example.com' }))
    expect(html).toContain('<a')
    expect(html).toContain('data-slot="link-card"')
  })
})
