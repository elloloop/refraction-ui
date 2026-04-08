/**
 * WCAG contrast ratio utilities for theme validation.
 * Helps verify that theme colors meet accessibility requirements.
 *
 * WCAG 2.1 minimum contrast ratios:
 *   - AA normal text: 4.5:1
 *   - AA large text (>=18pt or >=14pt bold): 3:1
 *   - AAA normal text: 7:1
 *   - AAA large text: 4.5:1
 */

/** Parse HSL string "H S% L%" to {h, s, l} */
export function parseHSL(hsl: string): { h: number; s: number; l: number } {
  const parts = hsl.trim().split(/\s+/)
  if (parts.length !== 3) {
    throw new Error(`Invalid HSL string: "${hsl}". Expected "H S% L%" format.`)
  }
  const h = parseFloat(parts[0])
  const s = parseFloat(parts[1].replace('%', ''))
  const l = parseFloat(parts[2].replace('%', ''))
  if (isNaN(h) || isNaN(s) || isNaN(l)) {
    throw new Error(`Invalid HSL values in: "${hsl}"`)
  }
  return { h, s, l }
}

/**
 * Convert a single sRGB channel value (0-1) to linear RGB.
 * Used in the WCAG relative luminance formula.
 */
function sRGBToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

/**
 * Convert HSL values to an RGB tuple (each 0-1).
 */
function hslToRGB(h: number, s: number, l: number): [number, number, number] {
  const sNorm = s / 100
  const lNorm = l / 100
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0, g = 0, b = 0
  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  return [r + m, g + m, b + m]
}

/** Convert HSL to relative luminance (WCAG 2.1 formula) */
export function hslToLuminance(h: number, s: number, l: number): number {
  const [r, g, b] = hslToRGB(h, s, l)
  const rLin = sRGBToLinear(r)
  const gLin = sRGBToLinear(g)
  const bLin = sRGBToLinear(b)
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

/** Calculate contrast ratio between two relative luminances */
export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Check if two HSL colors meet WCAG AA (4.5:1 normal, 3:1 large) */
export function meetsWCAG_AA(
  foreground: string,
  background: string,
  isLargeText = false,
): boolean {
  const fg = parseHSL(foreground)
  const bg = parseHSL(background)
  const fgLum = hslToLuminance(fg.h, fg.s, fg.l)
  const bgLum = hslToLuminance(bg.h, bg.s, bg.l)
  const ratio = contrastRatio(fgLum, bgLum)
  return ratio >= (isLargeText ? 3 : 4.5)
}

/** Check WCAG AAA (7:1 normal, 4.5:1 large) */
export function meetsWCAG_AAA(
  foreground: string,
  background: string,
  isLargeText = false,
): boolean {
  const fg = parseHSL(foreground)
  const bg = parseHSL(background)
  const fgLum = hslToLuminance(fg.h, fg.s, fg.l)
  const bgLum = hslToLuminance(bg.h, bg.s, bg.l)
  const ratio = contrastRatio(fgLum, bgLum)
  return ratio >= (isLargeText ? 4.5 : 7)
}

/**
 * Foreground/background pairs to validate in a theme.
 * Each entry maps a descriptive pair name to the CSS variable names
 * for the foreground and background colors.
 */
const THEME_PAIRS: { pair: string; fg: string; bg: string; largeText?: boolean }[] = [
  { pair: 'foreground / background', fg: '--foreground', bg: '--background' },
  { pair: 'primary / background', fg: '--primary', bg: '--background' },
  { pair: 'primary-foreground / primary', fg: '--primary-foreground', bg: '--primary' },
  { pair: 'secondary-foreground / secondary', fg: '--secondary-foreground', bg: '--secondary' },
  { pair: 'muted-foreground / background', fg: '--muted-foreground', bg: '--background' },
  { pair: 'muted-foreground / muted', fg: '--muted-foreground', bg: '--muted' },
  { pair: 'accent-foreground / accent', fg: '--accent-foreground', bg: '--accent' },
  { pair: 'destructive-foreground / destructive', fg: '--destructive-foreground', bg: '--destructive' },
  { pair: 'card-foreground / card', fg: '--card-foreground', bg: '--card' },
  { pair: 'popover-foreground / popover', fg: '--popover-foreground', bg: '--popover' },
  { pair: 'sidebar-foreground / sidebar-background', fg: '--sidebar-foreground', bg: '--sidebar-background' },
  { pair: 'sidebar-accent-foreground / sidebar-accent', fg: '--sidebar-accent-foreground', bg: '--sidebar-accent' },
]

/** Validate an entire theme's contrast ratios */
export function validateThemeContrast(
  theme: { light: Record<string, string>; dark: Record<string, string> },
): { pair: string; mode: string; ratio: number; passes: boolean }[] {
  const results: { pair: string; mode: string; ratio: number; passes: boolean }[] = []

  for (const mode of ['light', 'dark'] as const) {
    const vars = theme[mode]
    for (const { pair, fg, bg, largeText } of THEME_PAIRS) {
      const fgVal = vars[fg]
      const bgVal = vars[bg]
      if (!fgVal || !bgVal) continue

      // Skip non-HSL values like --radius
      try {
        const fgHSL = parseHSL(fgVal)
        const bgHSL = parseHSL(bgVal)
        const fgLum = hslToLuminance(fgHSL.h, fgHSL.s, fgHSL.l)
        const bgLum = hslToLuminance(bgHSL.h, bgHSL.s, bgHSL.l)
        const ratio = contrastRatio(fgLum, bgLum)
        const threshold = largeText ? 3 : 4.5
        results.push({
          pair: `${mode}: ${pair}`,
          mode,
          ratio: Math.round(ratio * 100) / 100,
          passes: ratio >= threshold,
        })
      } catch {
        // Skip unparseable values
      }
    }
  }

  return results
}
