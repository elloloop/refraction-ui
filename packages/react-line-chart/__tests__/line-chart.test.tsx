import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { LineChart, type LineChartProps } from '../src/line-chart.js'

const base: LineChartProps = {
  ariaLabel: 'Revenue and visitors by month',
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  series: [
    { id: 'revenue', name: 'Revenue', color: 'hsl(var(--primary))', data: [10, 20, 15, 30] },
    { id: 'visitors', name: 'Visitors', data: [5, 8, 12, 9] },
  ],
}
const render = (props: Partial<LineChartProps> = {}) =>
  renderToString(React.createElement(LineChart, { ...base, ...props }))

describe('LineChart (SSR)', () => {
  it('renders a focusable, named, responsive svg image', () => {
    const html = render()
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Revenue and visitors by month"')
    expect(html).toContain('viewBox="0 0 760 230"')
    expect(html).toContain('tabindex="0"')
  })

  it('draws one line per series and one hover column per label', () => {
    const html = render()
    expect((html.match(/fill="none" stroke=/g) ?? []).length).toBe(2)
    expect((html.match(/data-index=/g) ?? []).length).toBe(4)
  })

  it('fills the area only for a single series unless asked', () => {
    expect(render()).not.toContain('linearGradient')
    expect(render({ series: [base.series[0]] })).toContain('linearGradient')
    expect(render({ area: true })).toContain('linearGradient')
  })

  it('renders a legend with theme colour fallback, and can hide it', () => {
    const html = render()
    expect(html).toContain('Revenue')
    expect(html).toContain('hsl(var(--chart-2))')
    expect(render({ showLegend: false })).not.toContain('Visitors')
  })

  it('formats y ticks with formatTick', () => {
    expect(render({ formatTick: (v) => `$${Math.round(v)}` })).toContain('$0')
  })

  it('honours a custom viewBox size', () => {
    expect(render({ width: 400, height: 120 })).toContain('viewBox="0 0 400 120"')
  })
})
