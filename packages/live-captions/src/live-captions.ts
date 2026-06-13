/** A single caption cue — may be interim (non-final) while speech is in flight. */
export interface CaptionCue {
  /** Unique identifier for this cue. */
  id: string
  /** Speaker name, shown as a prefix when present. */
  speaker?: string
  /** The caption text. */
  text: string
  /** Whether this cue is finalised (true) or still being transcribed (false/absent). */
  final?: boolean
}

/**
 * Return the last `maxLines` cues to display in the caption overlay.
 * Preserves ordering (oldest first within the slice) so the overlay reads top-to-bottom.
 */
export function visibleCues(cues: CaptionCue[], maxLines = 2): CaptionCue[] {
  if (maxLines <= 0) return []
  return cues.slice(-maxLines)
}

/**
 * Format a single cue for display.
 * When `speaker` is present the result is `'Maya: the bottleneck is review capacity'`.
 * Without a speaker it is just the text.
 */
export function formatCue(cue: CaptionCue): string {
  return cue.speaker ? `${cue.speaker}: ${cue.text}` : cue.text
}

export interface LiveCaptionsAPI {
  /** ARIA attributes to spread on the caption container element. */
  ariaProps: Record<string, string | number | boolean>
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Build the framework-agnostic accessibility props for a live-caption overlay.
 *
 * Returns `role="log"` with `aria-live="polite"` and `aria-atomic=false` so
 * screen readers announce individual cues as they arrive without re-reading the
 * whole log. Adapters spread these onto the container element.
 */
export function createLiveCaptions(): LiveCaptionsAPI {
  const ariaProps: Record<string, string | number | boolean> = {
    role: 'log',
    'aria-live': 'polite',
    'aria-atomic': false,
  }

  const dataAttributes: Record<string, string> = {
    'data-component': 'live-captions',
  }

  return { ariaProps, dataAttributes }
}
