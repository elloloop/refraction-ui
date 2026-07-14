/**
 * `createComposer(config)` — the headless composer core.
 *
 * Owns the flat value + selection, committed tokens, staged attachments,
 * trigger/suggestion lifecycle, drafts, and the optimistic submit. Pure of
 * DOM/browser globals: `now`/`generateId` are injected (defaults live only at
 * this boundary, matching the other cores in the repo), so the same instance
 * is hydration-deterministic and portable to any framework adapter.
 */

import { generateId as sharedGenerateId } from '@refraction-ui/shared'
import { clampGraphemes, graphemeLength } from './graphemes.js'
import { canSend as computeCanSend, computeCounter, shouldSubmitOnEnter, payloadFor } from './rules.js'
import {
  detectActiveTrigger,
  resolveTriggerConfig,
  type DismissedOccurrence,
  type ResolvedTrigger,
  type TriggerMatch,
} from './trigger-engine.js'
import { createSuggestionController, CLOSED_SUGGESTION_STATE } from './suggestion.js'
import {
  applyValueEdit,
  commitTokenAt,
  detectTypedEmoji,
  expandRangeOverTokens,
  serializeTokens,
  snapSelectionToTokens,
} from './tokens.js'
import type {
  ActiveTriggerState,
  ComposerAPI,
  ComposerAttachment,
  ComposerConfig,
  ComposerDraft,
  ComposerOutput,
  ComposerSelection,
  ComposerState,
  ComposerSubmission,
  ComposerToken,
  EnterResult,
  PlacedToken,
  ResolvedToken,
} from './types.js'

export const DEFAULT_DRAFT_DEBOUNCE_MS = 400
export const DEFAULT_TYPING_SIGNAL_INTERVAL_MS = 3000
export const DEFAULT_MIN_LINES = 1
export const DEFAULT_MAX_LINES = 6

interface ClipShadow {
  text: string
  /** Tokens rebased to the start of the cut range. */
  tokens: PlacedToken[]
}

interface EditModeSnapshot {
  value: string
  tokens: PlacedToken[]
  selection: ComposerSelection
  attachments: ComposerAttachment[]
}

function validateDraft(raw: unknown): ComposerDraft | null {
  if (typeof raw !== 'object' || raw === null) return null
  const draft = raw as Partial<ComposerDraft>
  if (typeof draft.value !== 'string') return null
  if (!Array.isArray(draft.tokens)) return null
  if (!Array.isArray(draft.attachmentIds)) return null
  for (const token of draft.tokens) {
    if (
      typeof token !== 'object' ||
      token === null ||
      typeof token.start !== 'number' ||
      typeof token.end !== 'number' ||
      typeof token.display !== 'string' ||
      // The one invariant that matters: ranges must project the display.
      draft.value.substring(token.start, token.end) !== token.display
    ) {
      return null
    }
  }
  return {
    value: draft.value,
    tokens: draft.tokens as PlacedToken[],
    attachmentIds: draft.attachmentIds as string[],
    updatedAt: typeof draft.updatedAt === 'number' ? draft.updatedAt : 0,
  }
}

