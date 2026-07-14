/**
 * Suggestion menu state (R13, R14): debounced async resolution with a
 * monotonic requestToken staleness guard, delayed loading state, empty/error
 * states with retry, a per-trigger circuit breaker, and keyboard navigation.
 *
 * Timers are plain setTimeout/clearTimeout — cancelable and deterministic
 * under vitest fake timers; the controller never touches DOM globals.
 */

import type { ComposerCandidate, SuggestionState } from './types.js'
import type { TriggerMatch } from './trigger-engine.js'

/** Loading UI appears only if the resolver is still pending after this long. */
export const LOADING_DELAY_MS = 120
/** Deferred (blur) dismissal grace so a pointer tap on a row can land first. */
export const DISMISS_GRACE_MS = 120
/** Consecutive resolver throws for one trigger before remote calls stop for the session. */
export const CIRCUIT_BREAKER_THRESHOLD = 2

export const CLOSED_SUGGESTION_STATE: SuggestionState = {
  isOpen: false,
  items: [],
  visibleItems: [],
  activeIndex: 0,
  loading: false,
  error: null,
  requestToken: 0,
}

export interface SuggestionController {
  readonly state: SuggestionState
  /** Reconcile with the current trigger match after any mutation/caret move. */
  sync(match: TriggerMatch | null): void
  moveNext(): void
  movePrevious(): void
  setActiveIndex(index: number): void
  retry(): void
  /** Close after a grace period (blur); a commit during the grace cancels it. */
  dismissDeferred(onClosed: () => void): void
  cancelDeferredDismiss(): void
  /** Close immediately and invalidate any in-flight resolution. */
  close(): void
  isTripped(triggerId: string): boolean
  destroy(): void
}

