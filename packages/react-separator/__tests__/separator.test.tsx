import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Separator } from '../src/separator.js'

describe('Separator (React)', () => {
  it('horizontal renders h-px and role="separator" when not decorative', () => {
    const html = renderToString(
      React.createElement(Separator, { decorative: false }),
    )
    expect(html).toContain('h-px')
    expect(html).toContain('w-full')
    expect(html).toContain('role="separator"')
    expect(html).toContain('aria-orientation="horizontal"')
  })

  it('decorative (default) renders role="none" with no aria-orientation', () => {
    const html = renderToString(React.createElement(Separator, null))
    expect(html).toContain('role="none"')
    expect(html).not.toContain('aria-orientation')
  })

  it('vertical renders w-px and aria-orientation="vertical"', () => {
    const html = renderToString(
      React.createElement(Separator, { orientation: 'vertical', decorative: false }),
    )
    expect(html).toContain('w-px')
    expect(html).toContain('h-full')
    expect(html).toContain('aria-orientation="vertical"')
  })

  it('label variant renders the label text and two lines', () => {
    const html = renderToString(
      React.createElement(Separator, { label: 'OR' }),
    )
    expect(html).toContain('OR')
    expect(html).toContain('flex items-center')
    // Two flanking lines.
    const lineCount = (html.match(/h-px flex-1 bg-border/g) ?? []).length
    expect(lineCount).toBe(2)
    expect(html).toContain('text-muted-foreground')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(Separator, { className: 'my-sep' }),
    )
    expect(html).toContain('my-sep')
  })
})
