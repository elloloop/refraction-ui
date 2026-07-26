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
