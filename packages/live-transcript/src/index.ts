export {
  applyTranscriptUpdate,
  createLiveTranscript,
  followAfterScroll,
  groupConsecutiveBySpeaker,
  interimLineAriaProps,
  isAtLiveEdge,
  DEFAULT_INTERIM_LABEL,
  DEFAULT_JUMP_TO_LIVE_LABEL,
  LIVE_EDGE_TOLERANCE_PX,
  type LiveTranscriptAPI,
  type TranscriptBlock,
  type TranscriptBlockLine,
  type TranscriptEntry,
  type TranscriptScrollMetrics,
  type TranscriptSide,
} from './live-transcript.js'

export {
  liveTranscriptVariants,
  transcriptBlockVariants,
  transcriptJumpToLiveBarClass,
  transcriptJumpToLiveButtonClass,
  transcriptSpeakerRowClass,
  transcriptSpeakerNameClass,
  transcriptTimestampClass,
  transcriptTextLineVariants,
} from './live-transcript.styles.js'
