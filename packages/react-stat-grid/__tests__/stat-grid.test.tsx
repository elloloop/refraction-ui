import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { StatGrid } from '../src/stat-grid.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(StatGrid, props as never))

const threeItems = [
  { value: '10k+', label: 'Active users' },
  { value: '$4.2M', label: 'Revenue generated' },
  { value: '99.9%', label: 'Uptime SLA' },
]

describe('StatGrid (SSR)', () => {
  it('renders the correct number of listitem elements', () => {
    const html = render({ items: threeItems })
    expect((html.match(/role="listitem"/g) ?? []).length).toBe(3)
  })

  it('renders a role="list" container', () => {
    const html = render({ items: threeItems })
    expect(html).toContain('role="list"')
  })

  it('renders each item value and label', () => {
    const html = render({ items: threeItems })
    expect(html).toContain('10k+')
    expect(html).toContain('Active users')
    expect(html).toContain('$4.2M')
    expect(html).toContain('Revenue generated')
    expect(html).toContain('99.9%')
    expect(html).toContain('Uptime SLA')
  })

  it('applies gridTemplateColumns for 3 items', () => {
    const html = render({ items: threeItems })
    expect(html).toContain('grid-template-columns:repeat(3, 1fr)')
  })

  it('applies gridTemplateColumns for 2 items', () => {
    const twoItems = [threeItems[0], threeItems[1]]
    const html = render({ items: twoItems })
    expect(html).toContain('grid-template-columns:repeat(2, 1fr)')
  })

  it('applies gridTemplateColumns for 1 item', () => {
    const html = render({ items: [threeItems[0]] })
    expect(html).toContain('grid-template-columns:repeat(1, 1fr)')
  })

  it('respects an explicit columns override', () => {
    const html = render({ items: threeItems, columns: 2 })
    expect(html).toContain('grid-template-columns:repeat(2, 1fr)')
  })

  it('caps at 3 columns for 5 items by default', () => {
    const fiveItems = [
      ...threeItems,
      { value: '50+', label: 'Integrations' },
      { value: '24/7', label: 'Support' },
    ]
    const html = render({ items: fiveItems })
    expect(html).toContain('grid-template-columns:repeat(3, 1fr)')
    expect((html.match(/role="listitem"/g) ?? []).length).toBe(5)
  })
})
