import { describe, it, expect } from 'vitest'
import {
  validateFile,
  sanitizeString,
  validateExportOptions,
} from '../src/validation.js'

// ---------------------------------------------------------------------------
// validateFile
// ---------------------------------------------------------------------------
describe('validateFile', () => {
  it('should pass a valid file with no constraints', () => {
    const result = validateFile({ name: 'song.mp3', size: 1000, type: 'audio/mpeg' }, {})
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('should reject file exceeding maxSize', () => {
    const result = validateFile(
      { name: 'big.wav', size: 200, type: 'audio/wav' },
      { maxSize: 100 },
    )
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should accept file under maxSize', () => {
    const result = validateFile(
      { name: 'ok.mp3', size: 50, type: 'audio/mpeg' },
      { maxSize: 100 },
    )
    expect(result.valid).toBe(true)
  })

  it('should reject disallowed file type', () => {
    const result = validateFile(
      { name: 'hack.exe', size: 10, type: 'application/exe' },
      { allowedTypes: ['audio/mpeg', 'audio/wav'] },
    )
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.toLowerCase().includes('type'))).toBe(true)
  })

  it('should accept an allowed file type', () => {
    const result = validateFile(
      { name: 'song.mp3', size: 10, type: 'audio/mpeg' },
      { allowedTypes: ['audio/mpeg'] },
    )
    expect(result.valid).toBe(true)
  })

  it('should report multiple errors at once', () => {
    const result = validateFile(
      { name: 'bad.exe', size: 999, type: 'application/exe' },
      { maxSize: 100, allowedTypes: ['audio/mpeg'] },
    )
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBe(2)
  })

  it('should accept file at exactly maxSize', () => {
    const result = validateFile(
      { name: 'exact.mp3', size: 100, type: 'audio/mpeg' },
      { maxSize: 100 },
    )
    expect(result.valid).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// sanitizeString
// ---------------------------------------------------------------------------
describe('sanitizeString', () => {
  it('should return plain strings unchanged', () => {
    expect(sanitizeString('hello world')).toBe('hello world')
  })

  it('should strip angle brackets', () => {
    const result = sanitizeString('<script>alert("xss")</script>')
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('should strip javascript: protocol', () => {
    const result = sanitizeString('javascript:alert(1)')
    expect(result.toLowerCase()).not.toContain('javascript:')
  })

  it('should strip on* event handlers', () => {
    const result = sanitizeString('onerror=alert(1)')
    expect(result.toLowerCase()).not.toMatch(/^on\w+=/)
  })

  it('should handle empty string', () => {
    expect(sanitizeString('')).toBe('')
  })

  it('should strip onclick handler', () => {
    const result = sanitizeString('onclick=doEvil()')
    expect(result.toLowerCase()).not.toMatch(/onclick/)
  })

  it('should preserve normal text with special chars', () => {
    expect(sanitizeString('hello & goodbye')).toBe('hello & goodbye')
  })
})

// ---------------------------------------------------------------------------
// validateExportOptions
// ---------------------------------------------------------------------------
describe('validateExportOptions', () => {
  it('should accept valid export options', () => {
    const result = validateExportOptions({ duration: 60, fps: 30 })
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('should reject duration less than 0.1', () => {
    const result = validateExportOptions({ duration: 0.01, fps: 30 })
    expect(result.valid).toBe(false)
  })

  it('should reject duration greater than 3600', () => {
    const result = validateExportOptions({ duration: 5000, fps: 30 })
    expect(result.valid).toBe(false)
  })

  it('should accept duration at boundaries (0.1 and 3600)', () => {
    expect(validateExportOptions({ duration: 0.1, fps: 30 }).valid).toBe(true)
    expect(validateExportOptions({ duration: 3600, fps: 30 }).valid).toBe(true)
  })

  it('should reject non-standard fps', () => {
    const result = validateExportOptions({ duration: 10, fps: 15 })
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.toLowerCase().includes('fps'))).toBe(true)
  })

  it('should accept all standard fps values (24, 25, 30, 50, 60)', () => {
    for (const fps of [24, 25, 30, 50, 60]) {
      expect(validateExportOptions({ duration: 10, fps }).valid).toBe(true)
    }
  })

  it('should report multiple errors at once', () => {
    const result = validateExportOptions({ duration: -1, fps: 7 })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBe(2)
  })
})
