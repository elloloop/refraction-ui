// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VideoClip {
  id: string
  type: 'video' | 'audio' | 'picture' | 'dialogue' | 'text' | 'effect'
  startTime: number
  duration: number
  track: number
}

export interface Track {
  id: string
  name: string
  type: string
  muted: boolean
  clips: VideoClip[]
}

export interface Timeline {
  tracks: Track[]
  duration: number
  fps: number
}

export interface VideoExporter {
  export(timeline: Timeline, opts: Record<string, unknown>): Promise<Blob>
  getProgress(): number
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Compute the maximum end time across all clips in all tracks. */
export function computeTimelineDuration(tracks: Track[]): number {
  let max = 0
  for (const track of tracks) {
    for (const clip of track.clips) {
      const end = clip.startTime + clip.duration
      if (end > max) max = end
    }
  }
  return max
}

/** Return all clips that overlap the given time (start <= time < start+duration). */
export function getClipsAtTime(tracks: Track[], time: number): VideoClip[] {
  const result: VideoClip[] = []
  for (const track of tracks) {
    for (const clip of track.clips) {
      if (time >= clip.startTime && time < clip.startTime + clip.duration) {
        result.push(clip)
      }
    }
  }
  return result
}

/**
 * Validate a timeline: check for overlapping clips per track, valid fps,
 * non-negative durations, etc.
 */
export function validateTimeline(
  timeline: Timeline,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // fps validation
  if (timeline.fps <= 0) {
    errors.push('fps must be a positive number')
  }

  // duration validation
  if (timeline.duration < 0) {
    errors.push('Timeline duration must not be negative')
  }

  // Clip-level validation & overlap detection per track
  for (const track of timeline.tracks) {
    // Sort clips by startTime for overlap detection
    const sorted = [...track.clips].sort((a, b) => a.startTime - b.startTime)

    for (const clip of sorted) {
      if (clip.startTime < 0) {
        errors.push(`Clip "${clip.id}" has a negative startTime`)
      }
      if (clip.duration <= 0) {
        errors.push(`Clip "${clip.id}" has zero or negative duration`)
      }
    }

    // Check overlaps between consecutive sorted clips
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      const prevEnd = prev.startTime + prev.duration
      if (curr.startTime < prevEnd) {
        errors.push(
          `Clips "${prev.id}" and "${curr.id}" overlap on track "${track.id}"`,
        )
      }
    }
  }

  return { valid: errors.length === 0, errors }
}
