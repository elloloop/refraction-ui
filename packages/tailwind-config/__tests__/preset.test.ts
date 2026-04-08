import { describe, it, expect } from 'vitest'
import {
  refractionPreset,
  colors,
  keyframes,
  animation,
  utilitiesPlugin,
  refractionTheme,
  luxeTheme,
  warmTheme,
  signalTheme,
  pulseTheme,
  monoTheme,
  glassaTheme,
  THEMES,
  DEFAULT_THEME,
  generateThemeCSS,
  getThemeVariableNames,
  validateThemeContrast,
  type ThemeDefinition,
} from '../src/index.js'

// ---------------------------------------------------------------------------
// Preset
// ---------------------------------------------------------------------------

describe('refractionPreset', () => {
  it('uses class-based dark mode', () => {
    expect(refractionPreset.darkMode).toBe('class')
  })

  it('has container config', () => {
    expect(refractionPreset.theme.container.center).toBe(true)
    expect(refractionPreset.theme.container.padding).toBe('2rem')
    expect(refractionPreset.theme.container.screens['2xl']).toBe('1400px')
  })

  it('extends colors', () => {
    expect(refractionPreset.theme.extend.colors).toBeDefined()
    expect(refractionPreset.theme.extend.colors.primary).toBeDefined()
    expect(refractionPreset.theme.extend.colors.destructive).toBeDefined()
  })

  it('extends border radius with CSS variables', () => {
    expect(refractionPreset.theme.extend.borderRadius.lg).toBe('var(--radius)')
  })

  it('extends font families', () => {
    expect(refractionPreset.theme.extend.fontFamily.sans[0]).toBe('var(--font-sans)')
    expect(refractionPreset.theme.extend.fontFamily.mono[0]).toBe('var(--font-mono)')
  })

  it('extends font sizes via CSS variables', () => {
    const fs = refractionPreset.theme.extend.fontSize
    expect(fs.xs).toBe('var(--font-size-xs)')
    expect(fs.base).toBe('var(--font-size-base)')
    expect(fs['5xl']).toBe('var(--font-size-5xl)')
  })

  it('extends box shadows via CSS variables', () => {
    const bs = refractionPreset.theme.extend.boxShadow
    expect(bs.sm).toBe('var(--shadow-sm)')
    expect(bs.md).toBe('var(--shadow-md)')
    expect(bs.lg).toBe('var(--shadow-lg)')
    expect(bs.xl).toBe('var(--shadow-xl)')
  })

  it('includes keyframes and animations', () => {
    expect(refractionPreset.theme.extend.keyframes).toBeDefined()
    expect(refractionPreset.theme.extend.animation).toBeDefined()
  })

  it('is a valid object with required keys', () => {
    expect(typeof refractionPreset).toBe('object')
    expect(refractionPreset).toHaveProperty('darkMode')
    expect(refractionPreset).toHaveProperty('theme')
    expect(refractionPreset.theme).toHaveProperty('container')
    expect(refractionPreset.theme).toHaveProperty('extend')
    expect(refractionPreset.theme.extend).toHaveProperty('colors')
    expect(refractionPreset.theme.extend).toHaveProperty('borderRadius')
    expect(refractionPreset.theme.extend).toHaveProperty('fontFamily')
    expect(refractionPreset.theme.extend).toHaveProperty('fontSize')
    expect(refractionPreset.theme.extend).toHaveProperty('boxShadow')
    expect(refractionPreset.theme.extend).toHaveProperty('keyframes')
    expect(refractionPreset.theme.extend).toHaveProperty('animation')
  })
})

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

