import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { prefersReducedMotion, getAnimationDuration } from '../src/motion.js'

describe('prefersReducedMotion', () => {
  const originalWindow = globalThis.window

  afterEach(() => {
    if (originalWindow) {
      globalThis.window = originalWindow
    }
  })

  it('returns false when window is undefined (SSR)', () => {
    // @ts-expect-error - simulating SSR
    globalThis.window = undefined
    expect(prefersReducedMotion()).toBe(false)
  })

  it('returns true when prefers-reduced-motion: reduce matches', () => {
    globalThis.window = {
      ...globalThis.window,
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    } as unknown as Window & typeof globalThis
    expect(prefersReducedMotion()).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith(
      '(prefers-reduced-motion: reduce)',
    )
  })

  it('returns false when prefers-reduced-motion does not match', () => {
    globalThis.window = {
      ...globalThis.window,
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    } as unknown as Window & typeof globalThis
    expect(prefersReducedMotion()).toBe(false)
  })
})

describe('getAnimationDuration', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns "0ms" when reduced motion is preferred', () => {
    globalThis.window = {
      ...globalThis.window,
      matchMedia: vi.fn().mockReturnValue({ matches: true }),
    } as unknown as Window & typeof globalThis

    expect(getAnimationDuration('300ms')).toBe('0ms')
  })

  it('returns the normal duration when reduced motion is not preferred', () => {
    globalThis.window = {
      ...globalThis.window,
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    } as unknown as Window & typeof globalThis

    expect(getAnimationDuration('300ms')).toBe('300ms')
  })

  it('works with various duration formats', () => {
    globalThis.window = {
      ...globalThis.window,
      matchMedia: vi.fn().mockReturnValue({ matches: false }),
    } as unknown as Window & typeof globalThis

    expect(getAnimationDuration('1s')).toBe('1s')
    expect(getAnimationDuration('150ms')).toBe('150ms')
    expect(getAnimationDuration('0.5s')).toBe('0.5s')
  })
})
