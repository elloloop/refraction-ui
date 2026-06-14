import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { BrandNetworkCell } from '../src/brand-network-cell.js'

const render = (props: Partial<React.ComponentProps<typeof BrandNetworkCell>>) =>
  renderToString(
    React.createElement(BrandNetworkCell, {
      glyph: 'A',
      domain: 'acme.io',
      body: 'The Acme product suite.',
      ...props,
    }),
  )

describe('BrandNetworkCell (SSR)', () => {
  it('renders the glyph monogram', () => {
    const html = render({})
    expect(html).toContain('>A<')
  })

  it('renders the domain', () => {
    const html = render({ domain: 'example.com' })
    expect(html).toContain('example.com')
  })

  it('renders the body text', () => {
    const html = render({ body: 'A great product.' })
    expect(html).toContain('A great product.')
  })

  it('does NOT render "You are here" when current is false (default)', () => {
    const html = render({})
    expect(html).not.toContain('You are here')
  })

  it('renders "You are here" badge only when current is true', () => {
    const html = render({ current: true })
    expect(html).toContain('You are here')
  })

  it('sets data-current="true" when current', () => {
    const html = render({ current: true })
    expect(html).toContain('data-current="true"')
  })

  it('sets data-current="false" by default', () => {
    const html = render({})
    expect(html).toContain('data-current="false"')
  })

  it('renders the ring class when current', () => {
    const html = render({ current: true })
    expect(html).toContain('ring-1')
    expect(html).toContain('ring-primary')
  })

  it('does NOT render the ring class when not current', () => {
    const html = render({ current: false })
    expect(html).not.toContain('ring-1 ring-primary')
  })

  it('renders a link with href when provided', () => {
    const html = render({ href: 'https://example.com' })
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('Visit →')
  })

  it('uses linkLabel over the default when provided', () => {
    const html = render({ href: 'https://example.com', linkLabel: 'Go there' })
    expect(html).toContain('Go there')
    expect(html).not.toContain('Visit →')
  })

  it('does NOT render a link when href is omitted', () => {
    const html = render({})
    expect(html).not.toContain('<a ')
  })

  it('exposes role="group"', () => {
    const html = render({})
    expect(html).toContain('role="group"')
  })

  it('applies glyphBg and glyphColor via inline style', () => {
    const html = render({ glyphBg: '#6366f1', glyphColor: '#ffffff' })
    expect(html).toContain('background:#6366f1')
    expect(html).toContain('color:#ffffff')
  })
})
