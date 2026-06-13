/** A participant in an audio-only room. */
export interface AudioParticipant {
  /** Unique participant identifier. */
  id: string
  /** Display name shown below the orb. */
  name: string
  /** Optional avatar image URL. Falls back to initials when absent. */
  avatarUrl?: string
  /** Whether this participant is currently speaking. */
  speaking?: boolean
  /** Whether this participant's microphone is muted. */
  muted?: boolean
  /** Whether this participant has raised their hand. */
  handRaised?: boolean
}

export interface AudioRoomAPI {
  /** ARIA attributes to spread on the room container element. */
  ariaProps: { role: 'group' }
  /** Data attributes for styling hooks. */
  dataAttributes: Record<string, string>
}

/**
 * Derive up to two uppercase initials from a display name.
 *
 * Examples: "Alice" → "A", "Bob Smith" → "BS", "Dr. Jane Doe" → "JD"
 * (only word-initial alphabetic characters are used).
 */
export function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /[A-Za-z]/.test(w))
  if (words.length === 0) return ''
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/**
 * Determine the number of grid columns for the orb grid.
 *
 * | Count  | Columns |
 * |--------|---------|
 * | 1      | 1       |
 * | 2–4    | 2       |
 * | 5–9    | 3       |
 * | 10+    | 4       |
 */
export function orbColumns(count: number): number {
  if (count <= 1) return 1
  if (count <= 4) return 2
  if (count <= 9) return 3
  return 4
}

/**
 * Build the framework-agnostic container props for an audio room.
 *
 * Returns `role="group"` plus data attributes that adapters spread onto
 * their outermost container element.
 */
export function createAudioRoom(): AudioRoomAPI {
  return {
    ariaProps: { role: 'group' },
    dataAttributes: {
      'data-component': 'audio-room',
    },
  }
}
