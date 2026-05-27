import * as React from 'react'
import { getThemeScript, type ThemeMode } from '@refraction-ui/theme'

export interface ThemeScriptProps {
  /** localStorage key the ThemeProvider reads. */
  storageKey?: string
  /** Attribute strategy. `class` toggles `light`/`dark` on <html>; otherwise an HTML attribute. */
  attribute?: 'class' | 'data-theme'
  /**
   * Theme to apply when nothing is stored. Match this to `<ThemeProvider defaultMode>`
   * so the pre-paint script and provider agree on the no-storage path. Defaults
   * to `'system'` (current behaviour — OS preference wins). Issue #317.
   */
  defaultMode?: ThemeMode
  /**
   * When `false` the inline script never reads `prefers-color-scheme`; the
   * `defaultMode` is applied as-is for first-time visitors. Default `true`.
   */
  enableSystem?: boolean
}

/**
 * Renders an inline <script> that prevents theme flash on SSR pages.
 * Place this in the <head> of your document (in Next.js layout.tsx, Remix root, etc.)
 *
 * Mirror the props your <ThemeProvider> uses so first-paint and React mount stay in sync:
 *
 *     <ThemeScript defaultMode="light" storageKey="app_theme" />
 *     <ThemeProvider defaultMode="light" storageKey="app_theme">…</ThemeProvider>
 */
export function ThemeScript({
  storageKey = 'rfr-theme',
  attribute = 'class',
  defaultMode = 'system',
  enableSystem = true,
}: ThemeScriptProps) {
  return React.createElement('script', {
    dangerouslySetInnerHTML: {
      __html: getThemeScript({ storageKey, attribute, defaultMode, enableSystem }),
    },
  })
}
