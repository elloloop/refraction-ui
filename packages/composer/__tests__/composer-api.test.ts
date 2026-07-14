import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  detectActiveTrigger,
  resolveTriggerConfig,
  DEFAULT_MAX_QUERY_LENGTH,
  DEFAULT_MAX_VISIBLE_RESULTS,
} from '../src/index.js'
import { makeComposer, mentionTrigger, emojiTrigger, typeText, PEOPLE } from './helpers.js'

const ZWJ_FAMILY = '\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}'

describe('applyEnter matrix (§3.3/§3.4)', () => {
  it('Shift+Enter returns newline and never submits', () => {
    const c = makeComposer()
    c.setValue('line one')
    expect(c.applyEnter({ shiftPressed: true })).toBe('newline')
    expect(c.getState().value).toBe('line one') // core does not insert the \n itself
  })

  it('Enter while composing returns noop — the IME owns the key', () => {
    const c = makeComposer()
    c.setValue('こんにちは')
    c.setComposing(true)
    expect(c.applyEnter({ shiftPressed: false })).toBe('noop')
    expect(c.getState().value).toBe('こんにちは')
  })

  it('whitespace-only Enter is a silent noop: field not cleared, nothing submitted', () => {
    const c = makeComposer()
    c.setValue('  \n ')
    expect(c.applyEnter({ shiftPressed: false })).toBe('noop')
    expect(c.getState().value).toBe('  \n ')
  })

  it('Enter submits and clears when canSend', () => {
    const c = makeComposer()
    c.setValue('ship it')
    expect(c.applyEnter({ shiftPressed: false })).toBe('submitted')
    expect(c.getState().value).toBe('')
  })

  it('Enter is a noop while disabled or readOnly', () => {
    const c = makeComposer()
    c.setValue('text')
    c.setDisabled(true)
    expect(c.applyEnter({ shiftPressed: false })).toBe('noop')
    c.setDisabled(false)
    c.setReadOnly(true)
    expect(c.applyEnter({ shiftPressed: false })).toBe('noop')
    expect(c.getState().value).toBe('text')
  })

  it('Enter is a noop while busy — no double-send, value kept', () => {
    const c = makeComposer()
    c.setValue('sending…')
    c.setBusy(true)
    expect(c.applyEnter({ shiftPressed: false })).toBe('noop')
    expect(c.getState().value).toBe('sending…')
  })
})

describe('paste behavior (§3.5)', () => {
  it('pasteText inserts at the caret preserving internal newlines', () => {
    const c = makeComposer()
    typeText(c, 'ab')
    c.setSelection({ start: 1, end: 1 })
    c.pasteText('1\n\n2')
    expect(c.getState().value).toBe('a1\n\n2b')
    expect(c.getState().selection).toEqual({ start: 5, end: 5 })
  })

  it('pasteText clamps the pasted slice grapheme-safe and emits paste-trimmed', () => {
    const onEvent = vi.fn()
    const c = makeComposer({ maxLength: 4, onEvent })
    typeText(c, 'ab')
    c.pasteText(`xy${ZWJ_FAMILY}z`) // budget of 2 graphemes → 'xy', never half a family
    expect(c.getState().value).toBe('abxy')
    expect(onEvent).toHaveBeenCalledWith({ type: 'paste-trimmed' })
  })

  it('pasteText replaces a selection, expanding over a partially-selected token', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi @Jor')
    c.applySuggestion(0)
    typeText(c, ' bye')
    c.setSelection({ start: 5, end: 16 }) // snaps to [3,16)
    c.pasteText('X')
    const s = c.getState()
    expect(s.value).toBe('hi Xye')
    expect(s.tokens).toEqual([])
  })

  it('typing past maxLength via setValue drops the excess grapheme-safe', () => {
    const c = makeComposer({ maxLength: 3 })
    typeText(c, 'abcd')
    expect(c.getState().value).toBe('abc')
    expect(c.getState().counter).toEqual({ visible: true, remaining: 0, overLimit: true })
  })
})

