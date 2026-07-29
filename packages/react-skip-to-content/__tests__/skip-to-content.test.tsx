import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { SkipToContent } from '../src/skip-to-content.js'

describe('SkipToContent (React SSR)', () => {
  it('renders an anchor pointing at #main-content by default', () => {
    const html = renderToString(React.createElement(SkipToContent, {}))
    expect(html).toContain('<a')
    expect(html).toContain('href="#main-content"')
  })

  it('renders the default "Skip to content" label', () => {
    const html = renderToString(React.createElement(SkipToContent, {}))
    expect(html).toContain('Skip to content')
  })

  it('honors a custom targetId', () => {
    const html = renderToString(React.createElement(SkipToContent, { targetId: 'content' }))
    expect(html).toContain('href="#content"')
  })

  it('renders custom children instead of the default label', () => {
    const html = renderToString(
      React.createElement(SkipToContent, {}, 'Skip to main'),
    )
    expect(html).toContain('Skip to main')
    expect(html).not.toContain('Skip to content')
  })

  it('carries the skip-to-content data-slot', () => {
    const html = renderToString(React.createElement(SkipToContent, {}))
    expect(html).toContain('data-slot="skip-to-content"')
  })

  it('is visually hidden until focused (off-screen translate, restored on focus)', () => {
    const html = renderToString(React.createElement(SkipToContent, {}))
    expect(html).toContain('-translate-y-16')
    expect(html).toContain('focus:translate-y-0')
  })

  it('appends a custom className without dropping the variant classes', () => {
    const html = renderToString(React.createElement(SkipToContent, { className: 'my-skip' }))
    expect(html).toContain('my-skip')
    expect(html).toContain('-translate-y-16')
  })
})
