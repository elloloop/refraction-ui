import { describe, it, expect } from 'vitest'
import { computeLineChart, nextLineChartIndex, tooltipLeftPercent, lineChartColor } from '../src/index.js'

const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May']
const series = [
  { id: 'revenue', name: 'Revenue', color: 'red', data: [10, 20, 30, 40, 50] },
  { id: 'costs', name: 'Costs', data: [5, 5, 5, 5, 5] },
]
const geo = () =>
  computeLineChart({ series, labels, width: 500, height: 200, padding: { top: 10, right: 10, bottom: 20, left: 40 } })

describe('computeLineChart', () => {
  it('puts every series on one shared y-scale with headroom', () => {
    const g = geo()
    expect(g.max).toBeCloseTo(54)
    // The same value maps to the same y regardless of series.
    expect(g.y(5)).toBeCloseTo(g.y(5))
    expect(g.y(0)).toBe(g.plotBottom)
    expect(g.y(g.max)).toBe(g.plotTop)
  })

  it('spreads categories across the plot width', () => {
    const g = geo()
    expect(g.x(0)).toBe(40)
    expect(g.x(4)).toBe(490)
    expect(g.columns).toHaveLength(5)
  })

  it('emits gridline ticks from zero to max', () => {
    const g = geo()
    expect(g.ticks).toHaveLength(5)
    expect(g.ticks[0].value).toBe(0)
    expect(g.ticks[4].value).toBeCloseTo(54)
  })

  it('thins x labels but always keeps the last one', () => {
    expect(computeLineChart({ series, labels: ['a', 'b', 'c', 'd'], width: 100, height: 100 }).xLabels.map((l) => l.label)).toEqual(['a', 'c', 'd'])
  })

  it('builds line + closed area paths and falls back to theme colours', () => {
    const g = geo()
    expect(g.paths[0].line.startsWith('M40.0')).toBe(true)
    expect(g.paths[0].area.endsWith('Z')).toBe(true)
    expect(g.paths[0].color).toBe('red')
    expect(g.paths[1].color).toBe(lineChartColor(1))
    expect(lineChartColor(5)).toBe('hsl(var(--chart-1))')
  })

  it('does not divide by zero on empty or all-zero data', () => {
    const g = computeLineChart({ series: [{ id: 'a', name: 'A', data: [0, 0] }], labels: ['x', 'y'], width: 100, height: 100 })
    expect(g.max).toBe(1)
    expect(Number.isFinite(g.y(0))).toBe(true)
  })

  it('positions the tooltip as a percent of width', () => {
    expect(tooltipLeftPercent(geo(), 4)).toBeCloseTo(98)
  })
})

describe('nextLineChartIndex', () => {
  it('moves with arrows and clamps at the ends', () => {
    expect(nextLineChartIndex(null, 'ArrowRight', 3)).toBe(0)
    expect(nextLineChartIndex(null, 'ArrowLeft', 3)).toBe(2)
    expect(nextLineChartIndex(2, 'ArrowRight', 3)).toBe(2)
    expect(nextLineChartIndex(0, 'ArrowLeft', 3)).toBe(0)
    expect(nextLineChartIndex(1, 'Home', 3)).toBe(0)
    expect(nextLineChartIndex(1, 'End', 3)).toBe(2)
    expect(nextLineChartIndex(1, 'Tab', 3)).toBe(1)
    expect(nextLineChartIndex(null, 'ArrowRight', 0)).toBeNull()
  })
})
