/**
 * Symbol-agnostic trigger detection (R10–R12).
 *
 * Detection runs once per mutation, scanning backward from the caret within a
 * bounded window — cost is independent of how much text precedes the trigger.
 * The simple single-char/anywhere case delegates to rich-editor's shared
 * `detectTriggerInText` so the boundary rules live in exactly one place; the
 * general path (multi-char symbols, scopes, extra boundary chars,
 * closeOnSpace=false) layers on top of the same candidate/validation split.
 */

import { detectTriggerInText } from '@refraction-ui/rich-editor'
import { graphemeLength } from './graphemes.js'
import type { ComposerTrigger, ComposerTriggerScope, ComposerCandidate } from './types.js'

// ---------------------------------------------------------------------------
// Resolved config (defaults applied once)
// ---------------------------------------------------------------------------

export const DEFAULT_MAX_QUERY_LENGTH = 40
export const DEFAULT_MAX_VISIBLE_RESULTS = 6
/**
 * UTF-16 budget per grapheme when sizing the backward-scan window. The widest
 * common cluster (ZWJ family emoji) is 11 units; 16 leaves headroom without
 * unbounding the scan.
 */
export const SCAN_UNITS_PER_GRAPHEME = 16

export interface ResolvedTrigger {
  id: string
  symbol: string
  scope: ComposerTriggerScope
  queryPattern: RegExp | null
  maxQueryLength: number
  closeOnSpace: boolean
  allowMidWord: boolean
  extraBoundaryChars: readonly string[]
  debounceMs: number
  maxVisibleResults: number
  wrapNavigation: boolean
  toDisplay: (candidate: ComposerCandidate) => string
  resolve: ComposerTrigger['resolve']
}

export function resolveTriggerConfig(trigger: ComposerTrigger): ResolvedTrigger {
  const symbol = trigger.symbol
  return {
    id: trigger.id,
    symbol,
    scope: trigger.scope ?? 'anywhere',
    queryPattern: trigger.queryPattern ?? null,
    maxQueryLength: trigger.maxQueryLength ?? DEFAULT_MAX_QUERY_LENGTH,
    closeOnSpace: trigger.closeOnSpace ?? true,
    allowMidWord: trigger.allowMidWord ?? false,
    extraBoundaryChars: trigger.extraBoundaryChars ?? [],
    debounceMs: trigger.debounceMs ?? 0,
    maxVisibleResults: trigger.maxVisibleResults ?? DEFAULT_MAX_VISIBLE_RESULTS,
    wrapNavigation: trigger.wrapNavigation ?? true,
    toDisplay: trigger.toDisplay ?? ((candidate) => `${symbol}${candidate.display}`),
    resolve: trigger.resolve,
  }
}

