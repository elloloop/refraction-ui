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

// ---------------------------------------------------------------
// Additional SSR coverage (orientations, decorative vs semantic)
// ---------------------------------------------------------------

describe('Separator – orientation data attributes (React)', () => {
  it('marks horizontal orientation by default', () => {
    const html = renderToString(React.createElement(Separator, null))
    expect(html).toContain('data-orientation="horizontal"')
  })

  it('marks vertical orientation when set', () => {
    const html = renderToString(
      React.createElement(Separator, { orientation: 'vertical' }),
    )
    expect(html).toContain('data-orientation="vertical"')
  })

  it('pairs semantic vertical with role and data attribute', () => {
    const html = renderToString(
      React.createElement(Separator, { orientation: 'vertical', decorative: false }),
    )
    expect(html).toContain('role="separator"')
    expect(html).toContain('aria-orientation="vertical"')
    expect(html).toContain('data-orientation="vertical"')
  })
})

describe('Separator – decorative vs semantic (React)', () => {
  it('decorative vertical renders role="none" with no aria-orientation', () => {
    const html = renderToString(
      React.createElement(Separator, { orientation: 'vertical' }),
    )
    expect(html).toContain('role="none"')
    expect(html).not.toContain('aria-orientation')
  })

  it('semantic horizontal exposes the separator role', () => {
    const html = renderToString(
      React.createElement(Separator, { decorative: false }),
    )
    expect(html).toContain('role="separator"')
    expect(html).not.toContain('role="none"')
  })

  it('renders the rule color class', () => {
    const html = renderToString(React.createElement(Separator, null))
    expect(html).toContain('bg-border')
  })
})

describe('Separator – labeled divider (React)', () => {
  it('is decorative chrome with role="none"', () => {
    const html = renderToString(React.createElement(Separator, { label: 'OR' }))
    expect(html).toContain('role="none"')
    expect(html).not.toContain('aria-orientation')
    // The labeled branch carries no orientation data attribute.
    expect(html).not.toContain('data-orientation')
  })

  it('styles the label with muted uppercase text', () => {
    const html = renderToString(React.createElement(Separator, { label: 'OR' }))
    expect(html).toContain('uppercase')
    expect(html).toContain('tracking-wide')
    expect(html).toContain('px-3')
  })

  it('accepts a React node as the label', () => {
    const html = renderToString(
      React.createElement(Separator, {
        label: React.createElement('em', null, 'or'),
      }),
    )
    expect(html).toContain('<em>or</em>')
  })

  it('ignores the label for vertical orientation', () => {
    const html = renderToString(
      React.createElement(Separator, { orientation: 'vertical', label: 'OR' }),
    )
    expect(html).not.toContain('OR')
    expect(html).toContain('w-px')
    expect(html).toContain('role="none"')
  })
})

describe('Separator – prop passthrough (React)', () => {
  it('forwards extra props to the root element', () => {
    const html = renderToString(
      React.createElement(Separator, { id: 'rule-1', 'data-testid': 'sep' }),
    )
    expect(html).toContain('id="rule-1"')
    expect(html).toContain('data-testid="sep"')
  })
})