describe('submit details', () => {
  it('adjusts token offsets when leading whitespace is trimmed', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '  @Jor')
    c.applySuggestion(0)
    typeText(c, ' hi  ')
    const submission = c.submit()
    expect(submission?.plainText).toBe('@Jordan Lee hi')
    expect(submission?.tokens).toEqual([
      { type: 'mention', id: 'u_jordan', display: '@Jordan Lee', start: 0, end: 11 },
    ])
    expect(submission?.plainText.substring(0, 11)).toBe('@Jordan Lee')
  })

  it('returns null while the value is over the maxLength budget', () => {
    const c = makeComposer({ initialValue: 'a'.repeat(10), maxLength: 5 })
    expect(c.getState().canSend).toBe(false)
    expect(c.submit()).toBeNull()
  })
})

describe('IME composition details (R5)', () => {
  it('no maxLength truncation while composing; the clamp applies at composition end', () => {
    const c = makeComposer({ maxLength: 4 })
    typeText(c, 'ab')
    c.setComposing(true)
    c.setValue('ab漢字候補', { start: 6, end: 6 })
    expect(c.getState().value).toBe('ab漢字候補') // untouched mid-composition
    c.setComposing(false)
    expect(c.getState().value).toBe('ab漢字')
    expect(c.getState().selection).toEqual({ start: 4, end: 4 })
  })

  it('direct-typed emoji committed at composition end', () => {
    const c = makeComposer({ triggers: [emojiTrigger()] })
    c.setComposing(true)
    c.setValue('good :fire:', { start: 11, end: 11 })
    expect(c.getState().tokens).toEqual([])
    c.setComposing(false)
    expect(c.getState().value).toBe('good \u{1F525}')
    expect(c.getState().tokens).toHaveLength(1)
  })
})

describe('state & lifecycle details', () => {
  it('setDisabled closes an open suggestion menu', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '@jo')
    expect(c.getState().suggestion.isOpen).toBe(true)
    c.setDisabled(true)
    expect(c.getState().suggestion.isOpen).toBe(false)
    expect(c.getState().activeTrigger).toBeNull()
  })

  it('setReadOnly closes an open suggestion menu', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '@jo')
    c.setReadOnly(true)
    expect(c.getState().suggestion.isOpen).toBe(false)
  })

  it('beginEdit closes an open suggestion menu', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, '@jo')
    c.beginEdit({ value: 'old message', messageId: 'm1' })
    expect(c.getState().suggestion.isOpen).toBe(false)
    expect(c.getState().value).toBe('old message')
  })

  it('reset restores initialValue and initialTokens', () => {
    const c = makeComposer({
      initialValue: '@Ann hi',
      initialTokens: [
        { triggerId: 'mention', symbol: '@', id: 'u_a', label: 'Ann', display: '@Ann', start: 0, end: 4 },
      ],
    })
    c.setValue('completely different')
    c.reset()
    expect(c.getState().value).toBe('@Ann hi')
    expect(c.getState().tokens).toEqual([
      expect.objectContaining({ id: 'u_a', start: 0, end: 4 }),
    ])
  })

  it('counter surfaces in composer state near the limit', () => {
    const c = makeComposer({ maxLength: 10, initialValue: 'a'.repeat(9) })
    expect(c.getState().counter).toEqual({ visible: true, remaining: 1, overLimit: false })
  })

  it('insertTextAtCursor while disabled/readOnly emits the matching rejection event', () => {
    const onEvent = vi.fn()
    const c = makeComposer({ onEvent })
    c.setDisabled(true)
    c.insertTextAtCursor('x')
    expect(onEvent).toHaveBeenCalledWith({ type: 'insert-rejected', reason: 'disabled' })
    c.setDisabled(false)
    c.setReadOnly(true)
    c.insertTextAtCursor('x')
    expect(onEvent).toHaveBeenCalledWith({ type: 'insert-rejected', reason: 'read-only' })
    expect(c.getState().value).toBe('')
  })

  it('cut/copy/paste are inert while readOnly (copy still allowed)', () => {
    const c = makeComposer()
    c.setValue('read only text')
    c.setReadOnly(true)
    c.setSelection({ start: 0, end: 4 })
    expect(c.copySelection()).toBe('read')
    expect(c.cutSelection()).toBe('')
    c.pasteText('nope')
    expect(c.getState().value).toBe('read only text')
  })
})

