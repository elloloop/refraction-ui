import { describe, it, expect } from 'vitest'
import {
  createMotion,
  resolveDirection,
  resolvePageDirection,
  staggerDelay,
  motionStyles,
  MOTION_PATTERNS,
  MOTION_DURATIONS,
  MOTION_SPEEDS,
  MOTION_SPEED_NAMES,
  MIN_MOTION_SPEED,
  MAX_MOTION_SPEED,
  STAGGER_CAP,
  resolveMotionSpeed,
} from '../src/index.js'

describe('createMotion', () => {
  it('emits the reveal hook and pattern', () => {
    const { dataAttributes, style } = createMotion({ pattern: 'page-in' })
    expect(dataAttributes['data-rfr-motion']).toBe('reveal')
    expect(dataAttributes['data-pattern']).toBe('page-in')
    expect(dataAttributes['data-disabled']).toBeUndefined()
    expect(style).toEqual({})
  })

  it('exposes delay as a custom property and disabled as data', () => {
    const { dataAttributes, style } = createMotion({ pattern: 'celebrate', delayMs: 90.4, disabled: true })
    expect(style['--rfr-motion-delay']).toBe('90ms')
    expect(dataAttributes['data-disabled']).toBe('true')
  })
})

describe('resolvePageDirection', () => {
  it('rises forward and settles back on the vertical axis', () => {
    expect(resolvePageDirection(0, 1)).toBe('page-in')
    expect(resolvePageDirection(2, 1)).toBe('page-back')
    expect(resolvePageDirection(1, 1)).toBe('page-in')
  })

  it('slides sideways on the horizontal axis', () => {
    expect(resolvePageDirection(0, 1, 'horizontal')).toBe('side-next')
    expect(resolvePageDirection(3, 0, 'horizontal')).toBe('side-prev')
  })

  it('resolveDirection treats same index as forward', () => {
    expect(resolveDirection(4, 4)).toBe('forward')
    expect(resolveDirection(4, 3)).toBe('back')
  })
})

describe('staggerDelay', () => {
  it('steps 45ms per child by default', () => {
    expect(staggerDelay(0)).toBe(0)
    expect(staggerDelay(1)).toBe(MOTION_DURATIONS.staggerStep)
    expect(staggerDelay(3)).toBe(135)
  })

  it('caps at eight children', () => {
    const capDelay = (STAGGER_CAP - 1) * MOTION_DURATIONS.staggerStep
    expect(staggerDelay(7)).toBe(capDelay)
    expect(staggerDelay(8)).toBe(capDelay)
    expect(staggerDelay(50)).toBe(capDelay)
  })

  it('accepts a custom step and cap and clamps negatives', () => {
    expect(staggerDelay(2, 100, 3)).toBe(200)
    expect(staggerDelay(9, 100, 3)).toBe(200)
    expect(staggerDelay(-2)).toBe(0)
  })
})

describe('motionStyles', () => {
  it('has a rule and keyframes for every pattern and a reduced-motion block', () => {
    for (const pattern of MOTION_PATTERNS) {
      expect(motionStyles).toContain(`[data-pattern="${pattern}"]`)
    }
    expect(motionStyles).toContain('@keyframes rfr-motion-page-in')
    expect(motionStyles).toContain('prefers-reduced-motion:reduce')
    expect(motionStyles).toContain('animation:none!important')
  })
})

describe('resolveMotionSpeed', () => {
  it('defaults to the designed tempo', () => {
    expect(resolveMotionSpeed()).toBe(1)
    expect(resolveMotionSpeed('default')).toBe(1)
  })

  it('resolves every named step', () => {
    for (const name of MOTION_SPEED_NAMES) {
      expect(resolveMotionSpeed(name)).toBe(MOTION_SPEEDS[name])
    }
    expect(resolveMotionSpeed('fast')).toBeGreaterThan(resolveMotionSpeed('slow'))
  })

  it('accepts a raw multiplier and clamps it to a usable range', () => {
    expect(resolveMotionSpeed(1.25)).toBe(1.25)
    expect(resolveMotionSpeed(0.001)).toBe(MIN_MOTION_SPEED)
    expect(resolveMotionSpeed(50)).toBe(MAX_MOTION_SPEED)
  })

  it('falls back rather than freezing on a bad value', () => {
    expect(resolveMotionSpeed(0)).toBe(1)
    expect(resolveMotionSpeed(-2)).toBe(1)
    expect(resolveMotionSpeed(Number.NaN)).toBe(1)
    expect(resolveMotionSpeed('turbo' as never)).toBe(1)
  })
})

describe('createMotion speed', () => {
  it('adds no inline style at the default tempo', () => {
    expect(createMotion({ pattern: 'page-in' }).style['--rfr-motion-speed']).toBeUndefined()
    expect(createMotion({ pattern: 'page-in', speed: 'default' }).style).toEqual({})
  })

  it('emits the multiplier when it differs', () => {
    const api = createMotion({ pattern: 'celebrate', speed: 'fast' })
    expect(api.style['--rfr-motion-speed']).toBe('2')
    expect(api.speed).toBe(2)
    expect(createMotion({ pattern: 'page-in', speed: 0.5 }).style['--rfr-motion-speed']).toBe('0.5')
  })

  it('keeps the delay and the speed independent', () => {
    const api = createMotion({ pattern: 'page-in', delayMs: 90, speed: 'brisk' })
    expect(api.style['--rfr-motion-delay']).toBe('90ms')
    expect(api.style['--rfr-motion-speed']).toBe('1.5')
  })
})

describe('motionStyles speed wiring', () => {
  it('divides every duration and the delay by the speed property', () => {
    expect(motionStyles).toContain('--rfr-motion-speed:1')
    // No duration may reference a raw token without the divisor.
    for (const token of ['page', 'base', 'slow', 'sheet', 'celebrate', 'nudge', 'icon', 'num']) {
      expect(motionStyles).toContain(`calc(var(--rfr-motion-${token}) / var(--rfr-motion-speed,1))`)
    }
    expect(motionStyles).toContain('calc(var(--rfr-motion-delay,0ms) / var(--rfr-motion-speed,1))')
  })
})
