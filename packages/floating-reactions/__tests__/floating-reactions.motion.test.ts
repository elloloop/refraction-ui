import { describe, it, expect } from 'vitest'
import {
  REACTION_LIFETIME_MS,
  floatingReactionItemClass,
  floatingReactionKeyframes,
  floatingReactionRiseKeyframes,
  floatingReactionFadeKeyframes,
} from '../src/index.js'

/** The body of `@keyframes <name> { ... }` in the shipped CSS, braces balanced. */
function keyframesBody(css: string, name: string): string {
  const start = css.indexOf(`@keyframes ${name} {`)
  if (start === -1) throw new Error(`no @keyframes ${name} in:\n${css}`)
  let depth = 0
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}' && --depth === 0) return css.slice(css.indexOf('{', start) + 1, i)
  }
  throw new Error(`unbalanced @keyframes ${name}`)
}

/** The declarations of the keyframe whose selector list is exactly `selector`. */
function frame(body: string, selector: string): string {
  const match = body.match(new RegExp(`(?:^|\\})\\s*${selector.replace(/[%,]/g, '\\$&')}\\s*\\{([^}]*)\\}`))
  if (!match) throw new Error(`no ${selector} frame in: ${body}`)
  return match[1]
}

const MOVEMENT = /\b(transform|translate|scale|rotate|top|bottom|left|right|margin|inset)\s*:/
const classes = floatingReactionItemClass.split(/\s+/)
const seconds = `${REACTION_LIFETIME_MS / 1000}s`

describe('floating reaction keyframes', () => {
  it('ships both keyframes under library-prefixed names', () => {
    expect(floatingReactionRiseKeyframes).toMatch(/^rfr-/)
    expect(floatingReactionFadeKeyframes).toMatch(/^rfr-/)
    expect(floatingReactionKeyframes).toContain(`@keyframes ${floatingReactionRiseKeyframes} {`)
    expect(floatingReactionKeyframes).toContain(`@keyframes ${floatingReactionFadeKeyframes} {`)
  })

  it('rises from its resting place (bottom-4) by 80% of the overlay height and ends invisible', () => {
    const body = keyframesBody(floatingReactionKeyframes, floatingReactionRiseKeyframes)
    expect(classes).toContain('bottom-4')
    expect(frame(body, '0%')).toMatch(/bottom:\s*1rem;/)
    expect(frame(body, '0%')).toMatch(/opacity:\s*1/)
    // A percentage `bottom` is measured against the overlay, not the emoji.
    expect(frame(body, '100%')).toMatch(/bottom:\s*calc\(80% \+ 1rem\);/)
    expect(frame(body, '100%')).toMatch(/opacity:\s*0\b/)
  })

  it('fades in place for reduced motion: no movement in any frame', () => {
    const body = keyframesBody(floatingReactionKeyframes, floatingReactionFadeKeyframes)
    expect(body).not.toMatch(MOVEMENT)
    expect(frame(body, '0%, 80%')).toMatch(/opacity:\s*1/)
    expect(frame(body, '100%')).toMatch(/opacity:\s*0\b/)
  })

  it('keeps the fade on the same schedule as the rise: full opacity for the first 80%', () => {
    const rise = keyframesBody(floatingReactionKeyframes, floatingReactionRiseKeyframes)
    expect(frame(rise, '80%')).toMatch(/opacity:\s*1/)
    const fade = keyframesBody(floatingReactionKeyframes, floatingReactionFadeKeyframes)
    expect(frame(fade, '0%, 80%')).toMatch(/opacity:\s*1/)
  })
})

describe('floatingReactionItemClass motion', () => {
  it('rises for REACTION_LIFETIME_MS and holds its final frame', () => {
    expect(classes).toContain(`animate-[${floatingReactionRiseKeyframes}_${seconds}_ease-out_forwards]`)
  })

  it('switches to the in-place fade, same duration, when the reader prefers reduced motion', () => {
    expect(classes).toContain(
      `motion-reduce:animate-[${floatingReactionFadeKeyframes}_${seconds}_ease-out_forwards]`,
    )
  })

  it('only animates with keyframes the library ships', () => {
    const shipped = [floatingReactionRiseKeyframes, floatingReactionFadeKeyframes]
    const used = classes
      .map((c) => c.match(/animate-\[([^_\]]+)_/)?.[1])
      .filter((name): name is string => name !== undefined)
    expect(used.length).toBeGreaterThan(0)
    for (const name of used) expect(shipped).toContain(name)
  })
})
