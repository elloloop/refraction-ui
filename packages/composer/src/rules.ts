/**
 * Pure composer rules — the single source of truth shared by the enable-check,
 * the Enter handler, and the submitted payload (so they can never disagree).
 */

import { graphemeLength } from './graphemes.js'
import type { CounterState } from './types.js'

/** One trim shared by the enable-check AND the sent payload. */
export function payloadFor(raw: string): string {
  return raw.trim()
}

export interface CanSendArgs {
  text: string
  attachments?: readonly unknown[]
  disabled?: boolean
  readOnly?: boolean
  busy?: boolean
}

/**
 * Send is derived from BOTH trimmed text and attachments — an attachments-only
 * message is valid; a whitespace-only message never is.
 */
export function canSend({ text, attachments = [], disabled = false, readOnly = false, busy = false }: CanSendArgs): boolean {
  if (disabled || readOnly || busy) return false
  return payloadFor(text).length > 0 || attachments.length > 0
}

/**
 * The platform-matrix resolver: physical Enter sends unless Shift is held or
 * an IME composition is active (composing always wins — Enter confirms the
 * candidate, never submits).
 */
export function shouldSubmitOnEnter({
  shiftPressed,
  isComposing,
}: {
  shiftPressed: boolean
  isComposing: boolean
}): boolean {
  return !shiftPressed && !isComposing
}

/** The counter surfaces once remaining budget is within this fraction of maxLength. */
export const COUNTER_VISIBLE_FRACTION = 0.2

/**
 * Counter math over grapheme budget. The counter is confirmatory, not the
 * enforcement mechanism (clamping at the insert boundary prevents overflow).
 */
export function computeCounter(text: string, maxLength: number | undefined): CounterState {
  if (maxLength === undefined) {
    return { visible: false, remaining: null, overLimit: false }
  }
  const remaining = maxLength - graphemeLength(text)
  return {
    visible: remaining <= maxLength * COUNTER_VISIBLE_FRACTION,
    remaining,
    overLimit: remaining <= 0,
  }
}
