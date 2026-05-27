import { describe, it, expect } from 'vitest'
import { getThemeScript } from '../src/theme-script.js'

/**
 * The inline script string is small enough to assert on directly. We don't
 * `eval()` it (no `localStorage`/`window` in vitest by default and we don't
 * want to mock global state for a string-builder test) — instead we shape-
 * check the pieces that matter: storage key, attribute strategy, presence
 * or absence of the matchMedia fall-through.
 */
describe('getThemeScript', () => {
  it('back-compat: positional args produce the original script shape', () => {
    const s = getThemeScript('rfr-theme', 'class')
    expect(s).toContain("localStorage.getItem('rfr-theme')")
    expect(s).toContain("matchMedia('(prefers-color-scheme:dark)')")
    expect(s).toContain("classList.add(t)")
  })

  it('positional args honour custom storageKey', () => {
    const s = getThemeScript('app_theme')
    expect(s).toContain("localStorage.getItem('app_theme')")
  })

  it('positional args honour data-theme attribute strategy', () => {
    const s = getThemeScript('k', 'data-theme')
    expect(s).toContain("setAttribute('data-theme',t)")
    expect(s).not.toContain('classList.add(t)')
  })

  // Issue #317 — options object enables the no-system-fallback path.
  describe('options object with defaultMode / enableSystem (issue #317)', () => {
    it('defaultMode="light" skips matchMedia entirely', () => {
      const s = getThemeScript({ defaultMode: 'light' })
      expect(s).not.toContain('matchMedia')
      // No-storage path resolves to 'light'.
      expect(s).toContain("m==='light'?'light':'light'")
    })

    it('defaultMode="dark" skips matchMedia and falls back to dark', () => {
      const s = getThemeScript({ defaultMode: 'dark' })
      expect(s).not.toContain('matchMedia')
      expect(s).toContain("m==='light'?'light':'dark'")
    })

    it('defaultMode="system" + enableSystem=true preserves matchMedia (default behaviour)', () => {
      const s = getThemeScript({ defaultMode: 'system', enableSystem: true })
      expect(s).toContain("matchMedia('(prefers-color-scheme:dark)')")
    })

    it('defaultMode="system" + enableSystem=false drops matchMedia and falls back to light', () => {
      const s = getThemeScript({ defaultMode: 'system', enableSystem: false })
      expect(s).not.toContain('matchMedia')
      expect(s).toContain("m==='light'?'light':'light'")
    })

    it('options object still honours storageKey + attribute', () => {
      const s = getThemeScript({
        storageKey: 'my-app-theme',
        attribute: 'data-theme',
        defaultMode: 'light',
      })
      expect(s).toContain("localStorage.getItem('my-app-theme')")
      expect(s).toContain("setAttribute('data-theme',t)")
    })

    it('defaults match the original behaviour when called with empty options', () => {
      const s = getThemeScript({})
      expect(s).toContain("localStorage.getItem('rfr-theme')")
      expect(s).toContain('matchMedia')
      expect(s).toContain('classList.add(t)')
    })
  })

  it('always sets colorScheme so native form controls track the theme', () => {
    expect(getThemeScript()).toContain('d.style.colorScheme=t')
    expect(getThemeScript({ defaultMode: 'light' })).toContain('d.style.colorScheme=t')
  })

  it('wraps the body in a try/catch so SSR pages with broken localStorage still paint', () => {
    expect(getThemeScript()).toContain('try{')
    expect(getThemeScript()).toContain('}catch(e){}')
  })
})