export function createSuggestionController({ emit }: { emit: () => void }): SuggestionController {
  let state: SuggestionState = CLOSED_SUGGESTION_STATE
  let match: TriggerMatch | null = null
  let requestCounter = 0
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let loadingTimer: ReturnType<typeof setTimeout> | null = null
  let dismissTimer: ReturnType<typeof setTimeout> | null = null
  const consecutiveFailures = new Map<string, number>()
  const tripped = new Set<string>()

  function clearTimer(timer: ReturnType<typeof setTimeout> | null): null {
    if (timer !== null) clearTimeout(timer)
    return null
  }

  function setState(patch: Partial<SuggestionState>): void {
    state = { ...state, ...patch }
  }

  function sameOccurrence(a: TriggerMatch | null, b: TriggerMatch | null): boolean {
    return (
      a !== null &&
      b !== null &&
      a.trigger.id === b.trigger.id &&
      a.symbolStart === b.symbolStart
    )
  }

  function closeInternal(): void {
    debounceTimer = clearTimer(debounceTimer)
    loadingTimer = clearTimer(loadingTimer)
    // Bumping the counter invalidates any in-flight resolution (D13).
    requestCounter++
    match = null
    state = CLOSED_SUGGESTION_STATE
  }

  function applyResults(forMatch: TriggerMatch, items: ComposerCandidate[]): void {
    loadingTimer = clearTimer(loadingTimer)
    consecutiveFailures.set(forMatch.trigger.id, 0)
    setState({
      isOpen: true,
      items,
      visibleItems: items.slice(0, forMatch.trigger.maxVisibleResults),
      activeIndex: 0,
      loading: false,
      error: null,
    })
  }

  function applyFailure(forMatch: TriggerMatch, error: unknown): void {
    loadingTimer = clearTimer(loadingTimer)
    const triggerId = forMatch.trigger.id
    const failures = (consecutiveFailures.get(triggerId) ?? 0) + 1
    consecutiveFailures.set(triggerId, failures)
    if (failures >= CIRCUIT_BREAKER_THRESHOLD) {
      // Session fallback: stop resolving remotely, close silently (D6).
      tripped.add(triggerId)
      closeInternal()
      return
    }
    setState({
      isOpen: true,
      items: [],
      visibleItems: [],
      loading: false,
      error: error instanceof Error ? error.message : 'Failed to load suggestions',
    })
  }

  /**
   * `notifySync` — emit() after a synchronously-settled resolve. False when a
   * composer mutation is already in flight (it emits once at the end); true
   * when invoked from a timer, where nobody else will notify.
   */
  function dispatch(forMatch: TriggerMatch, notifySync: boolean): void {
    const token = ++requestCounter
    setState({ requestToken: token })
    let result: ComposerCandidate[] | Promise<ComposerCandidate[]>
    try {
      result = forMatch.trigger.resolve(forMatch.query)
    } catch (error) {
      applyFailure(forMatch, error)
      if (notifySync) emit()
      return
    }
    if (Array.isArray(result)) {
      applyResults(forMatch, result)
      if (notifySync) emit()
      return
    }
    // Async: show the loading state only if it is still pending after 120ms.
    loadingTimer = clearTimer(loadingTimer)
    loadingTimer = setTimeout(() => {
      if (token !== requestCounter) return
      setState({ isOpen: true, loading: true })
      emit()
    }, LOADING_DELAY_MS)
    result.then(
      (items) => {
        // Staleness guard: a slow response must never overwrite a newer one,
        // and results arriving after the trigger closed are ignored.
        if (token !== requestCounter || !sameOccurrence(match, forMatch)) return
        applyResults(forMatch, items)
        emit()
      },
      (error) => {
        if (token !== requestCounter || !sameOccurrence(match, forMatch)) return
        applyFailure(forMatch, error)
        emit()
      },
    )
  }

  function schedule(forMatch: TriggerMatch): void {
    debounceTimer = clearTimer(debounceTimer)
    if (forMatch.trigger.debounceMs <= 0) {
      dispatch(forMatch, false)
      return
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null
      if (sameOccurrence(match, forMatch) && match?.query === forMatch.query) {
        dispatch(forMatch, true)
      }
    }, forMatch.trigger.debounceMs)
  }

  return {
    get state() {
      return state
    },

    sync(next: TriggerMatch | null): void {
      if (next === null) {
        if (match !== null || state.isOpen) closeInternal()
        return
      }
      if (tripped.has(next.trigger.id)) {
        if (match !== null || state.isOpen) closeInternal()
        return
      }
      const isSame = sameOccurrence(match, next)
      const queryChanged = !isSame || match?.query !== next.query
      match = next
      if (!isSame) {
        // Fresh occurrence: start from a clean open menu.
        state = { ...CLOSED_SUGGESTION_STATE, isOpen: true, requestToken: state.requestToken }
      }
      if (queryChanged) schedule(next)
    },

    moveNext(): void {
      const count = state.items.length
      if (!state.isOpen || count === 0) return
      const wrap = match?.trigger.wrapNavigation ?? true
      const next = wrap
        ? (state.activeIndex + 1) % count
        : Math.min(state.activeIndex + 1, count - 1)
      setState({ activeIndex: next })
    },

    movePrevious(): void {
      const count = state.items.length
      if (!state.isOpen || count === 0) return
      const wrap = match?.trigger.wrapNavigation ?? true
      const previous = wrap
        ? (state.activeIndex - 1 + count) % count
        : Math.max(state.activeIndex - 1, 0)
      setState({ activeIndex: previous })
    },

    setActiveIndex(index: number): void {
      if (!state.isOpen || state.items.length === 0) return
      setState({ activeIndex: Math.max(0, Math.min(index, state.items.length - 1)) })
    },

    retry(): void {
      if (match === null) return
      if (tripped.has(match.trigger.id)) return
      setState({ error: null })
      dispatch(match, false)
    },

    dismissDeferred(onClosed: () => void): void {
      dismissTimer = clearTimer(dismissTimer)
      dismissTimer = setTimeout(() => {
        dismissTimer = null
        closeInternal()
        onClosed()
      }, DISMISS_GRACE_MS)
    },

    cancelDeferredDismiss(): void {
      dismissTimer = clearTimer(dismissTimer)
    },

    close(): void {
      dismissTimer = clearTimer(dismissTimer)
      closeInternal()
    },

    isTripped(triggerId: string): boolean {
      return tripped.has(triggerId)
    },

    destroy(): void {
      debounceTimer = clearTimer(debounceTimer)
      loadingTimer = clearTimer(loadingTimer)
      dismissTimer = clearTimer(dismissTimer)
      match = null
      state = CLOSED_SUGGESTION_STATE
    },
  }
}
