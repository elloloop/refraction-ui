/** Whether the incoming call is voice-only or has video. */
export type IncomingCallKind = 'audio' | 'video'

/**
 * What the Escape key does while the card has focus.
 *
 * - `none`    → nothing; the call keeps ringing (the default, so a stray Esc
 *               can neither answer nor reject a call)
 * - `decline` → rejects the call (`onDecline`)
 * - `dismiss` → hides the card but leaves the call ringing elsewhere
 *               (`onDismiss`), e.g. to keep a native notification
 */
export type IncomingCallEscapeBehavior = 'none' | 'decline' | 'dismiss'

/**
 * Where the card is rendered.
 *
 * - `overlay` → a floating card over the running app
 * - `window`  → the whole content of a small, separate window
 */
export type IncomingCallLayout = 'overlay' | 'window'

/** The callback an Escape key press resolves to (or `null` for none). */
export type IncomingCallEscapeAction = 'decline' | 'dismiss'

/** Default description announced after the caller's name, per call kind. */
export const INCOMING_CALL_KIND_LABELS: Record<IncomingCallKind, string> = {
  audio: 'Incoming audio call',
  video: 'Incoming video call',
}

const SECONDS_PER_MINUTE = 60
const SECONDS_PAD_LENGTH = 2

export interface IncomingCallCardProps {
  /** Id of the element holding the caller's name (`aria-labelledby`). */
  titleId: string
  /** Id of the element holding the kind + context (`aria-describedby`). */
  descriptionId: string
  /** Audio or video call. */
  kind?: IncomingCallKind
  /** Overlay card or the content of a separate window. */
  layout?: IncomingCallLayout
  /** Whether the ring animation should run (false once the countdown expires). */
  ringing?: boolean
}

export interface IncomingCallCardAPI {
  /** ARIA attributes to spread on the card container. */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic container props for an incoming-call card.
 *
 * The card is an `alertdialog` named by the caller and described by the call
 * kind and context, so assistive tech announces "Ada Lovelace, alert dialog,
 * Incoming video call" as soon as the adapter moves focus to it. It is not
 * `aria-modal`: the rest of the app stays usable while the call rings.
 */
export function createIncomingCallCard(props: IncomingCallCardProps): IncomingCallCardAPI {
  const { titleId, descriptionId, kind = 'audio', layout = 'overlay', ringing = true } = props

  const ariaProps: Record<string, string | number | boolean> = {
    role: 'alertdialog',
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
  }

  const dataAttributes: Record<string, string> = {
    'data-kind': kind,
    'data-layout': layout,
    'data-ringing': ringing ? 'true' : 'false',
  }

  return { ariaProps, dataAttributes }
}

/** Derive the title/description element ids from one stable base id. */
export function getIncomingCallCardIds(baseId: string): {
  titleId: string
  descriptionId: string
} {
  return {
    titleId: `${baseId}-title`,
    descriptionId: `${baseId}-description`,
  }
}

/**
 * Resolve what a key press on the card should do.
 *
 * Only Escape is ever handled, and only when `escapeBehavior` opts in. Enter
 * and Space are deliberately never mapped: initial focus sits on the card, not
 * on Accept, precisely so a stray Enter cannot answer the call.
 */
export function getIncomingCallEscapeAction(
  key: string,
  escapeBehavior: IncomingCallEscapeBehavior = 'none',
): IncomingCallEscapeAction | null {
  if (key !== 'Escape') return null
  if (escapeBehavior === 'decline') return 'decline'
  if (escapeBehavior === 'dismiss') return 'dismiss'
  return null
}

/** A resolved, display-ready countdown. */
export interface IncomingCallCountdown {
  /** Whole seconds left (rounded up, never negative). */
  remaining: number
  /** Total length of the ring in seconds, when known. */
  total: number | null
  /** Share of the ring left, 0..1, when the total is known. */
  fraction: number | null
  /** Whether the countdown has run out. */
  expired: boolean
}

function toSeconds(value: number | undefined): number | null {
  if (value === undefined || !Number.isFinite(value)) return null
  return Math.max(0, value)
}

/**
 * Resolve the countdown from a total (`timeoutSeconds`) and/or the seconds
 * left (`remaining`). Returns `null` when the card has no countdown.
 *
 * The core never reads a clock: whoever owns the timer (the adapter, or the
 * app via a controlled `remaining`) passes the current value in. Fractional
 * values are rounded **up** so "0.4 s left" still reads "0:01", and
 * `remaining` is clamped into `0..timeoutSeconds`.
 */
export function resolveIncomingCallCountdown(options: {
  timeoutSeconds?: number
  remaining?: number
}): IncomingCallCountdown | null {
  const total = toSeconds(options.timeoutSeconds)
  const left = toSeconds(options.remaining)
  const hasTotal = total !== null && total > 0

  if (!hasTotal && left === null) return null

  const raw = left ?? (total as number)
  const clamped = hasTotal ? Math.min(raw, total) : raw
  const remaining = Math.ceil(clamped)

  return {
    remaining,
    total: hasTotal ? total : null,
    fraction: hasTotal ? clamped / total : null,
    expired: remaining <= 0,
  }
}

/** One countdown step: a second less, never below zero. */
export function tickIncomingCallCountdown(remaining: number): number {
  return Math.max(0, remaining - 1)
}

/** Format whole seconds as `m:ss` (e.g. `75` → `1:15`). */
export function formatIncomingCallCountdown(seconds: number): string {
  const whole = Math.max(0, Math.ceil(Number.isFinite(seconds) ? seconds : 0))
  const minutes = Math.floor(whole / SECONDS_PER_MINUTE)
  const rest = String(whole % SECONDS_PER_MINUTE).padStart(SECONDS_PAD_LENGTH, '0')
  return `${minutes}:${rest}`
}

/** Default visible countdown text, e.g. `Ends in 0:25`. */
export function defaultIncomingCallCountdownLabel(seconds: number): string {
  return `Ends in ${formatIncomingCallCountdown(seconds)}`
}
