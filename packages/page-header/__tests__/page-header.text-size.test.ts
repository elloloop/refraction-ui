import { describe, it, expect } from 'vitest'
import { pageHeaderKickerClass } from '../src/page-header.styles.js'

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed. Each rem value equals the former pixel size at the
// default 16px root, so nothing moves for readers who never change it.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/

describe('PageHeader text size', () => {
  it('sizes the kicker in rem', () => {
    expect(pageHeaderKickerClass).not.toMatch(PIXEL_TEXT)
    expect(pageHeaderKickerClass).toContain('text-[0.6875rem]')
  })
})
