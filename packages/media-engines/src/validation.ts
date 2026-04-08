// ---------------------------------------------------------------------------
// File validation
// ---------------------------------------------------------------------------

export interface FileInfo {
  name: string
  size: number
  type: string
}

export interface FileValidationOptions {
  maxSize?: number
  allowedTypes?: string[]
}

export function validateFile(
  file: FileInfo,
  opts: FileValidationOptions,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (opts.maxSize !== undefined && file.size > opts.maxSize) {
    errors.push(`File size ${file.size} exceeds maximum ${opts.maxSize}`)
  }

  if (opts.allowedTypes && !opts.allowedTypes.includes(file.type)) {
    errors.push(
      `File type "${file.type}" is not allowed. Allowed: ${opts.allowedTypes.join(', ')}`,
    )
  }

  return { valid: errors.length === 0, errors }
}

// ---------------------------------------------------------------------------
// String sanitisation
// ---------------------------------------------------------------------------

/**
 * Strip potentially dangerous content from user-supplied strings:
 * - HTML angle brackets
 * - `javascript:` protocol
 * - `on*` event handler attributes
 */
export function sanitizeString(input: string): string {
  let s = input

  // Remove angle brackets
  s = s.replace(/[<>]/g, '')

  // Remove javascript: protocol (case-insensitive)
  s = s.replace(/javascript\s*:/gi, '')

  // Remove on* event handlers (e.g. onclick=, onerror=)
  s = s.replace(/\bon\w+\s*=/gi, '')

  return s
}

// ---------------------------------------------------------------------------
// Export options validation
// ---------------------------------------------------------------------------

const VALID_FPS = [24, 25, 30, 50, 60]

export function validateExportOptions(
  opts: { duration: number; fps: number },
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (opts.duration < 0.1 || opts.duration > 3600) {
    errors.push('Duration must be between 0.1 and 3600 seconds')
  }

  if (!VALID_FPS.includes(opts.fps)) {
    errors.push(`fps must be one of ${VALID_FPS.join(', ')}`)
  }

  return { valid: errors.length === 0, errors }
}
