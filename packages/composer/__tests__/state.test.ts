import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ComposerDraft, ComposerDraftStore } from '../src/index.js'
import { makeComposer, mentionTrigger, typeText } from './helpers.js'

function memoryStore(): ComposerDraftStore & { data: Map<string, ComposerDraft> } {
  const data = new Map<string, ComposerDraft>()
  return {
    data,
    read: (key) => data.get(key) ?? null,
    write: (key, draft) => void data.set(key, draft),
    clear: (key) => void data.delete(key),
  }
}

describe('B. State machine & submit', () => {
  it('B1: initial state is idle, empty, canSend false, suggestion closed', () => {
    const c = makeComposer({ triggers: [mentionTrigger()] })
    const s = c.getState()
    expect(s.value).toBe('')
    expect(s.isEmpty).toBe(true)
    expect(s.canSend).toBe(false)
    expect(s.suggestion.isOpen).toBe(false)
    expect(s.activeTrigger).toBeNull()
    expect(s.mode).toBe('compose')
    expect(s.isBusy).toBe(false)
    expect(s.error).toBeNull()
  })

  it('B2: setValue moves to typing (non-empty); clearing returns to idle (empty)', () => {
    const c = makeComposer()
    c.setValue('hi')
    expect(c.getState().isEmpty).toBe(false)
    expect(c.getState().canSend).toBe(true)
    c.setValue('')
    expect(c.getState().isEmpty).toBe(true)
    expect(c.getState().canSend).toBe(false)
  })

  it('B3: submit returns trimmed payload and clears synchronously incl. draft', () => {
    const store = memoryStore()
    const c = makeComposer({ draftStore: store, draftKey: 'k', replyToMessageId: 'm1' })
    store.data.set('k', { value: 'ignored', tokens: [], attachmentIds: [], updatedAt: 0 })
    c.setValue('  hello world  ')
    const submission = c.submit()
    expect(submission).not.toBeNull()
    expect(submission?.plainText).toBe('hello world')
    expect(submission?.tokens).toEqual([])
    expect(submission?.replyToMessageId).toBe('m1')
    expect(c.getState().value).toBe('')
    expect(c.getState().canSend).toBe(false)
    expect(store.data.has('k')).toBe(false)
  })

  it('B4: submit when !canSend returns null and leaves the value untouched', () => {
    const c = makeComposer()
    c.setValue('   ')
    expect(c.submit()).toBeNull()
    expect(c.getState().value).toBe('   ')
  })

  it('B5: submit while busy returns null (no double-send)', () => {
    const c = makeComposer()
    c.setValue('hello')
    c.setBusy(true)
    expect(c.submit()).toBeNull()
    expect(c.getState().value).toBe('hello')
    c.setBusy(false)
    expect(c.submit()?.plainText).toBe('hello')
  })

  it('B6: attachments-only submit has empty plainText and the attachments', () => {
    const c = makeComposer()
    const id = c.addAttachment({ kind: 'image', name: 'cat.png' })
    expect(id).toBeTruthy()
    const submission = c.submit()
    expect(submission?.plainText).toBe('')
    expect(submission?.attachments).toHaveLength(1)
    expect(submission?.attachments[0].name).toBe('cat.png')
    expect(c.getState().attachments).toHaveLength(0)
  })

  it('B7: setBusy/setError transitions; error preserves the draft value', () => {
    const c = makeComposer()
    c.setValue('draft text')
    c.setBusy(true)
    expect(c.getState().isBusy).toBe(true)
    c.setBusy(false)
    c.setError('send failed')
    expect(c.getState().error).toBe('send failed')
    expect(c.getState().value).toBe('draft text')
    c.setError(null)
    expect(c.getState().error).toBeNull()
  })

  it('B8: disabled makes setValue/insert/submit no-ops', () => {
    const c = makeComposer()
    c.setValue('keep')
    c.setDisabled(true)
    c.setValue('changed')
    c.insertTextAtCursor('x')
    expect(c.getState().value).toBe('keep')
    expect(c.submit()).toBeNull()
    expect(c.getState().disabled).toBe(true)
  })

  it('B9: readOnly keeps value immutable via the user path but allows selection updates', () => {
    const c = makeComposer()
    c.setValue('locked')
    c.setReadOnly(true)
    c.setValue('changed')
    expect(c.getState().value).toBe('locked')
    c.setSelection({ start: 2, end: 4 })
    expect(c.getState().selection).toEqual({ start: 2, end: 4 })
    c.setValue('locked', { start: 1, end: 1 })
    expect(c.getState().selection).toEqual({ start: 1, end: 1 })
    expect(c.submit()).toBeNull()
  })

  it('B10: subscribe fires on every transition; unsubscribe stops; getState is point-in-time', () => {
    const c = makeComposer()
    const seen: string[] = []
    const unsubscribe = c.subscribe((s) => seen.push(s.value))
    c.setValue('a')
    c.setBusy(true)
    expect(seen).toEqual(['a', 'a'])
    const snapshot = c.getState()
    unsubscribe()
    c.setBusy(false)
    c.setValue('b')
    expect(seen).toEqual(['a', 'a'])
    expect(snapshot.isBusy).toBe(true) // point-in-time, not live
  })

  it('B11: reset restores initial; destroy cancels pending debounce/async', () => {
    vi.useFakeTimers()
    try {
      const store = memoryStore()
      const c = makeComposer({ initialValue: 'seed', draftStore: store, draftKey: 'k' })
      c.setValue('typed a lot')
      c.setBusy(true)
      c.setError('x')
      c.reset()
      const s = c.getState()
      expect(s.value).toBe('seed')
      expect(s.isBusy).toBe(false)
      expect(s.error).toBeNull()

      c.setValue('pending draft')
      c.destroy()
      vi.advanceTimersByTime(1000)
      expect(store.data.has('k')).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('B12: validator blocks submit with a surfaced reason; valid passes', () => {
    const c = makeComposer({
      validator: (text) =>
        text.includes('forbidden')
          ? { isValid: false, reason: 'contains a forbidden word' }
          : { isValid: true },
    })
    c.setValue('this is forbidden')
    expect(c.submit()).toBeNull()
    expect(c.getState().error).toBe('contains a forbidden word')
    expect(c.getState().value).toBe('this is forbidden')
    c.setValue('all good')
    expect(c.submit()?.plainText).toBe('all good')
  })

  it('B13: beginEdit seeds value+tokens+editingMessageId; submit emits it; cancelEdit restores draft', () => {
    const c = makeComposer()
    c.setValue('half-typed draft')
    c.beginEdit({
      value: 'original message',
      tokens: [],
      messageId: 'msg-9',
    })
    let s = c.getState()
    expect(s.mode).toBe('edit')
    expect(s.value).toBe('original message')
    expect(s.editingMessageId).toBe('msg-9')

    c.cancelEdit()
    s = c.getState()
    expect(s.mode).toBe('compose')
    expect(s.value).toBe('half-typed draft')
    expect(s.editingMessageId).toBeUndefined()

    c.beginEdit({ value: 'edited body', messageId: 'msg-9' })
    const submission = c.submit()
    expect(submission?.editingMessageId).toBe('msg-9')
    expect(submission?.plainText).toBe('edited body')
    expect(c.getState().mode).toBe('compose')
  })

  it('B14: typing signal throttled leading-edge; not fired for programmatic setValue or while disabled', () => {
    let time = 0
    const events: string[] = []
    const c = makeComposer({
      now: () => time,
      typingSignalIntervalMs: 3000,
      onEvent: (e) => events.push(e.type),
    })
    typeText(c, 'ab') // two keystrokes within the interval → one leading signal
    expect(events.filter((e) => e === 'typing')).toHaveLength(1)
    time = 3000
    typeText(c, 'c')
    expect(events.filter((e) => e === 'typing')).toHaveLength(2)
    time = 4000
    c.setValue('host reset', undefined, { programmatic: true })
    expect(events.filter((e) => e === 'typing')).toHaveLength(2)
    time = 10000
    c.setDisabled(true)
    c.setValue('nope')
    expect(events.filter((e) => e === 'typing')).toHaveLength(2)
  })
})

describe('B. destroy semantics', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('B11: destroy stops emissions and future writes', () => {
    const c = makeComposer()
    const listener = vi.fn()
    c.subscribe(listener)
    c.destroy()
    c.setValue('after destroy')
    expect(listener).not.toHaveBeenCalled()
    expect(c.getState().value).toBe('')
  })
})
