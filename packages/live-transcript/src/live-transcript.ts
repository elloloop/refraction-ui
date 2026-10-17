/**
 * Which side of a two-party conversation a line belongs to: the person using
 * the app (`'me'`, typically their microphone) or everyone else (`'them'`,
 * typically the call's audio).
 */
export type TranscriptSide = 'me' | 'them'

/** A single transcript entry from one speaker at a point in time. */
export interface TranscriptEntry {
  /** Unique identifier for this entry. */
  id: string
  /** Display name of the speaker. */
  speaker: string
  /** The spoken text. */
  text: string
  /** Optional formatted timestamp string (e.g. "0:42"). */
  timestamp?: string
  /** Optional CSS color for the speaker's name (e.g. "#3b82f6"). */
  speakerColor?: string
  /** Which side of the conversation spoke; omit for a single-sided transcript. */
  side?: TranscriptSide
  /**
   * A partial result the recogniser may still revise. It is drawn softer and
   * is replaced when its final result arrives (see `applyTranscriptUpdate`).
   */
  interim?: boolean
  /**
   * Offset from the start of the session, in milliseconds. Orders final lines
   * from both sides by when they were spoken, whatever order they arrive in.
   */
  startMs?: number
}

/** One line of a `TranscriptBlock`. */
export interface TranscriptBlockLine {
  /** The entry's id. */
  id: string
  /** The spoken text. */
  text: string
  /** Whether the line is an interim (still revisable) result. */
  interim: boolean
}

/** A merged block of consecutive entries from the same speaker and side. */
export interface TranscriptBlock {
  /** Speaker display name. */
  speaker: string
  /** The side of the conversation, when the transcript has sides. */
  side?: TranscriptSide
  /** Timestamp of the first entry in the run (if present). */
  timestamp?: string
  /** Optional CSS color for the speaker name. */
  speakerColor?: string
  /** All lines from the consecutive run, in order. */
  lines: TranscriptBlockLine[]
}

/**
 * Merge consecutive `TranscriptEntry` items from the same speaker on the same
 * side into `TranscriptBlock` objects. A new block is started whenever the
 * speaker or the side changes; the block uses the timestamp and colour of the
 * *first* entry in that run. An interim line joins its speaker's block, so a
 * sentence still being heard reads as the continuation it is.
 */
export function groupConsecutiveBySpeaker(
  entries: readonly TranscriptEntry[],
): TranscriptBlock[] {
  const blocks: TranscriptBlock[] = []

  for (const entry of entries) {
    const line: TranscriptBlockLine = {
      id: entry.id,
      text: entry.text,
      interim: entry.interim === true,
    }
    const last = blocks[blocks.length - 1]
    if (last && last.speaker === entry.speaker && last.side === entry.side) {
      last.lines.push(line)
    } else {
      blocks.push({
        speaker: entry.speaker,
        side: entry.side,
        timestamp: entry.timestamp,
        speakerColor: entry.speakerColor,
        lines: [line],
      })
    }
  }

  return blocks
}

/** Interim lines follow the finals in this order: me, them, then unsided. */
const INTERIM_SIDE_ORDER: Record<TranscriptSide, number> = { me: 0, them: 1 }
const UNSIDED_INTERIM_ORDER = 2

function interimOrder(entry: TranscriptEntry): number {
  return entry.side ? INTERIM_SIDE_ORDER[entry.side] : UNSIDED_INTERIM_ORDER
}

/**
 * Apply one recogniser result to a transcript and return the next transcript
 * (the input is not mutated). The rules:
 *
 * - Each side has at most ONE interim line. A new interim replaces that
 *   side's previous one; a final clears it and is committed.
 * - Final lines interleave by `startMs`, whatever order they arrive in; a
 *   final without `startMs` keeps arrival order (it is appended).
 * - Interim lines always come after the final lines: me, then them.
 * - Text is trimmed; a blank result only clears its side's interim line.
 *
 * Entries without a `side` form one stream, so a single-sided transcript
 * has at most one interim line overall.
 */
