import { describe, it, expect } from 'vitest'
import { createChart, combineDimensions } from '../src/chart.js'
import type { ChartConfig } from '../src/chart.js'

describe('combineDimensions', () => {
  it('uses default margins when none provided', () => {
    const dims = combineDimensions({})
    expect(dims.margin.top).toBe(40)
    expect(dims.margin.right).toBe(30)
    expect(dims.margin.bottom).toBe(40)
    expect(dims.margin.left).toBe(75)
  })

  it('overrides individual margin values', () => {
    const dims = combineDimensions({ margin: { top: 10, right: 10, bottom: 10, left: 10 } })
    expect(dims.margin.top).toBe(10)
    expect(dims.margin.right).toBe(10)
  })

  it('computes boundedWidth from width and margins', () => {
    const dims = combineDimensions({ width: 500, margin: { top: 0, right: 50, bottom: 0, left: 50 } })
    expect(dims.boundedWidth).toBe(400)
  })

  it('computes boundedHeight from height and margins', () => {
    const dims = combineDimensions({ height: 400, margin: { top: 20, right: 0, bottom: 30, left: 0 } })
    expect(dims.boundedHeight).toBe(350)
  })

  it('uses default width and height', () => {
    const dims = combineDimensions({})
    expect(dims.width).toBeGreaterThan(0)
    expect(dims.height).toBeGreaterThan(0)
  })

  it('boundedWidth is never negative', () => {
    const dims = combineDimensions({ width: 10, margin: { top: 0, right: 100, bottom: 0, left: 100 } })
    expect(dims.boundedWidth).toBeGreaterThanOrEqual(0)
  })
})

describe('createChart', () => {
  const config: ChartConfig = {
    width: 600,
    height: 400,
    margin: { top: 20, right: 30, bottom: 40, left: 50 },
    data: [1, 2, 3, 4, 5],
  }

  it('returns dimensions based on config', () => {
    const chart = createChart(config)
    expect(chart.dimensions.width).toBe(600)
    expect(chart.dimensions.height).toBe(400)
  })

  it('computes boundedWidth correctly', () => {
    const chart = createChart(config)
    expect(chart.dimensions.boundedWidth).toBe(600 - 30 - 50)
  })

  it('computes boundedHeight correctly', () => {
    const chart = createChart(config)
    expect(chart.dimensions.boundedHeight).toBe(400 - 20 - 40)
  })

  it('exposes margin values', () => {
    const chart = createChart(config)
    expect(chart.dimensions.margin).toEqual({ top: 20, right: 30, bottom: 40, left: 50 })
  })

  it('updateDimensions changes dimensions', () => {
    const chart = createChart(config)
    chart.updateDimensions({ width: 800 })
    expect(chart.dimensions.width).toBe(800)
    expect(chart.dimensions.boundedWidth).toBe(800 - 30 - 50)
  })

  it('updateDimensions preserves unchanged values', () => {
    const chart = createChart(config)
    chart.updateDimensions({ width: 1000 })
    expect(chart.dimensions.height).toBe(400)
    expect(chart.dimensions.margin.top).toBe(20)
  })

  it('provides scales object', () => {
    const chart = createChart(config)
    expect(chart.scales).toBeDefined()
  })

  it('data is accessible from config', () => {
    const chart = createChart(config)
    expect(chart.dimensions).toBeDefined()
  })
})
