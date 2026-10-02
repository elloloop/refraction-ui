import { describe, it, expect } from 'vitest'
import { createComposer } from '../src/composer.js'
import { pasteComposerField, type ComposerPasteField } from '../src/paste-field.js'

function field(value: string, start: number, end = start): ComposerPasteField {
  return { value, selectionStart: start, selectionEnd: end, setSelectionRange(start, end) {
    this.selectionStart = start
    this.selectionEnd = end
  } }
}

describe('field paste boundary', () => {
  it('mirrors core replacement without splitting shared emoji surrogates in the native transaction', () => {
    const api = createComposer({ initialValue: 'before 😀 after' })
    const el = field(api.getState().value, 7, 9)
    const ranges: number[][] = []
    pasteComposerField(api, el, '😁', text => {
      ranges.push([el.selectionStart, el.selectionEnd])
      el.value = el.value.slice(0, el.selectionStart) + text + el.value.slice(el.selectionEnd)
      return true
    })
    expect(ranges).toEqual([[7, 9]])
    expect(el.value).toBe('before 😁 after')
    expect([el.selectionStart, el.selectionEnd]).toEqual([9, 9])
    api.destroy()
  })
  it('preserves image-only selection and core grapheme limits with no native insertion support', () => {
    const api = createComposer({ initialValue: 'draft', maxLength: 6 })
    const el = field('draft', 1, 4)
    pasteComposerField(api, el, '')
    expect(el.value).toBe('draft')
    expect(api.getState().selection).toEqual({ start: 1, end: 4 })
    pasteComposerField(api, el, '😀😁😂😃')
    expect(el.value).toBe('d😀😁😂😃t')
    expect([el.selectionStart, el.selectionEnd]).toEqual([9, 9])
    api.destroy()
  })
})
