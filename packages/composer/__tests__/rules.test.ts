import { describe, it, expect, vi } from 'vitest'
import {
  payloadFor,
  canSend,
  shouldSubmitOnEnter,
  computeCounter,
  clampGraphemes,
  graphemeLength,
  isGraphemeBoundary,
} from '../src/index.js'
import { makeComposer, typeText } from './helpers.js'

const ZWJ_FAMILY = '\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}' // 👨‍👩‍👧‍👦
const SKIN_TONE_THUMB = '\u{1F44D}\u{1F3FD}' // 👍🏽
const FLAG_IN = '\u{1F1EE}\u{1F1F3}' // 🇮🇳
const COMBINING_E = 'é' // é as e + U+0301
const DEVANAGARI = 'क्षि' // क्षि

describe('A. Rules (grapheme, trim, canSend, enter)', () => {
  it('A1: payloadFor trims leading/trailing, preserves internal newlines/blank lines', () => {
    expect(payloadFor('  hello  ')).toBe('hello')
    expect(payloadFor('\n\ta\n\nb list\n ')).toBe('a\n\nb list')
    expect(payloadFor('a\n\n\nb')).toBe('a\n\n\nb')
  })

  it('A2: canSend false for whitespace-only; true for text; true for attachments-only', () => {
    expect(canSend({ text: '' })).toBe(false)
    expect(canSend({ text: '   ' })).toBe(false)
    expect(canSend({ text: '\n' })).toBe(false)
    expect(canSend({ text: 'x' })).toBe(true)
    expect(canSend({ text: '', attachments: [{}] })).toBe(true)
  })

  it('A3: canSend false while disabled/readOnly/busy even with text', () => {
    expect(canSend({ text: 'hello', disabled: true })).toBe(false)
    expect(canSend({ text: 'hello', readOnly: true })).toBe(false)
    expect(canSend({ text: 'hello', busy: true })).toBe(false)
    expect(canSend({ text: '', attachments: [{}], busy: true })).toBe(false)
  })

  it('A4: shouldSubmitOnEnter truth table', () => {
    expect(shouldSubmitOnEnter({ shiftPressed: false, isComposing: false })).toBe(true)
    expect(shouldSubmitOnEnter({ shiftPressed: true, isComposing: false })).toBe(false)
    expect(shouldSubmitOnEnter({ shiftPressed: false, isComposing: true })).toBe(false)
    expect(shouldSubmitOnEnter({ shiftPressed: true, isComposing: true })).toBe(false)
  })

  it('A5: clamp leaves text under the limit unchanged; truncates at a grapheme boundary', () => {
    expect(clampGraphemes('hello', 10)).toBe('hello')
    expect(clampGraphemes('hello', 5)).toBe('hello')
    expect(clampGraphemes('hello', 3)).toBe('hel')
    expect(clampGraphemes('', 3)).toBe('')
    expect(clampGraphemes('abc', 0)).toBe('')
  })

  it('A6: clamp never splits ZWJ family emoji', () => {
    expect(clampGraphemes(`ab${ZWJ_FAMILY}`, 2)).toBe('ab')
    expect(clampGraphemes(`ab${ZWJ_FAMILY}`, 3)).toBe(`ab${ZWJ_FAMILY}`)
  })

  it('A6: clamp never splits skin-tone emoji', () => {
    expect(clampGraphemes(`ab${SKIN_TONE_THUMB}`, 2)).toBe('ab')
    expect(clampGraphemes(`ab${SKIN_TONE_THUMB}`, 3)).toBe(`ab${SKIN_TONE_THUMB}`)
  })

  it('A6: clamp never splits a regional-indicator flag', () => {
    expect(clampGraphemes(`ab${FLAG_IN}`, 2)).toBe('ab')
    expect(clampGraphemes(`ab${FLAG_IN}`, 3)).toBe(`ab${FLAG_IN}`)
  })

  it('A6: clamp never splits combining é (e + U+0301)', () => {
    expect(clampGraphemes(`ab${COMBINING_E}`, 2)).toBe('ab')
    expect(clampGraphemes(`ab${COMBINING_E}`, 3)).toBe(`ab${COMBINING_E}`)
  })

  it('A6: clamp never splits a Devanagari conjunct cluster', () => {
    expect(clampGraphemes(`ab${DEVANAGARI}`, 2)).toBe('ab')
    expect(clampGraphemes(`ab${DEVANAGARI}`, 3)).toBe(`ab${DEVANAGARI}`)
  })

  it('A6: isGraphemeBoundary rejects offsets inside a cluster', () => {
    // Offset 1 of the family emoji is mid-surrogate-pair — never a boundary.
    expect(isGraphemeBoundary(ZWJ_FAMILY, 1)).toBe(false)
    expect(isGraphemeBoundary(ZWJ_FAMILY, 0)).toBe(true)
    expect(isGraphemeBoundary(ZWJ_FAMILY, ZWJ_FAMILY.length)).toBe(true)
    expect(isGraphemeBoundary(`a${ZWJ_FAMILY}b`, 1)).toBe(true)
  })

  it('A7: length counted in graphemes not UTF-16 units (family emoji counts 1)', () => {
    expect(ZWJ_FAMILY.length).toBe(11)
    expect(graphemeLength(ZWJ_FAMILY)).toBe(1)
    expect(graphemeLength(`ab${ZWJ_FAMILY}`)).toBe(3)
    expect(graphemeLength(FLAG_IN)).toBe(1)
    expect(graphemeLength(COMBINING_E)).toBe(1)
  })

  it('A8: counter hidden above 20% remaining; visible at/below; overLimit at 0', () => {
    expect(computeCounter('a'.repeat(50), 100)).toEqual({
      visible: false,
      remaining: 50,
      overLimit: false,
    })
    expect(computeCounter('a'.repeat(79), 100).visible).toBe(false)
    expect(computeCounter('a'.repeat(80), 100)).toEqual({
      visible: true,
      remaining: 20,
      overLimit: false,
    })
    expect(computeCounter('a'.repeat(100), 100)).toEqual({
      visible: true,
      remaining: 0,
      overLimit: true,
    })
    expect(computeCounter('anything', undefined)).toEqual({
      visible: false,
      remaining: null,
      overLimit: false,
    })
  })

  it('A9: insertTextAtCursor inserts at a mid-string caret with caret after insertion', () => {
    const c = makeComposer()
    typeText(c, 'hello')
    c.setSelection({ start: 2, end: 2 })
    c.insertTextAtCursor('XY')
    expect(c.getState().value).toBe('heXYllo')
    expect(c.getState().selection).toEqual({ start: 4, end: 4 })
  })

  it('A9: insertTextAtCursor replaces an active selection', () => {
    const c = makeComposer()
    typeText(c, 'hello world')
    c.setSelection({ start: 6, end: 11 })
    c.insertTextAtCursor('there')
    expect(c.getState().value).toBe('hello there')
    expect(c.getState().selection).toEqual({ start: 11, end: 11 })
  })

  it('A10: insertTextAtCursor rejects with an event when it would exceed maxLength', () => {
    const onEvent = vi.fn()
    const c = makeComposer({ maxLength: 5, onEvent })
    typeText(c, 'abcd')
    c.insertTextAtCursor('xyz')
    expect(c.getState().value).toBe('abcd')
    expect(onEvent).toHaveBeenCalledWith({ type: 'insert-rejected', reason: 'max-length' })
  })

  it('A10: insertTextAtCursor is a no-op with an event while composing', () => {
    const onEvent = vi.fn()
    const c = makeComposer({ onEvent })
    typeText(c, 'ab')
    c.setComposing(true)
    c.insertTextAtCursor('x')
    expect(c.getState().value).toBe('ab')
    expect(onEvent).toHaveBeenCalledWith({ type: 'insert-rejected', reason: 'composing' })
  })
})
