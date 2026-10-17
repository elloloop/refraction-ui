import { describe, it, expect } from 'vitest'
import {
  CATEGORY_COUNT,
  THEMES,
  categoryTokens,
  categoryVariableNames,
  colors,
  contrastRatio,
  hslToLuminance,
  meetsWCAG_AA,
  parseHSL,
  validateThemeContrast,
} from '../src/index.js'

/** WCAG 1.4.11 non-text contrast: the dot is a graphical marker. */
const NON_TEXT_MIN_RATIO = 3
/** Hues closer than this read as the same colour family. */
const MIN_HUE_SEPARATION_DEG = 20
const FULL_CIRCLE_DEG = 360

function ratio(a: string, b: string): number {
  const fg = parseHSL(a)
  const bg = parseHSL(b)
  return contrastRatio(hslToLuminance(fg.h, fg.s, fg.l), hslToLuminance(bg.h, bg.s, bg.l))
}

const indices = Array.from({ length: CATEGORY_COUNT }, (_, i) => i + 1)
const modes = ['light', 'dark'] as const
const cases = Object.entries(THEMES).flatMap(([name, theme]) =>
  modes.flatMap((mode) => indices.map((index) => ({ name, mode, index, vars: theme.colors[mode] }))),
)

describe('categorical palette', () => {
  it('defines the same eight categories in light and dark', () => {
    expect(CATEGORY_COUNT).toBe(8)
    expect(Object.keys(categoryTokens.dark).sort()).toEqual(Object.keys(categoryTokens.light).sort())
    expect(Object.keys(categoryTokens.light)).toHaveLength(CATEGORY_COUNT * 3)
  })

  it('names each category as a dot / wash / foreground triple', () => {
    expect(categoryVariableNames(3)).toEqual({
      dot: '--category-3',
      wash: '--category-3-wash',
      foreground: '--category-3-foreground',
    })
  })

  it.each(cases)('$name $mode category-$index: text on wash meets WCAG AA', ({ vars, index }) => {
    const v = categoryVariableNames(index)
    expect(meetsWCAG_AA(vars[v.foreground], vars[v.wash])).toBe(true)
  })

  it.each(cases)('$name $mode category-$index: dot is ≥ 3:1 on wash and on the page', ({ vars, index }) => {
    const v = categoryVariableNames(index)
    expect(ratio(vars[v.dot], vars[v.wash])).toBeGreaterThanOrEqual(NON_TEXT_MIN_RATIO)
    expect(ratio(vars[v.dot], vars['--background'])).toBeGreaterThanOrEqual(NON_TEXT_MIN_RATIO)
    expect(ratio(vars[v.dot], vars['--card'])).toBeGreaterThanOrEqual(NON_TEXT_MIN_RATIO)
  })

  it('validateThemeContrast reports every category pair, all passing, for every theme', () => {
    for (const theme of Object.values(THEMES)) {
      const results = validateThemeContrast(theme.colors)
      const categoryResults = results.filter((r) => r.pair.includes('category-'))
      expect(categoryResults).toHaveLength(CATEGORY_COUNT * modes.length)
      expect(categoryResults.filter((r) => !r.passes)).toEqual([])
    }
  })

  it('spreads category dots around the hue wheel', () => {
    for (const mode of modes) {
      const hues = indices.map((i) => parseHSL(categoryTokens[mode][categoryVariableNames(i).dot]).h)
      for (let a = 0; a < hues.length; a++) {
        for (let b = a + 1; b < hues.length; b++) {
          const diff = Math.abs(hues[a] - hues[b])
          expect(Math.min(diff, FULL_CIRCLE_DEG - diff)).toBeGreaterThanOrEqual(MIN_HUE_SEPARATION_DEG)
        }
      }
    }
  })

  it('exposes Tailwind colours with contrast-safe neutral fallbacks', () => {
    expect(colors.category[1]).toEqual({
      DEFAULT: 'hsl(var(--category-1, var(--muted-foreground)))',
      wash: 'hsl(var(--category-1-wash, var(--muted)))',
      foreground: 'hsl(var(--category-1-foreground, var(--foreground)))',
    })
    expect(Object.keys(colors.category)).toHaveLength(CATEGORY_COUNT)
  })
})
