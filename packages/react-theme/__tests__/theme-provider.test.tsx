import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { ThemeProvider, ThemeScript } from '../src/index.js'

describe('ThemeProvider (SSR)', () => {
  it('renders children', () => {
    const html = renderToString(
      React.createElement(ThemeProvider, null,
        React.createElement('div', null, 'Hello'),
      ),
    )
    expect(html).toContain('Hello')
  })

  it('renders with custom defaultMode', () => {
    const html = renderToString(
      React.createElement(ThemeProvider, { defaultMode: 'dark' },
        React.createElement('div', null, 'Dark mode'),
      ),
    )
    expect(html).toContain('Dark mode')
  })
})

describe('ThemeScript', () => {
  it('renders inline script for flash prevention', () => {
    const html = renderToString(
      React.createElement(ThemeScript),
    )
    expect(html).toContain('<script>')
    expect(html).toContain('localStorage')
    expect(html).toContain('rfr-theme')
    expect(html).toContain('prefers-color-scheme')
  })

  it('uses custom storage key', () => {
    const html = renderToString(
      React.createElement(ThemeScript, { storageKey: 'my-theme' }),
    )
    expect(html).toContain('my-theme')
  })

  it('supports data-theme attribute mode', () => {
    const html = renderToString(
      React.createElement(ThemeScript, { attribute: 'data-theme' }),
    )
    expect(html).toContain('data-theme')
  })
})

describe('ThemeProvider additional SSR tests', () => {
  it('renders with defaultMode="light"', () => {
    const html = renderToString(
      React.createElement(ThemeProvider, { defaultMode: 'light' },
        React.createElement('div', null, 'Light mode content'),
      ),
    )
    expect(html).toContain('Light mode content')
  })

  it('renders with defaultMode="dark"', () => {
    const html = renderToString(
      React.createElement(ThemeProvider, { defaultMode: 'dark' },
        React.createElement('div', null, 'Dark mode content'),
      ),
    )
    expect(html).toContain('Dark mode content')
  })

  it('children render correctly', () => {
    const html = renderToString(
      React.createElement(ThemeProvider, null,
        React.createElement('span', null, 'Child A'),
        React.createElement('span', null, 'Child B'),
      ),
    )
    expect(html).toContain('Child A')
    expect(html).toContain('Child B')
  })

  it('multiple ThemeProvider nesting does not crash', () => {
    const html = renderToString(
      React.createElement(ThemeProvider, null,
        React.createElement(ThemeProvider, { defaultMode: 'dark' },
          React.createElement('div', null, 'Nested content'),
        ),
      ),
    )
    expect(html).toContain('Nested content')
  })
})

describe('ThemeScript additional tests', () => {
  it('renders a script tag with default props', () => {
    const html = renderToString(
      React.createElement(ThemeScript),
    )
    expect(html).toContain('<script>')
  })

  it('script content includes correct storage key', () => {
    const html = renderToString(
      React.createElement(ThemeScript, { storageKey: 'test-key' }),
    )
    expect(html).toContain('test-key')
    expect(html).not.toContain('rfr-theme')
  })

  it('with attribute="data-theme" renders differently than class', () => {
    const htmlClass = renderToString(
      React.createElement(ThemeScript, { attribute: 'class' }),
    )
    const htmlDataTheme = renderToString(
      React.createElement(ThemeScript, { attribute: 'data-theme' }),
    )
    expect(htmlDataTheme).toContain('data-theme')
    // They should produce different output
    expect(htmlClass).not.toEqual(htmlDataTheme)
  })
})
