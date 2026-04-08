// ---------------------------------------------------------------------------
// Base error
// ---------------------------------------------------------------------------

export type ErrorCategory = 'audio' | 'video' | 'export' | 'file'

export class MediaError extends Error {
  readonly code: string
  readonly category: ErrorCategory
  readonly recoverable: boolean
  readonly context?: Record<string, unknown>

  constructor(
    message: string,
    code: string,
    category: ErrorCategory,
    recoverable: boolean,
    context?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'MediaError'
    this.code = code
    this.category = category
    this.recoverable = recoverable
    this.context = context
  }
}

// ---------------------------------------------------------------------------
// Domain error factories
// ---------------------------------------------------------------------------

export const AudioError = {
  microphoneAccessDenied(): MediaError {
    return new MediaError(
      'Microphone access was denied',
      'MICROPHONE_ACCESS_DENIED',
      'audio',
      true,
    )
  },

  formatNotSupported(format: string): MediaError {
    return new MediaError(
      `Audio format "${format}" is not supported`,
      'FORMAT_NOT_SUPPORTED',
      'audio',
      false,
      { format },
    )
  },
}

export const ExportError = {
  ffmpegNotAvailable(): MediaError {
    return new MediaError(
      'FFmpeg is not available',
      'FFMPEG_NOT_AVAILABLE',
      'export',
      false,
    )
  },

  renderFailed(frame: number): MediaError {
    return new MediaError(
      `Render failed at frame ${frame}`,
      'RENDER_FAILED',
      'export',
      true,
      { frame },
    )
  },
}

export const FileError = {
  fileTooLarge(size: number, maxSize: number): MediaError {
    return new MediaError(
      `File size ${size} exceeds maximum ${maxSize}`,
      'FILE_TOO_LARGE',
      'file',
      false,
      { size, maxSize },
    )
  },

  invalidType(type: string, allowed: string[]): MediaError {
    return new MediaError(
      `File type "${type}" is not allowed. Allowed: ${allowed.join(', ')}`,
      'INVALID_FILE_TYPE',
      'file',
      false,
      { type, allowed },
    )
  },
}

// ---------------------------------------------------------------------------
// User-friendly messages
// ---------------------------------------------------------------------------

const FRIENDLY_MESSAGES: Record<string, string> = {
  MICROPHONE_ACCESS_DENIED:
    'Please allow microphone access in your browser settings and try again.',
  FORMAT_NOT_SUPPORTED:
    'This audio format is not supported. Please try a different file.',
  FFMPEG_NOT_AVAILABLE:
    'The video export engine is not available. Please check your installation.',
  RENDER_FAILED:
    'Video rendering failed. Please try again or reduce the project complexity.',
  FILE_TOO_LARGE:
    'The file is too large. Please choose a smaller file.',
  INVALID_FILE_TYPE:
    'This file type is not supported. Please choose a different file.',
}

/**
 * Return a human-readable message for any Error. MediaError instances get
 * tailored messages; other errors get a generic fallback.
 */
export function getUserFriendlyMessage(error: Error): string {
  if (error instanceof MediaError) {
    return FRIENDLY_MESSAGES[error.code] ?? error.message
  }
  return 'An unexpected error occurred. Please try again.'
}
