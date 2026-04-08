import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { MarkdownRenderer } from '../src/MarkdownRenderer.js'

describe('MarkdownRenderer (React)', () => {
  it('renders markdown content as HTML', () => {
    const html = renderToString(
      React.createElement(MarkdownRenderer, { content: '# Hello World' }),
    )
    expect(html).toContain('<h1>Hello World</h1>')
    expect(html).toContain('role="document"')
  })

  it('renders bold and italic', () => {
    const html = renderToString(
      React.createElement(MarkdownRenderer, { content: '**bold** and *italic*' }),
    )
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
  })

  it('renders links', () => {
    const html = renderToString(
      React.createElement(MarkdownRenderer, {
        content: '[Click here](https://example.com)',
      }),
    )
    expect(html).toContain('<a href="https://example.com">Click here</a>')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(MarkdownRenderer, {
        content: 'Hello',
        className: 'my-class',
      }),
    )
    expect(html).toContain('my-class')
  })

  it('applies size variant', () => {
    const html = renderToString(
      React.createElement(MarkdownRenderer, { content: 'Hello', size: 'sm' }),
    )
    expect(html).toContain('text-sm')
  })

  describe('XSS sanitization', () => {
    it('strips script tags', () => {
      const html = renderToString(
        React.createElement(MarkdownRenderer, {
          content: 'Hello <script>alert("xss")</script> world',
        }),
      )
      expect(html).not.toContain('<script>')
      expect(html).not.toContain('alert("xss")')
    })

    it('strips on* event handlers', () => {
      const html = renderToString(
        React.createElement(MarkdownRenderer, {
          content: 'Hello <img onerror="alert(1)" src="x"> world',
        }),
      )
      expect(html).not.toContain('onerror')
    })

    it('strips javascript: URLs from markdown links', () => {
      const html = renderToString(
        React.createElement(MarkdownRenderer, {
          content: '[Click here](javascript:alert(1))',
        }),
      )
      expect(html).not.toContain('javascript:')
      expect(html).toContain('Click here')
    })
  })
})