export function createComposer(config: ComposerConfig = {}): ComposerAPI {
  // Injection boundary: defaults using ambient time/counters live ONLY here.
  const now = config.now ?? (() => Date.now())
  const generateId = config.generateId ?? sharedGenerateId
  const onEvent = config.onEvent ?? (() => undefined)
  const triggers: ResolvedTrigger[] = (config.triggers ?? []).map(resolveTriggerConfig)
  const draftDebounceMs = config.draftDebounceMs ?? DEFAULT_DRAFT_DEBOUNCE_MS
  const typingSignalIntervalMs = config.typingSignalIntervalMs ?? DEFAULT_TYPING_SIGNAL_INTERVAL_MS
  const emojiTrigger = triggers.find((t) => t.symbol === ':') ?? null

  // --- mutable internal state -------------------------------------------------
  let value = config.initialValue ?? ''
  let tokens: PlacedToken[] = [...(config.initialTokens ?? [])]
  let selection: ComposerSelection = { start: value.length, end: value.length }
  let isComposing = false
  let isBusy = false
  let disabled = false
  let readOnly = false
  let error: string | null = null
  let attachments: ComposerAttachment[] = []
  let mode: 'compose' | 'edit' = 'compose'
  let editingMessageId: string | undefined
  let preEditSnapshot: EditModeSnapshot | null = null
  let activeMatch: TriggerMatch | null = null
  let dismissed: DismissedOccurrence[] = []
  let clipShadow: ClipShadow | null = null
  let lastTypingAt = Number.NEGATIVE_INFINITY
  let draftTimer: ReturnType<typeof setTimeout> | null = null
  let destroyed = false

  const listeners = new Set<(state: ComposerState) => void>()

  // Draft restore on create (fail closed: a corrupt draft yields a clean state).
  if (config.draftStore && config.draftKey) {
    try {
      const draft = validateDraft(config.draftStore.read(config.draftKey))
      if (draft) {
        value = draft.value
        tokens = draft.tokens
        selection = { start: value.length, end: value.length }
      }
    } catch {
      // fail closed — start empty
    }
  }

  const suggestions = createSuggestionController({ emit: () => emit() })

  // --- state assembly ----------------------------------------------------------

  function toActiveTriggerState(match: TriggerMatch | null): ActiveTriggerState | null {
    if (!match) return null
    return {
      triggerId: match.trigger.id,
      symbol: match.trigger.symbol,
      symbolStart: match.symbolStart,
      caret: match.caret,
      query: match.query,
    }
  }

  function buildState(): ComposerState {
    const counter = computeCounter(value, config.maxLength)
    const overBudget = counter.remaining !== null && counter.remaining < 0
    return {
      value,
      selection,
      isComposing,
      isBusy,
      disabled,
      readOnly,
      isEmpty: payloadFor(value).length === 0 && attachments.length === 0,
      canSend:
        computeCanSend({ text: value, attachments, disabled, readOnly, busy: isBusy }) &&
        !overBudget,
      error,
      attachments: [...attachments],
      tokens: [...tokens],
      activeTrigger: toActiveTriggerState(activeMatch),
      suggestion: destroyed ? CLOSED_SUGGESTION_STATE : suggestions.state,
      counter,
      mode,
      editingMessageId,
    }
  }

  function emit(): void {
    if (destroyed) return
    const snapshot = buildState()
    for (const listener of listeners) listener(snapshot)
  }

  // --- cross-cutting helpers ----------------------------------------------------

  function shiftDismissedForEdit(editStart: number, editOldEnd: number, delta: number): void {
    dismissed = dismissed
      .map((d) => (d.symbolStart >= editOldEnd ? { ...d, symbolStart: d.symbolStart + delta } : d))
      // An occurrence only stays dismissed while its symbol still sits at that
      // offset — deleting and retyping the symbol re-arms (C9).
      .filter((d) => {
        if (d.symbolStart >= editStart && d.symbolStart < editOldEnd) return false
        const trigger = triggers.find((t) => t.id === d.triggerId)
        return trigger !== undefined && value.startsWith(trigger.symbol, d.symbolStart)
      })
  }

  function recomputeTriggers(): void {
    const collapsed = selection.start === selection.end
    activeMatch =
      collapsed && !isComposing && !disabled && !readOnly
        ? detectActiveTrigger({
            text: value,
            caret: selection.start,
            triggers,
            isComposing,
            dismissed,
            tokenRanges: tokens,
          })
        : null
    suggestions.sync(activeMatch)
  }

  function fireTypingSignal(): void {
    // Leading edge + max one per interval; trailing edge deliberately dropped.
    const at = now()
    if (at - lastTypingAt >= typingSignalIntervalMs) {
      lastTypingAt = at
      onEvent({ type: 'typing' })
    }
  }

  function scheduleDraftWrite(): void {
    if (!config.draftStore || !config.draftKey) return
    if (draftTimer !== null) clearTimeout(draftTimer)
    draftTimer = setTimeout(() => {
      draftTimer = null
      // Never persist mid-IME text (F7); the post-composition mutation reschedules.
      if (isComposing || destroyed) return
      config.draftStore?.write(config.draftKey as string, {
        value,
        tokens: [...tokens],
        attachmentIds: attachments.map((a) => a.id),
        updatedAt: now(),
      })
    }, draftDebounceMs)
  }

  function cancelDraftWrite(): void {
    if (draftTimer !== null) {
      clearTimeout(draftTimer)
      draftTimer = null
    }
  }

  function clearPersistedDraft(): void {
    cancelDraftWrite()
    if (config.draftStore && config.draftKey) config.draftStore.clear(config.draftKey)
  }

  function maybeCommitTypedEmoji(): void {
    if (!emojiTrigger || selection.start !== selection.end) return
    const caretBefore = selection.start
    const hit = detectTypedEmoji(value, caretBefore)
    if (!hit) return
    // Never re-tokenize inside an existing token's range.
    if (tokens.some((t) => t.start < caretBefore && hit.start < t.end)) return
    const token: ComposerToken = {
      triggerId: emojiTrigger.id,
      symbol: emojiTrigger.symbol,
      id: hit.shortcode,
      label: hit.shortcode.slice(1, -1),
      display: hit.unicode,
    }
    const committed = commitTokenAt({
      value,
      tokens,
      start: hit.start,
      end: caretBefore,
      token,
    })
    const delta = committed.value.length - value.length
    value = committed.value
    tokens = committed.tokens
    selection = committed.selection
    shiftDismissedForEdit(hit.start, caretBefore, delta)
  }

  interface MutateOptions {
    programmatic?: boolean
    /** Emit 'paste-trimmed' (vs silent clamp) when the budget trims the insert. */
    trimEventOnClamp?: boolean
  }

  /**
   * The one write path for text: diff → token atomicity → clamp → snap →
   * emoji commit → trigger detection → typing signal → draft write → emit.
   * Returns the applied edit start (for clip-shadow restores) or null.
   */
  function mutateValue(
    newText: string,
    newSelection: ComposerSelection,
    opts: MutateOptions = {},
  ): { applied: boolean; editStart: number } {
    const previousSelection = selection

    if (isComposing) {
      // IME owns mid-composition text: track it verbatim (token ranges still
      // shift via the diff) but suspend clamping, triggers, drafts, signals.
      const result = applyValueEdit({ oldValue: value, newValue: newText, tokens, newSelection })
      value = result.value
      tokens = result.tokens
      selection = result.selection
      emit()
      return { applied: true, editStart: result.edit?.start ?? newSelection.start }
    }

    const result = applyValueEdit({
      oldValue: value,
      newValue: newText,
      tokens,
      newSelection,
      maxLength: config.maxLength,
    })

    if (result.rejected) {
      onEvent({ type: 'edit-rejected', reason: 'inside-token' })
      selection = result.selection
      recomputeTriggers()
      emit()
      return { applied: false, editStart: 0 }
    }

    if (result.trimmed && opts.trimEventOnClamp !== false) {
      onEvent({ type: 'paste-trimmed' })
    }

    const editStart = result.edit?.start ?? newSelection.start
    value = result.value
    tokens = result.tokens
    selection = snapSelectionToTokens(tokens, result.selection, previousSelection)

    if (result.edit) {
      shiftDismissedForEdit(
        result.edit.start,
        result.edit.oldEnd,
        result.edit.newEnd - result.edit.oldEnd,
      )
    }

    maybeCommitTypedEmoji()
    recomputeTriggers()
    if (!opts.programmatic) fireTypingSignal()
    scheduleDraftWrite()
    emit()
    return { applied: true, editStart }
  }

  function buildSubmissionTokens(): { plainText: string; tokens: ResolvedToken[] } {
    const plainText = payloadFor(value)
    const leading = value.length - value.trimStart().length
    const serialized = serializeTokens(value, tokens)
    return {
      plainText,
      tokens: serialized.tokens.map((t) => ({ ...t, start: t.start - leading, end: t.end - leading })),
    }
  }

  function commitSuggestion(index?: number): boolean {
    const match = activeMatch
    const menu = suggestions.state
    if (!match || !menu.isOpen) return false
    const item = menu.items[index ?? menu.activeIndex]
    if (!item) return false

    const display = match.trigger.toDisplay(item)
    if (config.maxLength !== undefined) {
      const replacedSpan = value.slice(match.symbolStart, match.caret)
      const nextLength =
        graphemeLength(value) - graphemeLength(replacedSpan) + graphemeLength(display)
      // A token commits whole or not at all — never a clamped half-token (E16).
      if (nextLength > config.maxLength) {
        onEvent({ type: 'insert-rejected', reason: 'max-length' })
        emit()
        return false
      }
    }

    const token: ComposerToken = {
      triggerId: match.trigger.id,
      symbol: match.trigger.symbol,
      id: item.id,
      label: item.display,
      display,
      metadata: item.metadata,
    }
    const committed = commitTokenAt({
      value,
      tokens,
      start: match.symbolStart,
      end: match.caret,
      token,
    })
    const delta = committed.value.length - value.length
    value = committed.value
    tokens = committed.tokens
    selection = committed.selection
    shiftDismissedForEdit(match.symbolStart, match.caret, delta)
    suggestions.cancelDeferredDismiss()
    activeMatch = null
    suggestions.sync(null)
    scheduleDraftWrite()
    emit()
    return true
  }

  function performSubmit(): ComposerSubmission | null {
    const counter = computeCounter(value, config.maxLength)
    const overBudget = counter.remaining !== null && counter.remaining < 0
    if (!computeCanSend({ text: value, attachments, disabled, readOnly, busy: isBusy }) || overBudget) {
      return null
    }

    const { plainText, tokens: submissionTokens } = buildSubmissionTokens()
    if (config.validator) {
      const verdict = config.validator(plainText, submissionTokens)
      if (!verdict.isValid) {
        // Draft-preserving: surface the reason, leave the value untouched.
        error = verdict.reason ?? 'Message failed validation'
        emit()
        return null
      }
    }

    const submission: ComposerSubmission = {
      plainText,
      tokens: submissionTokens,
      attachments: [...attachments],
      replyToMessageId: config.replyToMessageId,
      ...(mode === 'edit' ? { editingMessageId } : {}),
    }

    // Optimistic: snapshot then clear synchronously; transport is host-owned.
    value = ''
    tokens = []
    attachments = []
    selection = { start: 0, end: 0 }
    error = null
    activeMatch = null
    dismissed = []
    clipShadow = null
    mode = 'compose'
    editingMessageId = undefined
    preEditSnapshot = null
    suggestions.close()
    clearPersistedDraft()
    emit()
    return submission
  }

  // --- public API ----------------------------------------------------------------

  const api: ComposerAPI = {
    getState(): ComposerState {
      return buildState()
    },

    subscribe(listener: (state: ComposerState) => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    setValue(text, sel, opts): void {
      if (destroyed || disabled) return
      if (readOnly) {
        // Value is immutable via the user path; selection moves are allowed.
        if (text === value && sel) api.setSelection(sel)
        return
      }
      const nextSelection = sel ?? { start: text.length, end: text.length }
      mutateValue(text, nextSelection, { programmatic: opts?.programmatic })
    },

    setSelection(sel): void {
      if (destroyed || disabled) return
      const previous = selection
      selection = snapSelectionToTokens(tokens, {
        start: Math.max(0, Math.min(sel.start, value.length)),
        end: Math.max(0, Math.min(sel.end, value.length)),
      }, previous)
      // Any caret move re-evaluates the trigger (closes when leaving its range).
      recomputeTriggers()
      emit()
    },

    insertTextAtCursor(text): void {
      if (destroyed) return
      if (disabled) {
        onEvent({ type: 'insert-rejected', reason: 'disabled' })
        return
      }
      if (readOnly) {
        onEvent({ type: 'insert-rejected', reason: 'read-only' })
        return
      }
      if (isComposing) {
        // Splicing into an active composition corrupts the candidate — no-op.
        onEvent({ type: 'insert-rejected', reason: 'composing' })
        return
      }
      if (config.maxLength !== undefined) {
        const range = expandRangeOverTokens(tokens, selection)
        const base =
          graphemeLength(value.slice(0, range.start)) + graphemeLength(value.slice(range.end))
        // All-or-nothing: a programmatic insert is rejected, never truncated.
        if (base + graphemeLength(text) > config.maxLength) {
          onEvent({ type: 'insert-rejected', reason: 'max-length' })
          return
        }
      }
      const nextText = value.slice(0, selection.start) + text + value.slice(selection.end)
      const caret = selection.start + text.length
      mutateValue(nextText, { start: caret, end: caret })
    },

    setComposing(composing): void {
      if (destroyed || isComposing === composing) return
      isComposing = composing
      if (!composing) {
        // Re-run everything suspended during composition (R5/C12): clamp the
        // now-committed text, re-detect triggers, resume drafts.
        if (config.maxLength !== undefined && graphemeLength(value) > config.maxLength) {
          value = clampGraphemes(value, config.maxLength)
          tokens = tokens.filter((t) => t.end <= value.length)
          selection = {
            start: Math.min(selection.start, value.length),
            end: Math.min(selection.end, value.length),
          }
        }
        maybeCommitTypedEmoji()
        recomputeTriggers()
        scheduleDraftWrite()
      } else {
        activeMatch = null
        suggestions.sync(null)
      }
      emit()
    },

    applyEnter({ shiftPressed }): EnterResult {
      if (destroyed || disabled || readOnly) return 'noop'
      const menu = suggestions.state
      if (menu.isOpen && !isComposing) {
        // While the menu is open Enter always commits, never submits (D11).
        if (menu.items.length > 0) {
          return commitSuggestion() ? 'committed-suggestion' : 'noop'
        }
        return 'noop'
      }
      if (!shouldSubmitOnEnter({ shiftPressed, isComposing })) {
        // 'newline' asks the adapter to let the native key insert; while
        // composing the IME owns Enter entirely, so report 'noop'.
        return isComposing ? 'noop' : 'newline'
      }
      return performSubmit() ? 'submitted' : 'noop'
    },

    moveSuggestionNext(): void {
      suggestions.moveNext()
      emit()
    },

    moveSuggestionPrevious(): void {
      suggestions.movePrevious()
      emit()
    },

    setSuggestionActiveIndex(index): void {
      suggestions.setActiveIndex(index)
      emit()
    },

    applySuggestion(index): void {
      commitSuggestion(index)
    },

    dismissSuggestion(): void {
      if (activeMatch) {
        // Escape marks this occurrence dismissed — it will not re-arm until
        // the symbol is deleted and retyped (C9).
        dismissed.push({ triggerId: activeMatch.trigger.id, symbolStart: activeMatch.symbolStart })
        activeMatch = null
      }
      suggestions.close()
      emit()
    },

    dismissSuggestionDeferred(): void {
      suggestions.dismissDeferred(() => {
        // Blur-close: no dismissal marking — the next mutation may re-arm.
        activeMatch = null
        emit()
      })
    },

    retrySuggestions(): void {
      suggestions.retry()
      emit()
    },

    addAttachment(draft): string | null {
      if (destroyed) return null
      if (config.maxAttachments !== undefined && attachments.length >= config.maxAttachments) {
        onEvent({ type: 'attachment-rejected', reason: 'max-attachments', name: draft.name })
        return null
      }
      if (
        config.maxAttachmentSizeBytes !== undefined &&
        draft.sizeBytes !== undefined &&
        draft.sizeBytes > config.maxAttachmentSizeBytes
      ) {
        onEvent({ type: 'attachment-rejected', reason: 'max-size', name: draft.name })
        return null
      }
      if (config.acceptAttachment) {
        const verdict = config.acceptAttachment(draft)
        if (verdict !== true) {
          onEvent({
            type: 'attachment-rejected',
            reason: 'not-accepted',
            name: draft.name,
            ...(typeof verdict === 'string' ? { detail: verdict } : {}),
          })
          return null
        }
      }
      const id = draft.id ?? generateId('rfr-attachment')
      attachments = [...attachments, { ...draft, id, status: draft.status ?? 'pending' }]
      scheduleDraftWrite()
      emit()
      return id
    },

    updateAttachment(id, patch): void {
      if (destroyed) return
      attachments = attachments.map((a) => (a.id === id ? { ...a, ...patch, id } : a))
      emit()
    },

    removeAttachment(id): void {
      if (destroyed) return
      attachments = attachments.filter((a) => a.id !== id)
      scheduleDraftWrite()
      emit()
    },

    setBusy(busy): void {
      if (destroyed || isBusy === busy) return
      isBusy = busy
      emit()
    },

    setError(nextError): void {
      if (destroyed) return
      error = nextError
      emit()
    },

    setDisabled(nextDisabled): void {
      if (destroyed || disabled === nextDisabled) return
      disabled = nextDisabled
      if (disabled) {
        activeMatch = null
        suggestions.close()
      }
      emit()
    },

    setReadOnly(nextReadOnly): void {
      if (destroyed || readOnly === nextReadOnly) return
      readOnly = nextReadOnly
      if (readOnly) {
        activeMatch = null
        suggestions.close()
      }
      emit()
    },

    beginEdit({ value: editValue, tokens: editTokens, messageId }): void {
      if (destroyed || disabled) return
      preEditSnapshot = { value, tokens: [...tokens], selection, attachments: [...attachments] }
      mode = 'edit'
      editingMessageId = messageId
      value = editValue
      tokens = [...(editTokens ?? [])]
      selection = { start: value.length, end: value.length }
      activeMatch = null
      dismissed = []
      suggestions.close()
      emit()
    },

    cancelEdit(): void {
      if (destroyed || mode !== 'edit') return
      const snapshot = preEditSnapshot
      mode = 'compose'
      editingMessageId = undefined
      preEditSnapshot = null
      if (snapshot) {
        value = snapshot.value
        tokens = snapshot.tokens
        selection = snapshot.selection
        attachments = snapshot.attachments
      }
      activeMatch = null
      suggestions.close()
      emit()
    },

    copySelection(): string {
      // Tokens copy as their display text — the value already inlines it.
      return value.slice(selection.start, selection.end)
    },

    cutSelection(): string {
      if (destroyed || disabled || readOnly) return ''
      if (selection.start === selection.end) return ''
      const range = expandRangeOverTokens(tokens, selection)
      const text = value.slice(range.start, range.end)
      // Clip shadow: same-instance paste can restore live tokens (E12).
      clipShadow = {
        text,
        tokens: tokens
          .filter((t) => t.start >= range.start && t.end <= range.end)
          .map((t) => ({ ...t, start: t.start - range.start, end: t.end - range.start })),
      }
      const nextText = value.slice(0, range.start) + value.slice(range.end)
      mutateValue(nextText, { start: range.start, end: range.start })
      return text
    },

    pasteText(text): void {
      if (destroyed || disabled || readOnly) return
      const shadow = clipShadow
      const range = expandRangeOverTokens(tokens, selection)
      const nextText = value.slice(0, range.start) + text + value.slice(range.end)
      const caret = range.start + text.length
      const before = value
      mutateValue(nextText, { start: caret, end: caret }, { trimEventOnClamp: true })
      // Restore cut tokens only for an exact, untrimmed same-instance paste;
      // pasted look-alike text is never auto-tokenized (E11).
      if (
        shadow &&
        text === shadow.text &&
        value === before.slice(0, range.start) + text + before.slice(range.end)
      ) {
        const restored = shadow.tokens.map((t) => ({
          ...t,
          start: t.start + range.start,
          end: t.end + range.start,
        }))
        tokens = [...tokens, ...restored].sort((a, b) => a.start - b.start)
        emit()
      }
    },

    submit(): ComposerSubmission | null {
      if (destroyed) return null
      return performSubmit()
    },

    reset(): void {
      if (destroyed) return
      cancelDraftWrite()
      suggestions.close()
      value = config.initialValue ?? ''
      tokens = [...(config.initialTokens ?? [])]
      selection = { start: value.length, end: value.length }
      isComposing = false
      isBusy = false
      error = null
      attachments = []
      mode = 'compose'
      editingMessageId = undefined
      preEditSnapshot = null
      activeMatch = null
      dismissed = []
      clipShadow = null
      lastTypingAt = Number.NEGATIVE_INFINITY
      recomputeTriggers()
      emit()
    },

    serialize(): ComposerOutput {
      return serializeTokens(value, tokens)
    },

    destroy(): void {
      if (destroyed) return
      cancelDraftWrite()
      suggestions.destroy()
      listeners.clear()
      destroyed = true
    },
  }

  // Hydration determinism (§6.7): suggestion.isOpen starts false — the menu
  // only opens on the first user interaction, never at create time.
  return api
}