describe('colors', () => {
  it('maps semantic colors to CSS variables', () => {
    expect(colors.background).toBe('hsl(var(--background))')
    expect(colors.foreground).toBe('hsl(var(--foreground))')
    expect(colors.primary.DEFAULT).toBe('hsl(var(--primary))')
    expect(colors.primary.foreground).toBe('hsl(var(--primary-foreground))')
  })

  it('includes chart colors', () => {
    expect(colors.chart[1]).toBe('hsl(var(--chart-1))')
    expect(colors.chart[5]).toBe('hsl(var(--chart-5))')
  })

  it('includes sidebar colors', () => {
    expect(colors.sidebar.DEFAULT).toBe('hsl(var(--sidebar-background))')
  })

  it('background color is defined', () => {
    expect(colors.background).toBe('hsl(var(--background))')
  })

  it('foreground color is defined', () => {
    expect(colors.foreground).toBe('hsl(var(--foreground))')
  })

  it('primary DEFAULT and foreground are defined', () => {
    expect(colors.primary.DEFAULT).toBe('hsl(var(--primary))')
    expect(colors.primary.foreground).toBe('hsl(var(--primary-foreground))')
  })

  it('secondary DEFAULT and foreground are defined', () => {
    expect(colors.secondary.DEFAULT).toBe('hsl(var(--secondary))')
    expect(colors.secondary.foreground).toBe('hsl(var(--secondary-foreground))')
  })

  it('muted DEFAULT and foreground are defined', () => {
    expect(colors.muted.DEFAULT).toBe('hsl(var(--muted))')
    expect(colors.muted.foreground).toBe('hsl(var(--muted-foreground))')
  })

  it('accent DEFAULT and foreground are defined', () => {
    expect(colors.accent.DEFAULT).toBe('hsl(var(--accent))')
    expect(colors.accent.foreground).toBe('hsl(var(--accent-foreground))')
  })

  it('destructive DEFAULT and foreground are defined', () => {
    expect(colors.destructive.DEFAULT).toBe('hsl(var(--destructive))')
    expect(colors.destructive.foreground).toBe('hsl(var(--destructive-foreground))')
  })

  it('sidebar colors all defined', () => {
    expect(colors.sidebar.DEFAULT).toBe('hsl(var(--sidebar-background))')
    expect(colors.sidebar.foreground).toBe('hsl(var(--sidebar-foreground))')
    expect(colors.sidebar.primary).toBe('hsl(var(--sidebar-primary))')
    expect(colors.sidebar['primary-foreground']).toBe('hsl(var(--sidebar-primary-foreground))')
    expect(colors.sidebar.accent).toBe('hsl(var(--sidebar-accent))')
    expect(colors.sidebar['accent-foreground']).toBe('hsl(var(--sidebar-accent-foreground))')
    expect(colors.sidebar.border).toBe('hsl(var(--sidebar-border))')
    expect(colors.sidebar.ring).toBe('hsl(var(--sidebar-ring))')
  })

  it('chart colors 1-5 all defined', () => {
    expect(colors.chart[1]).toBe('hsl(var(--chart-1))')
    expect(colors.chart[2]).toBe('hsl(var(--chart-2))')
    expect(colors.chart[3]).toBe('hsl(var(--chart-3))')
    expect(colors.chart[4]).toBe('hsl(var(--chart-4))')
    expect(colors.chart[5]).toBe('hsl(var(--chart-5))')
  })
})

// ---------------------------------------------------------------------------
// Keyframes & Animations
// ---------------------------------------------------------------------------

describe('keyframes', () => {
  it('defines all animation keyframes', () => {
    expect(keyframes['fade-in']).toBeDefined()
    expect(keyframes['slide-up']).toBeDefined()
    expect(keyframes['toast-in']).toBeDefined()
    expect(keyframes['toast-out']).toBeDefined()
    expect(keyframes['accordion-down']).toBeDefined()
    expect(keyframes['accordion-up']).toBeDefined()
    expect(keyframes['scale-in']).toBeDefined()
  })

  it('fade-in has from/to opacity', () => {
    expect(keyframes['fade-in'].from.opacity).toBe('0')
    expect(keyframes['fade-in'].to.opacity).toBe('1')
  })
})

describe('animation', () => {
  it('defines animation utility values', () => {
    expect(animation['fade-in']).toContain('ease-out')
    expect(animation['toast-in']).toContain('ease-out')
    expect(animation['accordion-down']).toContain('ease-out')
  })
})

