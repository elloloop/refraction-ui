import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Footer } from '../src/footer.js'

describe('Footer (React)', () => {
  it('renders a footer element', () => {
    const html = renderToString(React.createElement(Footer))
    expect(html).toContain('<footer')
  })

  it('applies contentinfo role', () => {
    const html = renderToString(React.createElement(Footer))
    expect(html).toContain('role="contentinfo"')
  })

  it('renders default copyright text with current year', () => {
    const html = renderToString(React.createElement(Footer))
    const year = new Date().getFullYear()
    expect(html).toContain(`${year}`)
    expect(html).toContain('All rights reserved')
  })

  it('renders custom copyright text', () => {
    const html = renderToString(
      React.createElement(Footer, { copyright: 'Copyright Acme Inc.' }),
    )
    expect(html).toContain('Copyright Acme Inc.')
  })

  it('renders social links', () => {
    const socialLinks = [
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Twitter', href: 'https://twitter.com' },
    ]
    const html = renderToString(React.createElement(Footer, { socialLinks }))
    expect(html).toContain('GitHub')
    expect(html).toContain('Twitter')
    expect(html).toContain('aria-label="GitHub"')
  })

  it('renders columns with links', () => {
    const columns = [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '/features' },
          { label: 'Pricing', href: '/pricing' },
        ],
      },
    ]
    const html = renderToString(React.createElement(Footer, { columns }))
    expect(html).toContain('Product')
    expect(html).toContain('Features')
    expect(html).toContain('Pricing')
  })

  it('applies base footer styles', () => {
    const html = renderToString(React.createElement(Footer))
    expect(html).toContain('border-t')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(Footer, { className: 'my-footer' }),
    )
    expect(html).toContain('my-footer')
  })
})
