import { describe, it, expect } from 'vitest'
import { statusBadgeVariants, urlBarClass } from '../src/browser-chrome-mock.styles.js'

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed. Each rem value equals the former pixel size at the
// default 16px root, so nothing moves for readers who never change it.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/

describe('BrowserChromeMock text size', () => {
  it('sizes the URL bar in rem', () => {
    expect(urlBarClass).not.toMatch(PIXEL_TEXT)
    expect(urlBarClass).toContain('text-[0.6875rem]')
  })

  it('sizes the status badge in rem', () => {
    expect(statusBadgeVariants()).not.toMatch(PIXEL_TEXT)
    expect(statusBadgeVariants()).toContain('text-[0.625rem]')
  })
})
