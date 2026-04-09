import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Tooltip, TooltipTrigger, TooltipContent } from '../src/tooltip.js'
import { resetIdCounter } from '@elloloop/shared'

beforeEach(() => {
  resetIdCounter()
})

describe('Tooltip (React)', () => {
  it('renders trigger as a span', () => {
    const html = renderToString(
      React.createElement(Tooltip, null,
        React.createElement(TooltipTrigger, null, 'Hover me'),
        React.createElement(TooltipContent, null, 'Tooltip text'),
      ),
    )
    expect(html).toContain('<span')
    expect(html).toContain('Hover me')
  })

  it('trigger has aria-describedby', () => {
    const html = renderToString(
      React.createElement(Tooltip, null,
        React.createElement(TooltipTrigger, null, 'Hover me'),
        React.createElement(TooltipContent, null, 'Tooltip text'),
      ),
    )
    expect(html).toContain('aria-describedby')
  })

  it('does not render content when closed', () => {
    const html = renderToString(
      React.createElement(Tooltip, null,
        React.createElement(TooltipTrigger, null, 'Hover me'),
        React.createElement(TooltipContent, null, 'Hidden tooltip'),
      ),
    )
    expect(html).not.toContain('Hidden tooltip')
  })

  it('renders content when open is true (controlled)', () => {
    const html = renderToString(
      React.createElement(Tooltip, { open: true },
        React.createElement(TooltipTrigger, null, 'Hover me'),
        React.createElement(TooltipContent, null, 'Visible tooltip'),
      ),
    )
    expect(html).toContain('Visible tooltip')
    expect(html).toContain('role="tooltip"')
  })

  it('renders content when defaultOpen is true', () => {
    const html = renderToString(
      React.createElement(Tooltip, { defaultOpen: true },
        React.createElement(TooltipTrigger, null, 'Hover me'),
        React.createElement(TooltipContent, null, 'Default tooltip'),
      ),
    )
    expect(html).toContain('Default tooltip')
  })

  it('trigger aria-describedby matches content id', () => {
    const html = renderToString(
      React.createElement(Tooltip, { open: true },
        React.createElement(TooltipTrigger, null, 'Hover me'),
        React.createElement(TooltipContent, null, 'Tooltip'),
      ),
    )
    const describedByMatch = html.match(/aria-describedby="([^"]+)"/)
    const idMatch = html.match(/id="([^"]+)"/)
    expect(describedByMatch).toBeTruthy()
    expect(idMatch).toBeTruthy()
    expect(describedByMatch![1]).toBe(idMatch![1])
  })

  it('content applies tooltip styles', () => {
    const html = renderToString(
      React.createElement(Tooltip, { open: true },
        React.createElement(TooltipTrigger, null, 'Hover me'),
        React.createElement(TooltipContent, null, 'Styled'),
      ),
    )
    expect(html).toContain('z-50')
    expect(html).toContain('bg-primary')
    expect(html).toContain('text-xs')
  })

  it('content applies custom className', () => {
    const html = renderToString(
      React.createElement(Tooltip, { open: true },
        React.createElement(TooltipTrigger, null, 'Hover me'),
        React.createElement(TooltipContent, { className: 'my-tooltip' }, 'Content'),
      ),
    )
    expect(html).toContain('my-tooltip')
  })

  it('accepts custom placement', () => {
    const html = renderToString(
      React.createElement(Tooltip, { open: true, placement: 'bottom' },
        React.createElement(TooltipTrigger, null, 'Hover me'),
        React.createElement(TooltipContent, null, 'Bottom tooltip'),
      ),
    )
    expect(html).toContain('Bottom tooltip')
  })
})

// ---------------------------------------------------------------
// Additional React tooltip tests
// ---------------------------------------------------------------

describe('Tooltip – renders children', () => {
  it('renders arbitrary children inside the provider', () => {
    const html = renderToString(
      React.createElement(Tooltip, null,
        React.createElement('div', null, 'tooltip-child'),
      ),
    )
    expect(html).toContain('tooltip-child')
  })
})

describe('TooltipTrigger – renders span', () => {
  it('renders as a span element', () => {
    const html = renderToString(
      React.createElement(Tooltip, null,
        React.createElement(TooltipTrigger, null, 'Hover'),
      ),
    )
    expect(html).toContain('<span')
    expect(html).toContain('Hover')
  })

  it('renders children inside the span', () => {
    const html = renderToString(
      React.createElement(Tooltip, null,
        React.createElement(TooltipTrigger, null, 'Trigger text'),
      ),
    )
    expect(html).toContain('Trigger text')
  })
})

describe('TooltipContent – not rendered when closed', () => {
  it('content text is not in HTML when tooltip is closed', () => {
    const html = renderToString(
      React.createElement(Tooltip, null,
        React.createElement(TooltipTrigger, null, 'Hover'),
        React.createElement(TooltipContent, null, 'Secret tooltip'),
      ),
    )
    expect(html).not.toContain('Secret tooltip')
    expect(html).not.toContain('role="tooltip"')
  })
})

describe('TooltipContent – custom className', () => {
  it('applies custom className alongside default styles', () => {
    const html = renderToString(
      React.createElement(Tooltip, { open: true },
        React.createElement(TooltipTrigger, null, 'Hover'),
        React.createElement(TooltipContent, { className: 'custom-tip' }, 'Text'),
      ),
    )
    expect(html).toContain('custom-tip')
    expect(html).toContain('z-50')
  })
})

describe('Tooltip – controlled open', () => {
  it('shows content when open=true', () => {
    const html = renderToString(
      React.createElement(Tooltip, { open: true },
        React.createElement(TooltipTrigger, null, 'T'),
        React.createElement(TooltipContent, null, 'Visible'),
      ),
    )
    expect(html).toContain('Visible')
    expect(html).toContain('role="tooltip"')
  })

  it('hides content when open=false', () => {
    const html = renderToString(
      React.createElement(Tooltip, { open: false },
        React.createElement(TooltipTrigger, null, 'T'),
        React.createElement(TooltipContent, null, 'Invisible'),
      ),
    )
    expect(html).not.toContain('Invisible')
  })
})

describe('Tooltip – aria-describedby present on trigger', () => {
  it('trigger always has aria-describedby attribute', () => {
    const html = renderToString(
      React.createElement(Tooltip, null,
        React.createElement(TooltipTrigger, null, 'Hover'),
        React.createElement(TooltipContent, null, 'Tip'),
      ),
    )
    expect(html).toContain('aria-describedby')
  })
})

describe('Tooltip – id links trigger and content', () => {
  it('aria-describedby value equals content id when open', () => {
    const html = renderToString(
      React.createElement(Tooltip, { open: true },
        React.createElement(TooltipTrigger, null, 'Hover'),
        React.createElement(TooltipContent, null, 'Linked'),
      ),
    )
    const describedBy = html.match(/aria-describedby="([^"]+)"/)
    const id = html.match(/id="([^"]+)"/)
    expect(describedBy).toBeTruthy()
    expect(id).toBeTruthy()
    expect(describedBy![1]).toBe(id![1])
  })
})

describe('Tooltip – all placements render content', () => {
  it.each(['top', 'bottom', 'left', 'right'] as const)(
    'placement "%s" renders tooltip content when open',
    (placement) => {
      const html = renderToString(
        React.createElement(Tooltip, { open: true, placement },
          React.createElement(TooltipTrigger, null, 'Hover'),
          React.createElement(TooltipContent, null, `${placement}-content`),
        ),
      )
      expect(html).toContain(`${placement}-content`)
    },
  )
})
