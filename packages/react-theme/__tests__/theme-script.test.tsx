import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ThemeScript } from '../src/index.js'

/**
 * <ThemeScript> is a tiny SSR-only renderer over the headless `getThemeScript`.
 * The deep semantics live in `packages/theme/__tests__/theme-script.test.ts`
 * — here we just verify the component forwards every prop.
 */
describe('<ThemeScript /> (issue #317)', () => {
  it('renders an inline <script> tag', () => {
    const html = renderToString(React.createElement(ThemeScript))
    expect(html).toContain('<script')
    expect(html).toContain("localStorage.getItem('rfr-theme')")
  })

  it('default behaviour preserves the matchMedia fall-through', () => {
    const html = renderToString(React.createElement(ThemeScript))
    expect(html).toContain('matchMedia')
  })

  it('defaultMode="light" disables the matchMedia fall-through', () => {
    const html = renderToString(
      React.createElement(ThemeScript, { defaultMode: 'light' }),
    )
    expect(html).not.toContain('matchMedia')
  })

  it('defaultMode="dark" + enableSystem=false picks dark for first-time visitors', () => {
    const html = renderToString(
      React.createElement(ThemeScript, { defaultMode: 'dark', enableSystem: false }),
    )
    expect(html).not.toContain('matchMedia')
    expect(html).toContain("'dark'")
  })

  it('forwards storageKey + attribute strategy', () => {
    const html = renderToString(
      React.createElement(ThemeScript, {
        storageKey: 'app_theme',
        attribute: 'data-theme',
      }),
    )
    expect(html).toContain("localStorage.getItem('app_theme')")
    expect(html).toContain("setAttribute('data-theme',t)")
  })
})
