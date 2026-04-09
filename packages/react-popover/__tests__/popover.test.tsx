import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from '../src/popover.js'
import { resetIdCounter } from '@elloloop/shared'

beforeEach(() => {
  resetIdCounter()
})

describe('Popover (React)', () => {
  it('renders trigger as a button', () => {
    const html = renderToString(
      React.createElement(Popover, null,
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, 'Content'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('Open')
    expect(html).toContain('aria-haspopup="dialog"')
  })

  it('trigger has aria-expanded false when closed', () => {
    const html = renderToString(
      React.createElement(Popover, null,
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, 'Content'),
      ),
    )
    expect(html).toContain('aria-expanded="false"')
  })

  it('does not render content when closed', () => {
    const html = renderToString(
      React.createElement(Popover, null,
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, 'Hidden content'),
      ),
    )
    expect(html).not.toContain('Hidden content')
  })

  it('renders content when open is true (controlled)', () => {
    const html = renderToString(
      React.createElement(Popover, { open: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, 'Visible content'),
      ),
    )
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('Visible content')
    expect(html).toContain('role="dialog"')
  })

  it('renders content when defaultOpen is true', () => {
    const html = renderToString(
      React.createElement(Popover, { defaultOpen: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, 'Default visible'),
      ),
    )
    expect(html).toContain('Default visible')
  })

  it('trigger aria-controls matches content id', () => {
    const html = renderToString(
      React.createElement(Popover, { open: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, 'Content'),
      ),
    )
    const controlsMatch = html.match(/aria-controls="([^"]+)"/)
    const idMatch = html.match(/id="([^"]+)"/)
    expect(controlsMatch).toBeTruthy()
    expect(idMatch).toBeTruthy()
    expect(controlsMatch![1]).toBe(idMatch![1])
  })

  it('content applies popover styles', () => {
    const html = renderToString(
      React.createElement(Popover, { open: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, 'Styled content'),
      ),
    )
    expect(html).toContain('z-50')
    expect(html).toContain('w-72')
  })

  it('content applies custom className', () => {
    const html = renderToString(
      React.createElement(Popover, { open: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, { className: 'my-popover' }, 'Content'),
      ),
    )
    expect(html).toContain('my-popover')
  })

  it('renders PopoverClose as a button', () => {
    const html = renderToString(
      React.createElement(Popover, { open: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null,
          React.createElement(PopoverClose, null, 'Close'),
        ),
      ),
    )
    expect(html).toContain('Close')
  })
})

// ---------------------------------------------------------------
// Additional React popover tests
// ---------------------------------------------------------------

describe('Popover – renders children', () => {
  it('renders arbitrary children inside the provider', () => {
    const html = renderToString(
      React.createElement(Popover, null,
        React.createElement('div', null, 'child-element'),
      ),
    )
    expect(html).toContain('child-element')
  })
})

describe('PopoverTrigger – renders button', () => {
  it('renders as a button element with type="button"', () => {
    const html = renderToString(
      React.createElement(Popover, null,
        React.createElement(PopoverTrigger, null, 'Click me'),
      ),
    )
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
    expect(html).toContain('Click me')
  })
})

describe('PopoverContent – not rendered when closed', () => {
  it('content is absent from HTML when popover is closed', () => {
    const html = renderToString(
      React.createElement(Popover, null,
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, 'Secret content'),
      ),
    )
    expect(html).not.toContain('Secret content')
    expect(html).not.toContain('role="dialog"')
  })
})

describe('PopoverClose – renders correctly', () => {
  it('renders a button element', () => {
    const html = renderToString(
      React.createElement(Popover, { open: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null,
          React.createElement(PopoverClose, null, 'X'),
        ),
      ),
    )
    // There should be at least 2 buttons: trigger + close
    const buttonCount = (html.match(/<button/g) || []).length
    expect(buttonCount).toBeGreaterThanOrEqual(2)
    expect(html).toContain('X')
  })
})

describe('PopoverContent – custom className', () => {
  it('applies a custom className alongside default styles', () => {
    const html = renderToString(
      React.createElement(Popover, { open: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, { className: 'custom-pop' }, 'Content'),
      ),
    )
    expect(html).toContain('custom-pop')
    expect(html).toContain('z-50')
  })
})

describe('Popover – controlled open/close', () => {
  it('renders content when open=true', () => {
    const html = renderToString(
      React.createElement(Popover, { open: true },
        React.createElement(PopoverTrigger, null, 'T'),
        React.createElement(PopoverContent, null, 'Shown'),
      ),
    )
    expect(html).toContain('Shown')
  })

  it('does not render content when open=false', () => {
    const html = renderToString(
      React.createElement(Popover, { open: false },
        React.createElement(PopoverTrigger, null, 'T'),
        React.createElement(PopoverContent, null, 'Hidden'),
      ),
    )
    expect(html).not.toContain('Hidden')
  })
})

describe('Popover – trigger has aria-haspopup', () => {
  it('trigger always has aria-haspopup="dialog"', () => {
    const html = renderToString(
      React.createElement(Popover, null,
        React.createElement(PopoverTrigger, null, 'Open'),
      ),
    )
    expect(html).toContain('aria-haspopup="dialog"')
  })
})

describe('Popover – trigger has aria-expanded matching open state', () => {
  it('aria-expanded="true" when open', () => {
    const html = renderToString(
      React.createElement(Popover, { open: true },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, 'C'),
      ),
    )
    expect(html).toContain('aria-expanded="true"')
  })

  it('aria-expanded="false" when closed', () => {
    const html = renderToString(
      React.createElement(Popover, { open: false },
        React.createElement(PopoverTrigger, null, 'Open'),
        React.createElement(PopoverContent, null, 'C'),
      ),
    )
    expect(html).toContain('aria-expanded="false"')
  })
})
