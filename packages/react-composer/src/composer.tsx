import * as React from 'react'
import {
  composerAttachmentChipVariants,
  composerCounterVariants,
  composerFieldClass,
  composerMenuClass,
  composerMenuItemVariants,
  composerPrimaryActionVariants,
  composerSurfaceVariants,
  composerTokenPillClass,
  composerTrayClass,
} from '@refraction-ui/composer'
import type {
  ComposerAPI,
  ComposerAttachment,
  ComposerAttachmentDraft,
  ComposerAttachmentKind,
  ComposerCandidate,
  ComposerConfig,
  ComposerDraftStore,
  ComposerEvent,
  ComposerSubmission,
  ComposerTrigger,
  ComposerValidator,
  PlacedToken,
} from '@refraction-ui/composer'
import { cn, generateId } from '@refraction-ui/shared'
import { useComposer } from './use-composer.js'

// ---------------------------------------------------------------------------
// Layout constants (single source for the measure-free auto-grow math)
// ---------------------------------------------------------------------------

/** Unitless line-height applied to both the textarea and its mirror. */
const FIELD_LINE_HEIGHT = 1.5
/** Total vertical padding of `composerFieldClass` (`py-3` = 0.75rem × 2). */
const FIELD_VERTICAL_PADDING_REM = 1.5
/** How long the "paste was trimmed" notice stays visible. */
const TRIMMED_NOTICE_HIDE_MS = 4000

function fieldHeightFor(lines: number): string {
  return `calc(${lines * FIELD_LINE_HEIGHT}em + ${FIELD_VERTICAL_PADDING_REM}rem)`
}

// ---------------------------------------------------------------------------
// Strings
// ---------------------------------------------------------------------------

/** All user-facing text; every entry is overridable via the `strings` prop. */
export interface RefractionComposerStrings {
  /** Accessible name of the whole composer landmark. */
  composerLabel: string
  /** Accessible name of the message textarea (independent of the placeholder). */
  messageLabel: string
  sendLabel: string
  stopLabel: string
  attachLabel: string
  removeAttachmentLabel: (name: string) => string
  /** Accessible name of the suggestion listbox. */
  suggestionsLabel: string
  noMatchesLabel: (query: string) => string
  loadingLabel: string
  retryLabel: string
  trimmedNotice: string
  counterLabel: (remaining: number) => string
  editingLabel: string
  cancelEditLabel: string
  /** Live-region announcement while the suggestion menu shows results. */
  resultsAnnouncement: (count: number) => string
}

