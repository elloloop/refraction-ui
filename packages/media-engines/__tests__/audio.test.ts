import { describe, it, expect } from 'vitest'
import {
  generateWaveformPeaks,
  mixVolumes,
  computeClipTimings,
  createMockAudioEngine,
} from '../src/audio.js'
import type { AudioClip, WaveformData, AudioEngine } from '../src/audio.js'

// ---------------------------------------------------------------------------
// AudioClip type checks (structural – TS will catch, but we verify shape)
// ---------------------------------------------------------------------------
describe('AudioClip type shape', () => {
  it('should accept a valid AudioClip object', () => {
    const clip: AudioClip = {
      id: '1',
      src: '/audio/song.mp3',
      startTime: 0,
      duration: 30,
      volume: 0.8,
      speed: 1,
      muted: false,
    }
    expect(clip.id).toBe('1')
    expect(clip.volume).toBe(0.8)
  })
})

// ---------------------------------------------------------------------------
// generateWaveformPeaks
// ---------------------------------------------------------------------------
describe('generateWaveformPeaks', () => {
  it('should return an array of numbers', () => {
    const samples = [0.1, 0.5, 0.9, 0.3]
    const peaks = generateWaveformPeaks(samples)
    expect(Array.isArray(peaks)).toBe(true)
    peaks.forEach((p) => expect(typeof p).toBe('number'))
  })

  it('should default to 100 peaks', () => {
    const samples = Array.from({ length: 1000 }, (_, i) => Math.sin(i))
    const peaks = generateWaveformPeaks(samples)
    expect(peaks.length).toBe(100)
  })

  it('should respect a custom peakCount', () => {
    const samples = Array.from({ length: 500 }, () => 0.5)
    const peaks = generateWaveformPeaks(samples, 50)
    expect(peaks.length).toBe(50)
  })

  it('should normalise peaks to 0-1 range', () => {
    const samples = [0, 0.2, 0.4, 0.6, 0.8, 1.0]
    const peaks = generateWaveformPeaks(samples, 3)
    peaks.forEach((p) => {
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    })
  })

  it('should take the max of each bucket', () => {
    // 4 samples, 2 peaks → buckets [0.1, 0.9] and [0.3, 0.7]
    const peaks = generateWaveformPeaks([0.1, 0.9, 0.3, 0.7], 2)
    expect(peaks[0]).toBe(0.9)
    expect(peaks[1]).toBe(0.7)
  })

  it('should handle empty samples', () => {
    const peaks = generateWaveformPeaks([], 10)
    expect(peaks.length).toBe(10)
    peaks.forEach((p) => expect(p).toBe(0))
  })

  it('should handle peakCount larger than samples length', () => {
    const peaks = generateWaveformPeaks([0.5, 0.8], 10)
    expect(peaks.length).toBe(10)
  })

  it('should use absolute values for negative samples', () => {
    const peaks = generateWaveformPeaks([-0.5, -1.0, 0.3, 0.1], 2)
    expect(peaks[0]).toBe(1.0)
    expect(peaks[1]).toBe(0.3)
  })
})

// ---------------------------------------------------------------------------
// mixVolumes
// ---------------------------------------------------------------------------
describe('mixVolumes', () => {
  const clips: AudioClip[] = [
    { id: 'a', src: '', startTime: 0, duration: 10, volume: 0.8, speed: 1, muted: false },
    { id: 'b', src: '', startTime: 0, duration: 10, volume: 0.5, speed: 1, muted: true },
    { id: 'c', src: '', startTime: 0, duration: 10, volume: 1.0, speed: 1, muted: false },
  ]

  it('should return one entry per clip', () => {
    const result = mixVolumes(clips, 1)
    expect(result.length).toBe(3)
  })

  it('should multiply clip volume by master volume', () => {
    const result = mixVolumes(clips, 0.5)
    const a = result.find((r) => r.id === 'a')!
    expect(a.effectiveVolume).toBeCloseTo(0.4)
  })

  it('should return 0 for muted clips', () => {
    const result = mixVolumes(clips, 1)
    const b = result.find((r) => r.id === 'b')!
    expect(b.effectiveVolume).toBe(0)
  })

  it('should return 0 when master volume is 0', () => {
    const result = mixVolumes(clips, 0)
    result.forEach((r) => expect(r.effectiveVolume).toBe(0))
  })

  it('should handle empty clips array', () => {
    expect(mixVolumes([], 1)).toEqual([])
  })

  it('should clamp effective volume to 0-1 range', () => {
    const loud: AudioClip[] = [
      { id: 'x', src: '', startTime: 0, duration: 5, volume: 1.5, speed: 1, muted: false },
    ]
    const result = mixVolumes(loud, 1)
    expect(result[0].effectiveVolume).toBeLessThanOrEqual(1)
  })
})

