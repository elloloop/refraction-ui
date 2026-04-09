import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@elloloop/shared'
import { AppShell, useAppShell } from '../src/app-shell.js'

beforeEach(() => {
  resetIdCounter()
})

// ---------------------------------------------------------------------------
// AppShell root
// ---------------------------------------------------------------------------

describe('AppShell (React SSR)', () => {
  it('renders a wrapper div with data-shell attribute', () => {
    const html = renderToString(
      React.createElement(AppShell, null, 'content'),
    )
    expect(html).toContain('data-shell')
    expect(html).toContain('content')
  })

  it('applies CSS variables as inline styles', () => {
    const html = renderToString(
      React.createElement(AppShell, null, 'test'),
    )
    expect(html).toContain('--shell-sidebar-width')
    expect(html).toContain('--shell-header-height')
  })

  it('renders with flex layout classes', () => {
    const html = renderToString(
      React.createElement(AppShell, null, 'test'),
    )
    expect(html).toContain('flex')
    expect(html).toContain('h-screen')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(AppShell, { className: 'my-app' }, 'test'),
    )
    expect(html).toContain('my-app')
  })
})

// ---------------------------------------------------------------------------
// AppShell.Sidebar
// ---------------------------------------------------------------------------

describe('AppShell.Sidebar (React SSR)', () => {
  it('renders as <aside> with navigation role', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Sidebar, null, 'nav'),
      ),
    )
    expect(html).toContain('<aside')
    expect(html).toContain('role="navigation"')
    expect(html).toContain('aria-label="Sidebar"')
    expect(html).toContain('nav')
  })

  it('has sidebar ID for aria-controls linking', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Sidebar, null, 'side'),
      ),
    )
    expect(html).toContain('rfr-shell-sidebar')
  })

  it('uses CSS variable for width', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Sidebar, null, 'side'),
      ),
    )
    expect(html).toContain('var(--shell-sidebar-width)')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Sidebar, { className: 'my-sidebar' }, 'side'),
      ),
    )
    expect(html).toContain('my-sidebar')
  })

  it('renders border-r for left sidebar', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Sidebar, null, 'side'),
      ),
    )
    expect(html).toContain('border-r')
  })

  it('renders with transition classes', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Sidebar, null, 'side'),
      ),
    )
    expect(html).toContain('transition-')
  })
})

// ---------------------------------------------------------------------------
// AppShell.Main
// ---------------------------------------------------------------------------

describe('AppShell.Main (React SSR)', () => {
  it('renders a div with flex-1', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null, 'main content'),
      ),
    )
    expect(html).toContain('flex-1')
    expect(html).toContain('main content')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, { className: 'custom-main' }, 'test'),
      ),
    )
    expect(html).toContain('custom-main')
  })
})

// ---------------------------------------------------------------------------
// AppShell.Header
// ---------------------------------------------------------------------------

describe('AppShell.Header (React SSR)', () => {
  it('renders a sticky <header> with banner role', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null,
          React.createElement(AppShell.Header, null, 'header content'),
        ),
      ),
    )
    expect(html).toContain('<header')
    expect(html).toContain('role="banner"')
    expect(html).toContain('sticky')
    expect(html).toContain('header content')
  })

  it('uses CSS variable for height', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null,
          React.createElement(AppShell.Header, null, 'hdr'),
        ),
      ),
    )
    expect(html).toContain('var(--shell-header-height)')
  })

  it('has z-index class', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null,
          React.createElement(AppShell.Header, null, 'hdr'),
        ),
      ),
    )
    expect(html).toContain('z-30')
  })

  it('does not render hamburger on desktop (SSR default)', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null,
          React.createElement(AppShell.Header, null, 'hdr'),
        ),
      ),
    )
    // On SSR, breakpoint is desktop, so no hamburger
    expect(html).not.toContain('Toggle sidebar')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null,
          React.createElement(AppShell.Header, { className: 'my-header' }, 'hdr'),
        ),
      ),
    )
    expect(html).toContain('my-header')
  })
})

// ---------------------------------------------------------------------------
// AppShell.Content
// ---------------------------------------------------------------------------

describe('AppShell.Content (React SSR)', () => {
  it('renders a <main> with main role', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null,
          React.createElement(AppShell.Content, null, 'body'),
        ),
      ),
    )
    expect(html).toContain('<main')
    expect(html).toContain('role="main"')
    expect(html).toContain('body')
  })

  it('is scrollable', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null,
          React.createElement(AppShell.Content, null, 'body'),
        ),
      ),
    )
    expect(html).toContain('overflow-y-auto')
  })

  it('applies maxWidth constraint', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null,
          React.createElement(AppShell.Content, { maxWidth: '6xl' }, 'body'),
        ),
      ),
    )
    expect(html).toContain('max-w-6xl')
    expect(html).toContain('mx-auto')
  })

  it('has padding classes', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null,
          React.createElement(AppShell.Content, null, 'body'),
        ),
      ),
    )
    expect(html).toContain('px-4')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Main, null,
          React.createElement(AppShell.Content, { className: 'my-content' }, 'body'),
        ),
      ),
    )
    expect(html).toContain('my-content')
  })
})

// ---------------------------------------------------------------------------
// AppShell.MobileNav
// ---------------------------------------------------------------------------

describe('AppShell.MobileNav (React SSR)', () => {
  it('does not render on desktop (SSR default)', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.MobileNav, null, 'mobile nav'),
      ),
    )
    // SSR defaults to desktop, so MobileNav is not rendered
    expect(html).not.toContain('mobile nav')
  })
})

// ---------------------------------------------------------------------------
// AppShell.Overlay
// ---------------------------------------------------------------------------

describe('AppShell.Overlay (React SSR)', () => {
  it('does not render on desktop (SSR default)', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        null,
        React.createElement(AppShell.Overlay, null),
      ),
    )
    // SSR defaults to desktop, so overlay is not rendered
    expect(html).not.toContain('data-shell-overlay')
  })
})

// ---------------------------------------------------------------------------
// Full composition
// ---------------------------------------------------------------------------

describe('AppShell — full composition (React SSR)', () => {
  it('renders complete layout', () => {
    const html = renderToString(
      React.createElement(
        AppShell,
        { config: { sidebarWidth: '18rem' } },
        React.createElement(AppShell.Sidebar, null,
          React.createElement('div', null, 'Logo'),
          React.createElement('nav', null, 'Links'),
        ),
        React.createElement(
          AppShell.Main,
          null,
          React.createElement(AppShell.Header, null,
            React.createElement('div', null, 'Search'),
          ),
          React.createElement(AppShell.Content, { maxWidth: '6xl' },
            React.createElement('p', null, 'Page content'),
          ),
        ),
        React.createElement(AppShell.MobileNav, null, 'mobile'),
        React.createElement(AppShell.Overlay, null),
      ),
    )
    expect(html).toContain('Logo')
    expect(html).toContain('Links')
    expect(html).toContain('Search')
    expect(html).toContain('Page content')
    expect(html).toContain('role="navigation"')
    expect(html).toContain('role="banner"')
    expect(html).toContain('role="main"')
    expect(html).toContain('max-w-6xl')
    // Mobile elements not rendered in SSR (desktop default)
    expect(html).not.toContain('mobile')
  })
})
