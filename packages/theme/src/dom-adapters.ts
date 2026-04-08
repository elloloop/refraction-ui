/**
 * Browser DOM adapters for the theme machine.
 * These bridge the headless core to browser APIs.
 */

import type { StorageAdapter, MediaQueryAdapter, ResolvedTheme } from './theme-machine.js'

/** localStorage adapter */
export function createLocalStorageAdapter(): StorageAdapter {
  return {
    get(key) {
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value)
      } catch {
        // localStorage unavailable (SSR, incognito quota exceeded, etc.)
      }
    },
  }
}

/** matchMedia adapter */
export function createMediaQueryAdapter(): MediaQueryAdapter {
  return {
    matches(query) {
      if (typeof window === 'undefined') return false
      return window.matchMedia(query).matches
    },
    subscribe(query, callback) {
      if (typeof window === 'undefined') return () => {}
      const mql = window.matchMedia(query)
      const handler = (e: MediaQueryListEvent) => callback(e.matches)
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    },
  }
}

/** Apply resolved theme to the document */
export function applyThemeToDOM(
  resolved: ResolvedTheme,
  attribute: 'class' | 'data-theme' = 'class',
): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  if (attribute === 'class') {
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
  } else {
    root.setAttribute(attribute, resolved)
  }
  root.style.colorScheme = resolved
}
