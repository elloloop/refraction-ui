import { describe, it, expect } from 'vitest'
import { statusBarVariants, tabVariants } from '../src/diff-viewer.styles.js'

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed. Each rem value equals the former pixel size at the
// default 16px root, so nothing moves for readers who never change it.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/
// A fixed pixel height would clip the text once it grows.
const PIXEL_HEIGHT = /\bh-\[\d+(?:\.\d+)?px\]/

describe('DiffViewer text size', () => {
  it.each(['dark', 'light'] as const)('sizes the %s status bar in rem', (theme) => {
    const classes = statusBarVariants({ theme })
    expect(classes).not.toMatch(PIXEL_TEXT)
    expect(classes).not.toMatch(PIXEL_HEIGHT)
    expect(classes).toContain('text-[0.6875rem]')
    expect(classes).toContain('h-[1.375rem]')
  })

  it.each(['true', 'false'] as const)('lets a file tab (active=%s) grow with its text', (active) => {
    const classes = tabVariants({ active, theme: 'dark' })
    expect(classes).not.toMatch(PIXEL_HEIGHT)
    expect(classes).toContain('h-[2.1875rem]')
  })
})
