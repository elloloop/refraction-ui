import { describe, it, expect } from 'vitest'
import {
  laneOffsetPercent,
  REACTION_LIFETIME_MS,
  createFloatingReactions,
  FLOATING_REACTION_ITEM_ATTRIBUTE,
  FLOATING_REACTION_KEYFRAMES,
  floatingReactionItemClass,
  floatingReactionsStyles,
} from '../src/index.js'

/** The body of one `@keyframes` rule in the shipped sheet. */
function keyframesBody(name: string): string {
  const match = floatingReactionsStyles.match(
    new RegExp(`@keyframes ${name}\\{((?:[^{}]*\\{[^{}]*\\})*)\\}`),
  )
  if (!match) throw new Error(`no @keyframes ${name} in floatingReactionsStyles`)
  return match[1]
}

/** The declarations of the `@media (prefers-reduced-motion:reduce)` block. */
function reducedMotionBlock(): string {
  const match = floatingReactionsStyles.match(
    /@media \(prefers-reduced-motion:reduce\)\{((?:[^{}]*\{[^{}]*\})*)\}/,
  )
  if (!match) throw new Error('no reduced-motion block in floatingReactionsStyles')
  return match[1]
}

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

describe('item data attributes', () => {
  it('marks each item with FLOATING_REACTION_ITEM_ATTRIBUTE', () => {
    const { itemDataAttributes } = createFloatingReactions()
    expect(itemDataAttributes).toEqual({ [FLOATING_REACTION_ITEM_ATTRIBUTE]: '' })
    expect(FLOATING_REACTION_ITEM_ATTRIBUTE).toBe('data-floating-reaction')
  })
})

describe('floatingReactionsStyles', () => {
  const item = `[${FLOATING_REACTION_ITEM_ATTRIBUTE}]`

  it('namespaces its keyframes so they cannot clash with an app\'s own', () => {
    expect(FLOATING_REACTION_KEYFRAMES.rise).toMatch(/^rfr-/)
    expect(FLOATING_REACTION_KEYFRAMES.fade).toMatch(/^rfr-/)
    expect(floatingReactionsStyles).not.toMatch(/@keyframes float-up\b/)
  })

  it('animates every marked item for exactly REACTION_LIFETIME_MS, holding the last frame', () => {
    expect(floatingReactionsStyles).toContain(
      `${item}{animation:${FLOATING_REACTION_KEYFRAMES.rise} ${REACTION_LIFETIME_MS}ms ease-out forwards}`,
    )
  })

  it('rises from its start and ends invisible', () => {
    const rise = keyframesBody(FLOATING_REACTION_KEYFRAMES.rise)
    expect(rise).toContain('0%{transform:translateY(0);opacity:1}')
    expect(rise).toContain('100%{transform:translateY(-80%);opacity:0}')
  })

  it('swaps to a fade in place when the system asks for reduced motion', () => {
    expect(reducedMotionBlock()).toBe(`${item}{animation-name:${FLOATING_REACTION_KEYFRAMES.fade}}`)
  })

  it('never moves the reaction in the reduced-motion fade', () => {
    const fade = keyframesBody(FLOATING_REACTION_KEYFRAMES.fade)
    expect(fade).not.toContain('transform')
    expect(fade).toContain('100%{opacity:0}')
  })

  it('leaves the motion out of the item class, so an unmarked item holds still', () => {
    expect(floatingReactionItemClass).not.toMatch(/\banimate-/)
  })
})
