import { describe, it, expect } from 'vitest'
import { tableHeadVariants } from '../src/table.styles.js'

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed. Each rem value equals the former pixel size at the
// default 16px root, so nothing moves for readers who never change it.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/

describe('Table text size', () => {
  it.each(['default', 'eyebrow'] as const)('sizes the %s header tone in rem', (tone) => {
    expect(tableHeadVariants({ tone })).not.toMatch(PIXEL_TEXT)
  })

  it('keeps the eyebrow header at 0.6875rem', () => {
    expect(tableHeadVariants({ tone: 'eyebrow' })).toContain('text-[0.6875rem]')
  })
})
