import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { ComposerDraft, ComposerDraftStore } from '../src/index.js'
import { toMessageAttachment } from '../src/index.js'
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

describe('F. Attachments', () => {
  it('F1: add returns an id; state lists it; canSend flips true', () => {
    const c = makeComposer()
    expect(c.getState().canSend).toBe(false)
    const id = c.addAttachment({ kind: 'file', name: 'notes.pdf', mimeType: 'application/pdf' })
    expect(typeof id).toBe('string')
    const s = c.getState()
    expect(s.attachments).toEqual([
      expect.objectContaining({ id, name: 'notes.pdf', status: 'pending' }),
    ])
    expect(s.canSend).toBe(true)
  })

  it('F2: updateAttachment patches status/progress; remove recomputes canSend', () => {
    const c = makeComposer()
    const id = c.addAttachment({ kind: 'image', name: 'a.png' }) as string
    c.updateAttachment(id, { status: 'uploading', progress: 0.5 })
    expect(c.getState().attachments[0]).toMatchObject({ status: 'uploading', progress: 0.5 })
    c.updateAttachment(id, { status: 'ready', progress: 1 })
    expect(c.getState().attachments[0].status).toBe('ready')
    c.removeAttachment(id)
    expect(c.getState().attachments).toEqual([])
    expect(c.getState().canSend).toBe(false)
  })

  it('F3: exceeding maxAttachments emits a rejection event — no add, no throw', () => {
    const onEvent = vi.fn()
    const c = makeComposer({ maxAttachments: 1, onEvent })
    c.addAttachment({ kind: 'image', name: 'one.png' })
    const rejected = c.addAttachment({ kind: 'image', name: 'two.png' })
    expect(rejected).toBeNull()
    expect(c.getState().attachments).toHaveLength(1)
    expect(onEvent).toHaveBeenCalledWith({
      type: 'attachment-rejected',
      reason: 'max-attachments',
      name: 'two.png',
    })
  })

  it('F4: accept predicate and maxSizeBytes rejections surface an error event with a reason', () => {
    const onEvent = vi.fn()
    const c = makeComposer({
      maxAttachmentSizeBytes: 100,
      acceptAttachment: (draft) =>
        draft.mimeType === 'application/x-msdownload' ? 'executables are not allowed' : true,
      onEvent,
    })
    expect(c.addAttachment({ kind: 'file', name: 'big.zip', sizeBytes: 5000 })).toBeNull()
    expect(onEvent).toHaveBeenCalledWith({
      type: 'attachment-rejected',
      reason: 'max-size',
      name: 'big.zip',
    })
    expect(
      c.addAttachment({ kind: 'file', name: 'x.exe', mimeType: 'application/x-msdownload' }),
    ).toBeNull()
    expect(onEvent).toHaveBeenCalledWith({
      type: 'attachment-rejected',
      reason: 'not-accepted',
      name: 'x.exe',
      detail: 'executables are not allowed',
    })
    expect(c.getState().attachments).toEqual([])
  })

  it('F5: submit snapshots the attachments and then clears the tray', () => {
    const c = makeComposer()
    c.addAttachment({ kind: 'audio', name: 'note.m4a', status: 'ready' })
    c.setValue('voice note')
    const submission = c.submit()
    expect(submission?.attachments).toEqual([
      expect.objectContaining({ name: 'note.m4a', status: 'ready' }),
    ])
    expect(c.getState().attachments).toEqual([])
  })

  it('F: toMessageAttachment maps onto the conversation wire shape', () => {
    expect(
      toMessageAttachment({
        id: 'a1',
        kind: 'image',
        name: 'cat.png',
        mimeType: 'image/png',
        sizeBytes: 42,
        previewUrl: 'blob:x',
        status: 'ready',
      }),
    ).toEqual({ id: 'a1', name: 'cat.png', url: 'blob:x', type: 'image/png', size: 42 })
  })
})

