/**
 * Refraction UI Theme System
 *
 * Product-inspired themes drawn from real, successful design systems.
 * Every color is a researched, intentional choice — not arbitrary.
 *
 * All color values are HSL (hue saturation% lightness%) without the hsl()
 * wrapper, because components use them as: hsl(var(--primary))
 *
 * Run `validateThemeContrast(theme.colors)` from contrast.ts to verify
 * WCAG compliance for any theme.
 *
 * Inspirations:
 *   Refraction — Linear.app + Vercel (calm violet, crisp, professional)
 *   Luxe       — Apple.com product pages (premium blue, spacious, precise)
 *   Warm       — Airbnb + Notion (coral, inviting, warm off-white)
 *   Signal     — Slack + Linear (teal, dense, productive)
 *   Pulse      — Spotify + Discord (blurple, bold, playful)
 *   Mono       — Stripe docs + GitHub (slate, technical, code-first)
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

// ---------------------------------------------------------------------------
// 1. Refraction — the DEFAULT theme
//    Inspired by Linear.app + Vercel
//
//    Linear: #FCFCFC background, muted violet-blue #5E6AD2 primary,
//            barely-there borders, Inter font, 6px radius, ultra-subtle shadows
//    Vercel: High-contrast black/white, Geist font, minimal whitespace
//
//    Blend: Linear's calm violet with Vercel's crispness.
//    Primary is a muted, sophisticated violet — not bright or screaming.
//
// WCAG 2.1 Contrast Ratios (light, against --background 0 0% 99%):
//   --foreground       (240 10% 10%)  -> ~17.5:1  AAA
//   --primary          (250 50% 50%)  -> ~7.2:1   AAA (muted violet ~#6366F1)
//   --muted-foreground (240 4% 44%)   -> ~5.1:1   AA
//   --destructive-fg on destructive   -> ~4.5:1   AA
//
// Dark mode (against --background 240 10% 4%):
//   --foreground       (0 0% 98%)     -> ~19.0:1  AAA
//   --primary          (250 50% 65%)  -> ~5.4:1   AA
// ---------------------------------------------------------------------------

export const refractionTheme: ThemeDefinition = {
  name: 'refraction',
  displayName: 'Refraction',
  description: 'Calm, professional, no visual noise. Inspired by Linear and Vercel.',
  colors: {
    light: {
      '--background': '0 0% 99%',
      '--foreground': '240 10% 10%',
      '--card': '0 0% 99%',
      '--card-foreground': '240 10% 10%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '240 10% 10%',

      '--primary': '250 50% 50%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '240 5% 96%',
      '--secondary-foreground': '240 4% 44%',
      '--accent': '250 30% 95%',
      '--accent-foreground': '250 50% 40%',

      '--muted': '240 5% 96%',
      '--muted-foreground': '240 4% 44%',
      '--destructive': '0 84% 50%',
      '--destructive-foreground': '0 0% 100%',

      '--success': '142 71% 35%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '240 10% 10%',

      '--border': '240 6% 92%',
      '--input': '240 6% 92%',
      '--ring': '250 50% 50%',

      '--radius': '0.375rem',

      // Charts — colorblind-safe, spread across spectrum
      '--chart-1': '250 50% 50%',
      '--chart-2': '173 80% 36%',
      '--chart-3': '38 92% 50%',
      '--chart-4': '330 65% 50%',
      '--chart-5': '201 96% 42%',

      // Sidebar
      '--sidebar-background': '0 0% 98%',
      '--sidebar-foreground': '240 10% 10%',
      '--sidebar-primary': '250 50% 50%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '250 30% 95%',
      '--sidebar-accent-foreground': '250 50% 40%',
      '--sidebar-border': '240 6% 92%',
      '--sidebar-ring': '250 50% 50%',
    },
    dark: {
      '--background': '240 10% 4%',
      '--foreground': '0 0% 98%',
      '--card': '240 10% 8%',
      '--card-foreground': '0 0% 98%',
      '--popover': '240 10% 8%',
      '--popover-foreground': '0 0% 98%',

      '--primary': '250 50% 65%',
      '--primary-foreground': '240 10% 4%',
      '--secondary': '240 5% 16%',
      '--secondary-foreground': '240 5% 65%',
      '--accent': '250 30% 20%',
      '--accent-foreground': '250 60% 80%',

      '--muted': '240 5% 16%',
      '--muted-foreground': '240 5% 65%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '0 0% 98%',

      '--success': '142 71% 45%',
      '--success-foreground': '0 0% 98%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '240 10% 4%',

      '--border': '240 5% 16%',
      '--input': '240 5% 16%',
      '--ring': '250 50% 65%',

      '--radius': '0.375rem',

      '--chart-1': '250 50% 65%',
      '--chart-2': '173 70% 50%',
      '--chart-3': '38 92% 60%',
      '--chart-4': '330 60% 65%',
      '--chart-5': '201 90% 55%',

      '--sidebar-background': '240 10% 4%',
      '--sidebar-foreground': '0 0% 98%',
      '--sidebar-primary': '250 50% 65%',
      '--sidebar-primary-foreground': '240 10% 4%',
      '--sidebar-accent': '250 30% 20%',
      '--sidebar-accent-foreground': '250 60% 80%',
      '--sidebar-border': '240 5% 16%',
      '--sidebar-ring': '250 50% 65%',
    },
  },
  fonts: {
    sans: "'Inter', system-ui, sans-serif",
    heading: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: { ...defaultFontWeights },
  radius: '0.375rem',
  shadows: {
    // Linear-style: barely there, 0.03 opacity
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
    md: '0 2px 4px -1px rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.03)',
    lg: '0 6px 10px -2px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
    xl: '0 12px 20px -4px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
  },
  transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ---------------------------------------------------------------------------
// 2. Luxe — inspired by Apple.com product pages
//
//    Apple: #1d1d1f warm black text, #0071E3 blue primary,
//           SF Pro Display font, 12-18px radius, no visible borders,
//           shadows + background shifts, generous spacing, premium feel.
//
// WCAG 2.1 Contrast Ratios (light, against --background 0 0% 100%):
//   --foreground       (0 0% 12%)     -> ~16.6:1  AAA
//   --primary          (220 90% 45%)  -> ~6.6:1   AA (Apple blue #0071E3)
//   --muted-foreground (220 5% 40%)   -> ~5.9:1   AA
//
// Dark mode (against --background 0 0% 7%):
//   --foreground       (0 0% 98%)     -> ~18.0:1  AAA
//   --primary          (220 85% 60%)  -> ~4.8:1   AA
// ---------------------------------------------------------------------------

export const luxeTheme: ThemeDefinition = {
  name: 'luxe',
  displayName: 'Luxe',
  description: 'Premium, spacious, every pixel matters. Inspired by Apple product pages.',
  colors: {
    light: {
      '--background': '0 0% 100%',
      '--foreground': '0 0% 12%',
      '--card': '0 0% 100%',
      '--card-foreground': '0 0% 12%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '0 0% 12%',

      '--primary': '220 90% 45%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '220 5% 96%',
      '--secondary-foreground': '220 5% 40%',
      '--accent': '220 30% 95%',
      '--accent-foreground': '220 60% 35%',

      '--muted': '220 5% 96%',
      '--muted-foreground': '220 5% 40%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',

      '--success': '142 71% 35%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '0 0% 12%',

      '--border': '220 6% 93%',
      '--input': '220 6% 93%',
      '--ring': '220 90% 45%',

      '--radius': '0.75rem',

      '--chart-1': '220 90% 45%',
      '--chart-2': '160 65% 38%',
      '--chart-3': '38 85% 50%',
      '--chart-4': '280 50% 50%',
      '--chart-5': '350 60% 50%',

      '--sidebar-background': '0 0% 98%',
      '--sidebar-foreground': '0 0% 12%',
      '--sidebar-primary': '220 90% 45%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '220 30% 95%',
      '--sidebar-accent-foreground': '220 60% 35%',
      '--sidebar-border': '220 6% 93%',
      '--sidebar-ring': '220 90% 45%',
    },
    dark: {
      '--background': '0 0% 7%',
      '--foreground': '0 0% 98%',
      '--card': '0 0% 10%',
      '--card-foreground': '0 0% 98%',
      '--popover': '0 0% 10%',
      '--popover-foreground': '0 0% 98%',

      '--primary': '220 85% 60%',
      '--primary-foreground': '0 0% 7%',
      '--secondary': '220 5% 16%',
      '--secondary-foreground': '220 5% 65%',
      '--accent': '220 25% 18%',
      '--accent-foreground': '220 60% 75%',

      '--muted': '220 5% 16%',
      '--muted-foreground': '220 5% 60%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '0 0% 98%',

      '--success': '142 71% 45%',
      '--success-foreground': '0 0% 98%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '0 0% 7%',

      '--border': '220 5% 16%',
      '--input': '220 5% 16%',
      '--ring': '220 85% 60%',

      '--radius': '0.75rem',

      '--chart-1': '220 85% 60%',
      '--chart-2': '160 55% 48%',
      '--chart-3': '38 85% 58%',
      '--chart-4': '280 45% 60%',
      '--chart-5': '350 55% 60%',

      '--sidebar-background': '0 0% 5%',
      '--sidebar-foreground': '0 0% 98%',
      '--sidebar-primary': '220 85% 60%',
      '--sidebar-primary-foreground': '0 0% 7%',
      '--sidebar-accent': '220 25% 18%',
      '--sidebar-accent-foreground': '220 60% 75%',
      '--sidebar-border': '220 5% 16%',
      '--sidebar-ring': '220 85% 60%',
    },
  },
  fonts: {
    // SF Pro on Mac, Segoe UI on Windows — the native premium feel
    sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    heading: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'SF Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  radius: '0.75rem',
  shadows: {
    // Apple-style: soft, diffused
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.04)',
    md: '0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
    lg: '0 8px 16px -4px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
    xl: '0 16px 24px -6px rgb(0 0 0 / 0.1), 0 6px 10px -4px rgb(0 0 0 / 0.06)',
  },
  transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ---------------------------------------------------------------------------
// 3. Warm — inspired by Airbnb + Notion
//
//    Airbnb: #FF385C Rausch coral-pink primary, 12px radius,
//            Cereal/Circular font, warm and inviting
//    Notion: Very warm off-white #FFFEFA, sepia-tinted, minimal borders,
//            Charter/serif content font
//
//    Blend: Airbnb's coral warmth with Notion's cozy off-white.
//
// WCAG 2.1 Contrast Ratios (light, against --background 35 40% 99%):
//   --foreground       (15 20% 12%)   -> ~16.4:1  AAA
//   --primary          (350 85% 46%)  -> ~5.1:1   AA (warm coral)
//   --muted-foreground (25 10% 40%)   -> ~5.6:1   AA
//
// Dark mode (against --background 15 15% 5%):
//   --foreground       (30 20% 95%)   -> ~17.5:1  AAA
//   --primary          (350 80% 65%)  -> ~6.0:1   AA
// ---------------------------------------------------------------------------

export const warmTheme: ThemeDefinition = {
  name: 'warm',
  displayName: 'Warm',
  description: 'Inviting, hospitable, cozy. Inspired by Airbnb and Notion.',
  colors: {
    light: {
      '--background': '35 40% 99%',
      '--foreground': '15 20% 12%',
      '--card': '35 30% 99%',
      '--card-foreground': '15 20% 12%',
      '--popover': '35 30% 99%',
      '--popover-foreground': '15 20% 12%',

      '--primary': '350 85% 46%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '30 15% 95%',
      '--secondary-foreground': '25 10% 40%',
      '--accent': '350 30% 94%',
      '--accent-foreground': '350 60% 38%',

      '--muted': '30 15% 95%',
      '--muted-foreground': '25 10% 40%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',

      '--success': '142 71% 35%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '15 20% 12%',

      '--border': '30 12% 90%',
      '--input': '30 12% 90%',
      '--ring': '350 85% 46%',

      '--radius': '0.75rem',

      '--chart-1': '350 85% 46%',
      '--chart-2': '195 70% 42%',
      '--chart-3': '155 60% 38%',
      '--chart-4': '270 50% 55%',
      '--chart-5': '45 85% 48%',

      '--sidebar-background': '35 25% 97%',
      '--sidebar-foreground': '15 20% 12%',
      '--sidebar-primary': '350 85% 46%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '350 30% 94%',
      '--sidebar-accent-foreground': '350 60% 38%',
      '--sidebar-border': '30 12% 90%',
      '--sidebar-ring': '350 85% 46%',
    },
    dark: {
      '--background': '15 15% 5%',
      '--foreground': '30 20% 95%',
      '--card': '15 15% 9%',
      '--card-foreground': '30 20% 95%',
      '--popover': '15 15% 9%',
      '--popover-foreground': '30 20% 95%',

      '--primary': '350 80% 65%',
      '--primary-foreground': '15 15% 5%',
      '--secondary': '20 10% 16%',
      '--secondary-foreground': '25 10% 65%',
      '--accent': '350 25% 18%',
      '--accent-foreground': '350 50% 70%',

      '--muted': '20 10% 16%',
      '--muted-foreground': '30 10% 60%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '0 0% 98%',

      '--success': '142 71% 45%',
      '--success-foreground': '0 0% 98%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '15 15% 5%',

      '--border': '20 10% 16%',
      '--input': '20 10% 16%',
      '--ring': '350 80% 65%',

      '--radius': '0.75rem',

      '--chart-1': '350 80% 65%',
      '--chart-2': '195 65% 52%',
      '--chart-3': '155 50% 48%',
      '--chart-4': '270 45% 65%',
      '--chart-5': '45 80% 58%',

      '--sidebar-background': '15 15% 5%',
      '--sidebar-foreground': '30 20% 95%',
      '--sidebar-primary': '350 80% 65%',
      '--sidebar-primary-foreground': '15 15% 5%',
      '--sidebar-accent': '350 25% 18%',
      '--sidebar-accent-foreground': '350 50% 70%',
      '--sidebar-border': '20 10% 16%',
      '--sidebar-ring': '350 80% 65%',
    },
  },
  fonts: {
    // Slightly larger base (16px default already, but wider feel like Airbnb)
    sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    heading: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: { ...defaultFontWeights },
  radius: '0.75rem',
  shadows: {
    // Warm-tinted shadows (slightly amber)
    sm: '0 1px 3px 0 rgb(120 80 40 / 0.06)',
    md: '0 4px 6px -1px rgb(120 80 40 / 0.08), 0 2px 4px -2px rgb(120 80 40 / 0.06)',
    lg: '0 10px 15px -3px rgb(120 80 40 / 0.08), 0 4px 6px -4px rgb(120 80 40 / 0.06)',
    xl: '0 20px 25px -5px rgb(120 80 40 / 0.1), 0 8px 10px -6px rgb(120 80 40 / 0.08)',
  },
  transition: '180ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ---------------------------------------------------------------------------
// 4. Signal — inspired by Slack + Linear
//
//    Slack: #611F69 aubergine / #36C5F0 teal, Lato font,
//           dense functional UI, clear hierarchy, lots of small text
//    Linear: Clean teal accents, tight spacing, productive feel
//
//    Blend: Professional teal primary, dense layout, crisp borders.
//
// WCAG 2.1 Contrast Ratios (light, against --background 0 0% 100%):
//   --foreground       (210 15% 12%)  -> ~16.7:1  AAA
//   --primary          (190 80% 32%)  -> ~4.8:1   AA (professional teal)
//   --muted-foreground (210 8% 40%)   -> ~5.8:1   AA
//
// Dark mode (against --background 210 15% 5%):
//   --foreground       (190 10% 95%)  -> ~17.5:1  AAA
//   --primary          (190 70% 50%)  -> ~8.5:1   AAA
// ---------------------------------------------------------------------------

export const signalTheme: ThemeDefinition = {
  name: 'signal',
  displayName: 'Signal',
  description: 'Focused, dense, productive. Inspired by Slack and Linear.',
  colors: {
    light: {
      '--background': '0 0% 100%',
      '--foreground': '210 15% 12%',
      '--card': '0 0% 100%',
      '--card-foreground': '210 15% 12%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '210 15% 12%',

      '--primary': '190 80% 32%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '200 8% 95%',
      '--secondary-foreground': '210 8% 40%',
      '--accent': '190 25% 93%',
      '--accent-foreground': '190 60% 28%',

      '--muted': '200 8% 95%',
      '--muted-foreground': '210 8% 40%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',

      '--success': '142 71% 35%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '210 15% 12%',

      '--border': '210 10% 90%',
      '--input': '210 10% 90%',
      '--ring': '190 80% 32%',

      '--radius': '0.375rem',

      '--chart-1': '190 80% 32%',
      '--chart-2': '35 85% 50%',
      '--chart-3': '252 65% 55%',
      '--chart-4': '340 60% 50%',
      '--chart-5': '160 70% 38%',

      '--sidebar-background': '200 8% 97%',
      '--sidebar-foreground': '210 15% 12%',
      '--sidebar-primary': '190 80% 32%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '190 25% 93%',
      '--sidebar-accent-foreground': '190 60% 28%',
      '--sidebar-border': '210 10% 90%',
      '--sidebar-ring': '190 80% 32%',
    },
    dark: {
      '--background': '210 15% 5%',
      '--foreground': '190 10% 95%',
      '--card': '210 13% 9%',
      '--card-foreground': '190 10% 95%',
      '--popover': '210 13% 9%',
      '--popover-foreground': '190 10% 95%',

      '--primary': '190 70% 50%',
      '--primary-foreground': '210 15% 5%',
      '--secondary': '210 8% 16%',
      '--secondary-foreground': '210 8% 65%',
      '--accent': '190 20% 18%',
      '--accent-foreground': '190 50% 65%',

      '--muted': '210 8% 16%',
      '--muted-foreground': '210 8% 60%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '0 0% 98%',

      '--success': '142 71% 45%',
      '--success-foreground': '0 0% 98%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '210 15% 5%',

      '--border': '210 10% 16%',
      '--input': '210 10% 16%',
      '--ring': '190 70% 50%',

      '--radius': '0.375rem',

      '--chart-1': '190 70% 50%',
      '--chart-2': '35 80% 58%',
      '--chart-3': '252 55% 65%',
      '--chart-4': '340 55% 60%',
      '--chart-5': '160 55% 48%',

      '--sidebar-background': '210 15% 5%',
      '--sidebar-foreground': '190 10% 95%',
      '--sidebar-primary': '190 70% 50%',
      '--sidebar-primary-foreground': '210 15% 5%',
      '--sidebar-accent': '190 20% 18%',
      '--sidebar-accent-foreground': '190 50% 65%',
      '--sidebar-border': '210 10% 16%',
      '--sidebar-ring': '190 70% 50%',
    },
  },
  fonts: {
    // Slightly smaller base for dense, productive UI (like Slack)
    sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    heading: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
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
// 5. Pulse — inspired by Spotify + Discord
//
//    Spotify: #1DB954 green, dark-leaning even in light mode,
//             Circular font, bold high-contrast, 8px radius, pill buttons
//    Discord: #5865F2 blurple, rounded/playful, gg sans font
//
//    Blend: Vibrant Discord-ish blurple, very rounded, bold shadows.
//
// WCAG 2.1 Contrast Ratios (light, against --background 240 10% 97%):
//   --foreground       (240 10% 10%)  -> ~16.6:1  AAA
//   --primary          (265 80% 55%)  -> ~5.6:1   AA (blurple)
//   --muted-foreground (240 6% 40%)   -> ~5.8:1   AA
//
// Dark mode (against --background 260 15% 5%):
//   --foreground       (260 10% 96%)  -> ~17.9:1  AAA
//   --primary          (265 75% 65%)  -> ~5.0:1   AA
// ---------------------------------------------------------------------------

export const pulseTheme: ThemeDefinition = {
  name: 'pulse',
  displayName: 'Pulse',
  description: 'Energetic, bold, playful. Inspired by Spotify and Discord.',
  colors: {
    light: {
      '--background': '240 10% 97%',
      '--foreground': '240 10% 10%',
      '--card': '240 8% 99%',
      '--card-foreground': '240 10% 10%',
      '--popover': '240 8% 99%',
      '--popover-foreground': '240 10% 10%',

      '--primary': '265 80% 55%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '240 8% 93%',
      '--secondary-foreground': '240 6% 40%',
      '--accent': '265 30% 94%',
      '--accent-foreground': '265 60% 40%',

      '--muted': '240 8% 93%',
      '--muted-foreground': '240 6% 40%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',

      '--success': '142 71% 35%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '240 10% 10%',

      '--border': '240 8% 90%',
      '--input': '240 8% 90%',
      '--ring': '265 80% 55%',

      '--radius': '1rem',

      '--chart-1': '265 80% 55%',
      '--chart-2': '190 80% 42%',
      '--chart-3': '55 80% 48%',
      '--chart-4': '340 65% 50%',
      '--chart-5': '140 60% 40%',

      '--sidebar-background': '240 8% 96%',
      '--sidebar-foreground': '240 10% 10%',
      '--sidebar-primary': '265 80% 55%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '265 30% 94%',
      '--sidebar-accent-foreground': '265 60% 40%',
      '--sidebar-border': '240 8% 90%',
      '--sidebar-ring': '265 80% 55%',
    },
    dark: {
      '--background': '260 15% 5%',
      '--foreground': '260 10% 96%',
      '--card': '260 12% 8%',
      '--card-foreground': '260 10% 96%',
      '--popover': '260 12% 8%',
      '--popover-foreground': '260 10% 96%',

      '--primary': '265 75% 65%',
      '--primary-foreground': '260 15% 5%',
      '--secondary': '260 6% 16%',
      '--secondary-foreground': '260 6% 65%',
      '--accent': '265 25% 18%',
      '--accent-foreground': '265 55% 75%',

      '--muted': '260 6% 16%',
      '--muted-foreground': '260 6% 60%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '0 0% 98%',

      '--success': '142 71% 45%',
      '--success-foreground': '0 0% 98%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '260 15% 5%',

      '--border': '260 6% 16%',
      '--input': '260 6% 16%',
      '--ring': '265 75% 65%',

      '--radius': '1rem',

      '--chart-1': '265 75% 65%',
      '--chart-2': '190 75% 52%',
      '--chart-3': '55 75% 58%',
      '--chart-4': '340 55% 60%',
      '--chart-5': '140 50% 50%',

      '--sidebar-background': '260 15% 5%',
      '--sidebar-foreground': '260 10% 96%',
      '--sidebar-primary': '265 75% 65%',
      '--sidebar-primary-foreground': '260 15% 5%',
      '--sidebar-accent': '265 25% 18%',
      '--sidebar-accent-foreground': '265 55% 75%',
      '--sidebar-border': '260 6% 16%',
      '--sidebar-ring': '265 75% 65%',
    },
  },
  fonts: {
    // Medium weight default, system-ui (like Discord's gg sans feel)
    sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    heading: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  radius: '1rem',
  shadows: {
    // Bolder shadows (Spotify/Discord boldness)
    sm: '0 2px 4px 0 rgb(0 0 0 / 0.08)',
    md: '0 6px 10px -2px rgb(0 0 0 / 0.12), 0 3px 5px -2px rgb(0 0 0 / 0.08)',
    lg: '0 14px 20px -4px rgb(0 0 0 / 0.14), 0 6px 8px -4px rgb(0 0 0 / 0.1)',
    xl: '0 24px 32px -6px rgb(0 0 0 / 0.16), 0 10px 12px -6px rgb(0 0 0 / 0.1)',
  },
  transition: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
}

// ---------------------------------------------------------------------------
// 6. Mono — inspired by Stripe docs + GitHub
//
//    Stripe docs: #F6F9FC light blue-gray background, #425466 text,
//                 Inter body, monospace code, code-focused, technical
//    GitHub: Clean, technical, functional design
//
//    Blend: Dark slate primary, subtle blue-gray tint, technical feel.
//
// WCAG 2.1 Contrast Ratios (light, against --background 210 20% 98%):
//   --foreground       (210 15% 20%)  -> ~12.2:1  AAA
//   --primary          (210 10% 23%)  -> ~10.9:1  AAA (dark slate)
//   --muted-foreground (210 10% 40%)  -> ~5.6:1   AA
//
// Dark mode (against --background 210 15% 5%):
//   --foreground       (210 15% 93%)  -> ~16.6:1  AAA
//   --primary          (210 10% 80%)  -> ~12.1:1  AAA
// ---------------------------------------------------------------------------

export const monoTheme: ThemeDefinition = {
  name: 'mono',
  displayName: 'Mono',
  description: 'Technical, precise, code-first. Inspired by Stripe docs and GitHub.',
  colors: {
    light: {
      '--background': '210 20% 98%',
      '--foreground': '210 15% 20%',
      '--card': '210 20% 98%',
      '--card-foreground': '210 15% 20%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '210 15% 20%',

      '--primary': '210 10% 23%',
      '--primary-foreground': '0 0% 100%',
      '--secondary': '210 12% 94%',
      '--secondary-foreground': '210 10% 40%',
      '--accent': '210 15% 93%',
      '--accent-foreground': '210 10% 20%',

      '--muted': '210 12% 94%',
      '--muted-foreground': '210 10% 40%',
      '--destructive': '0 72% 45%',
      '--destructive-foreground': '0 0% 100%',

      '--success': '142 71% 35%',
      '--success-foreground': '0 0% 100%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '210 15% 20%',

      '--border': '210 14% 89%',
      '--input': '210 14% 89%',
      '--ring': '210 10% 23%',

      '--radius': '0.25rem',

      '--chart-1': '210 10% 23%',
      '--chart-2': '210 10% 40%',
      '--chart-3': '210 10% 55%',
      '--chart-4': '210 10% 70%',
      '--chart-5': '210 10% 82%',

      '--sidebar-background': '210 18% 96%',
      '--sidebar-foreground': '210 15% 20%',
      '--sidebar-primary': '210 10% 23%',
      '--sidebar-primary-foreground': '0 0% 100%',
      '--sidebar-accent': '210 15% 93%',
      '--sidebar-accent-foreground': '210 10% 20%',
      '--sidebar-border': '210 14% 89%',
      '--sidebar-ring': '210 10% 23%',
    },
    dark: {
      '--background': '210 15% 5%',
      '--foreground': '210 15% 93%',
      '--card': '210 13% 8%',
      '--card-foreground': '210 15% 93%',
      '--popover': '210 13% 8%',
      '--popover-foreground': '210 15% 93%',

      '--primary': '210 10% 80%',
      '--primary-foreground': '210 15% 5%',
      '--secondary': '210 8% 14%',
      '--secondary-foreground': '210 8% 65%',
      '--accent': '210 10% 18%',
      '--accent-foreground': '210 10% 80%',

      '--muted': '210 8% 14%',
      '--muted-foreground': '210 8% 60%',
      '--destructive': '0 63% 31%',
      '--destructive-foreground': '0 0% 98%',

      '--success': '142 71% 45%',
      '--success-foreground': '0 0% 98%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '210 15% 5%',

      '--border': '210 8% 16%',
      '--input': '210 8% 16%',
      '--ring': '210 10% 80%',

      '--radius': '0.25rem',

      '--chart-1': '210 10% 80%',
      '--chart-2': '210 10% 65%',
      '--chart-3': '210 10% 50%',
      '--chart-4': '210 10% 35%',
      '--chart-5': '210 10% 22%',

      '--sidebar-background': '210 15% 5%',
      '--sidebar-foreground': '210 15% 93%',
      '--sidebar-primary': '210 10% 80%',
      '--sidebar-primary-foreground': '210 15% 5%',
      '--sidebar-accent': '210 10% 18%',
      '--sidebar-accent-foreground': '210 10% 80%',
      '--sidebar-border': '210 8% 16%',
      '--sidebar-ring': '210 10% 80%',
    },
  },
  fonts: {
    // JetBrains Mono for headings (technical identity), system-ui for body
    sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    heading: "'JetBrains Mono', ui-monospace, monospace",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  fontSizes: { ...defaultFontSizes },
  fontWeights: { ...defaultFontWeights },
  radius: '0.25rem',
  shadows: {
    // No decorative shadows — just borders (Stripe/GitHub style)
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
