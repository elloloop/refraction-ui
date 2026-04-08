// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AudioClip {
  id: string
  src: string
  startTime: number
  duration: number
  /** 0-1 */
  volume: number
  speed: number
  muted: boolean
}

/** Normalized waveform peaks (0-1) */
export type WaveformData = number[]

export interface AudioEngine {
  load(src: string): Promise<void>
  play(clip: AudioClip): void
  pause(): void
  stop(): void
  record(): Promise<Blob>
  getWaveform(src: string): Promise<WaveformData>
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Down-sample raw audio samples into `peakCount` peaks by taking the max
 * absolute value of each bucket.
 */
export function generateWaveformPeaks(
  samples: number[],
  peakCount = 100,
): WaveformData {
  if (samples.length === 0) {
    return new Array(peakCount).fill(0)
  }

  const bucketSize = samples.length / peakCount
  const peaks: number[] = []

  for (let i = 0; i < peakCount; i++) {
    const start = Math.floor(i * bucketSize)
    const end = Math.floor((i + 1) * bucketSize)

    if (start >= samples.length) {
      peaks.push(0)
      continue
    }

    let max = 0
    for (let j = start; j < Math.min(end, samples.length); j++) {
      const abs = Math.abs(samples[j])
      if (abs > max) max = abs
    }
    // Clamp to 0-1
    peaks.push(Math.min(max, 1))
  }

  return peaks
}

/**
 * Compute effective volumes for a set of clips given a master volume.
 * Muted clips always return 0. Result is clamped to 0-1.
 */
export function mixVolumes(
  clips: AudioClip[],
  masterVolume: number,
): { id: string; effectiveVolume: number }[] {
  return clips.map((clip) => ({
    id: clip.id,
    effectiveVolume: clip.muted
      ? 0
      : Math.min(Math.max(clip.volume * masterVolume, 0), 1),
  }))
}

/**
 * Determine which clips are active at a given timeline position and compute
 * the playback offset within each clip.
 *
 * A clip is active when `startTime <= position < startTime + duration`.
 */
export function computeClipTimings(
  clips: AudioClip[],
  timelinePosition: number,
): { id: string; shouldPlay: boolean; offset: number }[] {
  return clips.map((clip) => {
    const endTime = clip.startTime + clip.duration
    const shouldPlay =
      timelinePosition >= clip.startTime && timelinePosition < endTime

    return {
      id: clip.id,
      shouldPlay,
      offset: shouldPlay ? timelinePosition - clip.startTime : 0,
    }
  })
}

// ---------------------------------------------------------------------------
// Mock engine (for testing consumers)
// ---------------------------------------------------------------------------

export function createMockAudioEngine(): AudioEngine {
  return {
    async load(_src: string): Promise<void> {
      // no-op
    },
    play(_clip: AudioClip): void {
      // no-op
    },
    pause(): void {
      // no-op
    },
    stop(): void {
      // no-op
    },
    async record(): Promise<Blob> {
      // Return a minimal Blob-like in Node (tests run in Node)
      return new Blob([])
    },
    async getWaveform(_src: string): Promise<WaveformData> {
      return new Array(100).fill(0.5)
    },
  }
}