// ---------------------------------------------------------------------------
// Utilities plugin
// ---------------------------------------------------------------------------

describe('utilitiesPlugin', () => {
  it('is a function (plugin creator)', () => {
    expect(typeof utilitiesPlugin).toBe('function')
  })

  it('registers utilities when called', () => {
    const utilities: Record<string, unknown> = {}
    utilitiesPlugin({
      addUtilities: (u) => Object.assign(utilities, u),
    })
    expect(utilities['.scrollbar-hide']).toBeDefined()
    expect(utilities['.safe-top']).toBeDefined()
    expect(utilities['.safe-bottom']).toBeDefined()
    expect(utilities['.snap-lane']).toBeDefined()
    expect(utilities['.press-scale']).toBeDefined()
    expect(utilities['.glass']).toBeDefined()
    expect(utilities['.text-gradient']).toBeDefined()
  })

  it('.drag-handle has correct styles', () => {
    const utilities: Record<string, unknown> = {}
    utilitiesPlugin({
      addUtilities: (u) => Object.assign(utilities, u),
    })
    const dragHandle = utilities['.drag-handle'] as Record<string, string>
    expect(dragHandle.width).toBe('36px')
    expect(dragHandle.height).toBe('4px')
    expect(dragHandle['border-radius']).toBe('2px')
    expect(dragHandle.margin).toBe('8px auto')
  })

  it('.momentum-scroll has webkit property', () => {
    const utilities: Record<string, unknown> = {}
    utilitiesPlugin({
      addUtilities: (u) => Object.assign(utilities, u),
    })
    const momentumScroll = utilities['.momentum-scroll'] as Record<string, string>
    expect(momentumScroll['-webkit-overflow-scrolling']).toBe('touch')
  })
})

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------

describe('borderRadius', () => {
  it('all border radius values reference --radius CSS variable', () => {
    const br = refractionPreset.theme.extend.borderRadius
    expect(br.lg).toContain('var(--radius)')
    expect(br.md).toContain('var(--radius)')
    expect(br.sm).toContain('var(--radius)')
  })
})

// ---------------------------------------------------------------------------
// Font families
// ---------------------------------------------------------------------------

describe('fontFamily', () => {
  it('font families have fallback stacks', () => {
    const ff = refractionPreset.theme.extend.fontFamily
    expect(ff.sans.length).toBeGreaterThan(1)
    expect(ff.mono.length).toBeGreaterThan(1)
    expect(ff.serif.length).toBeGreaterThan(1)
    expect(ff.heading.length).toBeGreaterThan(1)
  })
})

// ---------------------------------------------------------------------------
// Container screens
// ---------------------------------------------------------------------------

describe('container screens', () => {
  it('has 2xl breakpoint', () => {
    expect(refractionPreset.theme.container.screens['2xl']).toBe('1400px')
  })
})

// ---------------------------------------------------------------------------
// Animation - keyframe consistency
// ---------------------------------------------------------------------------

describe('animation-keyframe consistency', () => {
  it('all animation keys have matching keyframe definitions', () => {
    for (const key of Object.keys(animation)) {
      expect(keyframes[key]).toBeDefined()
    }
  })
})

// ---------------------------------------------------------------------------
// Theme registry
// ---------------------------------------------------------------------------

describe('THEMES registry', () => {
  it('contains exactly 6 themes', () => {
    expect(Object.keys(THEMES)).toHaveLength(6)
  })

  it('contains all named themes', () => {
    expect(THEMES.refraction).toBeDefined()
    expect(THEMES.luxe).toBeDefined()
    expect(THEMES.warm).toBeDefined()
    expect(THEMES.signal).toBeDefined()
    expect(THEMES.pulse).toBeDefined()
    expect(THEMES.mono).toBeDefined()
  })

  it('DEFAULT_THEME is refraction', () => {
    expect(DEFAULT_THEME).toBe('refraction')
  })
})

// ---------------------------------------------------------------------------
// All 6 themes: structural validation
// ---------------------------------------------------------------------------

