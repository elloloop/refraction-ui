import type { ComposerAPI } from './types.js'

/** Structural field seam: the headless package never reads browser globals. */
export interface ComposerPasteField {
  value: string
  selectionStart: number
  selectionEnd: number
  setSelectionRange(start: number, end: number): void
}

// Native replacement ranges must not bisect a UTF-16 surrogate pair.
function splitsSurrogate(text: string, offset: number): boolean {
  return /^[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(text.slice(offset - 1, offset + 1))
}

/**
 * Apply the core's token/grapheme rules, then mirror its edit as a native undo
 * transaction when the adapter supplies one. The adapter must defer rendering
 * the field until this call returns. Empty image-only pastes preserve selection.
 */
export function pasteComposerField(
  api: ComposerAPI,
  field: ComposerPasteField,
  text: string,
  insertText?: (text: string) => boolean,
): void {
  api.setSelection({ start: field.selectionStart, end: field.selectionEnd })
  if (text === '') return
  const before = field.value
  api.pasteText(text)
  const after = api.getState()
  if (after.value !== before) {
    let start = 0
    while (start < before.length && start < after.value.length && before[start] === after.value[start]) start++
    if (splitsSurrogate(before, start) || splitsSurrogate(after.value, start)) start--
    let end = before.length
    let nextEnd = after.value.length
    while (end > start && nextEnd > start && before[end - 1] === after.value[nextEnd - 1]) {
      end--
      nextEnd--
    }
    if (splitsSurrogate(before, end) || splitsSurrogate(after.value, nextEnd)) {
      end++
      nextEnd++
    }
    field.setSelectionRange(start, end)
    insertText?.(after.value.slice(start, nextEnd))
    // Non-browser tests and browsers without native insertion still retain the
    // core's value/selection rules; native undo is verified separately.
    if (field.value !== after.value) field.value = after.value
  }
  field.setSelectionRange(after.selection.start, after.selection.end)
}
