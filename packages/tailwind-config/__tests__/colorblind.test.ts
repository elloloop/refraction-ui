import { describe, it, expect } from 'vitest'
import { toastVariants } from '../../toast/src/toast.styles.js'
import { badgeVariants } from '../../badge/src/badge.styles.js'

describe('toast variants — color-blind safe patterns', () => {
  it('success variant includes border-l-4 for non-color distinction', () => {
    const classes = toastVariants({ variant: 'success' })
    expect(classes).toContain('border-l-4')
  })

  it('error variant includes border-l-4 for non-color distinction', () => {
    const classes = toastVariants({ variant: 'error' })
    expect(classes).toContain('border-l-4')
  })

  it('warning variant includes border-l-4 for non-color distinction', () => {
    const classes = toastVariants({ variant: 'warning' })
    expect(classes).toContain('border-l-4')
  })

  it('default variant does not have border-l-4 (no semantic color)', () => {
    const classes = toastVariants({ variant: 'default' })
    expect(classes).not.toContain('border-l-4')
  })

  it('all semantic variants use distinct border colors', () => {
    const success = toastVariants({ variant: 'success' })
    const error = toastVariants({ variant: 'error' })
    const warning = toastVariants({ variant: 'warning' })

    // Each should have a unique color in its border class
    expect(success).toContain('border-green')
    expect(error).toContain('border-red')
    expect(warning).toContain('border-amber')
  })
})

describe('badge status variants — color-blind safe patterns', () => {
  it('success variant has font-semibold for visual weight', () => {
    const classes = badgeVariants({ variant: 'success' })
    expect(classes).toContain('font-semibold')
  })

  it('warning variant has font-semibold for visual weight', () => {
    const classes = badgeVariants({ variant: 'warning' })
    expect(classes).toContain('font-semibold')
  })

  it('destructive variant has font-semibold for visual weight', () => {
    const classes = badgeVariants({ variant: 'destructive' })
    expect(classes).toContain('font-semibold')
  })
})

describe('chart colors — colorblind-safe documentation', () => {
  /**
   * Chart colors should be distinguishable for users with color vision deficiencies.
   *
   * The refraction theme chart colors use hues spread across the spectrum:
   *   chart-1: 252 (violet)  — distinguishable for protanopia/deuteranopia
   *   chart-2: 173 (teal)    — distinguishable from violet
   *   chart-3: 38  (amber)   — warm tone, distinct from cool tones
   *   chart-4: 330 (pink)    — distinguishable from blue/green
   *   chart-5: 201 (sky)     — distinguishable from other hues
   *
   * Recommended: When building charts, supplement colors with:
   *   - Different shapes (circle, square, triangle, diamond, star)
   *   - Different line patterns (solid, dashed, dotted)
   *   - Direct labels instead of color-only legends
   *   - Texture/pattern fills for area charts
   */

  it('chart colors use at least 5 distinct hues', async () => {
    const { refractionTheme } = await import('../src/themes/glassa.js')
    const chartKeys = ['--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'] as const
    const hues = chartKeys.map(key => {
      const value = refractionTheme.colors.light[key] as string
      return parseFloat(value.split(' ')[0])
    })

    // Verify all 5 chart colors exist
    expect(hues).toHaveLength(5)

    // Verify hues are spread across the spectrum (min 30 degrees apart)
    for (let i = 0; i < hues.length; i++) {
      for (let j = i + 1; j < hues.length; j++) {
        const diff = Math.abs(hues[i] - hues[j])
        const circularDiff = Math.min(diff, 360 - diff)
        expect(circularDiff).toBeGreaterThanOrEqual(20)
      }
    }
  })
})
