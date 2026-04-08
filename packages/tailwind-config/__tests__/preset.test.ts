import { describe, it, expect } from 'vitest'
import { refractionPreset, colors, keyframes, animation, utilitiesPlugin, glassaTheme, generateThemeCSS, getThemeVariableNames } from '../src/index.js'

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

  it('includes keyframes and animations', () => {
    expect(refractionPreset.theme.extend.keyframes).toBeDefined()
    expect(refractionPreset.theme.extend.animation).toBeDefined()
  })
})

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
})

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
})

describe('animation', () => {
  it('defines animation utility values', () => {
    expect(animation['fade-in']).toContain('ease-out')
    expect(animation['toast-in']).toContain('ease-out')
    expect(animation['accordion-down']).toContain('ease-out')
  })
})

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
})

describe('glassaTheme (default theme)', () => {
  it('has light and dark modes', () => {
    expect(glassaTheme.light).toBeDefined()
    expect(glassaTheme.dark).toBeDefined()
  })

  it('light mode has all required CSS variables', () => {
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
      expect(glassaTheme.light).toHaveProperty(v)
    }
  })

  it('dark mode has same variables as light mode', () => {
    const lightKeys = Object.keys(glassaTheme.light)
    const darkKeys = Object.keys(glassaTheme.dark)
    expect(darkKeys).toEqual(lightKeys)
  })

  it('light and dark have different background values', () => {
    expect(glassaTheme.light['--background']).not.toBe(glassaTheme.dark['--background'])
  })

  it('light and dark have different foreground values', () => {
    expect(glassaTheme.light['--foreground']).not.toBe(glassaTheme.dark['--foreground'])
  })

  it('all values are valid HSL strings (3 space-separated numbers)', () => {
    for (const [key, value] of Object.entries(glassaTheme.light)) {
      if (key === '--radius') continue // radius is rem not hsl
      expect(value).toMatch(/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/)
    }
  })

  it('radius is a rem value', () => {
    expect(glassaTheme.light['--radius']).toMatch(/rem$/)
  })

  it('has name', () => {
    expect(glassaTheme.name).toBe('glassa')
  })
})

describe('generateThemeCSS', () => {
  it('generates valid CSS with :root and .dark selectors', () => {
    const css = generateThemeCSS()
    expect(css).toContain(':root {')
    expect(css).toContain('.dark {')
  })

  it('includes all CSS variables in output', () => {
    const css = generateThemeCSS()
    expect(css).toContain('--background:')
    expect(css).toContain('--primary:')
    expect(css).toContain('--radius:')
  })

  it('light variables are in :root block', () => {
    const css = generateThemeCSS()
    const rootBlock = css.split('.dark')[0]
    expect(rootBlock).toContain('--background:')
  })

  it('dark variables are in .dark block', () => {
    const css = generateThemeCSS()
    const darkBlock = css.split('.dark {')[1]
    expect(darkBlock).toContain('--background:')
  })
})

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

describe('animation-keyframe consistency', () => {
  it('all animation keys have matching keyframe definitions', () => {
    for (const key of Object.keys(animation)) {
      expect(keyframes[key]).toBeDefined()
    }
  })
})

describe('colors - comprehensive', () => {
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

describe('borderRadius', () => {
  it('all border radius values reference --radius CSS variable', () => {
    const br = refractionPreset.theme.extend.borderRadius
    expect(br.lg).toContain('var(--radius)')
    expect(br.md).toContain('var(--radius)')
    expect(br.sm).toContain('var(--radius)')
  })
})

describe('fontFamily', () => {
  it('font families have fallback stacks', () => {
    const ff = refractionPreset.theme.extend.fontFamily
    expect(ff.sans.length).toBeGreaterThan(1)
    expect(ff.mono.length).toBeGreaterThan(1)
    expect(ff.serif.length).toBeGreaterThan(1)
    expect(ff.heading.length).toBeGreaterThan(1)
  })
})

describe('container screens', () => {
  it('has 2xl breakpoint', () => {
    expect(refractionPreset.theme.container.screens['2xl']).toBe('1400px')
  })
})

describe('keyframes - specific properties', () => {
  it('fade-in has from/to opacity', () => {
    expect(keyframes['fade-in'].from.opacity).toBe('0')
    expect(keyframes['fade-in'].to.opacity).toBe('1')
  })
})

describe('animation - specific durations', () => {
  it('toast-in uses ease-out', () => {
    expect(animation['toast-in']).toContain('ease-out')
  })
})

describe('utilitiesPlugin - specific utilities', () => {
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

describe('refractionPreset - validity', () => {
  it('is a valid object with required keys', () => {
    expect(typeof refractionPreset).toBe('object')
    expect(refractionPreset).toHaveProperty('darkMode')
    expect(refractionPreset).toHaveProperty('theme')
    expect(refractionPreset.theme).toHaveProperty('container')
    expect(refractionPreset.theme).toHaveProperty('extend')
    expect(refractionPreset.theme.extend).toHaveProperty('colors')
    expect(refractionPreset.theme.extend).toHaveProperty('borderRadius')
    expect(refractionPreset.theme.extend).toHaveProperty('fontFamily')
    expect(refractionPreset.theme.extend).toHaveProperty('keyframes')
    expect(refractionPreset.theme.extend).toHaveProperty('animation')
  })
})
