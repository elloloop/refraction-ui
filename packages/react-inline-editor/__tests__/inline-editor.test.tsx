import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import { InlineEditor } from '../src/InlineEditor.js'

beforeEach(() => {
  resetIdCounter()
})

describe('InlineEditor (React SSR)', () => {
  it('renders in view mode by default', () => {
    const html = renderToString(
      React.createElement(InlineEditor, { value: 'Hello World' }),
    )
    expect(html).toContain('Hello World')
    expect(html).toContain('role="button"')
    expect(html).toContain('Click to edit')
  })

  it('applies viewing variant styles in view mode', () => {
    const html = renderToString(
      React.createElement(InlineEditor, { value: 'Test' }),
    )
    expect(html).toContain('cursor-pointer')
  })

  it('renders preview content in view mode', () => {
    const html = renderToString(
      React.createElement(InlineEditor, { value: 'Preview text' }),
    )
    expect(html).toContain('Preview text')
    expect(html).toContain('prose')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(InlineEditor, { value: 'Test', className: 'my-editor' }),
    )
    expect(html).toContain('my-editor')
  })

  it('renders with tabIndex for keyboard accessibility', () => {
    const html = renderToString(
      React.createElement(InlineEditor, { value: 'Test' }),
    )
    expect(html).toContain('tabindex="0"')
  })
})
