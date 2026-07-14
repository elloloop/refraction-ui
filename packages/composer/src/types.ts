/**
 * Public types for the headless chat composer core.
 *
 * The composer models a single growing message buffer (flat string + selection)
 * with inline triggers (@mention, /command, :emoji:, #tag, custom), committed
 * atomic tokens, staged attachments, and one optimistic submit. Framework
 * adapters (React/Astro/Flutter) wrap this contract without re-implementing
 * any behavior.
 */

import type { MessageAttachment } from '@refraction-ui/conversation'

// ---------------------------------------------------------------------------
// Triggers & suggestions
// ---------------------------------------------------------------------------

/** Where a trigger symbol is allowed to arm. */
export type ComposerTriggerScope = 'anywhere' | 'startOfLine' | 'startOfMessage'

/** A candidate shown in the suggestion menu for an armed trigger. */
export interface ComposerCandidate {
  id: string
  display: string
  subtitle?: string
  metadata?: Record<string, unknown>
}

export type ComposerTriggerResolver = (
  query: string,
) => ComposerCandidate[] | Promise<ComposerCandidate[]>

/**
 * A trigger is configuration, not code — the engine is symbol-agnostic and
 * never special-cases '@' / '/' / ':' in control flow.
 */
export interface ComposerTrigger {
  id: string
  /** Trigger symbol; any length ('@', '/', '#', '!!'). */
  symbol: string
  /** Default 'anywhere'. Slash-style commands use 'startOfMessage'. */
  scope?: ComposerTriggerScope
  /** Extra validation for the query; a violating query closes the trigger. */
  queryPattern?: RegExp
  /** Queries longer than this silently cancel the trigger. Default 40. */
  maxQueryLength?: number
  /** Default true. '#'-style triggers set false so '#weekend trip' stays armed. */
  closeOnSpace?: boolean
  /** Default false. Trades away email/URL protection — must be justified. */
  allowMidWord?: boolean
  /** Additional boundary characters allowed before the symbol (e.g. '(' or '"'). */
  extraBoundaryChars?: string[]
  /** Resolver debounce in ms. Default 0 (sync/local resolvers). */
  debounceMs?: number
  /** Visible slice size for the adapter's menu. Default 6. */
  maxVisibleResults?: number
  /** Whether ArrowUp/Down wrap around the ends. Default true. */
  wrapNavigation?: boolean
  /**
   * Builds the committed token's display text. Defaults to `symbol + display`
   * ('@Jordan Lee'); the emoji recipe returns the unicode itself.
   */
  toDisplay?: (candidate: ComposerCandidate) => string
  resolve: ComposerTriggerResolver
}

/** A committed, atomic inline unit (identity + frozen display). */
export interface ComposerToken {
  triggerId: string
  symbol: string
  id: string
  label: string
  display: string
  metadata?: Record<string, unknown>
}

/** A token placed in the value, with its live UTF-16 range. */
export interface PlacedToken extends ComposerToken {
  start: number
  end: number
}

/** Structured output token with derived UTF-16 offsets into plainText. */
export interface ResolvedToken {
  type: string
  id: string
  display: string
  start: number
  end: number
}

// ---------------------------------------------------------------------------
// Attachments
// ---------------------------------------------------------------------------

export type ComposerAttachmentKind = 'text' | 'image' | 'video' | 'audio' | 'file'
export type ComposerAttachmentStatus = 'pending' | 'uploading' | 'ready' | 'error'

export interface ComposerAttachment {
  id: string
  kind: ComposerAttachmentKind
  name: string
  mimeType?: string
  sizeBytes?: number
  previewUrl?: string
  status: ComposerAttachmentStatus
  /** 0..1 while uploading. */
  progress?: number
  errorMessage?: string
  metadata?: Record<string, unknown>
}

/** Input to `addAttachment` — id/status are core-owned defaults. */
export type ComposerAttachmentDraft = Omit<ComposerAttachment, 'id' | 'status'> & {
  id?: string
  status?: ComposerAttachmentStatus
}

// ---------------------------------------------------------------------------
// Submission & serialization
// ---------------------------------------------------------------------------

export interface ComposerSubmission {
  /** Trimmed message text with token displays inlined. */
  plainText: string
  tokens: ResolvedToken[]
  attachments: ComposerAttachment[]
  replyToMessageId?: string
  /** Present when submitting from edit mode. */
  editingMessageId?: string
}

