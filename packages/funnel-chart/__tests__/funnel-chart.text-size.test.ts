import { describe, it, expect } from 'vitest'
import { funnelChartClasses } from '../src/funnel-chart.styles.js'

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed. Each rem value equals the former pixel size at the
// default 16px root, so nothing moves for readers who never change it.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/

describe('FunnelChart text size', () => {
  it.each(Object.entries(funnelChartClasses))('sizes the %s slot in rem', (_slot, classes) => {
    expect(classes).not.toMatch(PIXEL_TEXT)
  })

  it('keeps the label, value and share sizes', () => {
    expect(funnelChartClasses.label).toContain('text-[0.8125rem]')
    expect(funnelChartClasses.value).toContain('text-[0.9375rem]')
    expect(funnelChartClasses.share).toContain('text-[0.65625rem]')
  })
})
