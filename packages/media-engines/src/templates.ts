import type { Track, Timeline } from './video.js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Speaker {
  id: string
  name: string
  color: string
}

export interface ProjectTemplate {
  name: string
  description: string
  /** Duration in seconds */
  duration: number
  resolution: { width: number; height: number }
  tracks: Track[]
  speakers?: Speaker[]
}

// ---------------------------------------------------------------------------
// Built-in templates
// ---------------------------------------------------------------------------

const DEFAULT_RESOLUTION = { width: 1920, height: 1080 }

export const TEMPLATES: Record<string, ProjectTemplate> = {
  blank: {
    name: 'blank',
    description: 'Empty project with no pre-configured tracks',
    duration: 0,
    resolution: DEFAULT_RESOLUTION,
    tracks: [],
  },

  podcast: {
    name: 'podcast',
    description: 'Podcast with 3 tracks and 2 speakers (30 min)',
    duration: 30 * 60,
    resolution: DEFAULT_RESOLUTION,
    tracks: [
      { id: 'host-audio', name: 'Host Audio', type: 'audio', muted: false, clips: [] },
      { id: 'guest-audio', name: 'Guest Audio', type: 'audio', muted: false, clips: [] },
      { id: 'sfx', name: 'Sound Effects', type: 'audio', muted: false, clips: [] },
    ],
    speakers: [
      { id: 'host', name: 'Host', color: '#3b82f6' },
      { id: 'guest', name: 'Guest', color: '#ef4444' },
    ],
  },

  tutorial: {
    name: 'tutorial',
    description: 'Tutorial with video, narration, and overlay tracks (10 min)',
    duration: 10 * 60,
    resolution: DEFAULT_RESOLUTION,
    tracks: [
      { id: 'screen', name: 'Screen Recording', type: 'video', muted: false, clips: [] },
      { id: 'narration', name: 'Narration', type: 'audio', muted: false, clips: [] },
      { id: 'overlay', name: 'Text Overlay', type: 'text', muted: false, clips: [] },
    ],
  },

  audiobook: {
    name: 'audiobook',
    description: 'Audiobook with narration and music tracks (1 hour)',
    duration: 60 * 60,
    resolution: DEFAULT_RESOLUTION,
    tracks: [
      { id: 'narration', name: 'Narration', type: 'audio', muted: false, clips: [] },
      { id: 'bgmusic', name: 'Background Music', type: 'audio', muted: false, clips: [] },
    ],
  },

  interview: {
    name: 'interview',
    description: 'Interview with 4 tracks (20 min)',
    duration: 20 * 60,
    resolution: DEFAULT_RESOLUTION,
    tracks: [
      { id: 'cam-a', name: 'Camera A', type: 'video', muted: false, clips: [] },
      { id: 'cam-b', name: 'Camera B', type: 'video', muted: false, clips: [] },
      { id: 'host-mic', name: 'Host Mic', type: 'audio', muted: false, clips: [] },
      { id: 'guest-mic', name: 'Guest Mic', type: 'audio', muted: false, clips: [] },
    ],
  },
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Create a Timeline from a named template. Throws if the template name
 * is not found.
 */
export function createProjectFromTemplate(templateName: string): Timeline {
  const template = TEMPLATES[templateName]
  if (!template) {
    throw new Error(`Unknown template: "${templateName}"`)
  }

  return {
    tracks: template.tracks.map((t) => ({
      ...t,
      clips: [...t.clips],
    })),
    duration: template.duration,
    fps: 30,
  }
}

/** Return all available templates (defensive copies). */
export function getAvailableTemplates(): ProjectTemplate[] {
  return Object.values(TEMPLATES).map((t) => ({
    ...t,
    tracks: t.tracks.map((tr) => ({ ...tr, clips: [...tr.clips] })),
    speakers: t.speakers ? t.speakers.map((s) => ({ ...s })) : undefined,
  }))
}
