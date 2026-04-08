import { describe, it, expect } from 'vitest'
import {
  computeTimelineDuration,
  getClipsAtTime,
  validateTimeline,
} from '../src/video.js'
import type { VideoClip, Track, Timeline, VideoExporter } from '../src/video.js'

// ---------------------------------------------------------------------------
// Type shape checks
// ---------------------------------------------------------------------------
describe('VideoClip type shape', () => {
  it('should accept a valid VideoClip object', () => {
    const clip: VideoClip = {
      id: 'v1',
      type: 'video',
      startTime: 0,
      duration: 60,
      track: 0,
    }
    expect(clip.type).toBe('video')
  })

  it('should accept all valid clip types', () => {
    const types: VideoClip['type'][] = ['video', 'audio', 'picture', 'dialogue', 'text', 'effect']
    types.forEach((t) => {
      const clip: VideoClip = { id: t, type: t, startTime: 0, duration: 1, track: 0 }
      expect(clip.type).toBe(t)
    })
  })
})

describe('Track type shape', () => {
  it('should accept a valid Track object', () => {
    const track: Track = {
      id: 't1',
      name: 'Video Track',
      type: 'video',
      muted: false,
      clips: [],
    }
    expect(track.clips).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// computeTimelineDuration
// ---------------------------------------------------------------------------
describe('computeTimelineDuration', () => {
  it('should return 0 for empty tracks', () => {
    expect(computeTimelineDuration([])).toBe(0)
  })

  it('should return 0 for tracks with no clips', () => {
    const tracks: Track[] = [
      { id: 't1', name: 'A', type: 'video', muted: false, clips: [] },
    ]
    expect(computeTimelineDuration(tracks)).toBe(0)
  })

  it('should compute max end time across clips', () => {
    const tracks: Track[] = [
      {
        id: 't1', name: 'A', type: 'video', muted: false,
        clips: [
          { id: 'c1', type: 'video', startTime: 0, duration: 10, track: 0 },
          { id: 'c2', type: 'video', startTime: 5, duration: 20, track: 0 },
        ],
      },
    ]
    expect(computeTimelineDuration(tracks)).toBe(25) // 5 + 20
  })

  it('should consider clips across multiple tracks', () => {
    const tracks: Track[] = [
      {
        id: 't1', name: 'Video', type: 'video', muted: false,
        clips: [{ id: 'c1', type: 'video', startTime: 0, duration: 10, track: 0 }],
      },
      {
        id: 't2', name: 'Audio', type: 'audio', muted: false,
        clips: [{ id: 'c2', type: 'audio', startTime: 50, duration: 30, track: 1 }],
      },
    ]
    expect(computeTimelineDuration(tracks)).toBe(80) // 50 + 30
  })
})

// ---------------------------------------------------------------------------
// getClipsAtTime
// ---------------------------------------------------------------------------
describe('getClipsAtTime', () => {
  const tracks: Track[] = [
    {
      id: 't1', name: 'Video', type: 'video', muted: false,
      clips: [
        { id: 'c1', type: 'video', startTime: 0, duration: 10, track: 0 },
        { id: 'c2', type: 'video', startTime: 15, duration: 5, track: 0 },
      ],
    },
    {
      id: 't2', name: 'Audio', type: 'audio', muted: false,
      clips: [
        { id: 'c3', type: 'audio', startTime: 5, duration: 20, track: 1 },
      ],
    },
  ]

  it('should return clips overlapping the given time', () => {
    const result = getClipsAtTime(tracks, 7)
    const ids = result.map((c) => c.id)
    expect(ids).toContain('c1')
    expect(ids).toContain('c3')
    expect(ids).not.toContain('c2')
  })

  it('should include clip at its exact start time', () => {
    const result = getClipsAtTime(tracks, 15)
    expect(result.map((c) => c.id)).toContain('c2')
  })

  it('should exclude clip at its exact end time', () => {
    const result = getClipsAtTime(tracks, 10)
    expect(result.map((c) => c.id)).not.toContain('c1')
  })

  it('should return empty array when no clips overlap', () => {
    expect(getClipsAtTime(tracks, 100)).toEqual([])
  })

  it('should return empty when tracks are empty', () => {
    expect(getClipsAtTime([], 0)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// validateTimeline
// ---------------------------------------------------------------------------
describe('validateTimeline', () => {
  const validTimeline: Timeline = {
    tracks: [
      {
        id: 't1', name: 'Video', type: 'video', muted: false,
        clips: [
          { id: 'c1', type: 'video', startTime: 0, duration: 10, track: 0 },
          { id: 'c2', type: 'video', startTime: 15, duration: 5, track: 0 },
        ],
      },
    ],
    duration: 20,
    fps: 30,
  }

  it('should validate a correct timeline', () => {
    const result = validateTimeline(validTimeline)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('should detect overlapping clips on the same track', () => {
    const overlapping: Timeline = {
      tracks: [
        {
          id: 't1', name: 'V', type: 'video', muted: false,
          clips: [
            { id: 'c1', type: 'video', startTime: 0, duration: 10, track: 0 },
            { id: 'c2', type: 'video', startTime: 5, duration: 10, track: 0 },
          ],
        },
      ],
      duration: 15,
      fps: 30,
    }
    const result = validateTimeline(overlapping)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should reject invalid fps values', () => {
    const badFps: Timeline = { ...validTimeline, fps: 0 }
    const result = validateTimeline(badFps)
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.toLowerCase().includes('fps'))).toBe(true)
  })

  it('should reject negative fps', () => {
    const result = validateTimeline({ ...validTimeline, fps: -1 })
    expect(result.valid).toBe(false)
  })

  it('should reject negative duration', () => {
    const result = validateTimeline({ ...validTimeline, duration: -5 })
    expect(result.valid).toBe(false)
  })

  it('should accept standard fps values (24, 25, 30, 50, 60)', () => {
    for (const fps of [24, 25, 30, 50, 60]) {
      const result = validateTimeline({ ...validTimeline, fps })
      expect(result.valid).toBe(true)
    }
  })

  it('should allow non-overlapping adjacent clips', () => {
    const adjacent: Timeline = {
      tracks: [
        {
          id: 't1', name: 'V', type: 'video', muted: false,
          clips: [
            { id: 'c1', type: 'video', startTime: 0, duration: 10, track: 0 },
            { id: 'c2', type: 'video', startTime: 10, duration: 10, track: 0 },
          ],
        },
      ],
      duration: 20,
      fps: 30,
    }
    const result = validateTimeline(adjacent)
    expect(result.valid).toBe(true)
  })

  it('should handle timeline with empty tracks', () => {
    const empty: Timeline = {
      tracks: [{ id: 't1', name: 'V', type: 'video', muted: false, clips: [] }],
      duration: 0,
      fps: 30,
    }
    const result = validateTimeline(empty)
    expect(result.valid).toBe(true)
  })

  it('should detect clips with negative startTime', () => {
    const bad: Timeline = {
      tracks: [{
        id: 't1', name: 'V', type: 'video', muted: false,
        clips: [{ id: 'c1', type: 'video', startTime: -1, duration: 5, track: 0 }],
      }],
      duration: 5,
      fps: 30,
    }
    const result = validateTimeline(bad)
    expect(result.valid).toBe(false)
  })

  it('should detect clips with zero or negative duration', () => {
    const bad: Timeline = {
      tracks: [{
        id: 't1', name: 'V', type: 'video', muted: false,
        clips: [{ id: 'c1', type: 'video', startTime: 0, duration: 0, track: 0 }],
      }],
      duration: 0,
      fps: 30,
    }
    const result = validateTimeline(bad)
    expect(result.valid).toBe(false)
  })
})
