import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { FunnelChart, type FunnelChartProps } from '../src/funnel-chart.js'

const steps = [
  { id: 'visit', label: 'Visitors', description: 'Landing page', value: 1000 },
  { id: 'signup', label: 'Sign-ups', value: 250 },
  { id: 'buy', label: 'Purchases', value: 20 },
]

const render = (props: Partial<FunnelChartProps> = {}) =>
  renderToString(React.createElement(FunnelChart, { steps, ...props }))

describe('FunnelChart (SSR)', () => {
  it('renders one list item per step with its label and value', () => {
    const html = render({ 'aria-label': 'Checkout funnel' })
    expect(html).toMatch(/^<ol/)
    expect(html).toContain('aria-label="Checkout funnel"')
    expect((html.match(/<li>/g) ?? []).length).toBe(3)
    expect(html).toContain('Visitors')
    expect(html).toContain('Landing page')
    expect(html).toContain('1,000')
  })

  it('draws bars at their share, clamped to the minimum width', () => {
    const html = render({ minBarPercent: 5 })
    expect(html).toContain('width:100%')
    expect(html).toContain('width:25%')
    expect(html).toContain('width:5%')
  })

  it('renders transitions between steps using the copy props', () => {
    const html = render({
      conversionLabel: (p) => `${p} moved on`,
      droppedLabel: (n) => `${n} left`,
      formatPercent: (p) => `${Math.round(p)}%`,
    })
    expect(html).toContain('25% moved on')
    expect(html).toContain('750 left')
    expect((html.match(/moved on/g) ?? []).length).toBe(2)
  })
})
