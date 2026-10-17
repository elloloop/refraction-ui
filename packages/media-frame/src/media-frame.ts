import { mediaFrameLabelVariants, mediaFrameVariants } from './media-frame.styles.js'

/**
 * MediaFrame — headless core.
 *
 * A fixed-aspect-ratio box for rendered media (an image, a video, a live
 * preview of generated artwork) on a letterbox surface, with an optional
 * corner caption such as "1080×1080 · PNG". JSX-free: ratio parsing, data
 * attributes and class lists only.
 */

/** Width ÷ height: a positive number, `"w:h"` or `"w/h"`. */
export type MediaFrameRatio = number | `${number}:${number}` | `${number}/${number}`

/** The corner the caption sits in. `start` and `end` follow the writing direction. */
export type MediaFrameLabelPosition = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'

/** Letterbox surface: the neutral muted surface, or the theme's tertiary accent. */
export type MediaFrameTone = 'default' | 'tertiary'

export type MediaFrameOrientation = 'square' | 'landscape' | 'portrait'

/** The aspect ratio used when the requested one is unusable. */
export const MEDIA_FRAME_FALLBACK_RATIO = 1

/**
 * Parse a ratio into width ÷ height. Accepts a positive finite number, or
 * `"w:h"` / `"w/h"` with positive decimal sides (spaces allowed). Returns
 * `null` for anything unusable, so the caller can fall back to a square
 * rather than render a collapsed box.
 */
export function parseMediaRatio(ratio: MediaFrameRatio | string): number | null {
  if (typeof ratio === 'number') return Number.isFinite(ratio) && ratio > 0 ? ratio : null
  const separator = ratio.includes(':') ? ':' : '/'
  const sides = ratio.split(separator)
  if (sides.length !== 2) return null
  const width = parseSide(sides[0])
  const height = parseSide(sides[1])
  if (width === null || height === null) return null
  return width > 0 && height > 0 ? width / height : null
}

/** One side of a ratio: a plain non-negative decimal, surrounding spaces allowed. */
function parseSide(raw: string): number | null {
  const text = raw.trim()
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(text)) return null
  const value = Number(text)
  return Number.isFinite(value) ? value : null
}

export interface MediaFrameOptions {
  /** Width ÷ height. Defaults to square; an unusable value also falls back to square. */
  ratio?: MediaFrameRatio | string
  /** Letterbox surface. Defaults to `default`. */
  tone?: MediaFrameTone
  /** Caption corner. Defaults to `top-start`. */
  labelPosition?: MediaFrameLabelPosition
}

export interface MediaFrameAPI {
  /** The CSS `aspect-ratio` value. */
  aspectRatio: string
  /** Whether the requested ratio was usable (false means the square fallback is in use). */
  ratioValid: boolean
  orientation: MediaFrameOrientation
  dataAttributes: {
    'data-slot': 'media-frame'
    'data-orientation': MediaFrameOrientation
  }
  rootClass: string
  labelClass: string
}

export function createMediaFrame(options: MediaFrameOptions = {}): MediaFrameAPI {
  const { ratio = MEDIA_FRAME_FALLBACK_RATIO, tone = 'default', labelPosition = 'top-start' } =
    options
  const parsed = parseMediaRatio(ratio)
  const value = parsed ?? MEDIA_FRAME_FALLBACK_RATIO
  const orientation: MediaFrameOrientation =
    value === 1 ? 'square' : value > 1 ? 'landscape' : 'portrait'
  return {
    aspectRatio: String(value),
    ratioValid: parsed !== null,
    orientation,
    dataAttributes: {
      'data-slot': 'media-frame',
      'data-orientation': orientation,
    },
    rootClass: mediaFrameVariants({ tone }),
    labelClass: mediaFrameLabelVariants({ tone, position: labelPosition }),
  }
}
