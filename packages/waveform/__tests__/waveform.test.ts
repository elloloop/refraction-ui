import { describe, expect, it } from 'vitest'
import {
  DEFAULT_WAVEFORM_BAR_COUNT,
  DEFAULT_WAVEFORM_COLOR,
  createIntensitySamples,
  createSilentSamples,
  createWaveform,
  getWaveformPeak,
  normalizeBarCount,
  normalizeIntensity,
  normalizeSmoothing,
  normalizeWaveformConfig,
  normalizeWaveformSamples,
  resampleWaveformSamples,
  scaleWaveformSamples,
  smoothWaveformSamples,
  toCssDimension,
} from '../src/waveform.js'
import { waveformCanvasVariants, waveformVariants } from '../src/waveform.styles.js'

describe('waveform config', () => {
  it('normalizes defaults', () => {
    const config = normalizeWaveformConfig()

    expect(config.variant).toBe('bars')
    expect(config.smoothing).toBe(0.8)
    expect(config.color).toBe(DEFAULT_WAVEFORM_COLOR)
    expect(config.barCount).toBe(DEFAULT_WAVEFORM_BAR_COUNT)
  })

  it('clamps numeric options', () => {
    expect(normalizeBarCount(0)).toBe(1)
    expect(normalizeBarCount(2.4)).toBe(2)
    expect(normalizeSmoothing(-1)).toBe(0)
    expect(normalizeSmoothing(2)).toBe(0.99)
    expect(normalizeIntensity(-1)).toBe(0)
    expect(normalizeIntensity(10)).toBe(1)
  })

  it('formats numeric css dimensions as pixels', () => {
    expect(toCssDimension(80)).toBe('80px')
    expect(toCssDimension('4rem')).toBe('4rem')
    expect(toCssDimension(undefined)).toBeUndefined()
  })
})

describe('waveform samples', () => {
  it('normalizes sample arrays to the -1..1 range', () => {
    const samples = normalizeWaveformSamples([0, 64, 128, 255])

    expect(samples[0]).toBe(0)
    expect(samples[1]).toBeCloseTo(64 / 255)
    expect(samples[2]).toBeCloseTo(128 / 255)
    expect(samples[3]).toBe(1)
  })

  it('filters non-finite samples', () => {
    const samples = normalizeWaveformSamples([0, Number.NaN, Number.POSITIVE_INFINITY, -1])

    expect(Array.from(samples)).toEqual([0, 0, 0, -1])
  })

  it('returns silent samples for empty input with a target count', () => {
    const samples = normalizeWaveformSamples([], 4)

    expect(samples).toHaveLength(4)
    expect(Array.from(samples)).toEqual([0, 0, 0, 0])
  })

  it('resamples to the requested count', () => {
    const samples = resampleWaveformSamples([1, 1, -1, -1], 2)

    expect(Array.from(samples)).toEqual([1, -1])
  })

  it('smooths against the previous frame', () => {
    const samples = smoothWaveformSamples([0, 1], [1, 0], 0.5)

    expect(Array.from(samples)).toEqual([0.5, 0.5])
  })

  it('scales by intensity and clamps', () => {
    const samples = scaleWaveformSamples([0.25, -0.75], 2)

    expect(Array.from(samples)).toEqual([0.25, -0.75])
  })

  it('computes peak amplitude', () => {
    expect(getWaveformPeak([0.1, -0.8, 0.3])).toBe(0.8)
  })

  it('creates silent samples with normalized count', () => {
    expect(createSilentSamples(3)).toHaveLength(3)
  })

  it('creates deterministic intensity samples', () => {
    const samples = createIntensitySamples(0.5, 8)

    expect(samples).toHaveLength(8)
    expect(getWaveformPeak(samples)).toBeGreaterThan(0)
    expect(getWaveformPeak(samples)).toBeLessThanOrEqual(0.5)
  })
})

describe('createWaveform', () => {
  it('exposes aria and data attributes', () => {
    const api = createWaveform({ variant: 'line', paused: true })

    expect(api.ariaProps.role).toBe('img')
    expect(api.ariaProps['aria-label']).toBe('Audio waveform')
    expect(api.dataAttributes['data-variant']).toBe('line')
    expect(api.dataAttributes['data-paused']).toBe('true')
  })

  it('uses sample-array sources when samples are not provided', () => {
    const api = createWaveform({ source: [0, 1], barCount: 2 })

    expect(Array.from(api.samples)).toEqual([0, 1])
  })

  it('prefers samples over source arrays', () => {
    const api = createWaveform({ source: [1, 1], samples: [0, 0], barCount: 2 })

    expect(Array.from(api.samples)).toEqual([0, 0])
  })

  it('uses intensity samples when no source is provided', () => {
    const api = createWaveform({ intensity: 0.75, barCount: 8 })

    expect(api.samples).toHaveLength(8)
    expect(getWaveformPeak(api.samples)).toBeGreaterThan(0)
  })
})

describe('waveform styles', () => {
  it('returns root classes', () => {
    expect(waveformVariants()).toContain('relative')
    expect(waveformVariants()).toContain('overflow-hidden')
  })

  it('returns canvas classes', () => {
    expect(waveformCanvasVariants()).toContain('h-full')
    expect(waveformCanvasVariants()).toContain('w-full')
  })
})
