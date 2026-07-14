import { describe, it, expect, vi } from 'vitest'
import {
  detectActiveTrigger,
  resolveTriggerConfig,
  scanWindowFor,
} from '../src/index.js'
import type { ComposerTrigger } from '../src/index.js'
import { makeComposer, mentionTrigger, typeText, backspace, PEOPLE } from './helpers.js'

function resolved(overrides: Partial<ComposerTrigger> = {}) {
  return resolveTriggerConfig(mentionTrigger(overrides))
}

describe('C. Trigger detection', () => {
  it('C1: "@" at message start arms with an empty query', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '@')
    const trigger = c.getState().activeTrigger
    expect(trigger).not.toBeNull()
    expect(trigger?.triggerId).toBe('mention')
    expect(trigger?.query).toBe('')
    expect(trigger?.symbolStart).toBe(0)
  })

  it('C2: "@" after a space arms; alice@example.com does NOT', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hey @jo')
    expect(c.getState().activeTrigger?.query).toBe('jo')

    const c2 = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c2, 'alice@example.com')
    expect(c2.getState().activeTrigger).toBeNull()
  })

  it('C3: "/" with startOfMessage scope arms only at offset 0; "and/or" and mid-sentence "/help" never', () => {
    const slash: ComposerTrigger = {
      id: 'slash',
      symbol: '/',
      scope: 'startOfMessage',
      resolve: () => [{ id: 'help', display: 'help' }],
    }
    const c = makeComposer({ triggers: [slash] })
    typeText(c, '/he')
    expect(c.getState().activeTrigger?.query).toBe('he')

    const c2 = makeComposer({ triggers: [slash] })
    typeText(c2, 'and/or')
    expect(c2.getState().activeTrigger).toBeNull()

    const c3 = makeComposer({ triggers: [slash] })
    typeText(c3, 'see /help')
    expect(c3.getState().activeTrigger).toBeNull()
  })

  it('C3: startOfLine variant arms after a newline', () => {
    const slash: ComposerTrigger = {
      id: 'slash',
      symbol: '/',
      scope: 'startOfLine',
      resolve: () => [],
    }
    const c = makeComposer({ triggers: [slash] })
    typeText(c, 'hello\n/po')
    expect(c.getState().activeTrigger?.query).toBe('po')
    expect(c.getState().activeTrigger?.symbolStart).toBe(6)

    const c2 = makeComposer({ triggers: [slash] })
    typeText(c2, 'hello /po')
    expect(c2.getState().activeTrigger).toBeNull()
  })

  it('C4: "(" arms only when configured via extraBoundaryChars, not by default', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '(@jo')
    expect(c.getState().activeTrigger).toBeNull()

    const c2 = makeComposer({ triggers: [mentionTrigger({ extraBoundaryChars: ['('] })] })
    typeText(c2, '(@jo')
    expect(c2.getState().activeTrigger?.query).toBe('jo')
  })

  it('C5: query is text[symbol+1..caret]; typing filters live; caret moves re-evaluate', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi @jord')
    expect(c.getState().activeTrigger?.query).toBe('jord')
    expect(c.getState().suggestion.items.map((i) => i.id)).toEqual(['u_jordan'])
    // Caret back inside the query narrows it.
    c.setSelection({ start: 5, end: 5 })
    expect(c.getState().activeTrigger?.query).toBe('j')
    // Caret before the symbol closes.
    c.setSelection({ start: 2, end: 2 })
    expect(c.getState().activeTrigger).toBeNull()
  })

  it('C6: queryPattern violation closes the trigger', () => {
    const c = makeComposer({
      triggers: [mentionTrigger({ queryPattern: /^[a-z]*$/ })],
    })
    typeText(c, '@jo')
    expect(c.getState().activeTrigger).not.toBeNull()
    typeText(c, '9')
    expect(c.getState().activeTrigger).toBeNull()
  })

  it('C7: closeOnSpace=false ("#") stays armed across spaces; closes on a second "#" and on maxQueryLength', () => {
    const tag: ComposerTrigger = {
      id: 'tag',
      symbol: '#',
      closeOnSpace: false,
      maxQueryLength: 20,
      resolve: () => [],
    }
    const c = makeComposer({ triggers: [tag] })
    typeText(c, '#weekend trip')
    expect(c.getState().activeTrigger?.query).toBe('weekend trip')
    typeText(c, '#')
    expect(c.getState().activeTrigger).toBeNull()

    const c2 = makeComposer({ triggers: [{ ...tag, maxQueryLength: 5 }] })
    typeText(c2, '#abcdef')
    expect(c2.getState().activeTrigger).toBeNull()
  })

  it('C8: query exceeding maxQueryLength silently cancels', () => {
    const c = makeComposer({ triggers: [mentionTrigger({ maxQueryLength: 4 })] })
    typeText(c, '@abcd')
    expect(c.getState().activeTrigger?.query).toBe('abcd')
    typeText(c, 'e')
    expect(c.getState().activeTrigger).toBeNull()
  })

  it('C9: Escape dismisses the occurrence; further typing does not re-arm; delete + retype re-arms', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi @jo')
    expect(c.getState().suggestion.isOpen).toBe(true)
    c.dismissSuggestion()
    expect(c.getState().activeTrigger).toBeNull()
    expect(c.getState().suggestion.isOpen).toBe(false)
    typeText(c, 'r')
    expect(c.getState().activeTrigger).toBeNull()
    // Delete back through the symbol, retype → re-arms.
    backspace(c) // r
    backspace(c) // o
    backspace(c) // j
    backspace(c) // @
    typeText(c, '@j')
    expect(c.getState().activeTrigger?.query).toBe('j')
  })

  it('C10: backspace over the query re-filters each step; deleting the symbol closes', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '@jor')
    expect(c.getState().suggestion.items.map((i) => i.id)).toEqual(['u_jordan'])
    backspace(c) // query 'jo'
    expect(c.getState().activeTrigger?.query).toBe('jo')
    backspace(c) // query 'j'
    backspace(c) // query ''
    expect(c.getState().activeTrigger?.query).toBe('')
    expect(c.getState().suggestion.items).toHaveLength(PEOPLE.length)
    backspace(c) // deletes '@'
    expect(c.getState().activeTrigger).toBeNull()
  })

  it('C11: caret leaving [symbolStart, caret] closes; caret moves are never menu nav', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'aa @jo bb')
    expect(c.getState().activeTrigger).toBeNull() // space closed it
    c.setSelection({ start: 6, end: 6 }) // back inside '@jo'
    expect(c.getState().activeTrigger?.query).toBe('jo')
    c.setSelection({ start: 9, end: 9 }) // beyond — query would contain a space
    expect(c.getState().activeTrigger).toBeNull()
    c.setSelection({ start: 1, end: 1 }) // before the symbol
    expect(c.getState().activeTrigger).toBeNull()
  })

  it('C12: composing suspends detection; detection re-runs when composition ends', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    c.setComposing(true)
    c.setValue('@jo', { start: 3, end: 3 })
    expect(c.getState().activeTrigger).toBeNull()
    c.setComposing(false)
    expect(c.getState().activeTrigger?.query).toBe('jo')
  })

  it('C12: "你@" mid-IME never fires (and stays closed after composition — boundary fails)', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    c.setComposing(true)
    c.setValue('你@', { start: 2, end: 2 })
    expect(c.getState().activeTrigger).toBeNull()
    c.setComposing(false)
    expect(c.getState().activeTrigger).toBeNull()
  })

  it('C13: multi-char "!!" arms only when both chars are typed; boundary checked against the first char', () => {
    const quick: ComposerTrigger = { id: 'quick', symbol: '!!', resolve: () => [] }
    const c = makeComposer({ triggers: [quick] })
    typeText(c, '!')
    expect(c.getState().activeTrigger).toBeNull()
    typeText(c, '!')
    expect(c.getState().activeTrigger?.query).toBe('')
    typeText(c, 'omw')
    expect(c.getState().activeTrigger?.query).toBe('omw')

    const c2 = makeComposer({ triggers: [quick] })
    typeText(c2, 'a!!x')
    expect(c2.getState().activeTrigger).toBeNull()
  })

  it('C14: never arms inside a committed token range', () => {
    const c = makeComposer({
      triggers: [
        mentionTrigger({
          resolve: () => [{ id: 'u_j', display: 'Jordan' }],
        }),
      ],
    })
    typeText(c, 'hi @Jor')
    c.applySuggestion(0)
    expect(c.getState().value).toBe('hi @Jordan')
    expect(c.getState().tokens).toHaveLength(1)
    // Caret sits right after the token; the nearest '@' is inside its range.
    expect(c.getState().activeTrigger).toBeNull()
  })

  it('C15: only the nearest live trigger before the caret wins', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '@a @b')
    const trigger = c.getState().activeTrigger
    expect(trigger?.symbolStart).toBe(3)
    expect(trigger?.query).toBe('b')
  })

  it('C16: detection is backward-scan bounded — result independent of prefix length', () => {
    const triggers = [resolved()]
    const long = 'x'.repeat(200_000) + ' @jo'
    const match = detectActiveTrigger({ text: long, caret: long.length, triggers })
    expect(match?.query).toBe('jo')
    expect(match?.symbolStart).toBe(200_001)
  })

  it('C16: a symbol farther back than the scan window is never found', () => {
    const trigger = resolved({ maxQueryLength: 4 })
    const window = scanWindowFor(trigger)
    const text = '@' + 'a'.repeat(window + 10)
    const match = detectActiveTrigger({ text, caret: text.length, triggers: [trigger] })
    expect(match).toBeNull()
  })

  it('C17: blur closes after the grace period; refocus does not reopen', () => {
    vi.useFakeTimers()
    try {
      const c = makeComposer({ triggers: [mentionTrigger()] })
      typeText(c, '@jo')
      expect(c.getState().suggestion.isOpen).toBe(true)
      c.dismissSuggestionDeferred()
      expect(c.getState().suggestion.isOpen).toBe(true) // grace window
      vi.advanceTimersByTime(120)
      expect(c.getState().suggestion.isOpen).toBe(false)
      expect(c.getState().activeTrigger).toBeNull()
      // "Refocus" performs no mutation — nothing reopens.
      vi.advanceTimersByTime(1000)
      expect(c.getState().suggestion.isOpen).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('C18: RTL text — logical offsets stay correct for an Arabic query', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'مرحبا @سارة')
    const trigger = c.getState().activeTrigger
    expect(trigger?.symbolStart).toBe(6)
    expect(trigger?.query).toBe('سارة')
    expect(trigger?.caret).toBe(11)
  })

  it('C: parameterized — each symbol arms after whitespace and never mid-word', () => {
    for (const symbol of ['@', '/', ':', '#', '!!']) {
      const trigger: ComposerTrigger = { id: `t-${symbol}`, symbol, resolve: () => [] }
      const armed = makeComposer({ triggers: [trigger] })
      typeText(armed, `hi ${symbol}q`)
      expect(armed.getState().activeTrigger?.triggerId, `armed: ${symbol}`).toBe(`t-${symbol}`)

      const midWord = makeComposer({ triggers: [trigger] })
      typeText(midWord, `hi${symbol}q`)
      expect(midWord.getState().activeTrigger, `mid-word: ${symbol}`).toBeNull()
    }
  })
})
