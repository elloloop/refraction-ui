/**
 * Categorical palette (issue #593).
 *
 * Unlike the status colours, a category has no meaning of its own: it only
 * tells one speaker, tag or series apart from its neighbours. Each entry is a
 * triple so a chip can draw a solid marker on a pale surface and still set
 * readable text on it:
 *
 *   --category-N             the dot / marker (≥ 3:1 against wash and background)
 *   --category-N-wash        the pale surface behind the label
 *   --category-N-foreground  text on the wash (≥ 4.5:1, WCAG AA)
 *
 * The palette is shared by every theme: categorical hues must stay
 * distinguishable from each other, so they are not re-tinted per brand.
 * Hues are spread around the wheel (violet, teal, amber, pink, blue, green,
 * vermilion, purple) so neighbouring categories never share a hue family.
 * `__tests__/categories.test.ts` checks every ratio in light and dark.
 */

/** Number of categorical colours each theme defines. */
export const CATEGORY_COUNT = 8

export const categoryTokens: { light: Record<string, string>; dark: Record<string, string> } = {
  light: {
    '--category-1': '250 55% 55%',
    '--category-1-wash': '250 60% 95%',
    '--category-1-foreground': '250 50% 30%',
    '--category-2': '173 80% 32%',
    '--category-2-wash': '173 55% 92%',
    '--category-2-foreground': '173 80% 20%',
    '--category-3': '36 92% 36%',
    '--category-3-wash': '42 90% 91%',
    '--category-3-foreground': '30 80% 24%',
    '--category-4': '330 65% 50%',
    '--category-4-wash': '330 70% 95%',
    '--category-4-foreground': '330 65% 30%',
    '--category-5': '210 85% 45%',
    '--category-5-wash': '210 85% 94%',
    '--category-5-foreground': '210 80% 28%',
    '--category-6': '142 65% 32%',
    '--category-6-wash': '142 55% 92%',
    '--category-6-foreground': '142 70% 20%',
    '--category-7': '6 78% 50%',
    '--category-7-wash': '6 85% 95%',
    '--category-7-foreground': '6 75% 32%',
    '--category-8': '285 55% 50%',
    '--category-8-wash': '285 60% 95%',
    '--category-8-foreground': '285 55% 30%',
  },
  dark: {
    '--category-1': '250 70% 70%',
    '--category-1-wash': '250 30% 20%',
    '--category-1-foreground': '250 80% 88%',
    '--category-2': '173 60% 50%',
    '--category-2-wash': '173 40% 16%',
    '--category-2-foreground': '173 60% 80%',
    '--category-3': '38 90% 58%',
    '--category-3-wash': '38 40% 17%',
    '--category-3-foreground': '42 90% 80%',
    '--category-4': '330 70% 68%',
    '--category-4-wash': '330 30% 20%',
    '--category-4-foreground': '330 80% 87%',
    '--category-5': '210 85% 65%',
    '--category-5-wash': '210 40% 19%',
    '--category-5-foreground': '210 90% 86%',
    '--category-6': '142 55% 52%',
    '--category-6-wash': '142 35% 16%',
    '--category-6-foreground': '142 55% 80%',
    '--category-7': '6 85% 66%',
    '--category-7-wash': '6 35% 19%',
    '--category-7-foreground': '6 90% 87%',
    '--category-8': '285 60% 70%',
    '--category-8-wash': '285 30% 20%',
    '--category-8-foreground': '285 70% 88%',
  },
}

/** The three CSS variable names that make up category `index` (1-based). */
export function categoryVariableNames(index: number): {
  dot: string
  wash: string
  foreground: string
} {
  const base = `--category-${index}`
  return { dot: base, wash: `${base}-wash`, foreground: `${base}-foreground` }
}