export function applyTranscriptUpdate(
  entries: readonly TranscriptEntry[],
  update: TranscriptEntry,
): TranscriptEntry[] {
  const finals = entries.filter((entry) => entry.interim !== true)
  const interims = entries.filter(
    (entry) => entry.interim === true && entry.side !== update.side,
  )
  const text = update.text.trim()

  if (text.length === 0) return [...finals, ...interims]

  const line: TranscriptEntry = { ...update, text }

  if (update.interim === true) {
    const at = interims.findIndex((entry) => interimOrder(entry) > interimOrder(line))
    interims.splice(at < 0 ? interims.length : at, 0, line)
    return [...finals, ...interims]
  }

  const start = line.startMs
  const at =
    start == null
      ? -1
      : finals.findIndex((entry) => entry.startMs != null && entry.startMs > start)
  finals.splice(at < 0 ? finals.length : at, 0, line)
  return [...finals, ...interims]
}

/** The scroll position of a transcript's scroll container. */
export interface TranscriptScrollMetrics {
  /** Distance scrolled from the top, in pixels. */
  scrollTop: number
  /** Height of the whole scrolled content, in pixels. */
  scrollHeight: number
  /** Height of the visible area, in pixels. */
  clientHeight: number
}

/**
 * How close to the bottom, in pixels, still counts as reading live: about one
 * line of transcript text, so sub-pixel scroll positions and a reader who is
 * only nearly at the end keep the transcript following.
 */
export const LIVE_EDGE_TOLERANCE_PX = 24

/** Whether the newest line is in view (the reader is at the live edge). */
export function isAtLiveEdge(
  metrics: TranscriptScrollMetrics,
  tolerance = LIVE_EDGE_TOLERANCE_PX,
): boolean {
  return metrics.scrollHeight - metrics.scrollTop - metrics.clientHeight <= tolerance
}

/**
 * Whether the transcript should keep following new lines after a scroll.
 *
 * Reaching the live edge always resumes following. Scrolling up (towards
 * older lines) away from it pauses. Any other scroll — the transcript's own
 * pinning, a smooth "jump to live" in flight, content shrinking under the
 * reader — leaves the state as it was, so following is never paused by
 * something the reader did not do.
 */
export function followAfterScroll(
  following: boolean,
  previousScrollTop: number,
  metrics: TranscriptScrollMetrics,
  tolerance = LIVE_EDGE_TOLERANCE_PX,
): boolean {
  if (isAtLiveEdge(metrics, tolerance)) return true
  if (metrics.scrollTop < previousScrollTop) return false
  return following
}

export interface LiveTranscriptAPI {
  /**
   * ARIA attributes to spread on the scroll container.
   * Typed as a plain record so frameworks can spread without fighting their
   * aria-* type narrowing.
   */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic container props for a live transcript panel.
 *
 * Returns `role="log"` and `aria-live="polite"` so screen readers announce
 * new transcript entries without interrupting the user.
 */
export function createLiveTranscript(): LiveTranscriptAPI {
  const ariaProps: Record<string, string | number | boolean> = {
    role: 'log',
    'aria-live': 'polite',
  }

  const dataAttributes: Record<string, string> = {
    'data-component': 'live-transcript',
  }

  return { ariaProps, dataAttributes }
}

/**
 * ARIA attributes for an interim line. Its text changes with every partial
 * result, so it is kept out of the log's announcements (`aria-live="off"`);
 * the final line that replaces it is a new line and is announced once.
 */
export const interimLineAriaProps: Record<string, string | number | boolean> = {
  'aria-live': 'off',
}

/** Screen-reader suffix for an interim line, by default. */
export const DEFAULT_INTERIM_LABEL = 'still listening'

/** The jump-to-live control's label, by default. */
export const DEFAULT_JUMP_TO_LIVE_LABEL = 'Jump to live'
