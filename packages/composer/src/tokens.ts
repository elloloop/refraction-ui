/**
 * Token bookkeeping over the flat string (R15–R18).
 *
 * Committed tokens are atomic: an edit touching part of a token removes the
 * whole token; an insertion strictly inside a token is rejected; the caret
 * never rests strictly inside a token. Every function here is pure — the
 * composer owns the state and feeds it through these rules on each mutation.
 */

import { detectEmojiShortcode } from '@refraction-ui/rich-editor'
import { clampGraphemes, graphemeLength } from './graphemes.js'
import type {
  ComposerOutput,
  ComposerSelection,
  ComposerToken,
  PlacedToken,
  ResolvedToken,
} from './types.js'

// ---------------------------------------------------------------------------
// Diffing
// ---------------------------------------------------------------------------

export interface TextEdit {
  /** Offset where old and new text diverge. */
  start: number
  /** End of the replaced range in the OLD text. */
  oldEnd: number
  /** End of the inserted range in the NEW text. */
  newEnd: number
}

/** Minimal single-span diff via common prefix/suffix. Null when texts are equal. */
export function diffEdit(oldText: string, newText: string): TextEdit | null {
  if (oldText === newText) return null
  const minLen = Math.min(oldText.length, newText.length)
  let prefix = 0
  while (prefix < minLen && oldText[prefix] === newText[prefix]) prefix++
  let suffix = 0
  while (
    suffix < minLen - prefix &&
    oldText[oldText.length - 1 - suffix] === newText[newText.length - 1 - suffix]
  ) {
    suffix++
  }
  return { start: prefix, oldEnd: oldText.length - suffix, newEnd: newText.length - suffix }
}

// ---------------------------------------------------------------------------
// Edit application with token atomicity
// ---------------------------------------------------------------------------

export interface AppliedEdit {
  value: string
  tokens: PlacedToken[]
  selection: ComposerSelection
  /** Set when an insertion strictly inside a token was rejected (value restored). */
  rejected: boolean
  /** True when maxLength clamping dropped part of the inserted text. */
  trimmed: boolean
  removedTokens: PlacedToken[]
  /** The edit as actually applied to the old value (post token expansion), or null. */
  edit: TextEdit | null
}

export interface ApplyValueEditArgs {
  oldValue: string
  newValue: string
  tokens: readonly PlacedToken[]
  newSelection: ComposerSelection
  /** Grapheme budget; the INSERTED slice is clamped to fit, never bisecting a cluster. */
  maxLength?: number
}

function nearestBoundary(offset: number, token: PlacedToken): number {
  return offset - token.start <= token.end - offset ? token.start : token.end
}

/**
 * Reconcile a raw text edit (as reported by the adapter's input) with the
 * committed token list. Deletions touching part of a token expand to the whole
 * token; insertions strictly inside a token are rejected outright.
 */
export function applyValueEdit({
  oldValue,
  newValue,
  tokens,
  newSelection,
  maxLength,
}: ApplyValueEditArgs): AppliedEdit {
  const noChange: AppliedEdit = {
    value: oldValue,
    tokens: [...tokens],
    selection: newSelection,
    rejected: false,
    trimmed: false,
    removedTokens: [],
    edit: null,
  }
  const diff = diffEdit(oldValue, newValue)
  if (!diff) return noChange

  const insertedRaw = newValue.slice(diff.start, diff.newEnd)

  // Pure insertion strictly inside a token → reject, snap caret to a boundary.
  if (diff.oldEnd === diff.start) {
    const host = tokens.find((t) => t.start < diff.start && diff.start < t.end)
    if (host) {
      const caret = nearestBoundary(diff.start, host)
      return { ...noChange, rejected: true, selection: { start: caret, end: caret } }
    }
  }

  // Expand the replaced range over any partially/fully covered token (atomic delete).
  let expStart = diff.start
  let expOldEnd = diff.oldEnd
  const removedTokens: PlacedToken[] = []
  for (const token of tokens) {
    const overlaps = token.start < expOldEnd && token.end > expStart
    if (!overlaps) continue
    removedTokens.push(token)
    expStart = Math.min(expStart, token.start)
    expOldEnd = Math.max(expOldEnd, token.end)
  }

  // Clamp the inserted slice against the grapheme budget of what remains.
  let inserted = insertedRaw
  let trimmed = false
  if (maxLength !== undefined && inserted.length > 0) {
    const baseLength =
      graphemeLength(oldValue.slice(0, expStart)) + graphemeLength(oldValue.slice(expOldEnd))
    const budget = Math.max(0, maxLength - baseLength)
    if (graphemeLength(inserted) > budget) {
      inserted = clampGraphemes(inserted, budget)
      trimmed = true
    }
  }

  const value = oldValue.slice(0, expStart) + inserted + oldValue.slice(expOldEnd)
  const delta = expStart + inserted.length - expOldEnd
  const nextTokens = tokens
    .filter((t) => !removedTokens.includes(t))
    .map((t) => (t.start >= expOldEnd ? { ...t, start: t.start + delta, end: t.end + delta } : t))

  // When the applied edit differs from the raw input (expansion/clamp), the
  // reported selection can point past reality — collapse to end of insertion.
  const appliedMatchesRaw = expStart === diff.start && expOldEnd === diff.oldEnd && !trimmed
  const caret = expStart + inserted.length
  const selection = appliedMatchesRaw ? newSelection : { start: caret, end: caret }

  return {
    value,
    tokens: nextTokens,
    selection: clampSelectionToValue(selection, value),
    rejected: false,
    trimmed,
    removedTokens,
    edit: { start: expStart, oldEnd: expOldEnd, newEnd: expStart + inserted.length },
  }
}

