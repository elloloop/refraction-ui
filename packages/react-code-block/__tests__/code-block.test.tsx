import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { CodeBlock, CodeBlockHeader, CodeBlockContent } from '../src/code-block.js'

// SSR suite — structure and styling hooks only. This adapter is purely
// presentational (no interaction): it composes the core's data-slot attributes
// with the cva variant classes.

describe('CodeBlock (React)', () => {
  it('renders a div with the code-block data-slot and base classes', () => {
    const html = renderToString(React.createElement(CodeBlock, null, 'body'))
    expect(html).toContain('<div')
    expect(html).toContain('data-slot="code-block"')
    expect(html).toContain('rounded-lg border')
    expect(html).toContain('bg-zinc-950')
    expect(html).toContain('body')
  })

  it('appends a custom className to the root', () => {
    const html = renderToString(React.createElement(CodeBlock, { className: 'my-block' }, 'x'))
    expect(html).toContain('my-block')
    expect(html).toContain('bg-zinc-950')
  })

  it('spreads additional HTML attributes onto the root', () => {
    const html = renderToString(
      React.createElement(CodeBlock, { id: 'snippet', 'aria-label': 'Usage example' }, 'x'),
    )
    expect(html).toContain('id="snippet"')
    expect(html).toContain('aria-label="Usage example"')
  })
})

describe('CodeBlockHeader (React)', () => {
  it('renders the header data-slot with layout classes', () => {
    const html = renderToString(React.createElement(CodeBlockHeader, null, 'index.ts'))
    expect(html).toContain('data-slot="code-block-header"')
    expect(html).toContain('flex items-center justify-between')
    expect(html).toContain('index.ts')
  })

  it('appends a custom className', () => {
    const html = renderToString(React.createElement(CodeBlockHeader, { className: 'my-header' }, 'x'))
    expect(html).toContain('my-header')
  })
})

describe('CodeBlockContent (React)', () => {
  it('renders a pre element with the content data-slot and mono styling', () => {
    const html = renderToString(React.createElement(CodeBlockContent, null, 'const x = 1'))
    expect(html).toContain('<pre')
    expect(html).toContain('data-slot="code-block-content"')
    expect(html).toContain('font-mono')
    expect(html).toContain('const x = 1')
  })

  it('appends a custom className', () => {
    const html = renderToString(React.createElement(CodeBlockContent, { className: 'my-pre' }, 'x'))
    expect(html).toContain('my-pre')
  })
})

describe('CodeBlock composition (React)', () => {
  it('renders header and content inside the block', () => {
    const html = renderToString(
      React.createElement(
        CodeBlock,
        null,
        React.createElement(CodeBlockHeader, null, 'demo.ts'),
        React.createElement(CodeBlockContent, null, 'export {}'),
      ),
    )
    expect(html).toContain('data-slot="code-block"')
    expect(html).toContain('data-slot="code-block-header"')
    expect(html).toContain('data-slot="code-block-content"')
    expect(html).toContain('demo.ts')
    expect(html).toContain('export {}')
  })
})
