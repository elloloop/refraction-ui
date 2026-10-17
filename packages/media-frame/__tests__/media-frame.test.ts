import { describe, it, expect } from 'vitest'
import {
  createMediaFrame,
  parseMediaRatio,
  mediaFrameVariants,
  mediaFrameLabelVariants,
  MEDIA_FRAME_FALLBACK_RATIO,
} from '../src/index.js'

describe('parseMediaRatio', () => {
  it('reads numbers, w:h and w/h', () => {
    expect(parseMediaRatio(1.5)).toBe(1.5)
    expect(parseMediaRatio('9:16')).toBeCloseTo(0.5625)
    expect(parseMediaRatio('4 / 3')).toBeCloseTo(4 / 3)
    expect(parseMediaRatio('2.39:1')).toBeCloseTo(2.39)
    expect(parseMediaRatio('.5:1')).toBeCloseTo(0.5)
    expect(parseMediaRatio('3.:2')).toBeCloseTo(1.5)
  })

  it('rejects unusable ratios', () => {
    expect(parseMediaRatio(0)).toBeNull()
    expect(parseMediaRatio(-1)).toBeNull()
    expect(parseMediaRatio(Number.NaN)).toBeNull()
    expect(parseMediaRatio(Number.POSITIVE_INFINITY)).toBeNull()
    expect(parseMediaRatio('wide')).toBeNull()
    expect(parseMediaRatio('')).toBeNull()
    expect(parseMediaRatio('16')).toBeNull()
    expect(parseMediaRatio('0:9')).toBeNull()
    expect(parseMediaRatio('16:0')).toBeNull()
    expect(parseMediaRatio('.:1')).toBeNull()
    expect(parseMediaRatio('1.2.3:4')).toBeNull()
    expect(parseMediaRatio('16:9:1')).toBeNull()
    expect(parseMediaRatio('-4:3')).toBeNull()
    expect(parseMediaRatio('1e3:1')).toBeNull()
  })
})

describe('createMediaFrame', () => {
  it('defaults to a square frame on the neutral surface', () => {
    const api = createMediaFrame()
    expect(api.aspectRatio).toBe(String(MEDIA_FRAME_FALLBACK_RATIO))
    expect(api.ratioValid).toBe(true)
    expect(api.orientation).toBe('square')
    expect(api.dataAttributes).toEqual({ 'data-slot': 'media-frame', 'data-orientation': 'square' })
    expect(api.rootClass).toContain('bg-muted')
    expect(api.labelClass).toContain('bg-background/80')
  })

  it('derives the aspect ratio and orientation', () => {
    const landscape = createMediaFrame({ ratio: '16:9' })
    expect(Number(landscape.aspectRatio)).toBeCloseTo(16 / 9)
    expect(landscape.dataAttributes['data-orientation']).toBe('landscape')
    expect(createMediaFrame({ ratio: '9:16' }).orientation).toBe('portrait')
    expect(createMediaFrame({ ratio: 1 }).orientation).toBe('square')
    expect(createMediaFrame({ ratio: '4/4' }).orientation).toBe('square')
  })

  it('falls back to a square and reports an unusable ratio', () => {
    const api = createMediaFrame({ ratio: 'nope' })
    expect(api.aspectRatio).toBe('1')
    expect(api.ratioValid).toBe(false)
    expect(api.orientation).toBe('square')
  })

  it('places the caption in a logical corner', () => {
    expect(createMediaFrame().labelClass).toContain('start-1.5 top-1.5')
    expect(createMediaFrame({ labelPosition: 'top-end' }).labelClass).toContain('end-1.5 top-1.5')
    expect(createMediaFrame({ labelPosition: 'bottom-start' }).labelClass).toContain(
      'bottom-1.5 start-1.5',
    )
    expect(createMediaFrame({ labelPosition: 'bottom-end' }).labelClass).toContain(
      'bottom-1.5 end-1.5',
    )
    expect(createMediaFrame({ labelPosition: 'bottom-end' }).labelClass).not.toMatch(
      /\b(left|right)-/,
    )
  })

  it('switches both surfaces to the tertiary tone', () => {
    const api = createMediaFrame({ tone: 'tertiary' })
    expect(api.rootClass).toContain('bg-tertiary')
    expect(api.rootClass).not.toContain('bg-muted')
    expect(api.labelClass).toContain('text-tertiary-foreground')
  })

  it('agrees with the exported variants', () => {
    const api = createMediaFrame({ tone: 'tertiary', labelPosition: 'top-end' })
    expect(api.rootClass).toBe(mediaFrameVariants({ tone: 'tertiary' }))
    expect(api.labelClass).toBe(mediaFrameLabelVariants({ tone: 'tertiary', position: 'top-end' }))
  })
})
