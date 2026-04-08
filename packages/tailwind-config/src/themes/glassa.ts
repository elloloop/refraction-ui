/**
 * Refraction UI Theme System
 *
 * A comprehensive, world-class theme system covering colors, typography,
 * spacing, radius, shadows, and transitions. Six handcrafted presets
 * inspired by the best of Linear, Vercel, and Stripe.
 *
 * All color values are HSL (hue saturation% lightness%) without the hsl()
 * wrapper, because components use them as: hsl(var(--primary))
 *
 * Run `validateThemeContrast(theme.colors)` from contrast.ts to verify
 * WCAG compliance for any theme.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemeDefinition {
  name: string
  displayName: string
  description: string
  /** Colors in HSL values without wrapper */
  colors: {
    light: Record<string, string>
    dark: Record<string, string>
  }
  /** Typography stacks */
  fonts: {
    sans: string
    heading: string
    mono: string
  }
  /** Typographic scale */
  fontSizes: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
  }
  /** Font weights */
  fontWeights: {
    normal: string
    medium: string
    semibold: string
    bold: string
  }
  /** Base border-radius */
  radius: string
  /** Elevation shadows */
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  /** Default transition timing */
  transition: string
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const defaultFontSizes: ThemeDefinition['fontSizes'] = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
}

const defaultFontWeights: ThemeDefinition['fontWeights'] = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}

const defaultShadows: ThemeDefinition['shadows'] = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}

// ---------------------------------------------------------------------------
// 1. Refraction — the DEFAULT theme
//    Vibrant indigo-violet primary. Inspired by Linear + Vercel + Stripe.
//
// WCAG 2.1 Contrast Ratios (light, against --background #ffffff):
//   --foreground       (222 47% 11%)  -> ~16.0:1  AAA
//   --primary          (252 85% 60%)  -> ~4.6:1   AA normal text
//   --muted-foreground (240 4% 46%)   -> ~5.0:1   AA normal text
//   --destructive      (0 84% 50%)    -> ~4.6:1   AA normal text (white fg)
//
// Dark mode (against --background 224 71% 4%):
//   --foreground       (210 40% 98%)  -> ~18.3:1  AAA
//   --primary          (252 78% 65%)  -> ~6.0:1   AA normal text
// ---------------------------------------------------------------------------

