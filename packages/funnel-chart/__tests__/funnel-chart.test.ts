import { describe, it, expect } from 'vitest'
import { computeFunnel, funnelChartDefaults } from '../src/index.js'

const steps = [
  { id: 'visit', label: 'Visitors', value: 1000 },
  { id: 'signup', label: 'Sign-ups', value: 250 },
  { id: 'buy', label: 'Purchases', value: 20 },
]

describe('computeFunnel', () => {
  it('computes each step share of the top step', () => {
    expect(computeFunnel(steps).map((r) => r.shareOfTop)).toEqual([100, 25, 2])
  })

  it('never draws a bar below the minimum width', () => {
    const rows = computeFunnel(steps, 6)
    expect(rows[2].barPercent).toBe(6)
    expect(rows[1].barPercent).toBe(25)
  })

  it('computes continue-rate and drop-off between steps, none after the last', () => {
    const rows = computeFunnel(steps)
    expect(rows[0].next).toEqual({ conversion: 25, dropped: 750 })
    expect(rows[1].next).toEqual({ conversion: 8, dropped: 230 })
    expect(rows[2].next).toBeUndefined()
  })

  it('handles an empty funnel and a zero top step without dividing by zero', () => {
    expect(computeFunnel([])).toEqual([])
    const rows = computeFunnel([{ id: 'a', label: 'A', value: 0 }, { id: 'b', label: 'B', value: 0 }])
    expect(rows[0].shareOfTop).toBe(0)
    expect(rows[0].next?.conversion).toBe(0)
  })
})

describe('funnelChartDefaults', () => {
  it('formats values, percents and copy', () => {
    expect(funnelChartDefaults.formatValue(12500)).toBe('12,500')
    expect(funnelChartDefaults.formatPercent(25)).toBe('25.0%')
    expect(funnelChartDefaults.shareLabel('25.0%')).toBe('25.0% of top')
  })
})
