/**
 * @refraction-ui/react/theme
 *
 * Opt-in subpath that re-exports the @refraction-ui/react-theme package.
 * Kept separate from the main entry so that consumers who already use
 * their own theme system (e.g. next-themes) don't accidentally pull in
 * Refraction's ThemeProvider / useTheme / ThemeToggle and clash on names.
 *
 *   import { ThemeProvider, ThemeToggle, useTheme } from '@refraction-ui/react/theme'
 */

export * from '@refraction-ui/react-theme'