export const refractionTheme: ThemeDefinition = {
  name: 'refraction',
  displayName: 'Refraction',
  description: 'Modern, crisp, slightly warm. The default refraction-ui look.',
  colors: {
    light: {
      '--background': '0 0% 100%',
      '--foreground': '222 47% 11%',
      '--card': '0 0% 100%',
      '--card-foreground': '222 47% 11%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222 47% 11%',

      '--primary': '252 85% 60%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '240 5% 96%',
      '--secondary-foreground': '240 4% 43%',
      '--accent': '252 30% 95%',
      '--accent-foreground': '252 50% 45%',

      '--muted': '240 5% 96%',
      '--muted-foreground': '240 4% 43%',
      '--destructive': '0 84% 50%',
      '--destructive-foreground': '0 0% 100%',

      '--border': '240 6% 90%',
      '--input': '240 6% 90%',
      '--ring': '252 85% 60%',

      '--radius': '0.5rem',

      // Charts — vibrant, colorblind-safe
      '--chart-1': '252 85% 60%',
      '--chart-2': '173 80% 40%',
      '--chart-3': '38 92% 50%',
      '--chart-4': '330 65% 55%',
      '--chart-5': '201 96% 42%',

      // Sidebar
      '--sidebar-background': '0 0% 98%',
      '--sidebar-foreground': '222 47% 11%',
      '--sidebar-primary': '252 85% 60%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '252 30% 95%',
      '--sidebar-accent-foreground': '252 50% 45%',
      '--sidebar-border': '240 6% 90%',
      '--sidebar-ring': '252 85% 60%',
    },
    dark: {
      '--background': '224 71% 4%',
      '--foreground': '210 40% 98%',
      '--card': '222 47% 11%',
      '--card-foreground': '210 40% 98%',
      '--popover': '222 47% 11%',
      '--popover-foreground': '210 40% 98%',

      '--primary': '252 78% 68%',
      '--primary-foreground': '252 40% 10%',
      '--secondary': '240 4% 16%',
      '--secondary-foreground': '240 5% 65%',
      '--accent': '252 30% 20%',
      '--accent-foreground': '252 60% 80%',

      '--muted': '240 4% 16%',
      '--muted-foreground': '240 5% 65%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '210 40% 98%',

      '--border': '240 4% 16%',
      '--input': '240 4% 16%',
      '--ring': '252 78% 68%',

      '--radius': '0.5rem',

      '--chart-1': '252 78% 68%',
      '--chart-2': '173 70% 50%',
      '--chart-3': '38 92% 60%',
      '--chart-4': '330 60% 65%',
      '--chart-5': '201 90% 55%',

      '--sidebar-background': '224 71% 4%',
      '--sidebar-foreground': '210 40% 98%',
      '--sidebar-primary': '252 78% 68%',
      '--sidebar-primary-foreground': '252 40% 10%',
      '--sidebar-accent': '252 30% 20%',
      '--sidebar-accent-foreground': '252 60% 80%',
      '--sidebar-border': '240 4% 16%',
      '--sidebar-ring': '252 78% 68%',
    },
  },
  fonts: {
    sans: "'Inter', system-ui, sans-serif",
    heading: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: { ...defaultFontWeights },
  radius: '0.5rem',
  shadows: { ...defaultShadows },
  transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ---------------------------------------------------------------------------
// 2. Luxe — rich, elegant, premium
// ---------------------------------------------------------------------------

export const luxeTheme: ThemeDefinition = {
  name: 'luxe',
  displayName: 'Luxe',
  description: 'Rich, elegant, premium. Deep gold accents with refined typography.',
  colors: {
    light: {
      '--background': '30 20% 99%',
      '--foreground': '20 15% 10%',
      '--card': '30 20% 99%',
      '--card-foreground': '20 15% 10%',
      '--popover': '30 20% 99%',
      '--popover-foreground': '20 15% 10%',

      '--primary': '35 92% 33%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '30 10% 95%',
      '--secondary-foreground': '20 10% 40%',
      '--accent': '35 30% 93%',
      '--accent-foreground': '35 60% 30%',

      '--muted': '30 10% 95%',
      '--muted-foreground': '20 10% 40%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',

      '--border': '30 10% 89%',
      '--input': '30 10% 89%',
      '--ring': '35 92% 33%',

      '--radius': '0.25rem',

      '--chart-1': '35 92% 33%',
      '--chart-2': '200 70% 45%',
      '--chart-3': '160 65% 35%',
      '--chart-4': '280 50% 50%',
      '--chart-5': '350 60% 50%',

      '--sidebar-background': '30 15% 97%',
      '--sidebar-foreground': '20 15% 10%',
      '--sidebar-primary': '35 92% 33%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '35 30% 93%',
      '--sidebar-accent-foreground': '35 60% 30%',
      '--sidebar-border': '30 10% 89%',
      '--sidebar-ring': '35 92% 33%',
    },
    dark: {
      '--background': '20 15% 5%',
      '--foreground': '30 15% 95%',
      '--card': '20 15% 9%',
      '--card-foreground': '30 15% 95%',
      '--popover': '20 15% 9%',
      '--popover-foreground': '30 15% 95%',

      '--primary': '35 85% 50%',
      '--primary-foreground': '20 15% 5%',
      '--secondary': '20 10% 16%',
      '--secondary-foreground': '30 10% 70%',
      '--accent': '35 25% 18%',
      '--accent-foreground': '35 60% 70%',

      '--muted': '20 10% 16%',
      '--muted-foreground': '30 10% 60%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '210 40% 98%',

      '--border': '20 10% 16%',
      '--input': '20 10% 16%',
      '--ring': '35 85% 50%',

      '--radius': '0.25rem',

      '--chart-1': '35 85% 55%',
      '--chart-2': '200 65% 55%',
      '--chart-3': '160 55% 45%',
      '--chart-4': '280 45% 60%',
      '--chart-5': '350 55% 60%',

      '--sidebar-background': '20 15% 5%',
      '--sidebar-foreground': '30 15% 95%',
      '--sidebar-primary': '35 85% 50%',
      '--sidebar-primary-foreground': '20 15% 5%',
      '--sidebar-accent': '35 25% 18%',
      '--sidebar-accent-foreground': '35 60% 70%',
      '--sidebar-border': '20 10% 16%',
      '--sidebar-ring': '35 85% 50%',
    },
  },
  fonts: {
    sans: "'Inter', system-ui, sans-serif",
    heading: "'Playfair Display', Georgia, serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: { ...defaultFontWeights },
  radius: '0.25rem',
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
    md: '0 2px 4px -1px rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
    lg: '0 6px 10px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
    xl: '0 12px 18px -4px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
  },
  transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ---------------------------------------------------------------------------
// 3. Warm — inviting, hospitable, soft
// ---------------------------------------------------------------------------

export const warmTheme: ThemeDefinition = {
  name: 'warm',
  displayName: 'Warm',
  description: 'Inviting, hospitable, soft. Terracotta tones with friendly rounding.',
  colors: {
    light: {
      '--background': '30 50% 99%',
      '--foreground': '15 30% 12%',
      '--card': '30 50% 99%',
      '--card-foreground': '15 30% 12%',
      '--popover': '30 50% 99%',
      '--popover-foreground': '15 30% 12%',

      '--primary': '15 85% 42%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '25 20% 95%',
      '--secondary-foreground': '15 15% 40%',
      '--accent': '15 35% 94%',
      '--accent-foreground': '15 55% 35%',

      '--muted': '25 20% 95%',
      '--muted-foreground': '15 15% 40%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',

      '--border': '25 15% 89%',
      '--input': '25 15% 89%',
      '--ring': '15 85% 42%',

      '--radius': '0.75rem',

      '--chart-1': '15 85% 42%',
      '--chart-2': '195 70% 42%',
      '--chart-3': '155 60% 38%',
      '--chart-4': '270 50% 55%',
      '--chart-5': '45 85% 48%',

      '--sidebar-background': '30 40% 97%',
      '--sidebar-foreground': '15 30% 12%',
      '--sidebar-primary': '15 85% 42%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '15 35% 94%',
      '--sidebar-accent-foreground': '15 55% 35%',
      '--sidebar-border': '25 15% 89%',
      '--sidebar-ring': '15 85% 42%',
    },
    dark: {
      '--background': '15 20% 5%',
      '--foreground': '25 25% 95%',
      '--card': '15 20% 9%',
      '--card-foreground': '25 25% 95%',
      '--popover': '15 20% 9%',
      '--popover-foreground': '25 25% 95%',

      '--primary': '15 80% 60%',
      '--primary-foreground': '15 20% 5%',
      '--secondary': '15 12% 16%',
      '--secondary-foreground': '25 15% 70%',
      '--accent': '15 25% 18%',
      '--accent-foreground': '15 50% 70%',

      '--muted': '15 12% 16%',
      '--muted-foreground': '25 15% 60%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '210 40% 98%',

      '--border': '15 12% 16%',
      '--input': '15 12% 16%',
      '--ring': '15 80% 60%',

      '--radius': '0.75rem',

      '--chart-1': '15 80% 60%',
      '--chart-2': '195 65% 52%',
      '--chart-3': '155 50% 48%',
      '--chart-4': '270 45% 65%',
      '--chart-5': '45 80% 58%',

      '--sidebar-background': '15 20% 5%',
      '--sidebar-foreground': '25 25% 95%',
      '--sidebar-primary': '15 80% 60%',
      '--sidebar-primary-foreground': '15 20% 5%',
      '--sidebar-accent': '15 25% 18%',
      '--sidebar-accent-foreground': '15 50% 70%',
      '--sidebar-border': '15 12% 16%',
      '--sidebar-ring': '15 80% 60%',
    },
  },
  fonts: {
    sans: "'DM Sans', system-ui, sans-serif",
    heading: "'DM Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: { ...defaultFontWeights },
  radius: '0.75rem',
  shadows: {
    sm: '0 1px 3px 0 rgb(120 80 40 / 0.06)',
    md: '0 4px 6px -1px rgb(120 80 40 / 0.08), 0 2px 4px -2px rgb(120 80 40 / 0.06)',
    lg: '0 10px 15px -3px rgb(120 80 40 / 0.08), 0 4px 6px -4px rgb(120 80 40 / 0.06)',
    xl: '0 20px 25px -5px rgb(120 80 40 / 0.1), 0 8px 10px -6px rgb(120 80 40 / 0.08)',
  },
  transition: '180ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ---------------------------------------------------------------------------
// 4. Signal — focused, balanced, functional (communication/productivity)
// ---------------------------------------------------------------------------

export const signalTheme: ThemeDefinition = {
  name: 'signal',
  displayName: 'Signal',
  description: 'Focused, balanced, functional. Teal accents for productivity apps.',
  colors: {
    light: {
      '--background': '0 0% 100%',
      '--foreground': '210 20% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '210 20% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '210 20% 10%',

      '--primary': '175 85% 28%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '175 10% 95%',
      '--secondary-foreground': '175 15% 35%',
      '--accent': '175 25% 93%',
      '--accent-foreground': '175 60% 25%',

      '--muted': '175 10% 95%',
      '--muted-foreground': '175 10% 40%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',

      '--border': '210 10% 90%',
      '--input': '210 10% 90%',
      '--ring': '175 85% 28%',

      '--radius': '0.375rem',

      '--chart-1': '175 85% 28%',
      '--chart-2': '35 85% 50%',
      '--chart-3': '252 65% 55%',
      '--chart-4': '340 60% 50%',
      '--chart-5': '200 80% 45%',

      '--sidebar-background': '0 0% 98%',
      '--sidebar-foreground': '210 20% 10%',
      '--sidebar-primary': '175 85% 28%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '175 25% 93%',
      '--sidebar-accent-foreground': '175 60% 25%',
      '--sidebar-border': '210 10% 90%',
      '--sidebar-ring': '175 85% 28%',
    },
    dark: {
      '--background': '210 20% 5%',
      '--foreground': '175 15% 95%',
      '--card': '210 18% 9%',
      '--card-foreground': '175 15% 95%',
      '--popover': '210 18% 9%',
      '--popover-foreground': '175 15% 95%',

      '--primary': '175 70% 42%',
      '--primary-foreground': '210 20% 5%',
      '--secondary': '175 10% 16%',
      '--secondary-foreground': '175 15% 70%',
      '--accent': '175 20% 18%',
      '--accent-foreground': '175 50% 65%',

      '--muted': '175 10% 16%',
      '--muted-foreground': '175 10% 60%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '210 40% 98%',

      '--border': '210 12% 16%',
      '--input': '210 12% 16%',
      '--ring': '175 70% 42%',

      '--radius': '0.375rem',

      '--chart-1': '175 70% 48%',
      '--chart-2': '35 80% 58%',
      '--chart-3': '252 55% 65%',
      '--chart-4': '340 55% 60%',
      '--chart-5': '200 75% 55%',

      '--sidebar-background': '210 20% 5%',
      '--sidebar-foreground': '175 15% 95%',
      '--sidebar-primary': '175 70% 42%',
      '--sidebar-primary-foreground': '210 20% 5%',
      '--sidebar-accent': '175 20% 18%',
      '--sidebar-accent-foreground': '175 50% 65%',
      '--sidebar-border': '210 12% 16%',
      '--sidebar-ring': '175 70% 42%',
    },
  },
  fonts: {
    sans: "'IBM Plex Sans', system-ui, sans-serif",
    heading: "'IBM Plex Sans', system-ui, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: { ...defaultFontWeights },
  radius: '0.375rem',
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.06)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
  },
  transition: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ---------------------------------------------------------------------------
// 5. Pulse — energetic, bold, youthful
// ---------------------------------------------------------------------------

export const pulseTheme: ThemeDefinition = {
  name: 'pulse',
  displayName: 'Pulse',
  description: 'Energetic, bold, youthful. Hot pink with dramatic shadows.',
  colors: {
    light: {
      '--background': '0 0% 100%',
      '--foreground': '330 15% 10%',
      '--card': '0 0% 100%',
      '--card-foreground': '330 15% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '330 15% 10%',

      '--primary': '330 85% 45%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '330 10% 95%',
      '--secondary-foreground': '330 15% 38%',
      '--accent': '330 30% 94%',
      '--accent-foreground': '330 55% 38%',

      '--muted': '330 10% 95%',
      '--muted-foreground': '330 10% 40%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',

      '--border': '330 8% 90%',
      '--input': '330 8% 90%',
      '--ring': '330 85% 45%',

      '--radius': '1rem',

      '--chart-1': '330 85% 45%',
      '--chart-2': '190 80% 42%',
      '--chart-3': '55 80% 48%',
      '--chart-4': '260 65% 55%',
      '--chart-5': '140 60% 40%',

      '--sidebar-background': '330 5% 98%',
      '--sidebar-foreground': '330 15% 10%',
      '--sidebar-primary': '330 85% 45%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '330 30% 94%',
      '--sidebar-accent-foreground': '330 55% 38%',
      '--sidebar-border': '330 8% 90%',
      '--sidebar-ring': '330 85% 45%',
    },
    dark: {
      '--background': '330 15% 4%',
      '--foreground': '330 10% 96%',
      '--card': '330 12% 8%',
      '--card-foreground': '330 10% 96%',
      '--popover': '330 12% 8%',
      '--popover-foreground': '330 10% 96%',

      '--primary': '330 80% 60%',
      '--primary-foreground': '330 15% 4%',
      '--secondary': '330 10% 16%',
      '--secondary-foreground': '330 10% 70%',
      '--accent': '330 25% 18%',
      '--accent-foreground': '330 50% 70%',

      '--muted': '330 10% 16%',
      '--muted-foreground': '330 8% 60%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '210 40% 98%',

      '--border': '330 10% 16%',
      '--input': '330 10% 16%',
      '--ring': '330 80% 60%',

      '--radius': '1rem',

      '--chart-1': '330 80% 62%',
      '--chart-2': '190 75% 52%',
      '--chart-3': '55 75% 58%',
      '--chart-4': '260 55% 65%',
      '--chart-5': '140 50% 50%',

      '--sidebar-background': '330 15% 4%',
      '--sidebar-foreground': '330 10% 96%',
      '--sidebar-primary': '330 80% 60%',
      '--sidebar-primary-foreground': '330 15% 4%',
      '--sidebar-accent': '330 25% 18%',
      '--sidebar-accent-foreground': '330 50% 70%',
      '--sidebar-border': '330 10% 16%',
      '--sidebar-ring': '330 80% 60%',
    },
  },
  fonts: {
    sans: "'Outfit', system-ui, sans-serif",
    heading: "'Outfit', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: { ...defaultFontWeights },
  radius: '1rem',
  shadows: {
    sm: '0 2px 4px 0 rgb(0 0 0 / 0.08)',
    md: '0 6px 10px -2px rgb(0 0 0 / 0.12), 0 3px 5px -2px rgb(0 0 0 / 0.08)',
    lg: '0 14px 20px -4px rgb(0 0 0 / 0.14), 0 6px 8px -4px rgb(0 0 0 / 0.1)',
    xl: '0 24px 32px -6px rgb(0 0 0 / 0.16), 0 10px 12px -6px rgb(0 0 0 / 0.1)',
  },
  transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ---------------------------------------------------------------------------
// 6. Mono — stark, Swiss-style, typographic
// ---------------------------------------------------------------------------

export const monoTheme: ThemeDefinition = {
  name: 'mono',
  displayName: 'Mono',
  description: 'Stark, Swiss-style, typographic. Black, white, and nothing else.',
  colors: {
    light: {
      '--background': '0 0% 100%',
      '--foreground': '0 0% 4%',
      '--card': '0 0% 100%',
      '--card-foreground': '0 0% 4%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '0 0% 4%',

      '--primary': '0 0% 9%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '0 0% 96%',
      '--secondary-foreground': '0 0% 35%',
      '--accent': '0 0% 94%',
      '--accent-foreground': '0 0% 15%',

      '--muted': '0 0% 96%',
      '--muted-foreground': '0 0% 40%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',

      '--border': '0 0% 89%',
      '--input': '0 0% 89%',
      '--ring': '0 0% 9%',

      '--radius': '0rem',

      '--chart-1': '0 0% 9%',
      '--chart-2': '0 0% 35%',
      '--chart-3': '0 0% 55%',
      '--chart-4': '0 0% 72%',
      '--chart-5': '0 0% 88%',

      '--sidebar-background': '0 0% 98%',
      '--sidebar-foreground': '0 0% 4%',
      '--sidebar-primary': '0 0% 9%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '0 0% 94%',
      '--sidebar-accent-foreground': '0 0% 15%',
      '--sidebar-border': '0 0% 89%',
      '--sidebar-ring': '0 0% 9%',
    },
    dark: {
      '--background': '0 0% 4%',
      '--foreground': '0 0% 96%',
      '--card': '0 0% 7%',
      '--card-foreground': '0 0% 96%',
      '--popover': '0 0% 7%',
      '--popover-foreground': '0 0% 96%',

      '--primary': '0 0% 92%',
      '--primary-foreground': '0 0% 4%',
      '--secondary': '0 0% 14%',
      '--secondary-foreground': '0 0% 65%',
      '--accent': '0 0% 16%',
      '--accent-foreground': '0 0% 85%',

      '--muted': '0 0% 14%',
      '--muted-foreground': '0 0% 60%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '210 40% 98%',

      '--border': '0 0% 16%',
      '--input': '0 0% 16%',
      '--ring': '0 0% 92%',

      '--radius': '0rem',

      '--chart-1': '0 0% 92%',
      '--chart-2': '0 0% 72%',
      '--chart-3': '0 0% 52%',
      '--chart-4': '0 0% 35%',
      '--chart-5': '0 0% 18%',

      '--sidebar-background': '0 0% 4%',
      '--sidebar-foreground': '0 0% 96%',
      '--sidebar-primary': '0 0% 92%',
      '--sidebar-primary-foreground': '0 0% 4%',
      '--sidebar-accent': '0 0% 16%',
      '--sidebar-accent-foreground': '0 0% 85%',
      '--sidebar-border': '0 0% 16%',
      '--sidebar-ring': '0 0% 92%',
    },
  },
  fonts: {
    sans: "'JetBrains Mono', ui-monospace, monospace",
    heading: "'JetBrains Mono', ui-monospace, monospace",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: { ...defaultFontWeights },
  radius: '0rem',
  shadows: {
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
  },
  transition: '100ms linear',
}

// ---------------------------------------------------------------------------
// Theme registry
// ---------------------------------------------------------------------------

export const THEMES: Record<string, ThemeDefinition> = {
  refraction: refractionTheme,
  luxe: luxeTheme,
  warm: warmTheme,
  signal: signalTheme,
  pulse: pulseTheme,
  mono: monoTheme,
}

export const DEFAULT_THEME = 'refraction'

// ---------------------------------------------------------------------------
// Backward compat — glassaTheme alias
// ---------------------------------------------------------------------------

/** @deprecated Use `refractionTheme` or `THEMES.refraction` instead */
export const glassaTheme = {
  name: refractionTheme.name,
  light: refractionTheme.colors.light,
  dark: refractionTheme.colors.dark,
} as const

// ---------------------------------------------------------------------------
// CSS generation
// ---------------------------------------------------------------------------

/**
 * Generate a full CSS string from a ThemeDefinition for injection into a
 * <style> tag or CSS file. Covers colors, typography, layout, shadows, and
 * transitions.
 */
export function generateThemeCSS(theme: ThemeDefinition = refractionTheme): string {
  const colorVarsLight = Object.entries(theme.colors.light)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')

  const colorVarsDark = Object.entries(theme.colors.dark)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')

  const typographyVars = [
    `  --font-sans: ${theme.fonts.sans};`,
    `  --font-heading: ${theme.fonts.heading};`,
    `  --font-mono: ${theme.fonts.mono};`,
    '',
    `  --font-size-xs: ${theme.fontSizes.xs};`,
    `  --font-size-sm: ${theme.fontSizes.sm};`,
    `  --font-size-base: ${theme.fontSizes.base};`,
    `  --font-size-lg: ${theme.fontSizes.lg};`,
    `  --font-size-xl: ${theme.fontSizes.xl};`,
    `  --font-size-2xl: ${theme.fontSizes['2xl']};`,
    `  --font-size-3xl: ${theme.fontSizes['3xl']};`,
    `  --font-size-4xl: ${theme.fontSizes['4xl']};`,
    `  --font-size-5xl: ${theme.fontSizes['5xl']};`,
    '',
    `  --font-weight-normal: ${theme.fontWeights.normal};`,
    `  --font-weight-medium: ${theme.fontWeights.medium};`,
    `  --font-weight-semibold: ${theme.fontWeights.semibold};`,
    `  --font-weight-bold: ${theme.fontWeights.bold};`,
  ].join('\n')

  const layoutVars = [
    `  --radius: ${theme.radius};`,
  ].join('\n')

  const shadowVars = [
    `  --shadow-sm: ${theme.shadows.sm};`,
    `  --shadow-md: ${theme.shadows.md};`,
    `  --shadow-lg: ${theme.shadows.lg};`,
    `  --shadow-xl: ${theme.shadows.xl};`,
  ].join('\n')

  const transitionVars = [
    `  --transition: ${theme.transition};`,
  ].join('\n')

  return [
    ':root {',
    '  /* Colors */',
    colorVarsLight,
    '',
    '  /* Typography */',
    typographyVars,
    '',
    '  /* Layout */',
    layoutVars,
    '',
    '  /* Shadows */',
    shadowVars,
    '',
    '  /* Transitions */',
    transitionVars,
    '}',
    '',
    '.dark {',
    colorVarsDark,
    '}',
    '',
  ].join('\n')
}

/** Get all CSS variable names from the default theme (useful for validation) */
export function getThemeVariableNames(): string[] {
  return Object.keys(refractionTheme.colors.light)
}
