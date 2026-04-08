import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { CodeEditor } from '../src/CodeEditor.js'

describe('CodeEditor (React)', () => {
  it('renders a textarea element', () => {
    const html = renderToString(React.createElement(CodeEditor))
    expect(html).toContain('<textarea')
    expect(html).toContain('font-mono')
  })

  it('renders with value', () => {
    const html = renderToString(
      React.createElement(CodeEditor, { value: 'const x = 1' }),
    )
    expect(html).toContain('const x = 1')
  })

  it('renders language label in header', () => {
    const html = renderToString(
      React.createElement(CodeEditor, { language: 'typescript' }),
    )
    expect(html).toContain('TypeScript')
  })

  it('renders default language label', () => {
    const html = renderToString(React.createElement(CodeEditor))
    expect(html).toContain('Plaintext')
  })

  it('applies dark theme classes', () => {
    const html = renderToString(
      React.createElement(CodeEditor, { theme: 'dark' }),
    )
    expect(html).toContain('bg-gray-900')
    expect(html).toContain('data-theme="dark"')
  })

  it('sets readOnly on textarea', () => {
    const html = renderToString(
      React.createElement(CodeEditor, { readOnly: true }),
    )
    expect(html).toContain('readonly')
  })

  it('renders action buttons', () => {
    const html = renderToString(
      React.createElement(CodeEditor, {
        actions: [
          { label: 'Run', onClick: () => {} },
          { label: 'Copy', onClick: () => {} },
        ],
      }),
    )
    expect(html).toContain('Run')
    expect(html).toContain('Copy')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(CodeEditor, { className: 'my-editor' }),
    )
    expect(html).toContain('my-editor')
  })

  it('renders aria attributes', () => {
    const html = renderToString(
      React.createElement(CodeEditor, { language: 'python' }),
    )
    expect(html).toContain('aria-multiline="true"')
    expect(html).toContain('role="textbox"')
  })

  it('sets spellcheck to false', () => {
    const html = renderToString(React.createElement(CodeEditor))
    expect(html).toContain('spellCheck="false"')
  })
})
