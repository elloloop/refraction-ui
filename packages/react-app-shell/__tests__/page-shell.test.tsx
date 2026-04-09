import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@elloloop/shared'
import { PageShell } from '../src/page-shell.js'

beforeEach(() => {
  resetIdCounter()
})

// ---------------------------------------------------------------------------
// PageShell root
// ---------------------------------------------------------------------------

describe('PageShell (React SSR)', () => {
  it('renders a wrapper div with data-page-shell attribute', () => {
    const html = renderToString(
      React.createElement(PageShell, null, 'content'),
    )
    expect(html).toContain('data-page-shell')
    expect(html).toContain('content')
  })

  it('applies CSS variables as inline styles', () => {
    const html = renderToString(
      React.createElement(PageShell, null, 'test'),
    )
    expect(html).toContain('--page-max-width')
    expect(html).toContain('--page-nav-height')
  })

  it('has min-h-screen and flex layout', () => {
    const html = renderToString(
      React.createElement(PageShell, null, 'test'),
    )
    expect(html).toContain('min-h-screen')
    expect(html).toContain('flex')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(PageShell, { className: 'my-page' }, 'test'),
    )
    expect(html).toContain('my-page')
  })
})

// ---------------------------------------------------------------------------
// PageShell.Nav
// ---------------------------------------------------------------------------

describe('PageShell.Nav (React SSR)', () => {
  it('renders a <nav> with navigation role', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Nav, null, 'nav content'),
      ),
    )
    expect(html).toContain('<nav')
    expect(html).toContain('role="navigation"')
    expect(html).toContain('nav content')
  })

  it('is sticky by default', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Nav, null, 'nav'),
      ),
    )
    expect(html).toContain('sticky')
    expect(html).toContain('z-40')
  })

  it('is not sticky when navSticky is false', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        { config: { navSticky: false } },
        React.createElement(PageShell.Nav, null, 'nav'),
      ),
    )
    expect(html).not.toContain('sticky')
  })

  it('has bg-background by default', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Nav, null, 'nav'),
      ),
    )
    expect(html).toContain('bg-background')
  })

  it('is transparent when configured', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        { config: { navTransparent: true } },
        React.createElement(PageShell.Nav, null, 'nav'),
      ),
    )
    expect(html).toContain('bg-transparent')
    expect(html).not.toContain('bg-background')
  })

  it('uses CSS variable for height', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Nav, null, 'nav'),
      ),
    )
    expect(html).toContain('var(--page-nav-height)')
  })
})

// ---------------------------------------------------------------------------
// PageShell.Section
// ---------------------------------------------------------------------------

describe('PageShell.Section (React SSR)', () => {
  it('renders a <section> element', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Section, null, 'section content'),
      ),
    )
    expect(html).toContain('<section')
    expect(html).toContain('section content')
  })

  it('has padding by default', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Section, null, 'sec'),
      ),
    )
    expect(html).toContain('px-4')
    expect(html).toContain('py-12')
  })

  it('fullWidth section skips container constraints', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Section, { fullWidth: true }, 'full'),
      ),
    )
    expect(html).not.toContain('mx-auto')
    expect(html).not.toContain('max-w-')
  })

  it('applies custom maxWidth', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Section, { maxWidth: '5xl' }, 'sec'),
      ),
    )
    expect(html).toContain('max-w-5xl')
  })

  it('applies background=muted class', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Section, { background: 'muted' }, 'sec'),
      ),
    )
    expect(html).toContain('bg-muted')
  })
})

// ---------------------------------------------------------------------------
// PageShell.Footer
// ---------------------------------------------------------------------------

describe('PageShell.Footer (React SSR)', () => {
  it('renders a <footer> with contentinfo role', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Footer, null, 'footer content'),
      ),
    )
    expect(html).toContain('<footer')
    expect(html).toContain('role="contentinfo"')
    expect(html).toContain('footer content')
  })

  it('renders with grid layout', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Footer, null, 'footer'),
      ),
    )
    expect(html).toContain('grid')
  })

  it('uses default 4 columns', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Footer, null, 'footer'),
      ),
    )
    expect(html).toContain('repeat(4')
  })

  it('respects custom columns prop', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        null,
        React.createElement(PageShell.Footer, { columns: 3 }, 'footer'),
      ),
    )
    expect(html).toContain('repeat(3')
  })
})

// ---------------------------------------------------------------------------
// Full composition
// ---------------------------------------------------------------------------

describe('PageShell — full composition (React SSR)', () => {
  it('renders complete page layout', () => {
    const html = renderToString(
      React.createElement(
        PageShell,
        { config: { navTransparent: true } },
        React.createElement(PageShell.Nav, null, 'Logo'),
        React.createElement(
          PageShell.Section,
          { fullWidth: true },
          'Hero',
        ),
        React.createElement(
          PageShell.Section,
          { maxWidth: '5xl', background: 'muted' },
          'Features',
        ),
        React.createElement(
          PageShell.Footer,
          { columns: 4 },
          'Footer links',
        ),
      ),
    )
    expect(html).toContain('Logo')
    expect(html).toContain('Hero')
    expect(html).toContain('Features')
    expect(html).toContain('Footer links')
    expect(html).toContain('bg-transparent')
    expect(html).toContain('bg-muted')
    expect(html).toContain('max-w-5xl')
    expect(html).toContain('role="navigation"')
    expect(html).toContain('role="contentinfo"')
  })
})