const allThemes: [string, ThemeDefinition][] = Object.entries(THEMES)

describe.each(allThemes)('theme "%s" — structural', (_name, theme) => {
  it('has name, displayName, and description', () => {
    expect(theme.name).toBeTruthy()
    expect(theme.displayName).toBeTruthy()
    expect(theme.description).toBeTruthy()
  })

  it('has light and dark color modes', () => {
    expect(theme.colors.light).toBeDefined()
    expect(theme.colors.dark).toBeDefined()
  })

  it('light mode has all required CSS color variables', () => {
    const requiredVars = [
      '--background', '--foreground', '--primary', '--primary-foreground',
      '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
      '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
      '--border', '--input', '--ring', '--radius',
      '--card', '--card-foreground', '--popover', '--popover-foreground',
      '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
      '--sidebar-background', '--sidebar-foreground', '--sidebar-primary',
    ]
    for (const v of requiredVars) {
      expect(theme.colors.light).toHaveProperty(v)
    }
  })

  it('dark mode has same variables as light mode', () => {
    const lightKeys = Object.keys(theme.colors.light).sort()
    const darkKeys = Object.keys(theme.colors.dark).sort()
    expect(darkKeys).toEqual(lightKeys)
  })

  it('light and dark have different background values', () => {
    expect(theme.colors.light['--background']).not.toBe(theme.colors.dark['--background'])
  })

  it('all color values are valid HSL strings', () => {
    for (const [key, value] of Object.entries(theme.colors.light)) {
      if (key === '--radius') continue
      expect(value).toMatch(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/)
    }
  })

  it('radius is a rem value', () => {
    expect(theme.colors.light['--radius']).toMatch(/rem$/)
    expect(theme.radius).toMatch(/rem$/)
  })

  it('has font definitions', () => {
    expect(theme.fonts.sans).toBeTruthy()
    expect(theme.fonts.heading).toBeTruthy()
    expect(theme.fonts.mono).toBeTruthy()
  })

  it('has complete font size scale', () => {
    const sizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] as const
    for (const s of sizes) {
      expect(theme.fontSizes[s]).toMatch(/rem$/)
    }
  })

  it('has font weights', () => {
    expect(theme.fontWeights.normal).toBeTruthy()
    expect(theme.fontWeights.medium).toBeTruthy()
    expect(theme.fontWeights.semibold).toBeTruthy()
    expect(theme.fontWeights.bold).toBeTruthy()
  })

  it('has shadow definitions', () => {
    expect(theme.shadows.none).toBeDefined()
    expect(theme.shadows.sm).toBeDefined()
    expect(theme.shadows.md).toBeDefined()
    expect(theme.shadows.lg).toBeDefined()
    expect(theme.shadows.xl).toBeDefined()
  })

  it('has branding properties', () => {
    expect(theme.overlayOpacity).toBeTruthy()
    expect(theme.backdropBlur).toBeDefined()
    expect(theme.glassBackground).toBeTruthy()
    expect(theme.glassBorder).toBeTruthy()
    expect(theme.density).toBeTruthy()
    expect(typeof theme.spacingScale).toBe('number')
    expect(theme.letterSpacing).toBeDefined()
    expect(theme.letterSpacing.tighter).toBeTruthy()
    expect(theme.letterSpacing.tight).toBeTruthy()
    expect(theme.letterSpacing.wide).toBeDefined()
    expect(theme.letterSpacing.wider).toBeTruthy()
    expect(theme.lineHeight).toBeDefined()
    expect(theme.lineHeight.tight).toBeTruthy()
    expect(theme.lineHeight.normal).toBeTruthy()
    expect(theme.lineHeight.relaxed).toBeTruthy()
    expect(theme.headingWeight).toBeTruthy()
    expect(theme.headingLetterSpacing).toBeTruthy()
    expect(theme.headingLineHeight).toBeTruthy()
    expect(theme.borderWidth).toBeDefined()
    expect(theme.borderStyle).toBeTruthy()
    expect(theme.dividerStyle).toBeTruthy()
    expect(theme.dividerOpacity).toBeTruthy()
    expect(theme.transitionDuration).toBeTruthy()
    expect(theme.transitionEasing).toBeTruthy()
    expect(theme.containerMaxWidth).toBeTruthy()
    expect(theme.containerPadding).toBeTruthy()
    expect(theme.cardPadding).toBeTruthy()
    expect(theme.inputHeight).toBeTruthy()
    expect(theme.buttonHeight).toBeTruthy()
    expect(theme.sectionGap).toBeTruthy()
    expect(theme.radiusScale).toBeDefined()
    expect(theme.radiusScale.none).toBeDefined()
    expect(theme.radiusScale.sm).toBeTruthy()
    expect(theme.radiusScale.md).toBeTruthy()
    expect(theme.radiusScale.lg).toBeTruthy()
    expect(theme.radiusScale.xl).toBeTruthy()
    expect(theme.radiusScale['2xl']).toBeTruthy()
    expect(theme.radiusScale.full).toBeTruthy()
  })

  it('has shape language properties', () => {
    expect(theme.avatarRadius).toBeTruthy()
    expect(theme.badgeRadius).toBeTruthy()
    expect(theme.buttonRadius).toBeTruthy()
    expect(theme.inputRadius).toBeTruthy()
    expect(theme.cardRadius).toBeTruthy()
    expect(theme.tooltipRadius).toBeTruthy()
  })

  it('has component shadow properties', () => {
    expect(theme.cardShadow).toBeDefined()
    expect(theme.dropdownShadow).toBeDefined()
    expect(theme.dialogShadow).toBeDefined()
    expect(theme.buttonShadow).toBeDefined()
  })

  it('has component style properties', () => {
    expect(theme.inputStyle).toBeTruthy()
    expect(typeof theme.inputBorderOnFocus).toBe('boolean')
    expect(theme.placeholderOpacity).toBeTruthy()
    expect(theme.buttonStyle).toBeTruthy()
    expect(theme.buttonWeight).toBeTruthy()
    expect(theme.hoverEffect).toBeTruthy()
    expect(theme.activeEffect).toBeTruthy()
    expect(theme.disabledOpacity).toBeTruthy()
    expect(theme.linkStyle).toBeTruthy()
    expect(theme.linkWeight).toBeTruthy()
  })

  it('has focus style properties', () => {
    expect(theme.focusRingWidth).toBeTruthy()
    expect(theme.focusRingOffset).toBeDefined()
    expect(theme.focusRingStyle).toBeTruthy()
  })

  it('has icon style properties', () => {
    expect(theme.iconStyle).toBeTruthy()
    expect(theme.iconStrokeWidth).toBeTruthy()
    expect(theme.iconSize).toBeTruthy()
  })

  it('has scrollbar style properties', () => {
    expect(theme.scrollbarStyle).toBeTruthy()
    expect(theme.scrollbarTrack).toBeDefined()
    expect(theme.scrollbarThumb).toBeDefined()
  })

  it('has selection style properties', () => {
    expect(theme.selectionBackground).toBeTruthy()
    expect(theme.selectionForeground).toBeTruthy()
  })

  it('has tooltip, table, and spinner style properties', () => {
    expect(theme.tooltipStyle).toBeTruthy()
    expect(theme.tableStyle).toBeTruthy()
    expect(theme.tableHeaderWeight).toBeTruthy()
    expect(theme.spinnerStyle).toBeTruthy()
  })

  it('has motion properties', () => {
    expect(theme.animationSpeed).toBeTruthy()
    expect(theme.hoverTransition).toBeTruthy()
    expect(theme.enterTransition).toBeTruthy()
    expect(theme.exitTransition).toBeTruthy()
  })
})

