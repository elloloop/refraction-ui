import { describe, it, expect } from 'vitest'
import {
  parseHSL,
  hslToLuminance,
  contrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  validateThemeContrast,
  glassaTheme,
  refractionTheme,
} from '../src/index.js'

describe('parseHSL', () => {
  it('parses standard "H S% L%" format', () => {
    const result = parseHSL('221 83% 45%')
    expect(result).toEqual({ h: 221, s: 83, l: 45 })
  })

  it('parses zero values', () => {
    const result = parseHSL('0 0% 0%')
    expect(result).toEqual({ h: 0, s: 0, l: 0 })
  })

  it('parses white', () => {
    const result = parseHSL('0 0% 100%')
    expect(result).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('parses decimal hue values', () => {
    const result = parseHSL('221.5 83% 53%')
    expect(result).toEqual({ h: 221.5, s: 83, l: 53 })
  })

  it('handles extra whitespace', () => {
    const result = parseHSL('  221  83%  45%  ')
    expect(result).toEqual({ h: 221, s: 83, l: 45 })
  })

  it('throws on invalid format (missing parts)', () => {
    expect(() => parseHSL('221 83%')).toThrow('Invalid HSL string')
  })

  it('throws on empty string', () => {
    expect(() => parseHSL('')).toThrow('Invalid HSL string')
  })

  it('throws on non-numeric values', () => {
    expect(() => parseHSL('abc def% ghi%')).toThrow('Invalid HSL values')
  })
})

describe('hslToLuminance', () => {
  it('white has luminance of 1', () => {
    const lum = hslToLuminance(0, 0, 100)
    expect(lum).toBeCloseTo(1, 2)
  })

  it('black has luminance of 0', () => {
    const lum = hslToLuminance(0, 0, 0)
    expect(lum).toBeCloseTo(0, 2)
  })

  it('50% gray has luminance around 0.21', () => {
    const lum = hslToLuminance(0, 0, 50)
    expect(lum).toBeGreaterThan(0.18)
    expect(lum).toBeLessThan(0.25)
  })

  it('pure red has expected luminance', () => {
    // Pure red (0, 100%, 50%) should have luminance ~0.2126
    const lum = hslToLuminance(0, 100, 50)
    expect(lum).toBeCloseTo(0.2126, 2)
  })

  it('pure green has expected luminance', () => {
    // Pure green (120, 100%, 50%) should have luminance ~0.7152
    const lum = hslToLuminance(120, 100, 50)
    expect(lum).toBeCloseTo(0.7152, 2)
  })

  it('pure blue has expected luminance', () => {
    // Pure blue (240, 100%, 50%) should have luminance ~0.0722
    const lum = hslToLuminance(240, 100, 50)
    expect(lum).toBeCloseTo(0.0722, 2)
  })
})

describe('contrastRatio', () => {
  it('white vs black is 21:1', () => {
    const ratio = contrastRatio(1, 0)
    expect(ratio).toBeCloseTo(21, 0)
  })

  it('same color has ratio 1:1', () => {
    const ratio = contrastRatio(0.5, 0.5)
    expect(ratio).toBeCloseTo(1, 1)
  })

  it('order of arguments does not matter', () => {
    const ratio1 = contrastRatio(1, 0.2)
    const ratio2 = contrastRatio(0.2, 1)
    expect(ratio1).toBeCloseTo(ratio2, 5)
  })

  it('returns value >= 1', () => {
    const ratio = contrastRatio(0.3, 0.3)
    expect(ratio).toBeGreaterThanOrEqual(1)
  })
})

describe('meetsWCAG_AA', () => {
  const white = '0 0% 100%'
  const black = '0 0% 0%'

  it('black on white passes AA', () => {
    expect(meetsWCAG_AA(black, white)).toBe(true)
  })

  it('white on black passes AA', () => {
    expect(meetsWCAG_AA(white, black)).toBe(true)
  })

  it('light gray on white fails AA', () => {
    // Light gray (#d1d5db ~ 220 13% 84%) on white has very low contrast
    expect(meetsWCAG_AA('220 13% 84%', white)).toBe(false)
  })

  it('medium gray on white fails AA for normal text', () => {
    // ~3:1 contrast — fails normal text, could pass large text
    expect(meetsWCAG_AA('0 0% 60%', white, false)).toBe(false)
  })

  it('medium gray on white passes AA for large text', () => {
    // ~3:1 contrast — passes large text threshold of 3:1
    expect(meetsWCAG_AA('0 0% 57%', white, true)).toBe(true)
  })

  it('updated primary (221 83% 45%) on white passes AA', () => {
    expect(meetsWCAG_AA('221 83% 45%', white)).toBe(true)
  })

  it('new primary (221 83% 45%) on white passes AA', () => {
    expect(meetsWCAG_AA('221 83% 45%', white)).toBe(true)
  })
})

describe('meetsWCAG_AAA', () => {
  const white = '0 0% 100%'
  const black = '0 0% 0%'

  it('black on white passes AAA', () => {
    expect(meetsWCAG_AAA(black, white)).toBe(true)
  })

  it('near-black foreground on white passes AAA', () => {
    // 222 47% 11% is the refraction foreground — very dark
    expect(meetsWCAG_AAA('222 47% 11%', white)).toBe(true)
  })

  it('medium blue on white fails AAA', () => {
    // 221 83% 45% is ~4.6:1 — passes AA but not AAA (needs 7:1)
    expect(meetsWCAG_AAA('221 83% 45%', white)).toBe(false)
  })
})

describe('validateThemeContrast on refraction theme', () => {
  const themeForValidation = {
    light: refractionTheme.colors.light,
    dark: refractionTheme.colors.dark,
  }

  it('returns results for both light and dark modes', () => {
    const results = validateThemeContrast(themeForValidation)
    const lightResults = results.filter(r => r.mode === 'light')
    const darkResults = results.filter(r => r.mode === 'dark')
    expect(lightResults.length).toBeGreaterThan(0)
    expect(darkResults.length).toBeGreaterThan(0)
  })

  it('ALL foreground/background pairs pass WCAG AA', () => {
    const results = validateThemeContrast(themeForValidation)
    const failures = results.filter(r => !r.passes)
    if (failures.length > 0) {
      const failureMessages = failures
        .map(f => `  ${f.pair}: ${f.ratio}:1 (needs 4.5:1)`)
        .join('\n')
      throw new Error(
        `WCAG AA contrast failures detected:\n${failureMessages}\n\n` +
        'Fix these colors in the theme to meet minimum 4.5:1 contrast ratio.',
      )
    }
    expect(failures).toHaveLength(0)
  })

  it('each result has required properties', () => {
    const results = validateThemeContrast(themeForValidation)
    for (const result of results) {
      expect(result).toHaveProperty('pair')
      expect(result).toHaveProperty('mode')
      expect(result).toHaveProperty('ratio')
      expect(result).toHaveProperty('passes')
      expect(typeof result.ratio).toBe('number')
      expect(typeof result.passes).toBe('boolean')
    }
  })

  it('light mode foreground/background has very high contrast', () => {
    const results = validateThemeContrast(themeForValidation)
    const fgBg = results.find(r => r.pair === 'light: foreground / background')
    expect(fgBg).toBeDefined()
    expect(fgBg!.ratio).toBeGreaterThan(10)
  })

  it('light mode primary/background has adequate contrast', () => {
    const results = validateThemeContrast(themeForValidation)
    const primaryBg = results.find(r => r.pair === 'light: primary / background')
    expect(primaryBg).toBeDefined()
    expect(primaryBg!.ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('light mode muted-foreground has adequate contrast', () => {
    const results = validateThemeContrast(themeForValidation)
    const mutedBg = results.find(r => r.pair === 'light: muted-foreground / background')
    expect(mutedBg).toBeDefined()
    expect(mutedBg!.ratio).toBeGreaterThanOrEqual(4.5)
  })

  it('dark mode foreground/background has very high contrast', () => {
    const results = validateThemeContrast(themeForValidation)
    const fgBg = results.find(r => r.pair === 'dark: foreground / background')
    expect(fgBg).toBeDefined()
    expect(fgBg!.ratio).toBeGreaterThan(15)
  })

  it('backward compat: glassaTheme works with validateThemeContrast', () => {
    const results = validateThemeContrast(glassaTheme)
    const failures = results.filter(r => !r.passes)
    expect(failures).toHaveLength(0)
  })
})
