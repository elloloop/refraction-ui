import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ContentProtection } from '../src/content-protection.js'

describe('ContentProtection (React)', () => {
  it('renders a div wrapping children', () => {
    const html = renderToString(
      React.createElement(ContentProtection, null, 'Secret content'),
    )
    expect(html).toContain('<div')
    expect(html).toContain('Secret content')
  })

  it('applies base protection styles', () => {
    const html = renderToString(
      React.createElement(ContentProtection, null, 'Content'),
    )
    expect(html).toContain('relative')
    expect(html).toContain('select-none')
  })

  it('sets data-protected attribute when enabled', () => {
    const html = renderToString(
      React.createElement(ContentProtection, null, 'Content'),
    )
    expect(html).toContain('data-protected="true"')
  })

  it('does not set data-protected when disabled', () => {
    const html = renderToString(
      React.createElement(ContentProtection, { enabled: false }, 'Content'),
    )
    expect(html).not.toContain('data-protected')
  })

  it('renders watermark overlay when watermarkText provided', () => {
    const html = renderToString(
      React.createElement(
        ContentProtection,
        { watermarkText: 'Confidential' },
        'Content',
      ),
    )
    expect(html).toContain('Confidential')
    expect(html).toContain('aria-hidden="true"')
  })

  it('does not render watermark when no text', () => {
    const html = renderToString(
      React.createElement(ContentProtection, null, 'Content'),
    )
    expect(html).not.toContain('aria-hidden')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(
        ContentProtection,
        { className: 'my-protection' },
        'Content',
      ),
    )
    expect(html).toContain('my-protection')
  })
})
