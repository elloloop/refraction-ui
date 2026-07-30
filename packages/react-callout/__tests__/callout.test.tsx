import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  Callout,
  CalloutIcon,
  CalloutContent,
  CalloutTitle,
  CalloutDescription,
} from '../src/callout.js'

describe('Callout (React)', () => {
  it('renders a region with the callout data-slot and base classes', () => {
    const html = renderToString(React.createElement(Callout, null, 'Body'))
    expect(html).toContain('role="region"')
    expect(html).toContain('data-slot="callout"')
    expect(html).toContain('rounded-lg border p-4')
    expect(html).toContain('Body')
  })

  it('renders the default variant classes', () => {
    const html = renderToString(React.createElement(Callout, null, 'x'))
    expect(html).toContain('bg-muted/50')
    expect(html).toContain('border-border')
  })

  it('destructive variant uses role="alert" and destructive classes', () => {
    const html = renderToString(React.createElement(Callout, { variant: 'destructive' }, 'Boom'))
    expect(html).toContain('role="alert"')
    expect(html).toContain('bg-destructive/10')
    expect(html).toContain('text-destructive')
  })

  it('non-destructive variants keep role="region"', () => {
    for (const variant of ['success', 'warning', 'info'] as const) {
      const html = renderToString(React.createElement(Callout, { variant }, 'x'))
      expect(html).toContain('role="region"')
    }
  })

  it('applies variant-specific classes', () => {
    expect(renderToString(React.createElement(Callout, { variant: 'success' }, 'x'))).toContain('bg-success/10')
    expect(renderToString(React.createElement(Callout, { variant: 'warning' }, 'x'))).toContain('bg-warning/10')
    expect(renderToString(React.createElement(Callout, { variant: 'info' }, 'x'))).toContain('bg-info/10')
  })

  it('appends a custom className', () => {
    const html = renderToString(React.createElement(Callout, { className: 'my-callout' }, 'x'))
    expect(html).toContain('my-callout')
    expect(html).toContain('rounded-lg')
  })

  it('spreads additional HTML attributes onto the root', () => {
    const html = renderToString(
      React.createElement(Callout, { id: 'notice', 'aria-label': 'Site notice' } as React.ComponentProps<typeof Callout>, 'x'),
    )
    expect(html).toContain('id="notice"')
    expect(html).toContain('aria-label="Site notice"')
  })
})

describe('Callout composition (React)', () => {
  it('renders icon/content/title/description slots with data-slot hooks', () => {
    const html = renderToString(
      React.createElement(
        Callout,
        null,
        React.createElement(CalloutIcon, null, '!'),
        React.createElement(
          CalloutContent,
          null,
          React.createElement(CalloutTitle, null, 'Heads up'),
          React.createElement(CalloutDescription, null, 'Something happened.'),
        ),
      ),
    )
    expect(html).toContain('data-slot="callout-icon"')
    expect(html).toContain('data-slot="callout-content"')
    expect(html).toContain('data-slot="callout-title"')
    expect(html).toContain('data-slot="callout-description"')
    expect(html).toContain('Heads up')
    expect(html).toContain('Something happened.')
  })

  it('renders the title as an h5 heading', () => {
    const html = renderToString(React.createElement(CalloutTitle, null, 'Title'))
    expect(html).toContain('<h5')
    expect(html).toContain('font-semibold')
  })

  it('renders the description with muted styling hook', () => {
    const html = renderToString(React.createElement(CalloutDescription, null, 'Desc'))
    expect(html).toContain('opacity-90')
  })
})
