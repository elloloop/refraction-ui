import { describe, it, expect } from 'vitest'
import { createEmojiTrigger } from '../src/emoji-trigger.js'
import type { ComposerCandidate } from '../src/types.js'

const resolveSync = (trigger: ReturnType<typeof createEmojiTrigger>, q: string) =>
  trigger.resolve(q) as ComposerCandidate[]

describe('createEmojiTrigger', () => {
  it('defaults to the ":" symbol and "emoji" id', () => {
    const trigger = createEmojiTrigger()
    expect(trigger.symbol).toBe(':')
    expect(trigger.id).toBe('emoji')
  })

  it('resolves against the full shared set (":fir" surfaces 🔥)', () => {
    const trigger = createEmojiTrigger()
    const results = resolveSync(trigger, 'fir')
    expect(results.length).toBeGreaterThan(0)
    expect(results.some((c) => c.metadata?.emoji === '\u{1F525}')).toBe(true)
  })

  it('commits the glyph itself via toDisplay, not the :shortcode:', () => {
    const trigger = createEmojiTrigger()
    const [first] = resolveSync(trigger, 'fire')
    expect(trigger.toDisplay?.(first)).toBe(first.metadata?.emoji)
  })

  it('honours minQueryLength (no flood on a lone colon)', () => {
    const trigger = createEmojiTrigger({ minQueryLength: 2 })
    expect(resolveSync(trigger, 'f')).toHaveLength(0)
    expect(resolveSync(trigger, 'fi').length).toBeGreaterThan(0)
  })

  it('caps results at maxResults', () => {
    const trigger = createEmojiTrigger({ maxResults: 3 })
    expect(resolveSync(trigger, 'a').length).toBeLessThanOrEqual(3)
  })

  it('accepts a custom symbol', () => {
    expect(createEmojiTrigger({ symbol: ';' }).symbol).toBe(';')
  })
})
