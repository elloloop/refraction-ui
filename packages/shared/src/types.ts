/**
 * Framework-agnostic base prop types for all refraction-ui components.
 * These are headless core types — no React, Angular, or Astro imports.
 * Framework wrappers extend these with framework-specific types.
 */

/** Base props shared by all components */
export interface BaseProps {
  id?: string
  className?: string
  style?: Record<string, string | number>
  [dataAttr: `data-${string}`]: string | undefined
}

/** Accessibility props */
export interface AccessibilityProps {
  role?: string
  tabIndex?: number
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-controls'?: string
  'aria-expanded'?: boolean
  'aria-selected'?: boolean
  'aria-hidden'?: boolean
  'aria-disabled'?: boolean
  'aria-pressed'?: boolean | 'mixed'
  'aria-checked'?: boolean | 'mixed'
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  'aria-live'?: 'off' | 'assertive' | 'polite'
  'aria-atomic'?: boolean
}

/** Theme customization props (framework-agnostic) */
export interface ThemeProps {
  variant?: string
  size?: string
  colorScheme?: string
  disabled?: boolean
}

/** Composition props (framework-agnostic) */
export interface CompositionProps {
  asChild?: boolean
}
