/**
 * Inline script for preventing theme flash on page load.
 * Inject this as a <script> tag in the <head> before any CSS.
 * Works with any framework (React, Astro, plain HTML).
 */

import type { ThemeMode } from './theme-machine.js'

export interface ThemeScriptOptions {
  /** localStorage key the corresponding ThemeProvider reads. */
  storageKey?: string
  /** Attribute strategy: 'class' toggles `light`/`dark` classes; otherwise an HTML attribute. */
  attribute?: 'class' | 'data-theme'
  /**
   * Theme to apply when nothing is stored AND `enableSystem` is false
   * (or `defaultMode` is explicitly 'light'/'dark'). Match this to your
   * ThemeProvider's `defaultMode` so the pre-paint script and provider agree.
   * Defaults to `'system'` — current behavior, OS preference wins.
   *
   * Issue #317.
   */
  defaultMode?: ThemeMode
  /**
   * When `true` (default) and `defaultMode === 'system'`, the script falls
   * through to `prefers-color-scheme`. When `false`, the script applies
   * `defaultMode` directly and never reads the OS preference.
   */
  enableSystem?: boolean
}

/**
 * Build the pre-paint inline script. Mirrors the resolution order used by
 * the React/Astro `ThemeProvider`:
 *
 *   1. stored value (light|dark|system)
 *   2. if no stored value: `defaultMode` (light|dark applied as-is)
 *   3. if stored or default is 'system' AND `enableSystem`: matchMedia
 *   4. else: 'light'
 *
 * Back-compat: with no options the script behaves exactly as before —
 * stored value, then matchMedia, then 'light'.
 */
export function getThemeScript(
  storageKeyOrOptions: string | ThemeScriptOptions = 'rfr-theme',
  attribute: 'class' | 'data-theme' = 'class',
): string {
  const opts: Required<ThemeScriptOptions> =
    typeof storageKeyOrOptions === 'string'
      ? {
          storageKey: storageKeyOrOptions,
          attribute,
          defaultMode: 'system',
          enableSystem: true,
        }
      : {
          storageKey: storageKeyOrOptions.storageKey ?? 'rfr-theme',
          attribute: storageKeyOrOptions.attribute ?? 'class',
          defaultMode: storageKeyOrOptions.defaultMode ?? 'system',
          enableSystem: storageKeyOrOptions.enableSystem ?? true,
        }

  // `noSystemFallback` short-circuits matchMedia entirely when the consumer
  // wants brand consistency over OS preference (defaultMode='light'/'dark'
  // OR enableSystem=false).
  const noSystemFallback =
    opts.defaultMode === 'light' || opts.defaultMode === 'dark' || !opts.enableSystem
  const safeDefault: 'light' | 'dark' =
    opts.defaultMode === 'dark' ? 'dark' : 'light'

  const resolveExpr = noSystemFallback
    ? // Stored wins → else hard default. No matchMedia call at all.
      `var t=m==='dark'?'dark':(m==='light'?'light':'${safeDefault}');`
    : // Original behaviour: stored → else matchMedia → else light.
      `var s=window.matchMedia('(prefers-color-scheme:dark)').matches;var t=m==='dark'||(m!=='light'&&s)?'dark':'light';`

  const applyExpr =
    opts.attribute === 'class'
      ? "d.classList.remove('light','dark');d.classList.add(t);"
      : `d.setAttribute('${opts.attribute}',t);`

  return `(function(){try{var m=localStorage.getItem('${opts.storageKey}');${resolveExpr}var d=document.documentElement;${applyExpr}d.style.colorScheme=t;}catch(e){}})()`
}
