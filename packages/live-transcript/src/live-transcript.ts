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
}

/** A merged block of consecutive entries from the same speaker. */
export interface TranscriptBlock {
  /** Speaker display name. */
  speaker: string
  /** Timestamp of the first entry in the run (if present). */
  timestamp?: string
  /** Optional CSS color for the speaker name. */
  speakerColor?: string
  /** All text segments from the consecutive run, in order. */
  texts: string[]
}

/**
 * Merge consecutive `TranscriptEntry` items from the same speaker into
 * `TranscriptBlock` objects. A new block is started whenever the speaker
 * changes; the block uses the timestamp of the *first* entry in that run.
 */
export function groupConsecutiveBySpeaker(
  entries: TranscriptEntry[],
): TranscriptBlock[] {
  const blocks: TranscriptBlock[] = []

  for (const entry of entries) {
    const last = blocks[blocks.length - 1]
    if (last && last.speaker === entry.speaker) {
      last.texts.push(entry.text)
    } else {
      blocks.push({
        speaker: entry.speaker,
        timestamp: entry.timestamp,
        speakerColor: entry.speakerColor,
        texts: [entry.text],
      })
    }
  }

  return blocks
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
