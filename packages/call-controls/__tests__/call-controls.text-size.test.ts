import { describe, it, expect } from 'vitest'
import { callControlLabelClass } from '../src/call-controls.styles.js'

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed. Each rem value equals the former pixel size at the
// default 16px root, so nothing moves for readers who never change it.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/

describe('CallControls text size', () => {
  it('sizes the control label in rem', () => {
    expect(callControlLabelClass).not.toMatch(PIXEL_TEXT)
    expect(callControlLabelClass).toContain('text-[0.625rem]')
  })
})