describe('F. Drafts', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('F6: autosave is debounced and includes value+tokens; restore rehydrates; submit clears', () => {
    const store = memoryStore()
    const c = makeComposer({
      triggers: [mentionTrigger()],
      draftStore: store,
      draftKey: 'room-1',
      draftDebounceMs: 400,
      now: () => 12345,
    })
    typeText(c, 'hey @Jor')
    c.applySuggestion(0)
    expect(store.data.has('room-1')).toBe(false) // debounced, not yet written
    vi.advanceTimersByTime(399)
    expect(store.data.has('room-1')).toBe(false)
    vi.advanceTimersByTime(2)
    const draft = store.data.get('room-1')
    expect(draft?.value).toBe('hey @Jordan Lee')
    expect(draft?.tokens).toEqual([
      expect.objectContaining({ id: 'u_jordan', start: 4, end: 15 }),
    ])
    expect(draft?.updatedAt).toBe(12345)

    // Restore on create.
    const restored = makeComposer({ triggers: [mentionTrigger()], draftStore: store, draftKey: 'room-1' })
    expect(restored.getState().value).toBe('hey @Jordan Lee')
    expect(restored.getState().tokens).toHaveLength(1)

    // Clear on successful send.
    const submission = restored.submit()
    expect(submission?.plainText).toBe('hey @Jordan Lee')
    expect(store.data.has('room-1')).toBe(false)
  })

  it('F7: no draft write while IME composition is mid-flight', () => {
    const store = memoryStore()
    const c = makeComposer({ draftStore: store, draftKey: 'k', draftDebounceMs: 100 })
    typeText(c, 'a') // schedules a write
    c.setComposing(true)
    c.setValue('a漢字候補', { start: 5, end: 5 })
    vi.advanceTimersByTime(500)
    // The pre-composition timer fired but was guarded; nothing persisted mid-IME.
    expect(store.data.has('k')).toBe(false)
    c.setComposing(false)
    vi.advanceTimersByTime(500)
    expect(store.data.get('k')?.value).toBe('a漢字候補')
  })

  it('F6: the draft write includes attachment ids (blobs stay host-owned)', () => {
    const store = memoryStore()
    const c = makeComposer({
      draftStore: store,
      draftKey: 'k',
      generateId: (prefix = 'id') => `${prefix}-1`,
    })
    c.setValue('with file')
    c.addAttachment({ kind: 'file', name: 'doc.txt' })
    vi.advanceTimersByTime(400)
    expect(store.data.get('k')?.attachmentIds).toEqual(['rfr-attachment-1'])
  })

  it('F6: reset cancels a pending draft write', () => {
    const store = memoryStore()
    const c = makeComposer({ draftStore: store, draftKey: 'k' })
    c.setValue('about to reset')
    c.reset()
    vi.advanceTimersByTime(1000)
    expect(store.data.has('k')).toBe(false)
  })

  it('F6: a rapid second edit re-debounces the write (single write, latest value)', () => {
    const store = memoryStore()
    const write = vi.spyOn(store, 'write')
    const c = makeComposer({ draftStore: store, draftKey: 'k', draftDebounceMs: 400 })
    typeText(c, 'a')
    vi.advanceTimersByTime(300)
    typeText(c, 'b')
    vi.advanceTimersByTime(399)
    expect(write).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(write).toHaveBeenCalledTimes(1)
    expect(store.data.get('k')?.value).toBe('ab')
  })

  it('F8: corrupt or absent draft reads fail closed to a clean empty state', () => {
    const corrupt: ComposerDraftStore = {
      read: () => ({ value: 'abc', tokens: [{ start: 0, end: 99, display: 'MISMATCH' }], attachmentIds: [] }) as unknown as ComposerDraft,
      write: () => undefined,
      clear: () => undefined,
    }
    expect(makeComposer({ draftStore: corrupt, draftKey: 'k' }).getState().value).toBe('')

    const throwing: ComposerDraftStore = {
      read: () => {
        throw new Error('storage unavailable')
      },
      write: () => undefined,
      clear: () => undefined,
    }
    expect(makeComposer({ draftStore: throwing, draftKey: 'k' }).getState().value).toBe('')

    const absent: ComposerDraftStore = {
      read: () => null,
      write: () => undefined,
      clear: () => undefined,
    }
    expect(makeComposer({ draftStore: absent, draftKey: 'k' }).getState().value).toBe('')
  })
})
