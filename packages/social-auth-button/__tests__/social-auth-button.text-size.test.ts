import { describe, it, expect } from 'vitest'
import { lastUsedBadgeVariants } from '../src/social-auth-button.styles.js'

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed. Each rem value equals the former pixel size at the
// default 16px root, so nothing moves for readers who never change it.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/

describe('SocialAuthButton text size', () => {
  it('sizes the "Last used" badge in rem', () => {
    expect(lastUsedBadgeVariants()).not.toMatch(PIXEL_TEXT)
    expect(lastUsedBadgeVariants()).toContain('text-[0.625rem]')
  })
})
