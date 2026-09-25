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

  it('applies responsive columns for 3 items', () => {
    const html = render({ items: threeItems })
    expect(html).toContain('lg:grid-cols-3')
  })

  it('applies responsive columns for 2 items', () => {
    const twoItems = [threeItems[0], threeItems[1]]
    const html = render({ items: twoItems })
    expect(html).toContain('sm:grid-cols-2')
    expect(html).not.toContain('lg:grid-cols-3')
  })

  it('applies responsive columns for 1 item', () => {
    const html = render({ items: [threeItems[0]] })
    expect(html).toContain('grid-cols-1')
    expect(html).not.toContain('sm:grid-cols-2')
  })

  it('respects an explicit columns override', () => {
    const html = render({ items: threeItems, columns: 2 })
    expect(html).toContain('sm:grid-cols-2')
    expect(html).not.toContain('lg:grid-cols-3')
  })

  it('caps at 3 columns for 5 items by default', () => {
    const fiveItems = [
      ...threeItems,
      { value: '50+', label: 'Integrations' },
      { value: '24/7', label: 'Support' },
    ]
    const html = render({ items: fiveItems })
    expect(html).toContain('lg:grid-cols-3')
    expect((html.match(/role="listitem"/g) ?? []).length).toBe(5)
  })

  it('never sets an inline grid template (so the grid reflows)', () => {
    expect(render({ items: threeItems })).not.toContain('grid-template-columns')
  })

  it('supports auto columns, card variant, label-first layout, tone, description and item props', () => {
    const html = render({
      items: [
        { id: 'rev', value: '$12k', label: 'Revenue', tone: 'positive', description: 'Last 30 days', props: { 'data-stat': 'revenue' } },
        { value: '3', label: 'Refunds', tone: 'negative' },
      ],
      columns: 'auto',
      variant: 'card',
      layout: 'label-first',
    })
    expect(html).toContain('auto-fill')
    expect(html).toContain('rounded-lg border')
    expect(html).toContain('text-success')
    expect(html).toContain('text-destructive')
    expect(html).toContain('Last 30 days')
    expect(html).toContain('data-stat="revenue"')
    expect(html.indexOf('Revenue')).toBeLessThan(html.indexOf('$12k'))
  })
})
