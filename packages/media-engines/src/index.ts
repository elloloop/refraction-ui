// Audio
export type { AudioClip, WaveformData, AudioEngine } from './audio.js'
export { generateWaveformPeaks, mixVolumes, computeClipTimings, createMockAudioEngine } from './audio.js'

// Video
export type { VideoClip, Track, Timeline, VideoExporter } from './video.js'
export { computeTimelineDuration, getClipsAtTime, validateTimeline } from './video.js'

// Effects
export type { Effect, EffectControl, CanvasLike, EffectConfig } from './effects.js'
export { createEffect, BUILT_IN_EFFECTS, applyEffectDefaults } from './effects.js'

// Templates
export type { ProjectTemplate, Speaker } from './templates.js'
export { TEMPLATES, createProjectFromTemplate, getAvailableTemplates } from './templates.js'

// Errors
export type { ErrorCategory } from './errors.js'
export { MediaError, AudioError, ExportError, FileError, getUserFriendlyMessage } from './errors.js'

// Validation
export type { FileInfo, FileValidationOptions } from './validation.js'
export { validateFile, sanitizeString, validateExportOptions } from './validation.js'

// Logger
export type { LogLevel, LogCategory, LogEntry, Logger, LoggerOptions } from './logger.js'
export { createLogger, createScopedLogger } from './logger.js'
