import { describe, it, expect } from 'vitest'
import { audioRoomHandBadgeClass, audioRoomMutedBadgeClass } from '../src/audio-room.styles.js'

// Text sized in rem follows the reader's browser text-size setting; a pixel
// size would stay fixed. Each rem value equals the former pixel size at the
// default 16px root, so nothing moves for readers who never change it.
const PIXEL_TEXT = /\btext-\[\d+(?:\.\d+)?px\]/

describe('AudioRoom text size', () => {
  it('sizes the muted badge in rem', () => {
    expect(audioRoomMutedBadgeClass).not.toMatch(PIXEL_TEXT)
    expect(audioRoomMutedBadgeClass).toContain('text-[0.625rem]')
  })

  it('sizes the raised-hand badge in rem', () => {
    expect(audioRoomHandBadgeClass).not.toMatch(PIXEL_TEXT)
    expect(audioRoomHandBadgeClass).toContain('text-[0.75rem]')
  })
})
