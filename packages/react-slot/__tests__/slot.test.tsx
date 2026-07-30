import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Slot } from '../src/slot.js'

describe('Slot (React, SSR)', () => {
  it('renders the child element instead of a wrapper', () => {
    const html = renderToString(
      React.createElement(
        Slot,
        null,
        React.createElement('a', { href: '/x' }, 'Link'),
      ),
    )
    expect(html).toContain('<a')
    expect(html).toContain('href="/x"')
    expect(html).toContain('Link')
    expect(html).not.toContain('<div')
  })

  it('merges slot className with the child className', () => {
    const html = renderToString(
      React.createElement(
        Slot,
        { className: 'slot-class' },
        React.createElement('a', { href: '/x', className: 'child-class' }, 'Link'),
      ),
    )
    expect(html).toContain('slot-class')
    expect(html).toContain('child-class')
  })

  it('spreads remaining props onto the child', () => {
    const html = renderToString(
      React.createElement(
        Slot,
        { 'data-slot': 'card', role: 'group' } as Record<string, unknown>,
        React.createElement('section', null, 'Body'),
      ),
    )
    expect(html).toContain('data-slot="card"')
    expect(html).toContain('role="group"')
  })

  it('child props win over slot props for non-merged keys', () => {
    const html = renderToString(
      React.createElement(
        Slot,
        { href: '/slot' } as Record<string, unknown>,
        React.createElement('a', { href: '/child' }, 'Link'),
      ),
    )
    expect(html).toContain('href="/child"')
    expect(html).not.toContain('/slot')
  })

  it('renders nothing when the child is not a single element', () => {
    expect(renderToString(React.createElement(Slot, null, 'plain text'))).toBe('')
    expect(
      renderToString(
        React.createElement(
          Slot,
          null,
          React.createElement('a', null, 'one'),
          React.createElement('a', null, 'two'),
        ),
      ),
    ).toBe('')
  })
})
