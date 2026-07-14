import { describe, it, expect, vi } from 'vitest'
import type { ComposerAPI, ComposerCandidate } from '../src/index.js'
import { serializeTokens } from '../src/index.js'
import {
  makeComposer,
  mentionTrigger,
  emojiTrigger,
  typeText,
  backspace,
  forwardDelete,
  mulberry32,
  PEOPLE,
} from './helpers.js'

/** Type `@Jor` (or a custom query) at the caret and commit the first match. */
function commitMention(c: ComposerAPI, query = '@Jor', index = 0): void {
  typeText(c, query)
  c.applySuggestion(index)
}

function expectInvariant(c: ComposerAPI): void {
  const s = c.getState()
  for (const t of s.tokens) {
    expect(s.value.substring(t.start, t.end)).toBe(t.display)
  }
}

describe('E. Tokens', () => {
  it('E1: commit replaces [symbolStart, caret) atomically; plainText projection correct', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi ')
    commitMention(c)
    const s = c.getState()
    expect(s.value).toBe('hi @Jordan Lee')
    expect(s.tokens).toEqual([
      expect.objectContaining({ id: 'u_jordan', display: '@Jordan Lee', start: 3, end: 14 }),
    ])
    expect(s.selection).toEqual({ start: 14, end: 14 })
    const out = c.serialize()
    expect(out.plainText).toBe('hi @Jordan Lee')
    expect(out.tokens).toEqual([
      { type: 'mention', id: 'u_jordan', display: '@Jordan Lee', start: 3, end: 14 },
    ])
  })

  it('E2: offsets at 0, mid, EOF, adjacent tokens; edits before a token shift its range', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    commitMention(c) // token at 0
    expect(c.getState().tokens[0]).toMatchObject({ start: 0, end: 11 })
    typeText(c, ' ')
    commitMention(c, '@Al') // token at EOF
    let s = c.getState()
    expect(s.value).toBe('@Jordan Lee @Alice')
    expect(s.tokens[1]).toMatchObject({ id: 'u_alice', start: 12, end: 18 })
    expectInvariant(c)

    // Deleting the separator makes the tokens adjacent — both survive whole.
    c.setSelection({ start: 12, end: 12 })
    backspace(c)
    s = c.getState()
    expect(s.value).toBe('@Jordan Lee@Alice')
    expect(s.tokens.map((t) => [t.start, t.end])).toEqual([
      [0, 11],
      [11, 17],
    ])
    expectInvariant(c)

    // An edit before every token shifts all ranges.
    c.setSelection({ start: 0, end: 0 })
    c.insertTextAtCursor('>> ')
    s = c.getState()
    expect(s.value).toBe('>> @Jordan Lee@Alice')
    expect(s.tokens.map((t) => [t.start, t.end])).toEqual([
      [3, 14],
      [14, 20],
    ])
    expectInvariant(c)
  })

  it('E3: backspace immediately after a token deletes the whole token in one step', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi ')
    commitMention(c)
    backspace(c)
    const s = c.getState()
    expect(s.value).toBe('hi ')
    expect(s.tokens).toEqual([])
    expect(s.selection).toEqual({ start: 3, end: 3 })
  })

  it('E4: forward-delete immediately before a token deletes the whole token', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi ')
    commitMention(c)
    typeText(c, ' there')
    c.setSelection({ start: 3, end: 3 })
    forwardDelete(c)
    const s = c.getState()
    expect(s.value).toBe('hi  there')
    expect(s.tokens).toEqual([])
  })

  it('E5: a selection overlapping half a token + delete removes the whole token', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi ')
    commitMention(c)
    typeText(c, ' end')
    // Delete from inside the token ('Jordan|') through ' e' — adapter reports
    // the raw half-deleted text; the core removes the token whole.
    const s0 = c.getState()
    const next = s0.value.slice(0, 8) + s0.value.slice(16)
    c.setValue(next, { start: 8, end: 8 })
    const s = c.getState()
    expect(s.value).toBe('hi nd')
    expect(s.tokens).toEqual([])
  })

  it('E6: typing at a token boundary creates adjacent plain text, never merges into the token', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    commitMention(c)
    // At the end boundary.
    typeText(c, '!')
    let s = c.getState()
    expect(s.value).toBe('@Jordan Lee!')
    expect(s.tokens[0]).toMatchObject({ start: 0, end: 11 })
    // At the start boundary.
    c.setSelection({ start: 0, end: 0 })
    c.insertTextAtCursor('x')
    s = c.getState()
    expect(s.value).toBe('x@Jordan Lee!')
    expect(s.tokens[0]).toMatchObject({ start: 1, end: 12, display: '@Jordan Lee' })
    expectInvariant(c)
  })

  it('E7: an edit strictly inside a token is rejected; caret snaps to the nearest boundary', () => {
    const onEvent = vi.fn()
    const c = makeComposer({ triggers: [mentionTrigger()], onEvent })
    typeText(c, 'hi ')
    commitMention(c)
    const before = c.getState().value
    // Adapter reports a char typed at offset 5 (inside '@Jordan Lee').
    c.setValue(before.slice(0, 5) + 'X' + before.slice(5), { start: 6, end: 6 })
    const s = c.getState()
    expect(s.value).toBe(before)
    expect(s.tokens).toHaveLength(1)
    expect(onEvent).toHaveBeenCalledWith({ type: 'edit-rejected', reason: 'inside-token' })
    expect(s.selection).toEqual({ start: 3, end: 3 }) // nearest boundary of [3,14)
  })

  it('E8: a selection landing strictly inside a token snaps outward to the full bounds', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi ')
    commitMention(c)
    typeText(c, ' bye')
    c.setSelection({ start: 5, end: 16 })
    expect(c.getState().selection).toEqual({ start: 3, end: 16 })
    c.setSelection({ start: 1, end: 6 })
    expect(c.getState().selection).toEqual({ start: 1, end: 14 })
    c.setSelection({ start: 5, end: 9 })
    expect(c.getState().selection).toEqual({ start: 3, end: 14 })
  })

  it('E9: arrow keys skip over a token as one unit (caret stops at both edges, never inside)', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi ')
    commitMention(c)
    typeText(c, ' bye')
    // ArrowRight from just before the token: adapter proposes start+1.
    c.setSelection({ start: 3, end: 3 })
    c.setSelection({ start: 4, end: 4 })
    expect(c.getState().selection).toEqual({ start: 14, end: 14 })
    // ArrowLeft from just after the token: adapter proposes end-1.
    c.setSelection({ start: 13, end: 13 })
    expect(c.getState().selection).toEqual({ start: 3, end: 3 })
  })

  it('E10: copying a range containing tokens yields the display text', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'ping ')
    commitMention(c)
    c.setSelection({ start: 0, end: c.getState().value.length })
    expect(c.copySelection()).toBe('ping @Jordan Lee')
  })

  it('E11: pasting text that looks like a token does NOT create a token', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi ')
    c.pasteText('@Jordan Lee')
    const s = c.getState()
    expect(s.value).toBe('hi @Jordan Lee')
    expect(s.tokens).toEqual([])
  })

  it('E12: cut then paste in the same instance restores the live token (id preserved)', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi ')
    commitMention(c)
    c.setSelection({ start: 3, end: 14 })
    const cut = c.cutSelection()
    expect(cut).toBe('@Jordan Lee')
    expect(c.getState().tokens).toEqual([])
    expect(c.getState().value).toBe('hi ')
    typeText(c, 'so ')
    c.pasteText(cut)
    const s = c.getState()
    expect(s.value).toBe('hi so @Jordan Lee')
    expect(s.tokens).toEqual([
      expect.objectContaining({ id: 'u_jordan', display: '@Jordan Lee', start: 6, end: 17 }),
    ])
    expectInvariant(c)
  })

  it("E13: direct-typed ':fire:' commits an emoji token without the menu; unknown ':nope:' stays literal", () => {
    const c = makeComposer({ triggers: [emojiTrigger()] })
    typeText(c, 'lit :fire:')
    const s = c.getState()
    expect(s.value).toBe('lit \u{1F525}')
    expect(s.tokens).toEqual([
      expect.objectContaining({ triggerId: 'emoji', id: ':fire:', display: '\u{1F525}' }),
    ])
    expectInvariant(c)

    const c2 = makeComposer({ triggers: [emojiTrigger()] })
    typeText(c2, ':nope:')
    expect(c2.getState().value).toBe(':nope:')
    expect(c2.getState().tokens).toEqual([])
  })

  it('E13: no emoji auto-commit when no ":" trigger is configured', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, ':fire:')
    expect(c.getState().value).toBe(':fire:')
    expect(c.getState().tokens).toEqual([])
  })

  it('E14: token display is frozen at insert — later resolver changes never mutate it', () => {
    let roster: ComposerCandidate[] = [{ id: 'u_j', display: 'Jordan' }]
    const c = makeComposer({
      triggers: [mentionTrigger({ resolve: () => roster })],
    })
    commitMention(c, '@Jor')
    expect(c.getState().tokens[0].display).toBe('@Jordan')
    roster = [{ id: 'u_j', display: 'Jordan RENAMED' }]
    typeText(c, ' hi')
    expect(c.getState().tokens[0].display).toBe('@Jordan')
    expect(c.getState().value).toBe('@Jordan hi')
  })

  it('E15: serialize keeps plainText and derived ranges in sync (property test, seeded)', () => {
    const random = mulberry32(0xc0ffee)
    const words = ['hello', 'world ', ' ok', 'zz', '\nline', '👍🏽', 'é']
    for (let round = 0; round < 12; round++) {
      const c = makeComposer({ triggers: [mentionTrigger()] })
      for (let op = 0; op < 20; op++) {
        const s = c.getState()
        const roll = random()
        if (roll < 0.4) {
          // Insert a random word at a random (token-snapped) position.
          const at = Math.floor(random() * (s.value.length + 1))
          c.setSelection({ start: at, end: at })
          c.insertTextAtCursor(words[Math.floor(random() * words.length)])
        } else if (roll < 0.65) {
          // Commit a mention at the end.
          c.setSelection({ start: s.value.length, end: s.value.length })
          typeText(c, ' @')
          c.applySuggestion(Math.floor(random() * PEOPLE.length))
        } else if (roll < 0.85 && s.value.length > 2) {
          // Cut a random range (expands over tokens).
          const a = Math.floor(random() * s.value.length)
          const b = Math.min(s.value.length, a + 1 + Math.floor(random() * 8))
          c.setSelection({ start: a, end: b })
          c.cutSelection()
        } else {
          // Backspace at a random caret.
          const at = Math.floor(random() * (s.value.length + 1))
          c.setSelection({ start: at, end: at })
          backspace(c)
        }
        const out = c.serialize()
        expect(out.plainText).toBe(c.getState().value)
        for (const t of out.tokens) {
          expect(out.plainText.substring(t.start, t.end)).toBe(t.display)
        }
        // Ranges are ordered and non-overlapping.
        for (let i = 1; i < out.tokens.length; i++) {
          expect(out.tokens[i].start).toBeGreaterThanOrEqual(out.tokens[i - 1].end)
        }
      }
    }
  })

  it('E15: serializeTokens is pure and derives type from triggerId', () => {
    const out = serializeTokens('a @B c', [
      { triggerId: 'mention', symbol: '@', id: 'u1', label: 'B', display: '@B', start: 2, end: 4 },
    ])
    expect(out).toEqual({
      plainText: 'a @B c',
      tokens: [{ type: 'mention', id: 'u1', display: '@B', start: 2, end: 4 }],
    })
  })

  it('E16: a token commit that would exceed maxLength is rejected as a unit', () => {
    const onEvent = vi.fn()
    const c = makeComposer({ triggers: [mentionTrigger()], maxLength: 12, onEvent })
    typeText(c, 'hi ')
    typeText(c, '@Jor') // committing '@Jordan Lee' would take graphemes to 14 > 12
    c.applySuggestion(0)
    const s = c.getState()
    expect(s.value).toBe('hi @Jor')
    expect(s.tokens).toEqual([])
    expect(onEvent).toHaveBeenCalledWith({ type: 'insert-rejected', reason: 'max-length' })
    expect(s.suggestion.isOpen).toBe(true) // menu stays for a shorter pick
  })
})
