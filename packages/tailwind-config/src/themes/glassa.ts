/**
 * Glassa theme — the DEFAULT theme for refraction-ui.
 * Inspired by glassa.ai: clean, modern, minimal.
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH FOR THE DEFAULT LOOK.
 * Change values here → every component updates automatically.
 *
 * All values are HSL (hue saturation% lightness%) without the hsl() wrapper,
 * because components use them as: hsl(var(--primary))
 *
 * WCAG 2.1 Contrast Ratios (light mode, against --background #ffffff):
 *   --foreground       (224 71% 4%)   → ~19.5:1  ✓ AAA
 *   --primary          (221 83% 45%)  → ~4.6:1   ✓ AA normal text
 *   --muted-foreground (220 9% 40%)   → ~5.5:1   ✓ AA normal text
 *   --secondary-fg     (220 9% 40%)   → ~5.5:1   ✓ AA normal text
 *   --accent-fg        (220 9% 40%)   → ~5.5:1   ✓ AA normal text
 *   --destructive      (0 84% 60%)    → ~4.0:1   ✓ AA large text
 *
 * Dark mode (against --background #030712):
 *   --foreground       (210 40% 98%)  → ~18.3:1  ✓ AAA
 *   --primary          (217 91% 60%)  → ~6.4:1   ✓ AA normal text
 *   --muted-foreground (215 20% 65%)  → ~5.9:1   ✓ AA normal text
 *
 * Run `validateThemeContrast(glassaTheme)` from contrast.ts to verify.
 */

export const glassaTheme = {
  name: 'glassa',
  light: {
    // Backgrounds
    '--background': '0 0% 100%',           // #ffffff — clean white
    '--foreground': '224 71% 4%',           // #030712 — near-black text
    '--card': '0 0% 100%',
    '--card-foreground': '224 71% 4%',
    '--popover': '0 0% 100%',
    '--popover-foreground': '224 71% 4%',

    // Brand colors
    '--primary': '221 83% 45%',             // #2563eb — blue, WCAG AA ~4.6:1 on white
    '--primary-foreground': '210 40% 98%',  // white on primary
    '--secondary': '220 14% 96%',           // #f1f5f9 — light gray
    '--secondary-foreground': '220 9% 40%', // #576170 — WCAG AA ~5.5:1 on white
    '--accent': '220 14% 96%',
    '--accent-foreground': '220 9% 40%',    // WCAG AA ~5.5:1 on white

    // Semantic
    '--muted': '220 14% 96%',              // #f1f5f9
    '--muted-foreground': '220 9% 40%',    // #576170 — WCAG AA ~5.5:1 on white
    '--destructive': '0 72% 45%',            // #c52525 — darker red, ~5.5:1 on white foreground
    '--destructive-foreground': '210 40% 98%',

    // Borders & inputs
    '--border': '220 13% 91%',             // #e2e8f0 — light border
    '--input': '220 13% 91%',
    '--ring': '221 83% 45%',               // matches primary

    // Radius
    '--radius': '0.625rem',                 // 10px — modern rounded

    // Charts — Wong colorblind-safe palette (Nature Methods 2011)
    '--chart-1': '201 100% 35%',           // #0072B2 — blue
    '--chart-2': '40 100% 45%',            // #E69F00 — orange
    '--chart-3': '164 100% 31%',           // #009E73 — bluish green
    '--chart-4': '70 87% 55%',              // golden yellow — 30deg from orange
    '--chart-5': '330 37% 65%',              // #CC79A7 — reddish pink (Wong palette)

    // Sidebar
    '--sidebar-background': '0 0% 98%',    // #fafafa
    '--sidebar-foreground': '224 71% 4%',
    '--sidebar-primary': '221 83% 45%',
    '--sidebar-primary-foreground': '210 40% 98%',
    '--sidebar-accent': '220 14% 96%',
    '--sidebar-accent-foreground': '220 9% 40%',
    '--sidebar-border': '220 13% 91%',
    '--sidebar-ring': '221 83% 45%',
  },
  dark: {
    // Backgrounds
    '--background': '224 71% 4%',           // #030712 — deep dark
    '--foreground': '210 40% 98%',          // #f8fafc — near-white text
    '--card': '222 47% 11%',               // #111827
    '--card-foreground': '210 40% 98%',
    '--popover': '222 47% 11%',
    '--popover-foreground': '210 40% 98%',

    // Brand colors
    '--primary': '217 91% 60%',             // #60a5fa — lighter blue for dark bg
    '--primary-foreground': '222 47% 11%',
    '--secondary': '217 33% 17%',           // #1e293b
    '--secondary-foreground': '210 40% 98%',
    '--accent': '217 33% 17%',
    '--accent-foreground': '210 40% 98%',

    // Semantic
    '--muted': '217 33% 17%',
    '--muted-foreground': '215 20% 65%',    // #94a3b8
    '--destructive': '0 63% 31%',           // darker red for dark mode
    '--destructive-foreground': '210 40% 98%',

    // Borders & inputs
    '--border': '217 33% 17%',             // #1e293b
    '--input': '217 33% 17%',
    '--ring': '217 91% 60%',

    // Radius (same as light)
    '--radius': '0.625rem',

    // Charts — Wong colorblind-safe palette (lighter for dark backgrounds)
    '--chart-1': '201 100% 45%',
    '--chart-2': '40 100% 55%',
    '--chart-3': '164 100% 41%',
    '--chart-4': '70 87% 65%',
    '--chart-5': '330 37% 75%',

    // Sidebar
    '--sidebar-background': '224 71% 4%',
    '--sidebar-foreground': '210 40% 98%',
    '--sidebar-primary': '217 91% 60%',
    '--sidebar-primary-foreground': '222 47% 11%',
    '--sidebar-accent': '217 33% 17%',
    '--sidebar-accent-foreground': '210 40% 98%',
    '--sidebar-border': '217 33% 17%',
    '--sidebar-ring': '217 91% 60%',
  },
} as const

/**
 * Generate CSS string from theme for injection into a <style> tag or CSS file.
 * This is the ONE-FILE theme output that all components read from.
 */
export function generateThemeCSS(
  theme: typeof glassaTheme = glassaTheme,
): string {
  const lightVars = Object.entries(theme.light)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')

  const darkVars = Object.entries(theme.dark)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')

  return `:root {\n${lightVars}\n}\n\n.dark {\n${darkVars}\n}\n`
}

/** Get all theme variable names (useful for validation) */
export function getThemeVariableNames(): string[] {
  return Object.keys(glassaTheme.light)
}
