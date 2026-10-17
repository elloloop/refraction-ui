import { describe, it, expect } from 'vitest'
import {
  getInitials,
  createVideoTile,
  getVideoTileEmphasis,
  getVideoTileLabel,
  videoTileDefaultLabels,
  videoTileEdgeVariants,
  videoTileMediaVariants,
  videoTileVariants,
  videoTileAvatarFallbackClass,
  videoTileAvatarCircleClass,
  videoTileNameChipClass,
} from '../src/index.js'

describe('getInitials', () => {
  it('extracts two initials from a full name', () => {
    expect(getInitials('Maya Goldberg')).toBe('MG')
  })

  it('extracts a single initial from a single-word name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('uppercases the initials', () => {
    expect(getInitials('john doe')).toBe('JD')
  })

  it('takes only the first two words when more are given', () => {
    expect(getInitials('Mary Anne Smith')).toBe('MA')
  })

  it('handles leading/trailing whitespace', () => {
    expect(getInitials('  Bob  ')).toBe('B')
  })
})

describe('createVideoTile', () => {
  it('defaults speaking and pinned to false', () => {
    const { dataAttributes, ariaProps } = createVideoTile()
    expect(dataAttributes['data-speaking']).toBe('false')
    expect(dataAttributes['data-pinned']).toBe('false')
    expect(ariaProps.role).toBe('group')
  })

  it('sets data-speaking to true when speaking', () => {
    const { dataAttributes } = createVideoTile({ speaking: true })
    expect(dataAttributes['data-speaking']).toBe('true')
  })

  it('sets data-pinned to true when pinned', () => {
    const { dataAttributes } = createVideoTile({ pinned: true })
    expect(dataAttributes['data-pinned']).toBe('true')
  })

  it('both flags can be true simultaneously', () => {
    const { dataAttributes } = createVideoTile({ speaking: true, pinned: true })
    expect(dataAttributes['data-speaking']).toBe('true')
    expect(dataAttributes['data-pinned']).toBe('true')
  })
})

describe('createVideoTile — hand and screen share', () => {
  it('defaults hand-raised and screen-share to false', () => {
    const { dataAttributes } = createVideoTile()
    expect(dataAttributes['data-hand-raised']).toBe('false')
    expect(dataAttributes['data-screen-share']).toBe('false')
  })

  it('reflects a raised hand', () => {
    expect(createVideoTile({ handRaised: true }).dataAttributes['data-hand-raised']).toBe('true')
  })

  it('reflects a shared screen', () => {
    expect(createVideoTile({ screenShare: true }).dataAttributes['data-screen-share']).toBe('true')
  })

  it('exposes the edge emphasis', () => {
    expect(createVideoTile().emphasis).toBe('none')
    expect(createVideoTile({ pinned: true }).emphasis).toBe('pinned')
    expect(createVideoTile({ speaking: true, pinned: true }).emphasis).toBe('speaking')
  })
})

describe('getVideoTileEmphasis', () => {
  it('is none when idle', () => {
    expect(getVideoTileEmphasis({})).toBe('none')
  })

  it('highlights a pinned tile', () => {
    expect(getVideoTileEmphasis({ pinned: true })).toBe('pinned')
  })

  it('lets speaking win over pinned — the pin badge still marks the pin', () => {
    expect(getVideoTileEmphasis({ speaking: true, pinned: true })).toBe('speaking')
  })
})

describe('getVideoTileLabel', () => {
  it('is the participant name for a camera tile', () => {
    expect(getVideoTileLabel('Maya Goldberg')).toBe('Maya Goldberg')
  })

  it('qualifies a shared-screen tile with the default label', () => {
    expect(getVideoTileLabel('Maya Goldberg', { screenShare: true })).toBe(
      'Maya Goldberg (Presenting)',
    )
  })

  it('uses an overridden screen-share label', () => {
    expect(
      getVideoTileLabel('Maya', { screenShare: true }, { screenShare: 'Bildschirm' }),
    ).toBe('Maya (Bildschirm)')
  })
})

describe('videoTileDefaultLabels', () => {
  it('names every indicator', () => {
    expect(videoTileDefaultLabels).toEqual({
      muted: 'Microphone muted',
      speaking: 'Speaking',
      handRaised: 'Hand raised',
      pinned: 'Pinned',
      screenShare: 'Presenting',
    })
  })
})

describe('styles', () => {
  it('draws the speaking edge with the success token and the pin edge with primary', () => {
    expect(videoTileEdgeVariants({ emphasis: 'speaking' })).toContain('border-success')
    expect(videoTileEdgeVariants({ emphasis: 'pinned' })).toContain('border-primary')
    expect(videoTileEdgeVariants({ emphasis: 'none' })).toContain('border-transparent')
  })

  it('disables the edge transition under reduced motion', () => {
    expect(videoTileEdgeVariants()).toContain('motion-reduce:transition-none')
  })

  it('crops camera media and letterboxes a shared screen', () => {
    expect(videoTileMediaVariants({ fit: 'cover' })).toContain('[&>video]:object-cover')
    expect(videoTileMediaVariants({ fit: 'contain' })).toContain('[&>video]:object-contain')
  })

  it('keeps a 16:9 tile by default and fills the parent on request', () => {
    expect(videoTileVariants()).toContain('aspect-video')
    expect(videoTileVariants({ fill: 'true' })).toContain('h-full w-full')
    expect(videoTileVariants({ fill: 'true' })).not.toContain('aspect-video')
  })

  it('keeps the root free of an outer ring a clipping parent would cut off', () => {
    expect(videoTileVariants()).not.toMatch(/\bring-/)
  })

  it('sizes the avatar to the space above the name chip, so a short tile never overlaps them', () => {
    // The chip sits at bottom-2 and is under 1.5rem tall; the avatar area ends 2rem up.
    expect(videoTileNameChipClass).toContain('bottom-2')
    expect(videoTileAvatarFallbackClass).toContain('bottom-8')
    expect(videoTileAvatarFallbackClass).not.toContain('inset-0')
    expect(videoTileAvatarCircleClass).toContain('h-full')
    expect(videoTileAvatarCircleClass).toContain('max-h-16')
  })
})
