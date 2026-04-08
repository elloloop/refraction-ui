/**
 * Colorblind-safe color palettes for charts.
 * Based on Wong (2011) "Points of view: Color blindness" — Nature Methods.
 * These 8 colors are distinguishable by people with all types of color vision deficiency.
 */
export const COLORBLIND_SAFE_PALETTE = [
  '#0072B2', // blue
  '#E69F00', // orange
  '#009E73', // green (blue-tinted, safe for protanopia/deuteranopia)
  '#F0E442', // yellow
  '#56B4E9', // sky blue
  '#D55E00', // vermillion (not red — distinguishable from green)
  '#CC79A7', // pink
  '#000000', // black
] as const

/** Convert hex to HSL string for CSS variables */
export function hexToHSL(hex: string): string {
  // Remove # prefix
  const h = hex.replace(/^#/, '')

  const r = parseInt(h.substring(0, 2), 16) / 255
  const g = parseInt(h.substring(2, 4), 16) / 255
  const b = parseInt(h.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    // Achromatic
    return `0 0% ${Math.round(l * 100)}%`
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let hue: number
  if (max === r) {
    hue = ((g - b) / d + (g < b ? 6 : 0)) / 6
  } else if (max === g) {
    hue = ((b - r) / d + 2) / 6
  } else {
    hue = ((r - g) / d + 4) / 6
  }

  return `${Math.round(hue * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/** Get a colorblind-safe color by index (wraps around) */
export function getChartColor(index: number): string {
  return COLORBLIND_SAFE_PALETTE[index % COLORBLIND_SAFE_PALETTE.length]
}

/**
 * Pattern fills for charts — when color alone isn't enough.
 * Returns SVG pattern definitions that can be used as fill.
 */
export type PatternType = 'solid' | 'diagonal' | 'dots' | 'crosshatch' | 'horizontal' | 'vertical' | 'zigzag' | 'checker'

export function getPatternDef(type: PatternType, color: string, id: string): string {
  const size = 8

  switch (type) {
    case 'solid':
      return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${color}"/></pattern>`

    case 'diagonal':
      return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${color}" opacity="0.3"/><line x1="0" y1="${size}" x2="${size}" y2="0" stroke="${color}" stroke-width="1.5"/></pattern>`

    case 'dots':
      return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${color}" opacity="0.3"/><circle cx="${size / 2}" cy="${size / 2}" r="1.5" fill="${color}"/></pattern>`

    case 'crosshatch':
      return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${color}" opacity="0.3"/><line x1="0" y1="0" x2="${size}" y2="${size}" stroke="${color}" stroke-width="1"/><line x1="${size}" y1="0" x2="0" y2="${size}" stroke="${color}" stroke-width="1"/></pattern>`

    case 'horizontal':
      return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${color}" opacity="0.3"/><line x1="0" y1="${size / 2}" x2="${size}" y2="${size / 2}" stroke="${color}" stroke-width="1.5"/></pattern>`

    case 'vertical':
      return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${color}" opacity="0.3"/><line x1="${size / 2}" y1="0" x2="${size / 2}" y2="${size}" stroke="${color}" stroke-width="1.5"/></pattern>`

    case 'zigzag':
      return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${color}" opacity="0.3"/><polyline points="0,${size} ${size / 2},0 ${size},${size}" fill="none" stroke="${color}" stroke-width="1.5"/></pattern>`

    case 'checker':
      return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><rect width="${size}" height="${size}" fill="${color}" opacity="0.3"/><rect width="${size / 2}" height="${size / 2}" fill="${color}"/><rect x="${size / 2}" y="${size / 2}" width="${size / 2}" height="${size / 2}" fill="${color}"/></pattern>`
  }
}

export const PATTERNS: PatternType[] = [
  'solid',
  'diagonal',
  'dots',
  'crosshatch',
  'horizontal',
  'vertical',
  'zigzag',
  'checker',
]
