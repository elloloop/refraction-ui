import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../src/collapsible.js'

describe('Collapsible (React)', () => {
  it('renders a wrapper div', () => {
    const html = renderToString(
      React.createElement(Collapsible, null, 'content'),
    )
    expect(html).toContain('<div')
    expect(html).toContain('content')
  })

  it('defaults to closed state', () => {
    const html = renderToString(
      React.createElement(Collapsible, null, 'content'),
    )
    expect(html).toContain('data-state="closed"')
  })

  it('renders open state when defaultOpen is true', () => {
    const html = renderToString(
      React.createElement(Collapsible, { defaultOpen: true }, 'content'),
    )
    expect(html).toContain('data-state="open"')
  })

  it('renders open state when controlled open is true', () => {
    const html = renderToString(
      React.createElement(Collapsible, { open: true }, 'content'),
    )
    expect(html).toContain('data-state="open"')
  })

  it('renders data-disabled when disabled', () => {
    const html = renderToString(
      React.createElement(Collapsible, { disabled: true }, 'content'),
    )
    expect(html).toContain('data-disabled=""')
  })
})

describe('CollapsibleTrigger (React)', () => {
  it('renders a button element', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        null,
        React.createElement(CollapsibleTrigger, null, 'Toggle'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('Toggle')
  })

  it('has aria-expanded false when closed', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        null,
        React.createElement(CollapsibleTrigger, null, 'Toggle'),
      ),
    )
    expect(html).toContain('aria-expanded="false"')
  })

  it('has aria-expanded true when open', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(CollapsibleTrigger, null, 'Toggle'),
      ),
    )
    expect(html).toContain('aria-expanded="true"')
  })

  it('has aria-controls pointing to content id', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(CollapsibleTrigger, null, 'Toggle'),
        React.createElement(CollapsibleContent, null, 'Body'),
      ),
    )
    // Extract the aria-controls value
    const controlsMatch = html.match(/aria-controls="([^"]+)"/)
    const idMatch = html.match(/id="([^"]+)"/)
    expect(controlsMatch).not.toBeNull()
    expect(idMatch).not.toBeNull()
    expect(controlsMatch![1]).toBe(idMatch![1])
  })

  it('has data-state matching open state', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        null,
        React.createElement(CollapsibleTrigger, null, 'Toggle'),
      ),
    )
    // The trigger should have data-state="closed"
    expect(html).toContain('data-state="closed"')
  })

  it('has type button', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        null,
        React.createElement(CollapsibleTrigger, null, 'Toggle'),
      ),
    )
    expect(html).toContain('type="button"')
  })

  it('is disabled when parent Collapsible is disabled', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { disabled: true },
        React.createElement(CollapsibleTrigger, null, 'Toggle'),
      ),
    )
    expect(html).toContain('disabled')
  })
})

describe('CollapsibleContent (React)', () => {
  it('does not render when closed', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        null,
        React.createElement(CollapsibleContent, null, 'Hidden content'),
      ),
    )
    expect(html).not.toContain('Hidden content')
  })

  it('renders when open', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(CollapsibleContent, null, 'Visible content'),
      ),
    )
    expect(html).toContain('Visible content')
  })

  it('has role region', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(CollapsibleContent, null, 'Content'),
      ),
    )
    expect(html).toContain('role="region"')
  })

  it('has data-state open when rendered', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(CollapsibleContent, null, 'Content'),
      ),
    )
    expect(html).toContain('data-state="open"')
  })

  it('applies animation classes', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(CollapsibleContent, null, 'Content'),
      ),
    )
    expect(html).toContain('overflow-hidden')
    expect(html).toContain('transition-all')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(
          CollapsibleContent,
          { className: 'my-content' },
          'Content',
        ),
      ),
    )
    expect(html).toContain('my-content')
  })

  it('has an id attribute', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(CollapsibleContent, null, 'Content'),
      ),
    )
    expect(html).toMatch(/id="rfr-collapsible-/)
  })
})

describe('CollapsibleTrigger extended (React)', () => {
  it('renders a button element', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        null,
        React.createElement(CollapsibleTrigger, null, 'Click me'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('Click me')
  })

  it('custom className on trigger is applied', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        null,
        React.createElement(CollapsibleTrigger, { className: 'my-trigger-cls' }, 'Toggle'),
      ),
    )
    expect(html).toContain('my-trigger-cls')
  })

  it('disabled prop prevents toggle (button is disabled)', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { disabled: true },
        React.createElement(CollapsibleTrigger, null, 'Toggle'),
      ),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('data-disabled=""')
  })
})

describe('CollapsibleContent extended (React)', () => {
  it('content hidden when closed (not rendered)', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        null,
        React.createElement(CollapsibleContent, null, 'Secret'),
      ),
    )
    expect(html).not.toContain('Secret')
    expect(html).not.toContain('role="region"')
  })

  it('content visible when open', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(CollapsibleContent, null, 'Revealed'),
      ),
    )
    expect(html).toContain('Revealed')
    expect(html).toContain('role="region"')
  })

  it('custom className on content is applied', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { defaultOpen: true },
        React.createElement(
          CollapsibleContent,
          { className: 'my-content-cls' },
          'Body',
        ),
      ),
    )
    expect(html).toContain('my-content-cls')
  })

  it('disabled prop on parent prevents toggle via trigger', () => {
    const html = renderToString(
      React.createElement(
        Collapsible,
        { disabled: true },
        React.createElement(CollapsibleTrigger, null, 'Toggle'),
        React.createElement(CollapsibleContent, null, 'Body'),
      ),
    )
    // Content should not be visible since default is closed and disabled prevents opening
    expect(html).not.toContain('Body')
    expect(html).toContain('disabled')
  })
})