export const DEFAULT_COMPOSER_STRINGS: RefractionComposerStrings = {
  composerLabel: 'Message composer',
  messageLabel: 'Message',
  sendLabel: 'Send',
  stopLabel: 'Stop',
  attachLabel: 'Attach a file',
  removeAttachmentLabel: (name) => `Remove attachment ${name}`,
  suggestionsLabel: 'Suggestions',
  noMatchesLabel: (query) => `No matches for "${query}"`,
  loadingLabel: 'Loading suggestions…',
  retryLabel: 'Retry',
  trimmedNotice: 'Pasted text was trimmed to fit the length limit',
  counterLabel: (remaining) => `${remaining} characters remaining`,
  editingLabel: 'Editing message',
  cancelEditLabel: 'Cancel edit',
  resultsAnnouncement: (count) => `${count} suggestions available`,
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PrimaryActionContext {
  hasText: boolean
  canSend: boolean
  busy: boolean
}

export interface SuggestionRenderContext {
  active: boolean
  index: number
}

export interface RefractionComposerProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'onChange' | 'defaultValue' | 'onSubmit' | 'onError' | 'content' | 'placeholder' | 'dir'
  > {
  /** Controlled value. When set, the prop wins over internal edits. */
  value?: string
  /** Initial value for uncontrolled usage. */
  defaultValue?: string
  /** Fired with the new text after every user-driven change (incl. submit clearing). */
  onChange?: (value: string) => void
  placeholder?: string
  /** Distinct placeholder shown while disabled. Falls back to `placeholder`. */
  disabledPlaceholder?: string
  /** Rows shown when empty. Default 1. */
  minLines?: number
  /** Auto-grow ceiling; the field scrolls internally beyond it. Default 6. */
  maxLines?: number
  /** Grapheme-cluster budget (not UTF-16 units). Fixed at mount. */
  maxLength?: number
  maxAttachments?: number
  disabled?: boolean
  readOnly?: boolean
  /** Busy/streaming: swaps the default send button for a stop button. */
  busy?: boolean
  onStop?: () => void
  autoFocus?: boolean
  dir?: 'ltr' | 'rtl' | 'auto'
  /** Trigger configs (mention '@', slash '/', emoji ':', …). Fixed at mount. */
  triggers?: ComposerTrigger[]
  /**
   * Whether a plain Enter submits. Defaults to true (SSR-deterministic);
   * after mount a coarse pointer (`(pointer: coarse)`) flips the default to
   * false. An explicit prop always wins.
   */
  submitOnEnter?: boolean
  strings?: Partial<RefractionComposerStrings>
  /** Rendered at the start of the action row (e.g. an attach button). */
  leading?: React.ReactNode
  /** Rendered at the end of the action row, before the primary action. */
  trailing?: React.ReactNode
  /** Replaces the built-in send/stop primary action. */
  primaryAction?: (context: PrimaryActionContext) => React.ReactNode
  /** Custom row content for suggestion menu items. */
  renderSuggestion?: (candidate: ComposerCandidate, context: SuggestionRenderContext) => React.ReactNode
  /** Attachments staged at creation (SSR-deterministic, e.g. restored drafts). */
  initialAttachments?: ComposerAttachmentDraft[]
  draftStore?: ComposerDraftStore
  draftKey?: string
  validator?: ComposerValidator
  replyToMessageId?: string
  onSubmit?: (submission: ComposerSubmission) => void
  /** ArrowUp on an empty field (desktop edit-last affordance). */
  onEditLastRequested?: () => void
  /** Escape pressed while in edit mode (after the core restores the draft). */
  onEditCancel?: () => void
  /** Throttled typing signal (core-owned leading-edge throttle). */
  onTypingActivity?: () => void
  onAttachmentAdd?: (attachment: ComposerAttachment) => void
  onAttachmentRejected?: (event: Extract<ComposerEvent, { type: 'attachment-rejected' }>) => void
  /** Raw core notice channel ('paste-trimmed', 'insert-rejected', …). */
  onEvent?: (event: ComposerEvent) => void
  /** Receives the composer core for imperative use (beginEdit, addAttachment, …). */
  apiRef?: React.Ref<ComposerAPI>
  id?: string
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function useLatestRef<T>(value: T): React.RefObject<T> {
  const ref = React.useRef(value)
  ref.current = value
  return ref
}

function kindFromMime(mimeType: string): ComposerAttachmentKind {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  return 'file'
}

interface ValueSegment {
  key: string
  text: string
  isToken: boolean
}

/** Split the flat value at committed token ranges for the highlight mirror. */
function segmentValue(value: string, tokens: readonly PlacedToken[]): ValueSegment[] {
  const segments: ValueSegment[] = []
  let cursor = 0
  for (const token of tokens) {
    if (token.start > cursor) {
      segments.push({ key: `p${cursor}`, text: value.slice(cursor, token.start), isToken: false })
    }
    segments.push({ key: `t${token.start}`, text: value.slice(token.start, token.end), isToken: true })
    cursor = token.end
  }
  if (cursor < value.length) {
    segments.push({ key: `p${cursor}`, text: value.slice(cursor), isToken: false })
  }
  return segments
}

const iconSvgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

function IconArrowUp() {
  return (
    <svg {...iconSvgProps}>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  )
}

function IconStop() {
  return (
    <svg {...iconSvgProps}>
      <rect x={7} y={7} width={10} height={10} rx={1.5} />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * RefractionComposer — the chat message composer.
 *
 * Wraps the headless `@refraction-ui/composer` core: flat value + selection,
 * atomic inline tokens (mention/slash/emoji triggers), attachments, drafts,
 * busy/stop, edit-in-place, and one optimistic submit. `ref` targets the
 * textarea; the core is reachable through `apiRef`.
 */
export const RefractionComposer = React.forwardRef<HTMLTextAreaElement, RefractionComposerProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onChange,
      placeholder,
      disabledPlaceholder,
      minLines = 1,
      maxLines = 6,
      maxLength,
      maxAttachments,
      disabled = false,
      readOnly = false,
      busy = false,
      onStop,
      autoFocus,
      dir,
      triggers,
      submitOnEnter,
      strings: stringsProp,
      leading,
      trailing,
      primaryAction,
      renderSuggestion,
      initialAttachments,
      draftStore,
      draftKey,
      validator,
      replyToMessageId,
      onSubmit,
      onEditLastRequested,
      onEditCancel,
      onTypingActivity,
      onAttachmentAdd,
      onAttachmentRejected,
      onEvent,
      apiRef,
      id,
      className,
      ...rest
    },
    forwardedRef,
  ) => {
    const strings = React.useMemo(
      () => ({ ...DEFAULT_COMPOSER_STRINGS, ...stringsProp }),
      [stringsProp],
    )

    // Latest-prop refs so the once-captured core config/events see fresh handlers.
    const onSubmitRef = useLatestRef(onSubmit)
    const onChangeRef = useLatestRef(onChange)
    const onStopRef = useLatestRef(onStop)
    const onEventRef = useLatestRef(onEvent)
    const onTypingActivityRef = useLatestRef(onTypingActivity)
    const onAttachmentAddRef = useLatestRef(onAttachmentAdd)
    const onAttachmentRejectedRef = useLatestRef(onAttachmentRejected)
    const onEditLastRequestedRef = useLatestRef(onEditLastRequested)
    const onEditCancelRef = useLatestRef(onEditCancel)

    const [trimmedNoticeVisible, setTrimmedNoticeVisible] = React.useState(false)
    const trimmedTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

    // One stable config object. The core reads maxLength/maxAttachments/
    // validator/replyToMessageId/draft fields lazily on each operation, so
    // updating the same object keeps them live; triggers and initialValue are
    // fixed at mount by design (the core resolves them once).
    const configRef = React.useRef<ComposerConfig | null>(null)
    if (configRef.current === null) {
      configRef.current = {
        initialValue: valueProp ?? defaultValue ?? '',
        minLines,
        maxLines,
        triggers,
        onEvent: (event) => {
          if (event.type === 'typing') onTypingActivityRef.current?.()
          if (event.type === 'attachment-rejected') onAttachmentRejectedRef.current?.(event)
          if (event.type === 'paste-trimmed') {
            setTrimmedNoticeVisible(true)
            if (trimmedTimerRef.current !== null) clearTimeout(trimmedTimerRef.current)
            trimmedTimerRef.current = setTimeout(() => {
              trimmedTimerRef.current = null
              setTrimmedNoticeVisible(false)
            }, TRIMMED_NOTICE_HIDE_MS)
          }
          onEventRef.current?.(event)
        },
      }
    }
    configRef.current.maxLength = maxLength
    configRef.current.maxAttachments = maxAttachments
    configRef.current.validator = validator
    configRef.current.replyToMessageId = replyToMessageId
    configRef.current.draftStore = draftStore
    configRef.current.draftKey = draftKey

    // Seed creation-time state (runs before the first snapshot, so SSR markup
    // already reflects attachments and the disabled/readOnly/busy props).
    const { state, api } = useComposer(configRef.current, (core) => {
      for (const draft of initialAttachments ?? []) core.addAttachment(draft)
      if (disabled) core.setDisabled(true)
      if (readOnly) core.setReadOnly(true)
      if (busy) core.setBusy(true)
    })

    React.useEffect(() => () => {
      if (trimmedTimerRef.current !== null) clearTimeout(trimmedTimerRef.current)
    }, [])

    // ---- refs / ids -------------------------------------------------------

    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const highlightRef = React.useRef<HTMLDivElement | null>(null)
    const mergedTextareaRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      },
      [forwardedRef],
    )

    const idBase = React.useRef(id ?? generateId('composer')).current
    const listId = `${idBase}-listbox`
    const optionId = (index: number) => `${idBase}-option-${index}`

    React.useEffect(() => {
      if (!apiRef) return
      if (typeof apiRef === 'function') {
        apiRef(api)
        return () => {
          apiRef(null)
        }
      }
      const mutableRef = apiRef as React.MutableRefObject<ComposerAPI | null>
      mutableRef.current = api
      return () => {
        mutableRef.current = null
      }
    }, [apiRef, api])

    // ---- prop → core sync -------------------------------------------------

    React.useEffect(() => {
      api.setDisabled(disabled)
    }, [api, disabled])
    React.useEffect(() => {
      api.setReadOnly(readOnly)
    }, [api, readOnly])
    React.useEffect(() => {
      api.setBusy(busy)
    }, [api, busy])

    // Controlled value: the prop wins. Re-runs on internal state changes too,
    // so an edit the parent ignored snaps back to the prop (like a native
    // controlled input, the snap-back itself does not re-fire onChange).
    React.useEffect(() => {
      if (valueProp === undefined) return
      const current = api.getState()
      if (current.disabled || current.readOnly || current.value === valueProp) return
      api.setValue(
        valueProp,
        { start: valueProp.length, end: valueProp.length },
        { programmatic: true },
      )
    }, [api, valueProp, state.value])

    // onChange fires synchronously inside the user-event paths (not from an
    // effect) so an echoing controlled parent updates in the same React batch
    // as the edit — an effect-based echo arrives after the controlled
    // snap-back and ping-pongs forever.
    const withValueChange = React.useCallback(
      <T,>(mutate: () => T): T => {
        const before = api.getState().value
        const result = mutate()
        const after = api.getState().value
        if (after !== before) onChangeRef.current?.(after)
        return result
      },
      [api, onChangeRef],
    )

    // submitOnEnter default: SSR-deterministic true; coarse pointers flip the
    // default after mount. An explicit prop always wins.
    const [coarsePointer, setCoarsePointer] = React.useState(false)
    React.useEffect(() => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
      const query = window.matchMedia('(pointer: coarse)')
      const update = () => setCoarsePointer(query.matches)
      update()
      query.addEventListener?.('change', update)
      return () => query.removeEventListener?.('change', update)
    }, [])
    const submitEnabled = submitOnEnter ?? !coarsePointer

    // The core may correct value/selection after any notify (atomic token
    // delete, clamp, snap): write the corrected selection back to the DOM.
    React.useEffect(() => {
      const el = textareaRef.current
      if (!el) return
      if (el.value !== state.value) el.value = state.value
      if (
        document.activeElement === el &&
        (el.selectionStart !== state.selection.start || el.selectionEnd !== state.selection.end)
      ) {
        el.setSelectionRange(state.selection.start, state.selection.end)
      }
    }, [state.value, state.selection.start, state.selection.end])

    // ---- event handlers ----------------------------------------------------

    const readSelection = (el: HTMLTextAreaElement) => ({
      start: el.selectionStart ?? el.value.length,
      end: el.selectionEnd ?? el.value.length,
    })

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const el = event.currentTarget
      withValueChange(() => api.setValue(el.value, readSelection(el)))
    }

    const handleSelect = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const el = event.currentTarget
      const next = readSelection(el)
      const current = api.getState().selection
      if (next.start !== current.start || next.end !== current.end) {
        api.setSelection(next)
      }
    }

    const submitNow = React.useCallback(() => {
      const submission = withValueChange(() => api.submit())
      if (submission) onSubmitRef.current?.(submission)
      return submission !== null
    }, [api, onSubmitRef, withValueChange])

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const snapshot = api.getState()
      const menuOpen = snapshot.suggestion.isOpen && !snapshot.isComposing
      const hasMenuItems = snapshot.suggestion.items.length > 0

      if (menuOpen) {
        if (event.key === 'ArrowDown' && hasMenuItems) {
          event.preventDefault()
          api.moveSuggestionNext()
          return
        }
        if (event.key === 'ArrowUp' && hasMenuItems) {
          event.preventDefault()
          api.moveSuggestionPrevious()
          return
        }
        if (event.key === 'Tab' && hasMenuItems) {
          event.preventDefault()
          withValueChange(() => api.applySuggestion())
          return
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          api.dismissSuggestion()
          return
        }
      }

      if (event.key === 'Escape' && !menuOpen && snapshot.mode === 'edit') {
        event.preventDefault()
        withValueChange(() => api.cancelEdit())
        onEditCancelRef.current?.()
        return
      }

      if (
        event.key === 'ArrowUp' &&
        !menuOpen &&
        !snapshot.isComposing &&
        snapshot.value === '' &&
        onEditLastRequestedRef.current
      ) {
        event.preventDefault()
        onEditLastRequestedRef.current()
        return
      }

      if (event.key === 'Enter') {
        if (menuOpen) {
          // While the menu is open Enter always commits, never submits —
          // and never inserts a native newline.
          event.preventDefault()
          withValueChange(() => api.applyEnter({ shiftPressed: event.shiftKey }))
          return
        }
        // While composing the IME owns Enter entirely (core reports 'noop').
        if (snapshot.isComposing) return
        // Shift+Enter — and any Enter on touch modality — is a native newline.
        if (event.shiftKey || !submitEnabled) return
        // Guarded submit: whitespace-only/busy/disabled Enter is swallowed
        // (never a newline), matching the core's applyEnter contract.
        event.preventDefault()
        if (snapshot.disabled || snapshot.readOnly) return
        submitNow()
      }
    }

    const handleCompositionStart = () => api.setComposing(true)
    const handleCompositionEnd = () => withValueChange(() => api.setComposing(false))

    const handleCopy = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const text = api.copySelection()
      if (text === '') return
      event.preventDefault()
      event.clipboardData.setData('text/plain', text)
    }

    const handleCut = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      event.preventDefault()
      const text = withValueChange(() => api.cutSelection())
      if (text !== '') event.clipboardData.setData('text/plain', text)
    }

    const addFiles = React.useCallback(
      (files: ArrayLike<File>) => {
        for (const file of Array.from(files)) {
          const previewUrl =
            typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'
              ? URL.createObjectURL(file)
              : undefined
          const attachmentId = api.addAttachment({
            kind: kindFromMime(file.type),
            name: file.name,
            mimeType: file.type || undefined,
            sizeBytes: file.size,
            previewUrl,
          })
          if (attachmentId === null) {
            // Rejected by the core (limits/accept) — release the preview URL.
            if (previewUrl !== undefined) URL.revokeObjectURL(previewUrl)
            continue
          }
          const added = api.getState().attachments.find((a) => a.id === attachmentId)
          if (added) onAttachmentAddRef.current?.(added)
        }
      },
      [api, onAttachmentAddRef],
    )

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const files = event.clipboardData?.files
      if (files && files.length > 0) {
        // Mixed clipboard: files/images win over text (R23).
        event.preventDefault()
        addFiles(files)
        return
      }
      event.preventDefault()
      withValueChange(() => api.pasteText(event.clipboardData?.getData('text/plain') ?? ''))
    }

    const [dragActive, setDragActive] = React.useState(false)

    const dragHasPayload = (event: React.DragEvent) => {
      const types = event.dataTransfer ? Array.from(event.dataTransfer.types ?? []) : []
      return types.includes('Files') || types.includes('text/plain')
    }

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      if (!dragHasPayload(event)) return
      event.preventDefault()
      setDragActive(true)
    }

    const handleDragLeave = () => setDragActive(false)

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragActive(false)
      const transfer = event.dataTransfer
      if (!transfer) return
      if (transfer.files && transfer.files.length > 0) {
        addFiles(transfer.files)
        return
      }
      const text = transfer.getData('text/plain')
      if (text) withValueChange(() => api.pasteText(text))
    }

    const handleBlur = () => api.dismissSuggestionDeferred()

    const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
      if (highlightRef.current) {
        highlightRef.current.scrollTop = event.currentTarget.scrollTop
      }
    }

    // ---- derived render data ----------------------------------------------

    const hasTriggers = (triggers?.length ?? 0) > 0
    const menuOpen = state.suggestion.isOpen
    const visibleItems = state.suggestion.visibleItems
    const activeIndex = state.suggestion.activeIndex
    const hasText = state.value.trim().length > 0
    const effectivePlaceholder =
      state.disabled && disabledPlaceholder !== undefined ? disabledPlaceholder : placeholder
    const segments = React.useMemo(
      () => segmentValue(state.value, state.tokens),
      [state.value, state.tokens],
    )

    const primaryContext: PrimaryActionContext = {
      hasText,
      canSend: state.canSend,
      busy: state.isBusy,
    }

    const defaultPrimaryAction = state.isBusy ? (
      <button
        type="button"
        aria-label={strings.stopLabel}
        className={composerPrimaryActionVariants({ enabled: 'true' })}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onStopRef.current?.()}
      >
        <IconStop />
      </button>
    ) : (
      <button
        type="button"
        aria-label={strings.sendLabel}
        disabled={!state.canSend}
        className={composerPrimaryActionVariants({ enabled: state.canSend ? 'true' : 'false' })}
        onMouseDown={(event) => event.preventDefault()}
        onClick={submitNow}
      >
        <IconArrowUp />
      </button>
    )

    const menuBody = () => {
      if (state.suggestion.loading) {
        return (
          <div className="px-3 py-2 text-sm text-muted-foreground">{strings.loadingLabel}</div>
        )
      }
      if (state.suggestion.error !== null) {
        return (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-destructive">
            <span className="flex-1 truncate">{state.suggestion.error}</span>
            <button
              type="button"
              className="font-medium underline"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => api.retrySuggestions()}
            >
              {strings.retryLabel}
            </button>
          </div>
        )
      }
      if (visibleItems.length === 0) {
        return (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            {strings.noMatchesLabel(state.activeTrigger?.query ?? '')}
          </div>
        )
      }
      return visibleItems.map((candidate, index) => {
        const active = index === activeIndex
        return (
          <button
            key={candidate.id}
            type="button"
            role="option"
            id={optionId(index)}
            aria-selected={active}
            className={composerMenuItemVariants({ active: active ? 'true' : 'false' })}
            onMouseEnter={() => api.setSuggestionActiveIndex(index)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => withValueChange(() => api.applySuggestion(index))}
          >
            {renderSuggestion ? (
              renderSuggestion(candidate, { active, index })
            ) : (
              <>
                <span className="flex-1 truncate">{candidate.display}</span>
                {candidate.subtitle !== undefined && (
                  <span className="truncate text-xs text-muted-foreground">
                    {candidate.subtitle}
                  </span>
                )}
              </>
            )}
          </button>
        )
      })
    }

    return (
      <div
        {...rest}
        id={idBase}
        dir={dir}
        role="form"
        aria-label={strings.composerLabel}
        className={cn('relative', className)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {menuOpen && (
          <div
            id={listId}
            role="listbox"
            aria-label={strings.suggestionsLabel}
            className={cn(composerMenuClass, 'absolute bottom-full start-0 mb-2')}
          >
            {menuBody()}
          </div>
        )}

        <div
          data-dragover={dragActive ? '' : undefined}
          className={cn(
            composerSurfaceVariants({
              disabled: state.disabled ? 'true' : 'false',
              error: state.error !== null ? 'true' : 'false',
            }),
            dragActive && 'border-primary/60 shadow-md',
          )}
        >
          {state.error !== null && (
            <div
              role="alert"
              className="flex items-center gap-2 border-b border-border bg-destructive/5 px-3 py-2 text-xs text-destructive"
            >
              <span className="flex-1 truncate">{state.error}</span>
            </div>
          )}

          {state.mode === 'edit' && (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs text-muted-foreground">
              <span className="flex-1 truncate">{strings.editingLabel}</span>
              <button
                type="button"
                className="font-medium underline"
                onClick={() => {
                  withValueChange(() => api.cancelEdit())
                  onEditCancelRef.current?.()
                }}
              >
                {strings.cancelEditLabel}
              </button>
            </div>
          )}

          {trimmedNoticeVisible && (
            <div role="status" className="px-3 pt-2 text-xs text-muted-foreground">
              {strings.trimmedNotice}
            </div>
          )}

          {state.attachments.length > 0 && (
            <div className={composerTrayClass}>
              {state.attachments.map((attachment) => (
                <span
                  key={attachment.id}
                  className={composerAttachmentChipVariants({ status: attachment.status })}
                >
                  {attachment.name}
                  <button
                    type="button"
                    aria-label={strings.removeAttachmentLabel(attachment.name)}
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      api.removeAttachment(attachment.id)
                      if (
                        attachment.previewUrl !== undefined &&
                        typeof URL !== 'undefined' &&
                        typeof URL.revokeObjectURL === 'function'
                      ) {
                        URL.revokeObjectURL(attachment.previewUrl)
                      }
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative">
            {/* Height driver + token highlight mirror: an in-flow copy of the
                value gives measure-free auto-grow (its height IS the content
                height between the min/max rails); token spans paint the pill
                background while the transparent text keeps glyph metrics
                identical to the textarea stacked above it. */}
            <div
              ref={highlightRef}
              aria-hidden="true"
              className={cn(
                composerFieldClass,
                'pointer-events-none overflow-hidden whitespace-pre-wrap break-words text-transparent',
              )}
              style={{
                lineHeight: FIELD_LINE_HEIGHT,
                minHeight: fieldHeightFor(minLines),
                maxHeight: fieldHeightFor(maxLines),
              }}
            >
              {segments.map((segment) =>
                segment.isToken ? (
                  <span
                    key={segment.key}
                    data-token=""
                    className={cn(composerTokenPillClass, 'px-0 text-transparent')}
                  >
                    <bdi>{segment.text}</bdi>
                  </span>
                ) : (
                  <span key={segment.key}>{segment.text}</span>
                ),
              )}
              {'\u200b'}
            </div>
            <textarea
              ref={mergedTextareaRef}
              id={`${idBase}-input`}
              rows={minLines}
              value={state.value}
              placeholder={effectivePlaceholder}
              disabled={state.disabled}
              readOnly={state.readOnly}
              autoFocus={autoFocus}
              aria-multiline="true"
              aria-label={strings.messageLabel}
              {...(hasTriggers
                ? {
                    'aria-autocomplete': 'list' as const,
                    'aria-expanded': menuOpen,
                    'aria-controls': listId,
                    'aria-activedescendant':
                      menuOpen && visibleItems.length > 0 ? optionId(activeIndex) : undefined,
                  }
                : {})}
              className={cn(
                composerFieldClass,
                'absolute inset-0 h-full overflow-y-auto rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              )}
              style={{ lineHeight: FIELD_LINE_HEIGHT, maxHeight: fieldHeightFor(maxLines) }}
              onChange={handleChange}
              onSelect={handleSelect}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onCopy={handleCopy}
              onCut={handleCut}
              onPaste={handlePaste}
              onBlur={handleBlur}
              onScroll={handleScroll}
            />
          </div>

          <div className="flex items-center gap-0.5 px-2 pb-2">
            {leading}
            <div className="flex-1" />
            {state.counter.visible && state.counter.remaining !== null && (
              <div
                aria-live={state.counter.overLimit ? 'polite' : undefined}
                className={cn(
                  composerCounterVariants({
                    overLimit: state.counter.overLimit ? 'true' : 'false',
                  }),
                  'me-2',
                )}
              >
                {strings.counterLabel(state.counter.remaining)}
              </div>
            )}
            {trailing}
            {primaryAction ? primaryAction(primaryContext) : defaultPrimaryAction}
          </div>
        </div>

        <div aria-live="polite" className="sr-only">
          {menuOpen && !state.suggestion.loading && state.suggestion.error === null
            ? visibleItems.length === 0
              ? strings.noMatchesLabel(state.activeTrigger?.query ?? '')
              : strings.resultsAnnouncement(visibleItems.length)
            : ''}
        </div>
      </div>
    )
  },
)

RefractionComposer.displayName = 'RefractionComposer'
