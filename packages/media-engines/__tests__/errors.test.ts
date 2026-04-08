import { describe, it, expect } from 'vitest'
import {
  MediaError,
  AudioError,
  ExportError,
  FileError,
  getUserFriendlyMessage,
} from '../src/errors.js'

// ---------------------------------------------------------------------------
// MediaError base class
// ---------------------------------------------------------------------------
describe('MediaError', () => {
  it('should extend Error', () => {
    const err = new MediaError('test', 'TEST_CODE', 'audio', true)
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(MediaError)
  })

  it('should store code, category, and recoverable', () => {
    const err = new MediaError('msg', 'CODE', 'video', false)
    expect(err.code).toBe('CODE')
    expect(err.category).toBe('video')
    expect(err.recoverable).toBe(false)
    expect(err.message).toBe('msg')
  })

  it('should accept optional context', () => {
    const err = new MediaError('msg', 'CODE', 'export', true, { frame: 42 })
    expect(err.context).toEqual({ frame: 42 })
  })

  it('should default context to undefined', () => {
    const err = new MediaError('msg', 'CODE', 'file', true)
    expect(err.context).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// AudioError static factories
// ---------------------------------------------------------------------------
describe('AudioError', () => {
  it('microphoneAccessDenied should return a MediaError', () => {
    const err = AudioError.microphoneAccessDenied()
    expect(err).toBeInstanceOf(MediaError)
    expect(err.category).toBe('audio')
    expect(err.recoverable).toBe(true)
  })

  it('microphoneAccessDenied should have a descriptive code', () => {
    const err = AudioError.microphoneAccessDenied()
    expect(err.code).toContain('MICROPHONE')
  })

  it('formatNotSupported should include the format in context', () => {
    const err = AudioError.formatNotSupported('ogg')
    expect(err).toBeInstanceOf(MediaError)
    expect(err.category).toBe('audio')
    expect(err.context?.format).toBe('ogg')
  })

  it('formatNotSupported should not be recoverable', () => {
    const err = AudioError.formatNotSupported('wav')
    expect(err.recoverable).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// ExportError static factories
// ---------------------------------------------------------------------------
describe('ExportError', () => {
  it('ffmpegNotAvailable should return a MediaError', () => {
    const err = ExportError.ffmpegNotAvailable()
    expect(err).toBeInstanceOf(MediaError)
    expect(err.category).toBe('export')
    expect(err.recoverable).toBe(false)
  })

  it('renderFailed should include the frame in context', () => {
    const err = ExportError.renderFailed(123)
    expect(err).toBeInstanceOf(MediaError)
    expect(err.category).toBe('export')
    expect(err.context?.frame).toBe(123)
  })
})

// ---------------------------------------------------------------------------
// FileError static factories
// ---------------------------------------------------------------------------
describe('FileError', () => {
  it('fileTooLarge should include size and maxSize', () => {
    const err = FileError.fileTooLarge(500, 100)
    expect(err).toBeInstanceOf(MediaError)
    expect(err.category).toBe('file')
    expect(err.context?.size).toBe(500)
    expect(err.context?.maxSize).toBe(100)
  })

  it('invalidType should include type and allowed types', () => {
    const err = FileError.invalidType('exe', ['mp3', 'wav'])
    expect(err).toBeInstanceOf(MediaError)
    expect(err.category).toBe('file')
    expect(err.context?.type).toBe('exe')
    expect(err.context?.allowed).toEqual(['mp3', 'wav'])
  })
})

// ---------------------------------------------------------------------------
// getUserFriendlyMessage
// ---------------------------------------------------------------------------
describe('getUserFriendlyMessage', () => {
  it('should return a string for a MediaError', () => {
    const err = AudioError.microphoneAccessDenied()
    const msg = getUserFriendlyMessage(err)
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  it('should return a generic message for unknown errors', () => {
    const msg = getUserFriendlyMessage(new Error('random'))
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })

  it('should produce distinct messages for different error types', () => {
    const mic = getUserFriendlyMessage(AudioError.microphoneAccessDenied())
    const ffmpeg = getUserFriendlyMessage(ExportError.ffmpegNotAvailable())
    expect(mic).not.toBe(ffmpeg)
  })

  it('should produce a message for file too large', () => {
    const msg = getUserFriendlyMessage(FileError.fileTooLarge(999, 100))
    expect(msg.length).toBeGreaterThan(0)
  })

  it('should produce a message for render failed', () => {
    const msg = getUserFriendlyMessage(ExportError.renderFailed(42))
    expect(msg.length).toBeGreaterThan(0)
  })
})