function clampSelectionToValue(selection: ComposerSelection, value: string): ComposerSelection {
  const clamp = (n: number) => Math.max(0, Math.min(n, value.length))
  return { start: clamp(selection.start), end: clamp(selection.end) }
}

// ---------------------------------------------------------------------------
// Selection snapping
// ---------------------------------------------------------------------------

/**
 * Snap a selection so no endpoint rests strictly inside a token. A collapsed
 * caret snaps in the direction of travel (so arrow keys skip a token as one
 * unit); a range expands outward to the full token bounds.
 */
export function snapSelectionToTokens(
  tokens: readonly PlacedToken[],
  selection: ComposerSelection,
  previous?: ComposerSelection,
): ComposerSelection {
  const inside = (offset: number) =>
    tokens.find((t) => t.start < offset && offset < t.end)

  if (selection.start === selection.end) {
    const host = inside(selection.start)
    if (!host) return selection
    let caret: number
    if (previous && previous.start === previous.end && previous.start !== selection.start) {
      caret = selection.start > previous.start ? host.end : host.start
    } else {
      caret = nearestBoundary(selection.start, host)
    }
    return { start: caret, end: caret }
  }

  const startHost = inside(selection.start)
  const endHost = inside(selection.end)
  return {
    start: startHost ? startHost.start : selection.start,
    end: endHost ? endHost.end : selection.end,
  }
}

/** Expand a range outward so it covers any partially-included token whole. */
export function expandRangeOverTokens(
  tokens: readonly PlacedToken[],
  range: ComposerSelection,
): ComposerSelection {
  let { start, end } = range
  for (const token of tokens) {
    if (token.start < end && token.end > start) {
      start = Math.min(start, token.start)
      end = Math.max(end, token.end)
    }
  }
  return { start, end }
}

// ---------------------------------------------------------------------------
// Commit / serialize
// ---------------------------------------------------------------------------

export interface CommitTokenArgs {
  value: string
  tokens: readonly PlacedToken[]
  /** Replaced range: `[start, end)` — symbol + query for a trigger commit. */
  start: number
  end: number
  token: ComposerToken
}

export interface CommitTokenResult {
  value: string
  tokens: PlacedToken[]
  selection: ComposerSelection
}

/** Replace `[start, end)` with the token's display in one atomic transaction. */
export function commitTokenAt({ value, tokens, start, end, token }: CommitTokenArgs): CommitTokenResult {
  const display = token.display
  const nextValue = value.slice(0, start) + display + value.slice(end)
  const delta = display.length - (end - start)
  const placed: PlacedToken = { ...token, start, end: start + display.length }
  const shifted = tokens.map((t) =>
    t.start >= end ? { ...t, start: t.start + delta, end: t.end + delta } : t,
  )
  const nextTokens = [...shifted, placed].sort((a, b) => a.start - b.start)
  const caret = placed.end
  return { value: nextValue, tokens: nextTokens, selection: { start: caret, end: caret } }
}

/**
 * Structured output: plainText inlines every display; ranges are derived and
 * guaranteed in sync (`plainText.substring(start, end) === display`).
 */
export function serializeTokens(value: string, tokens: readonly PlacedToken[]): ComposerOutput {
  const resolved: ResolvedToken[] = tokens.map((t) => ({
    type: t.triggerId,
    id: t.id,
    display: t.display,
    start: t.start,
    end: t.end,
  }))
  return { plainText: value, tokens: resolved }
}

// ---------------------------------------------------------------------------
// Direct-typed emoji commit (R18)
// ---------------------------------------------------------------------------

export interface TypedEmojiHit {
  shortcode: string
  unicode: string
  /** Offset of the opening colon. */
  start: number
}

/**
 * Detect a just-completed `:shortcode:` immediately before the caret using
 * rich-editor's EMOJI_MAP (via detectEmojiShortcode). Unknown shortcodes stay
 * literal; the composer converts a hit into a committed token without the
 * menu ever opening.
 */
export function detectTypedEmoji(value: string, caret: number): TypedEmojiHit | null {
  const hit = detectEmojiShortcode(value.slice(0, caret))
  if (!hit) return null
  return { shortcode: hit.shortcode, unicode: hit.unicode, start: caret - hit.shortcode.length }
}