describe('trigger-engine unit surface', () => {
  it('resolveTriggerConfig applies the documented defaults', () => {
    const resolved = resolveTriggerConfig({ id: 't', symbol: '@', resolve: () => [] })
    expect(resolved.scope).toBe('anywhere')
    expect(resolved.maxQueryLength).toBe(DEFAULT_MAX_QUERY_LENGTH)
    expect(resolved.closeOnSpace).toBe(true)
    expect(resolved.allowMidWord).toBe(false)
    expect(resolved.extraBoundaryChars).toEqual([])
    expect(resolved.debounceMs).toBe(0)
    expect(resolved.maxVisibleResults).toBe(DEFAULT_MAX_VISIBLE_RESULTS)
    expect(resolved.wrapNavigation).toBe(true)
    expect(resolved.toDisplay({ id: 'x', display: 'Ann' })).toBe('@Ann')
  })

  it('allowMidWord fires mid-word (trades away email protection deliberately)', () => {
    const triggers = [resolveTriggerConfig({ id: 't', symbol: '@', allowMidWord: true, resolve: () => [] })]
    const match = detectActiveTrigger({ text: 'alice@ex', caret: 8, triggers })
    expect(match?.query).toBe('ex')
  })

  it('tokenRanges suppress candidates whose symbol sits inside a committed token', () => {
    const triggers = [resolveTriggerConfig({ id: 't', symbol: '@', resolve: () => [] })]
    const text = 'hi @Jordan'
    expect(
      detectActiveTrigger({ text, caret: text.length, triggers, tokenRanges: [{ start: 3, end: 10 }] }),
    ).toBeNull()
    expect(detectActiveTrigger({ text, caret: text.length, triggers })).not.toBeNull()
  })

  it('dismissed occurrences never re-match; other occurrences still do', () => {
    const triggers = [resolveTriggerConfig({ id: 't', symbol: '@', resolve: () => [] })]
    const text = 'hi @jo'
    expect(
      detectActiveTrigger({
        text,
        caret: text.length,
        triggers,
        dismissed: [{ triggerId: 't', symbolStart: 3 }],
      }),
    ).toBeNull()
    expect(
      detectActiveTrigger({
        text,
        caret: text.length,
        triggers,
        dismissed: [{ triggerId: 'other', symbolStart: 3 }],
      }),
    ).not.toBeNull()
  })

  it('isComposing suspends detection entirely', () => {
    const triggers = [resolveTriggerConfig({ id: 't', symbol: '@', resolve: () => [] })]
    expect(detectActiveTrigger({ text: '@jo', caret: 3, triggers, isComposing: true })).toBeNull()
  })
})

describe('suggestion extras', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('activeIndex resets to 0 when the query changes', () => {
    const c = makeComposer({ triggers: [mentionTrigger({ resolve: () => PEOPLE })] })
    typeText(c, '@')
    c.moveSuggestionNext()
    expect(c.getState().suggestion.activeIndex).toBe(1)
    typeText(c, 'x') // query change → fresh results → active resets
    expect(c.getState().suggestion.activeIndex).toBe(0)
  })

  it('copy (not cut) never seeds the clip shadow — pasting copied token text stays plain', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    typeText(c, 'hi @Jor')
    c.applySuggestion(0)
    c.setSelection({ start: 3, end: 14 })
    const copied = c.copySelection()
    c.setSelection({ start: 14, end: 14 })
    typeText(c, ' ')
    c.pasteText(copied)
    const s = c.getState()
    expect(s.value).toBe('hi @Jordan Lee @Jordan Lee')
    expect(s.tokens).toHaveLength(1) // only the original
  })

  it('a cut from one instance does not restore tokens in another instance', () => {
    const a = makeComposer({ triggers: [mentionTrigger()] })
    typeText(a, '@Jor')
    a.applySuggestion(0)
    a.setSelection({ start: 0, end: 11 })
    const cut = a.cutSelection()
    const b = makeComposer({ triggers: [mentionTrigger()] })
    b.pasteText(cut)
    expect(b.getState().value).toBe('@Jordan Lee')
    expect(b.getState().tokens).toEqual([])
  })
})
