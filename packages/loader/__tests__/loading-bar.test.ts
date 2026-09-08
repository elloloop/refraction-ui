import { describe, it, expect } from 'vitest'
import {
  createLoadingBar,
  clampProgress,
  trickleProgress,
  TRICKLE_CEILING,
  createLoadingOverlay,
} from '../src/index.js'

describe('trickleProgress', () => {
  it('advances in shrinking steps and never passes the ceiling', () => {
    let v = 0
    const seen: number[] = []
    for (let i = 0; i < 200; i++) {
      v = trickleProgress(v)
      seen.push(v)
    }
    expect(seen[0]).toBe(8)
    expect(seen[1] - seen[0]).toBeGreaterThan(seen[seen.length - 1] - seen[seen.length - 2])
    expect(Math.max(...seen)).toBe(TRICKLE_CEILING)
    expect(trickleProgress(TRICKLE_CEILING)).toBe(TRICKLE_CEILING)
  })

  it('clamps out-of-range values', () => {
    expect(clampProgress(-5)).toBe(0)
    expect(clampProgress(140)).toBe(100)
    expect(clampProgress(Number.NaN)).toBe(0)
  })
})

describe('createLoadingBar', () => {
  it('is indeterminate without a value', () => {
    const { ariaProps, dataAttributes, style } = createLoadingBar()
    expect(ariaProps.role).toBe('progressbar')
    expect(ariaProps['aria-valuenow']).toBeUndefined()
    expect(ariaProps['aria-busy']).toBe(true)
    expect(dataAttributes['data-state']).toBe('indeterminate')
    expect(style['--rfr-loader-value']).toBe('0%')
  })

  it('reports the value triple when determinate', () => {
    const { ariaProps, dataAttributes, style } = createLoadingBar({ value: 42.4, placement: 'fixed' })
    expect(ariaProps['aria-valuemin']).toBe(0)
    expect(ariaProps['aria-valuemax']).toBe(100)
    expect(ariaProps['aria-valuenow']).toBe(42)
    expect(dataAttributes['data-state']).toBe('loading')
    expect(dataAttributes['data-placement']).toBe('fixed')
    expect(style['--rfr-loader-value']).toBe('42.4%')
  })

  it('drops busy state at 100%', () => {
    const { ariaProps, dataAttributes } = createLoadingBar({ value: 100 })
    expect(ariaProps['aria-busy']).toBe(false)
    expect(dataAttributes['data-state']).toBe('complete')
  })
})

describe('createLoadingOverlay', () => {
  it('exposes a labelled status region and scope', () => {
    const { ariaProps, dataAttributes } = createLoadingOverlay({ scope: 'contain', blur: false, label: 'Saving' })
    expect(ariaProps.role).toBe('status')
    expect(ariaProps['aria-label']).toBe('Saving')
    expect(dataAttributes['data-scope']).toBe('contain')
    expect(dataAttributes['data-blur']).toBe('false')
    expect(dataAttributes['data-state']).toBe('open')
  })
})