export interface ComposerOutput {
  plainText: string
  tokens: ResolvedToken[]
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface ComposerSelection {
  start: number
  end: number
}

export interface ActiveTriggerState {
  triggerId: string
  symbol: string
  symbolStart: number
  caret: number
  query: string
}

export interface SuggestionState {
  isOpen: boolean
  /** Full result list (overflow intact). */
  items: ComposerCandidate[]
  /** `items` sliced to the trigger's maxVisibleResults for the adapter. */
  visibleItems: ComposerCandidate[]
  activeIndex: number
  loading: boolean
  error: string | null
  /** Monotonic id of the latest resolve request (staleness guard). */
  requestToken: number
}

export interface CounterState {
  /** Visible once remaining budget is within 20% of maxLength. */
  visible: boolean
  /** Remaining grapheme budget; null without a maxLength. */
  remaining: number | null
  overLimit: boolean
}

export type ComposerMode = 'compose' | 'edit'

export interface ComposerState {
  value: string
  selection: ComposerSelection
  isComposing: boolean
  isBusy: boolean
  disabled: boolean
  readOnly: boolean
  isEmpty: boolean
  canSend: boolean
  error: string | null
  attachments: ComposerAttachment[]
  tokens: PlacedToken[]
  activeTrigger: ActiveTriggerState | null
  suggestion: SuggestionState
  counter: CounterState
  mode: ComposerMode
  editingMessageId?: string
}

// ---------------------------------------------------------------------------
// Validation, drafts, events, config
// ---------------------------------------------------------------------------

export interface ComposerValidationResult {
  isValid: boolean
  reason?: string
}

export type ComposerValidator = (
  plainText: string,
  tokens: ResolvedToken[],
) => ComposerValidationResult

/** Persisted draft snapshot (attachments by id only — blobs are host-owned). */
export interface ComposerDraft {
  value: string
  tokens: PlacedToken[]
  attachmentIds: string[]
  updatedAt: number
}

/** Injected persistence seam; the core ships only an in-memory default. */
export interface ComposerDraftStore {
  read(key: string): ComposerDraft | null
  write(key: string, draft: ComposerDraft): void
  clear(key: string): void
}

export type ComposerEvent =
  | { type: 'paste-trimmed' }
  | { type: 'insert-rejected'; reason: 'max-length' | 'composing' | 'disabled' | 'read-only' }
  | { type: 'edit-rejected'; reason: 'inside-token' }
  | { type: 'attachment-rejected'; reason: 'max-attachments' | 'max-size' | 'not-accepted'; name: string; detail?: string }
  | { type: 'typing' }

export interface ComposerConfig {
  initialValue?: string
  /** Tokens present in initialValue (e.g. when re-opening a draft the host owns). */
  initialTokens?: PlacedToken[]
  /** Grapheme-cluster budget (not UTF-16 units). */
  maxLength?: number
  maxAttachments?: number
  /** Per-attachment size gate; larger drafts are rejected with an event. */
  maxAttachmentSizeBytes?: number
  /** Predicate gate; return false or a reason string to reject a draft. */
  acceptAttachment?: (draft: ComposerAttachmentDraft) => boolean | string
  minLines?: number
  maxLines?: number
  triggers?: ComposerTrigger[]
  validator?: ComposerValidator
  draftStore?: ComposerDraftStore
  draftKey?: string
  /** Draft autosave debounce. Default 400ms. */
  draftDebounceMs?: number
  /** Leading-edge throttle for the 'typing' event. Default 3000ms. */
  typingSignalIntervalMs?: number
  replyToMessageId?: string
  /** Injected clock — the core never calls Date.now() in logic paths. */
  now?: () => number
  /** Injected id factory — the core never calls Math.random(). */
  generateId?: (prefix?: string) => string
  /** Notice channel ('paste-trimmed', 'attachment-rejected', 'typing', …). */
  onEvent?: (event: ComposerEvent) => void
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/** Outcome of a physical Enter press routed through the core. */
export type EnterResult = 'submitted' | 'newline' | 'committed-suggestion' | 'noop'

export interface ComposerAPI {
  getState(): ComposerState
  subscribe(listener: (state: ComposerState) => void): () => void

  /**
   * The adapter's input path: full new text + selection after a user edit.
   * Pass `{ programmatic: true }` for host-driven writes (suppresses the
   * typing signal).
   */
  setValue(text: string, selection?: ComposerSelection, opts?: { programmatic?: boolean }): void
  /** Caret/selection move without a text change (allowed while readOnly). */
  setSelection(selection: ComposerSelection): void
  insertTextAtCursor(text: string): void
  setComposing(isComposing: boolean): void

  /** Routes a physical Enter; the return value tells the adapter whether to preventDefault. */
  applyEnter(opts: { shiftPressed: boolean }): EnterResult

  moveSuggestionNext(): void
  moveSuggestionPrevious(): void
  /** Pointer hover — last-input-wins with the keyboard. */
  setSuggestionActiveIndex(index: number): void
  applySuggestion(index?: number): void
  /** Escape-style dismissal: closes now and marks the occurrence dismissed. */
  dismissSuggestion(): void
  /** Blur-style dismissal: closes after a short grace so a click can land. */
  dismissSuggestionDeferred(): void
  retrySuggestions(): void

  addAttachment(draft: ComposerAttachmentDraft): string | null
  updateAttachment(id: string, patch: Partial<Omit<ComposerAttachment, 'id'>>): void
  removeAttachment(id: string): void

  setBusy(busy: boolean): void
  setError(error: string | null): void
  setDisabled(disabled: boolean): void
  setReadOnly(readOnly: boolean): void

  beginEdit(args: { value: string; tokens?: PlacedToken[]; messageId: string }): void
  cancelEdit(): void

  /** Clipboard seam: returns the selected display text. */
  copySelection(): string
  /** Clipboard seam: removes the selection, retaining token identity for same-instance paste. */
  cutSelection(): string
  /** Clipboard seam: plain-text insert at caret (clamped); restores tokens only for a same-instance cut. */
  pasteText(text: string): void

  submit(): ComposerSubmission | null
  reset(): void
  serialize(): ComposerOutput
  destroy(): void
}

/**
 * Bridge to the conversation layer: a ready composer attachment mapped onto
 * `@refraction-ui/conversation`'s wire shape.
 */
export function toMessageAttachment(attachment: ComposerAttachment): MessageAttachment {
  return {
    id: attachment.id,
    name: attachment.name,
    url: attachment.previewUrl ?? '',
    type: attachment.mimeType ?? attachment.kind,
    size: attachment.sizeBytes,
  }
}

export type { MessageAttachment }
