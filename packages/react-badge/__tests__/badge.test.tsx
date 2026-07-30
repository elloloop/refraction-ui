import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Badge } from '../src/badge.js'

describe('Badge (React)', () => {
  it('renders a div element', () => {
    const html = renderToString(React.createElement(Badge, null, 'Badge'))
    expect(html).toContain('<div')
    expect(html).toContain('Badge')
  })

  it('applies default variant classes', () => {
    const html = renderToString(React.createElement(Badge, null, 'Default'))
    expect(html).toContain('bg-primary')
  })

  it('applies destructive variant classes', () => {
    const html = renderToString(
      React.createElement(Badge, { variant: 'destructive' }, 'Error'),
    )
    expect(html).toContain('bg-destructive')
  })

  it('applies success variant with role="status"', () => {
    const html = renderToString(
      React.createElement(Badge, { variant: 'success' }, 'Active'),
    )
    expect(html).toContain('bg-success')
    expect(html).toContain('role="status"')
  })

  it('applies warning variant with role="status"', () => {
    const html = renderToString(
      React.createElement(Badge, { variant: 'warning' }, 'Warning'),
    )
    expect(html).toContain('bg-warning')
    expect(html).toContain('role="status"')
  })

  it('applies outline variant', () => {
    const html = renderToString(
      React.createElement(Badge, { variant: 'outline' }, 'Outline'),
    )
    expect(html).toContain('text-foreground')
  })

  it('applies sm size classes', () => {
    const html = renderToString(
      React.createElement(Badge, { size: 'sm' }, 'Small'),
    )
    expect(html).toContain('text-[10px]')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(Badge, { className: 'my-badge' }, 'Custom'),
    )
    expect(html).toContain('my-badge')
  })

  it('does not set role for non-status variants', () => {
    const html = renderToString(
      React.createElement(Badge, { variant: 'secondary' }, 'Secondary'),
    )
    expect(html).not.toContain('role=')
  })

  it('sets data-variant attribute', () => {
    const html = renderToString(
      React.createElement(Badge, { variant: 'warning' }, 'Warn'),
    )
    expect(html).toContain('data-variant="warning"')
  })
})

// ---------------------------------------------------------------
// Additional React badge tests
// ---------------------------------------------------------------

describe('Badge – each variant renders', () => {
  it.each([
    'default',
    'primary',
    'secondary',
    'destructive',
    'outline',
    'success',
    'warning',
  ] as const)('%s variant renders without error', (variant) => {
    const html = renderToString(
      React.createElement(Badge, { variant }, `${variant} badge`),
    )
    expect(html).toContain(`${variant} badge`)
  })
})

describe('Badge – each size renders', () => {
  it('sm size renders with text-[10px]', () => {
    const html = renderToString(
      React.createElement(Badge, { size: 'sm' }, 'Small'),
    )
    expect(html).toContain('text-[10px]')
  })

  it('md size renders with text-xs', () => {
    const html = renderToString(
      React.createElement(Badge, { size: 'md' }, 'Medium'),
    )
    expect(html).toContain('text-xs')
  })
})

describe('Badge – custom className appended', () => {
  it('appends className alongside variant classes', () => {
    const html = renderToString(
      React.createElement(Badge, { variant: 'success', className: 'extra-class' }, 'Test'),
    )
    expect(html).toContain('extra-class')
    expect(html).toContain('bg-success')
  })
})

describe('Badge – children render inside badge', () => {
  it('renders text children', () => {
    const html = renderToString(
      React.createElement(Badge, null, 'Child text here'),
    )
    expect(html).toContain('Child text here')
  })

  it('renders element children', () => {
    const html = renderToString(
      React.createElement(
        Badge,
        null,
        React.createElement('span', null, 'inner-span'),
      ),
    )
    expect(html).toContain('<span')
    expect(html).toContain('inner-span')
  })
})

describe('Badge – role="status" for status variants', () => {
  it.each(['success', 'warning', 'destructive'] as const)(
    '%s variant has role="status"',
    (variant) => {
      const html = renderToString(
        React.createElement(Badge, { variant }, 'test'),
      )
      expect(html).toContain('role="status"')
    },
  )
})

describe('Badge – no role for non-status variants', () => {
  it.each(['default', 'primary', 'secondary', 'outline'] as const)(
    '%s variant does not have role attribute',
    (variant) => {
      const html = renderToString(
        React.createElement(Badge, { variant }, 'test'),
      )
      expect(html).not.toContain('role=')
    },
  )
})

describe('Badge – data-variant attribute present', () => {
  it.each([
    'default',
    'primary',
    'secondary',
    'destructive',
    'outline',
    'success',
    'warning',
  ] as const)('%s variant has data-variant="%s"', (variant) => {
    const html = renderToString(
      React.createElement(Badge, { variant }, 'test'),
    )
    expect(html).toContain(`data-variant="${variant}"`)
  })
})

describe('Badge asChild (React)', () => {
  it('renders the child element with badge classes and forwarded props', () => {
    const html = renderToString(
      React.createElement(
        Badge,
        { asChild: true, variant: 'success' },
        React.createElement('a', { href: '/status' }, 'Active'),
      ),
    )
    expect(html).toContain('<a')
    expect(html).toContain('href="/status"')
    expect(html).toContain('Active')
    expect(html).toContain('bg-success')
    expect(html).toContain('data-variant="success"')
    expect(html).toContain('role="status"')
    expect(html).not.toContain('<div')
  })

  it('merges the child className with badge classes', () => {
    const html = renderToString(
      React.createElement(
        Badge,
        { asChild: true, className: 'my-badge' },
        React.createElement('a', { href: '/x', className: 'child-class' }, 'x'),
      ),
    )
    expect(html).toContain('bg-primary')
    expect(html).toContain('my-badge')
    expect(html).toContain('child-class')
  })

  it('keeps the default render when asChild is absent', () => {
    const html = renderToString(React.createElement(Badge, null, 'Badge'))
    expect(html).toContain('<div')
    expect(html).not.toContain('<a')
  })
})