/** UTF-16 size of the backward-scan window for a trigger (exported for tests). */
export function scanWindowFor(trigger: ResolvedTrigger): number {
  return trigger.maxQueryLength * SCAN_UNITS_PER_GRAPHEME + trigger.symbol.length
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

export interface TriggerMatch {
  trigger: ResolvedTrigger
  symbolStart: number
  caret: number
  query: string
}

/** An occurrence dismissed via Escape — never re-arms until the symbol is retyped. */
export interface DismissedOccurrence {
  triggerId: string
  symbolStart: number
}

export interface TokenRange {
  start: number
  end: number
}

export interface DetectTriggerArgs {
  text: string
  caret: number
  triggers: readonly ResolvedTrigger[]
  isComposing?: boolean
  dismissed?: readonly DismissedOccurrence[]
  tokenRanges?: readonly TokenRange[]
}

function isWhitespace(ch: string): boolean {
  return /\s/.test(ch)
}

function boundaryOk(text: string, symbolStart: number, trigger: ResolvedTrigger): boolean {
  if (trigger.allowMidWord) return true
  if (symbolStart === 0) return true
  const prev = text[symbolStart - 1]
  return isWhitespace(prev) || trigger.extraBoundaryChars.includes(prev)
}

function scopeOk(text: string, symbolStart: number, scope: ComposerTriggerScope): boolean {
  if (scope === 'anywhere') return true
  if (scope === 'startOfMessage') return symbolStart === 0
  // startOfLine
  return symbolStart === 0 || text[symbolStart - 1] === '\n'
}

/** Nearest-occurrence candidate within the bounded scan window, or null. */
function findCandidate(
  text: string,
  caret: number,
  trigger: ResolvedTrigger,
): { symbolStart: number; query: string } | null {
  const window = scanWindowFor(trigger)
  const isSimple =
    trigger.symbol.length === 1 &&
    trigger.scope === 'anywhere' &&
    trigger.closeOnSpace &&
    !trigger.allowMidWord &&
    trigger.extraBoundaryChars.length === 0

  if (isSimple) {
    // Include one context char so the shared detector sees the boundary; a
    // symbol landing exactly on the slice edge is re-validated below anyway.
    const sliceStart = Math.max(0, caret - window - 1)
    const slice = text.slice(sliceStart, caret)
    const hit = detectTriggerInText(slice, slice.length, trigger.symbol)
    if (!hit) return null
    return { symbolStart: sliceStart + hit.start, query: hit.query }
  }

  const sliceStart = Math.max(0, caret - window)
  const rel = text.slice(sliceStart, caret).lastIndexOf(trigger.symbol)
  if (rel === -1) return null
  const symbolStart = sliceStart + rel
  // The symbol must be fully typed before the caret (multi-char symbols arm
  // only once complete — C13).
  if (symbolStart + trigger.symbol.length > caret) return null
  return { symbolStart, query: text.slice(symbolStart + trigger.symbol.length, caret) }
}

function validateCandidate(
  text: string,
  caret: number,
  trigger: ResolvedTrigger,
  candidate: { symbolStart: number; query: string },
  dismissed: readonly DismissedOccurrence[],
  tokenRanges: readonly TokenRange[],
): TriggerMatch | null {
  const { symbolStart, query } = candidate
  if (!boundaryOk(text, symbolStart, trigger)) return null
  if (!scopeOk(text, symbolStart, trigger.scope)) return null
  // Never arm inside a committed token's range (its display may contain the symbol).
  for (const range of tokenRanges) {
    if (symbolStart >= range.start && symbolStart < range.end) return null
  }
  if (dismissed.some((d) => d.triggerId === trigger.id && d.symbolStart === symbolStart)) return null
  if (trigger.closeOnSpace && /\s/.test(query)) return null
  // Queries are line-local even when spaces are allowed ('#weekend trip').
  if (!trigger.closeOnSpace && query.includes('\n')) return null
  if (graphemeLength(query) > trigger.maxQueryLength) return null
  if (trigger.queryPattern && !trigger.queryPattern.test(query)) return null
  return { trigger, symbolStart, caret, query }
}

/**
 * Backward-scan detection from the caret. Returns the nearest live trigger
 * (only the last unescaped occurrence before the caret can be live), or null.
 * Suspended entirely while an IME composition is active.
 */
export function detectActiveTrigger({
  text,
  caret,
  triggers,
  isComposing = false,
  dismissed = [],
  tokenRanges = [],
}: DetectTriggerArgs): TriggerMatch | null {
  if (isComposing) return null
  let best: TriggerMatch | null = null
  for (const trigger of triggers) {
    const candidate = findCandidate(text, caret, trigger)
    if (!candidate) continue
    const match = validateCandidate(text, caret, trigger, candidate, dismissed, tokenRanges)
    if (!match) continue
    if (
      !best ||
      match.symbolStart > best.symbolStart ||
      (match.symbolStart === best.symbolStart && match.trigger.symbol.length > best.trigger.symbol.length)
    ) {
      best = match
    }
  }
  return best
}