// ---------------------------------------------------------------------------
// All 6 themes: WCAG AA contrast validation
// ---------------------------------------------------------------------------

describe.each(allThemes)('theme "%s" — WCAG AA contrast', (_name, theme) => {
  it('ALL foreground/background pairs pass WCAG AA', () => {
    const themeForValidation = {
      light: theme.colors.light,
      dark: theme.colors.dark,
    }
    const results = validateThemeContrast(themeForValidation)
    const failures = results.filter(r => !r.passes)
    if (failures.length > 0) {
      const failureMessages = failures
        .map(f => `  ${f.pair}: ${f.ratio}:1 (needs 4.5:1)`)
        .join('\n')
      throw new Error(
        `WCAG AA contrast failures in "${_name}" theme:\n${failureMessages}\n\n` +
        'Fix these colors to meet minimum 4.5:1 contrast ratio.',
      )
    }
    expect(failures).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Backward compat: glassaTheme alias
// ---------------------------------------------------------------------------

describe('glassaTheme (backward compat)', () => {
  it('has light and dark modes', () => {
    expect(glassaTheme.light).toBeDefined()
    expect(glassaTheme.dark).toBeDefined()
  })

  it('has name "refraction"', () => {
    expect(glassaTheme.name).toBe('refraction')
  })

  it('light mode matches refractionTheme colors', () => {
    expect(glassaTheme.light['--primary']).toBe(refractionTheme.colors.light['--primary'])
    expect(glassaTheme.light['--background']).toBe(refractionTheme.colors.light['--background'])
  })
})

// ---------------------------------------------------------------------------
// generateThemeCSS
// ---------------------------------------------------------------------------

describe('generateThemeCSS', () => {
  it('generates valid CSS with :root and .dark selectors', () => {
    const css = generateThemeCSS()
    expect(css).toContain(':root {')
    expect(css).toContain('.dark {')
  })

  it('includes color CSS variables', () => {
    const css = generateThemeCSS()
    expect(css).toContain('--background:')
    expect(css).toContain('--primary:')
  })

  it('includes font variables', () => {
    const css = generateThemeCSS()
    expect(css).toContain('--font-sans:')
    expect(css).toContain('--font-heading:')
    expect(css).toContain('--font-mono:')
  })

  it('includes font size variables', () => {
    const css = generateThemeCSS()
    expect(css).toContain('--font-size-xs:')
    expect(css).toContain('--font-size-base:')
    expect(css).toContain('--font-size-5xl:')
  })

  it('includes shadow variables', () => {
    const css = generateThemeCSS()
    expect(css).toContain('--shadow-none:')
    expect(css).toContain('--shadow-sm:')
    expect(css).toContain('--shadow-md:')
    expect(css).toContain('--shadow-lg:')
    expect(css).toContain('--shadow-xl:')
  })

  it('includes radius variable', () => {
    const css = generateThemeCSS()
    expect(css).toContain('--radius:')
  })

  it('includes branding variables', () => {
    const css = generateThemeCSS()
    // Glass & overlay
    expect(css).toContain('--overlay-opacity:')
    expect(css).toContain('--backdrop-blur:')
    expect(css).toContain('--glass-bg:')
    expect(css).toContain('--glass-border:')
    // Spacing & density
    expect(css).toContain('--spacing-scale:')
    expect(css).toContain('--container-max-width:')
    expect(css).toContain('--container-padding:')
    expect(css).toContain('--card-padding:')
    expect(css).toContain('--input-height:')
    expect(css).toContain('--button-height:')
    expect(css).toContain('--section-gap:')
    // Typography
    expect(css).toContain('--letter-spacing-tighter:')
    expect(css).toContain('--letter-spacing-tight:')
    expect(css).toContain('--letter-spacing-normal:')
    expect(css).toContain('--letter-spacing-wide:')
    expect(css).toContain('--letter-spacing-wider:')
    expect(css).toContain('--line-height-tight:')
    expect(css).toContain('--line-height-normal:')
    expect(css).toContain('--line-height-relaxed:')
    expect(css).toContain('--heading-weight:')
    expect(css).toContain('--heading-letter-spacing:')
    expect(css).toContain('--heading-line-height:')
    // Shape language
    expect(css).toContain('--radius-none:')
    expect(css).toContain('--radius-sm:')
    expect(css).toContain('--radius-md:')
    expect(css).toContain('--radius-lg:')
    expect(css).toContain('--radius-xl:')
    expect(css).toContain('--radius-2xl:')
    expect(css).toContain('--radius-full:')
    expect(css).toContain('--avatar-radius:')
    expect(css).toContain('--badge-radius:')
    expect(css).toContain('--button-radius:')
    expect(css).toContain('--input-radius:')
    expect(css).toContain('--card-radius:')
    expect(css).toContain('--tooltip-radius:')
    // Component shadows
    expect(css).toContain('--card-shadow:')
    expect(css).toContain('--dropdown-shadow:')
    expect(css).toContain('--dialog-shadow:')
    expect(css).toContain('--button-shadow:')
    // Borders & dividers
    expect(css).toContain('--border-width:')
    expect(css).toContain('--border-style:')
    expect(css).toContain('--divider-style:')
    expect(css).toContain('--divider-opacity:')
    // Component styles
    expect(css).toContain('--input-style:')
    expect(css).toContain('--input-border-on-focus:')
    expect(css).toContain('--placeholder-opacity:')
    expect(css).toContain('--button-style:')
    expect(css).toContain('--button-weight:')
    expect(css).toContain('--hover-effect:')
    expect(css).toContain('--active-effect:')
    expect(css).toContain('--disabled-opacity:')
    expect(css).toContain('--link-style:')
    expect(css).toContain('--link-weight:')
    expect(css).toContain('--focus-ring-width:')
    expect(css).toContain('--focus-ring-offset:')
    expect(css).toContain('--focus-ring-style:')
    expect(css).toContain('--icon-style:')
    expect(css).toContain('--icon-stroke-width:')
    expect(css).toContain('--icon-size:')
    expect(css).toContain('--scrollbar-style:')
    expect(css).toContain('--scrollbar-track:')
    expect(css).toContain('--scrollbar-thumb:')
    expect(css).toContain('--selection-background:')
    expect(css).toContain('--selection-foreground:')
    expect(css).toContain('--tooltip-style:')
    expect(css).toContain('--table-style:')
    expect(css).toContain('--table-header-weight:')
    expect(css).toContain('--spinner-style:')
    // Motion
    expect(css).toContain('--transition-duration:')
    expect(css).toContain('--transition-easing:')
    expect(css).toContain('--animation-speed:')
    expect(css).toContain('--hover-transition:')
    expect(css).toContain('--enter-transition:')
    expect(css).toContain('--exit-transition:')
  })

  it('light variables are in :root block', () => {
    const css = generateThemeCSS()
    const rootBlock = css.split('.dark')[0]
    expect(rootBlock).toContain('--background:')
    expect(rootBlock).toContain('--font-sans:')
    expect(rootBlock).toContain('--shadow-sm:')
  })

  it('dark variables are in .dark block', () => {
    const css = generateThemeCSS()
    const darkBlock = css.split('.dark {')[1]
    expect(darkBlock).toContain('--background:')
  })

  it('accepts a custom theme', () => {
    const css = generateThemeCSS(monoTheme)
    expect(css).toContain("'JetBrains Mono'")
    expect(css).toContain('210 10% 23%') // mono primary (Stripe/GitHub slate)
  })
})

// ---------------------------------------------------------------------------
// getThemeVariableNames
// ---------------------------------------------------------------------------

describe('getThemeVariableNames', () => {
  it('returns array of variable names', () => {
    const names = getThemeVariableNames()
    expect(Array.isArray(names)).toBe(true)
    expect(names.length).toBeGreaterThan(20)
  })

  it('all names start with --', () => {
    for (const name of getThemeVariableNames()) {
      expect(name.startsWith('--')).toBe(true)
    }
  })

  it('includes core variables', () => {
    const names = getThemeVariableNames()
    expect(names).toContain('--background')
    expect(names).toContain('--primary')
    expect(names).toContain('--radius')
  })
})