// ---------------------------------------------------------------------------
// computeClipTimings
// ---------------------------------------------------------------------------
describe('computeClipTimings', () => {
  const clips: AudioClip[] = [
    { id: 'intro', src: '', startTime: 0, duration: 10, volume: 1, speed: 1, muted: false },
    { id: 'middle', src: '', startTime: 10, duration: 20, volume: 1, speed: 1, muted: false },
    { id: 'outro', src: '', startTime: 25, duration: 10, volume: 1, speed: 1, muted: false },
  ]

  it('should mark clip as playing when position is within its range', () => {
    const result = computeClipTimings(clips, 5)
    const intro = result.find((r) => r.id === 'intro')!
    expect(intro.shouldPlay).toBe(true)
  })

  it('should mark clip as not playing when position is outside its range', () => {
    const result = computeClipTimings(clips, 5)
    const middle = result.find((r) => r.id === 'middle')!
    expect(middle.shouldPlay).toBe(false)
  })

  it('should compute offset as position minus startTime', () => {
    const result = computeClipTimings(clips, 15)
    const middle = result.find((r) => r.id === 'middle')!
    expect(middle.offset).toBe(5)
  })

  it('should return offset 0 for clips not yet started', () => {
    const result = computeClipTimings(clips, 5)
    const middle = result.find((r) => r.id === 'middle')!
    expect(middle.offset).toBe(0)
  })

  it('should handle overlapping clips', () => {
    const result = computeClipTimings(clips, 27)
    const middle = result.find((r) => r.id === 'middle')!
    const outro = result.find((r) => r.id === 'outro')!
    expect(middle.shouldPlay).toBe(true) // 10..30
    expect(outro.shouldPlay).toBe(true) // 25..35
  })

  it('should handle position at exact start time', () => {
    const result = computeClipTimings(clips, 10)
    const middle = result.find((r) => r.id === 'middle')!
    expect(middle.shouldPlay).toBe(true)
    expect(middle.offset).toBe(0)
  })

  it('should handle position at exact end time', () => {
    const result = computeClipTimings(clips, 10)
    const intro = result.find((r) => r.id === 'intro')!
    // At exactly startTime + duration the clip is done
    expect(intro.shouldPlay).toBe(false)
  })

  it('should return entries for all clips', () => {
    const result = computeClipTimings(clips, 0)
    expect(result.length).toBe(clips.length)
  })

  it('should handle empty clips array', () => {
    expect(computeClipTimings([], 5)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// createMockAudioEngine
// ---------------------------------------------------------------------------
describe('createMockAudioEngine', () => {
  it('should return an object conforming to AudioEngine', () => {
    const engine = createMockAudioEngine()
    expect(typeof engine.load).toBe('function')
    expect(typeof engine.play).toBe('function')
    expect(typeof engine.pause).toBe('function')
    expect(typeof engine.stop).toBe('function')
    expect(typeof engine.record).toBe('function')
    expect(typeof engine.getWaveform).toBe('function')
  })

  it('load should resolve without error', async () => {
    const engine = createMockAudioEngine()
    await expect(engine.load('/test.mp3')).resolves.toBeUndefined()
  })

  it('play should not throw', () => {
    const engine = createMockAudioEngine()
    const clip: AudioClip = {
      id: '1', src: '', startTime: 0, duration: 5, volume: 1, speed: 1, muted: false,
    }
    expect(() => engine.play(clip)).not.toThrow()
  })

  it('pause and stop should not throw', () => {
    const engine = createMockAudioEngine()
    expect(() => engine.pause()).not.toThrow()
    expect(() => engine.stop()).not.toThrow()
  })

  it('record should resolve to a Blob-like object', async () => {
    const engine = createMockAudioEngine()
    const blob = await engine.record()
    expect(blob).toBeDefined()
  })

  it('getWaveform should resolve to WaveformData', async () => {
    const engine = createMockAudioEngine()
    const waveform = await engine.getWaveform('/test.mp3')
    expect(Array.isArray(waveform)).toBe(true)
  })
})
