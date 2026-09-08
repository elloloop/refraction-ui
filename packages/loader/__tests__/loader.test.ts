import { describe, it, expect } from 'vitest'
import {
  createLoader,
  LOADER_PART_COUNT,
  initialLoaderVisibility,
  reduceLoaderVisibility,
  isLoaderVisible,
  nextLoaderTransitionAt,
  pickLoaderMessage,
  type LoaderVisibilityState,
} from '../src/index.js'

describe('createLoader', () => {
  it('exposes a polite status region with a default label', () => {
    const { ariaProps, dataAttributes, partCount } = createLoader()
    expect(ariaProps.role).toBe('status')
    expect(ariaProps['aria-live']).toBe('polite')
    expect(ariaProps['aria-busy']).toBe(true)
    expect(ariaProps['aria-label']).toBe('Loading')
    expect(dataAttributes['data-variant']).toBe('ring')
    expect(dataAttributes['data-size']).toBe('md')
    expect(partCount).toBe(1)
  })

  it('hides decorative spinners from assistive tech', () => {
    const { ariaProps } = createLoader({ decorative: true })
    expect(ariaProps).toEqual({ 'aria-hidden': true })
  })

  it('reports the part count for every variant', () => {
    for (const [variant, count] of Object.entries(LOADER_PART_COUNT)) {
      expect(createLoader({ variant: variant as keyof typeof LOADER_PART_COUNT }).partCount).toBe(count)
    }
  })
})

describe('reduceLoaderVisibility', () => {
  const opts = { delayMs: 200, minDurationMs: 500 }
  const step = (s: LoaderVisibilityState, type: 'start' | 'stop' | 'tick', now: number) =>
    reduceLoaderVisibility(s, { type, now }, opts)

  it('waits out the delay before showing', () => {
    let s = initialLoaderVisibility(0)
    s = step(s, 'start', 0)
    expect(s.phase).toBe('waiting')
    expect(isLoaderVisible(s)).toBe(false)
    expect(nextLoaderTransitionAt(s, opts)).toBe(200)
    s = step(s, 'tick', 200)
    expect(s.phase).toBe('visible')
    expect(isLoaderVisible(s)).toBe(true)
  })

  it('never shows when work finishes inside the delay', () => {
    let s = step(initialLoaderVisibility(0), 'start', 0)
    s = step(s, 'stop', 120)
    expect(s.phase).toBe('idle')
    expect(nextLoaderTransitionAt(s, opts)).toBeNull()
  })

  it('holds for the minimum duration once shown', () => {
    let s = step(initialLoaderVisibility(0), 'start', 0)
    s = step(s, 'tick', 200)
    s = step(s, 'stop', 300)
    expect(s.phase).toBe('settling')
    expect(isLoaderVisible(s)).toBe(true)
    expect(nextLoaderTransitionAt(s, opts)).toBe(700)
    s = step(s, 'tick', 700)
    expect(s.phase).toBe('idle')
  })

  it('hides immediately when the minimum duration already elapsed', () => {
    let s = step(initialLoaderVisibility(0), 'start', 0)
    s = step(s, 'tick', 200)
    s = step(s, 'stop', 900)
    expect(s.phase).toBe('idle')
  })

  it('returns to visible if work restarts while settling', () => {
    let s = step(initialLoaderVisibility(0), 'start', 0)
    s = step(s, 'tick', 200)
    s = step(s, 'stop', 300)
    s = step(s, 'start', 350)
    expect(s.phase).toBe('visible')
    expect(s.since).toBe(200)
  })

  it('shows at once with a zero delay', () => {
    const s = reduceLoaderVisibility(initialLoaderVisibility(0), { type: 'start', now: 5 }, { delayMs: 0 })
    expect(s.phase).toBe('visible')
  })
})

describe('pickLoaderMessage', () => {
  it('wraps around the list', () => {
    const msgs = ['a', 'b', 'c']
    expect(pickLoaderMessage(msgs, 0)).toBe('a')
    expect(pickLoaderMessage(msgs, 4)).toBe('b')
    expect(pickLoaderMessage(msgs, -1)).toBe('c')
    expect(pickLoaderMessage([], 3)).toBeUndefined()
  })
})
