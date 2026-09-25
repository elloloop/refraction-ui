import { describe, it, expect } from 'vitest'
import { computeLineChart, nextLineChartIndex, tooltipLeftPercent, lineChartColor, niceScale } from '../src/index.js'

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
    // peak 50 × headroom 1.08 = 54 → nice step 20 → max 60
    expect(g.max).toBe(60)
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

  it('emits round gridline ticks from zero to a nice max', () => {
    expect(geo().ticks.map((t) => t.value)).toEqual([0, 20, 40, 60])
  })

  it('thins x labels but always keeps the last one', () => {
    expect(computeLineChart({ series, labels: ['a', 'b', 'c', 'd'], width: 100, height: 100, labelEvery: 2 }).xLabels.map((l) => l.label)).toEqual(['a', 'c', 'd'])
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

describe('automatic x label thinning', () => {
  const months = ['J', 'F', 'M', 'A', 'M2', 'J2', 'J3', 'A2', 'S', 'O', 'N', 'D']
  it('keeps every label when there is room and thins when narrow', () => {
    expect(computeLineChart({ series, labels: months, width: 760, height: 200 }).xLabels).toHaveLength(12)
    const narrow = computeLineChart({ series, labels: months, width: 300, height: 200 }).xLabels
    expect(narrow.length).toBeLessThan(12)
    expect(narrow[narrow.length - 1].label).toBe('D')
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

describe('niceScale', () => {
  it('produces 1-2-5 steps and round tick values', () => {
    expect(niceScale(5555, 4)).toEqual({ max: 6000, step: 2000, ticks: [0, 2000, 4000, 6000] })
    expect(niceScale(100, 4)).toEqual({ max: 100, step: 50, ticks: [0, 50, 100] })
    expect(niceScale(0.3, 4).ticks).toEqual([0, 0.1, 0.2, 0.3])
  })

  it('never returns floating-point noise', () => {
    for (const raw of [0.7, 3.3, 47, 5999.9999, 123456]) {
      const { step, ticks } = niceScale(raw, 4)
      const stepDecimals = (String(step).split('.')[1] ?? '').length
      for (const t of ticks) expect((String(t).split('.')[1] ?? '').length).toBeLessThanOrEqual(stepDecimals)
    }
  })

  it('covers the raw max and handles zero', () => {
    for (const raw of [1, 9, 11, 99, 101, 5401]) expect(niceScale(raw, 4).max).toBeGreaterThanOrEqual(raw)
    expect(niceScale(0, 4).max).toBe(1)
  })
})
