import { describe, it, expect } from 'vitest'
import {
  laneOffsetPercent,
  REACTION_LIFETIME_MS,
  createFloatingReactions,
} from '../src/index.js'

describe('laneOffsetPercent', () => {
  it('spreads lanes evenly across [0, 100]', () => {
    // 5 lanes → buckets of 20%; centres at 10, 30, 50, 70, 90
    expect(laneOffsetPercent(0, 5)).toBe(10)
    expect(laneOffsetPercent(1, 5)).toBe(30)
    expect(laneOffsetPercent(2, 5)).toBe(50)
    expect(laneOffsetPercent(3, 5)).toBe(70)
    expect(laneOffsetPercent(4, 5)).toBe(90)
  })

  it('clamps lane below 0 to 0', () => {
    expect(laneOffsetPercent(-1, 5)).toBe(laneOffsetPercent(0, 5))
  })

  it('clamps lane above lanes-1 to the last lane', () => {
    expect(laneOffsetPercent(99, 5)).toBe(laneOffsetPercent(4, 5))
  })

  it('defaults to 5 lanes when lanes is omitted', () => {
    expect(laneOffsetPercent(2)).toBe(50)
  })

  it('returns 50 when lanes is 0 (fallback)', () => {
    expect(laneOffsetPercent(0, 0)).toBe(50)
  })

  it('works with a single lane', () => {
    expect(laneOffsetPercent(0, 1)).toBe(50)
  })
})

describe('REACTION_LIFETIME_MS', () => {
  it('is exported and is a positive number', () => {
    expect(typeof REACTION_LIFETIME_MS).toBe('number')
    expect(REACTION_LIFETIME_MS).toBeGreaterThan(0)
  })

  it('equals 3000 ms', () => {
    expect(REACTION_LIFETIME_MS).toBe(3000)
  })
})

describe('createFloatingReactions', () => {
  it('sets role="status" on ariaProps', () => {
    const { ariaProps } = createFloatingReactions()
    expect(ariaProps.role).toBe('status')
  })

  it('sets aria-live="polite"', () => {
    const { ariaProps } = createFloatingReactions()
    expect(ariaProps['aria-live']).toBe('polite')
  })

  it('sets aria-label="Reactions"', () => {
    const { ariaProps } = createFloatingReactions()
    expect(ariaProps['aria-label']).toBe('Reactions')
  })

  it('returns a dataAttributes object', () => {
    const { dataAttributes } = createFloatingReactions()
    expect(typeof dataAttributes).toBe('object')
    expect(dataAttributes['data-component']).toBe('floating-reactions')
  })
})
