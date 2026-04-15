// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageShellConfig {
  /** Max width for contained sections (default '80rem') */
  maxWidth?: string
  /** Navigation bar height (default '4rem') */
  navHeight?: string
  /** Whether nav is transparent (for hero sections, default false) */
  navTransparent?: boolean
  /** Whether nav is sticky (default true) */
  navSticky?: boolean
  /** Number of footer columns (default 4) */
  footerColumns?: number
}

export interface SectionConfig {
  /** Whether section spans edge-to-edge (default false) */
  fullWidth?: boolean
  /** Override max-width for this section */
  maxWidth?: string
  /** Whether section has padding (default true) */
  padding?: boolean
  /** Background variant */
  background?: 'default' | 'muted' | 'primary' | 'none'
}

export interface PageShellAPI {
  /** Resolved config with all defaults applied */
  config: Required<PageShellConfig>
  /** ARIA attributes for the nav region */
  navAriaProps: Record<string, string>
  /** ARIA attributes for the footer region */
  footerAriaProps: Record<string, string>
  /** Returns Tailwind utility classes for a section */
  getSectionClasses(sectionConfig?: SectionConfig): string
  /** CSS custom property map */
  getCSSVariables(): Record<string, string>
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULTS: Required<PageShellConfig> = {
  maxWidth: '80rem',
  navHeight: '4rem',
  navTransparent: false,
  navSticky: true,
  footerColumns: 4,
}

// ---------------------------------------------------------------------------
// Background class map
// ---------------------------------------------------------------------------

const BACKGROUND_CLASSES: Record<NonNullable<SectionConfig['background']>, string> = {
  default: '',
  muted: 'bg-muted',
  primary: 'bg-primary text-primary-foreground',
  none: '',
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createPageShell(config?: PageShellConfig): PageShellAPI {
  const resolved: Required<PageShellConfig> = {
    ...DEFAULTS,
    ...(config ? Object.fromEntries(Object.entries(config).filter(([_, v]) => v !== undefined)) : {})
  } as Required<PageShellConfig>

  function getSectionClasses(sectionConfig?: SectionConfig): string {
    const {
      fullWidth = false,
      maxWidth,
      padding = true,
      background = 'default',
    } = sectionConfig ?? {}

    const classes: string[] = []

    if (!fullWidth) {
      classes.push('mx-auto')
      classes.push('w-full')
      // Use custom max-width or fall through to CSS variable
      if (maxWidth) {
        classes.push(`max-w-${maxWidth}`)
      } else {
        classes.push('max-w-[var(--page-max-width)]')
      }
    }

    if (padding) {
      classes.push('px-4 sm:px-6 lg:px-8')
    }

    const bg = BACKGROUND_CLASSES[background]
    if (bg) {
      classes.push(bg)
    }

    return classes.join(' ')
  }

  function getCSSVariables(): Record<string, string> {
    return {
      '--page-max-width': resolved.maxWidth,
      '--page-nav-height': resolved.navHeight,
      '--page-footer-columns': String(resolved.footerColumns),
    }
  }

  return {
    config: resolved,
    navAriaProps: {
      role: 'navigation',
      'aria-label': 'Main navigation',
    },
    footerAriaProps: {
      role: 'contentinfo',
    },
    getSectionClasses,
    getCSSVariables,
  }
}
