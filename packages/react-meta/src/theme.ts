/**
 * @refraction-ui/react/theme
 *
 * RSC client boundary (ThemeProvider / useTheme / ThemeToggle use React
 * context + hooks). Do NOT add a `'use client'` directive here — it is
 * injected post-build by scripts/ensure-use-client.mjs (bundling strips a
 * source/banner directive). This subpath is safe to import from a Next.js
 * App Router Server Component.
 *
 * Opt-in subpath that re-exports the @refraction-ui/react-theme package.
 * Kept separate from the main entry so that consumers who already use
 * their own theme system (e.g. next-themes) don't accidentally pull in
 * Refraction's ThemeProvider / useTheme / ThemeToggle and clash on names.
 *
 *   import { ThemeProvider, ThemeToggle, useTheme } from '@refraction-ui/react/theme'
 */

export * from '@refraction-ui/react-theme'
