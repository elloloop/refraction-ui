import { describe, it, expect } from 'vitest'
import { lineChartClasses } from '../src/line-chart.styles.js'

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed. Each rem value equals the former pixel size at the
// default 16px root, so nothing moves for readers who never change it.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/

describe('LineChart text size', () => {
  it.each(Object.entries(lineChartClasses))('sizes the %s slot in rem', (_slot, classes) => {
    expect(classes).not.toMatch(PIXEL_TEXT)
  })

  it('keeps the axis and legend sizes', () => {
    expect(lineChartClasses.axis).toContain('text-[0.5625rem]')
    expect(lineChartClasses.legendItem).toContain('text-[0.6875rem]')
  })
})
