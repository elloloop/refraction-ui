export {
  VoiceNote,
  type VoiceNoteProps,
  type VoiceNoteLabels,
  type VoiceNoteState,
} from './voice-note.js'

// Headless helpers for consumers building their own audio-message UI.
export {
  DEFAULT_VOICE_NOTE_LABELS,
  VOICE_NOTE_PLAYBACK_RATES,
  VOICE_NOTE_SEEK_STEP_SECONDS,
  formatVoiceNoteTime,
  getVoiceNoteValueText,
  voiceNoteVariants,
} from '@refraction-ui/voice-note'
