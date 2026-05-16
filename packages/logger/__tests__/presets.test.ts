import { describe, it, expect } from 'vitest'
import { PRESETS, resolvePreset } from '../src/presets.js'

describe('presets', () => {
  it('development is sync, pretty, level=debug, no batch, full sample', () => {
    const p = PRESETS.development
    expect(p.minLevel).toBe('debug')
    expect(p.batch).toBe(false)
    expect(p.pretty).toBe(true)
    expect(p.sampleRate).toBe(1)
    expect(p.beaconFlush).toBe(false)
  })

  it('production is batched, sampled, level>=warn, beacon flush', () => {
    const p = PRESETS.production
    expect(p.minLevel).toBe('warn')
    expect(p.batch).toBe(true)
    expect(p.batchSize).toBeGreaterThan(1)
    expect(p.sampleRate).toBeGreaterThan(0)
    expect(p.sampleRate).toBeLessThan(1)
    expect(p.beaconFlush).toBe(true)
    expect(p.pretty).toBe(false)
  })

  it('resolvePreset returns a defensive copy', () => {
    const a = resolvePreset('development')
    const b = resolvePreset('development')
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
    a.minLevel = 'error'
    expect(PRESETS.development.minLevel).toBe('debug')
  })

  it('resolvePreset selects the right env', () => {
    expect(resolvePreset('production').minLevel).toBe('warn')
    expect(resolvePreset('development').minLevel).toBe('debug')
  })
})
