import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { TableOfContents } from '../src/table-of-contents.js'

// SSR contract: TableOfContents starts with an empty heading list and parses
// the container inside useEffect, which never runs during SSR. The honest
// server-rendered output is therefore "nothing" — the nav only appears after
// hydration. Parsing itself is covered by the core package's unit tests.
describe('TableOfContents (React SSR)', () => {
  it('renders nothing on the server — headings are parsed in an effect after mount', () => {
    const html = renderToString(React.createElement(TableOfContents, {}))
    expect(html).toBe('')
  })

  it('renders nothing even when a containerRef is provided (no document access during SSR)', () => {
    const containerRef = React.createRef<HTMLElement>()
    const html = renderToString(React.createElement(TableOfContents, { containerRef }))
    expect(html).toBe('')
  })

  it('accepts custom selectors and callbacks without crashing the server render', () => {
    const html = renderToString(
      React.createElement(TableOfContents, {
        selectors: 'h1, h2',
        onActiveIdChange: () => {},
        className: 'my-toc',
      }),
    )
    expect(html).toBe('')
  })
})
