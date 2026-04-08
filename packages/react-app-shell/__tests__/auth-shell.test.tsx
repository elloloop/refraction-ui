import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { resetIdCounter } from '@refraction-ui/shared'
import { AuthShell } from '../src/auth-shell.js'

beforeEach(() => {
  resetIdCounter()
})

// ---------------------------------------------------------------------------
// AuthShell root
// ---------------------------------------------------------------------------

describe('AuthShell (React SSR)', () => {
  it('renders a wrapper div with data-auth-shell attribute', () => {
    const html = renderToString(
      React.createElement(AuthShell, null, 'content'),
    )
    expect(html).toContain('data-auth-shell')
    expect(html).toContain('content')
  })

  it('has main role for the auth region', () => {
    const html = renderToString(
      React.createElement(AuthShell, null, 'test'),
    )
    expect(html).toContain('role="main"')
    expect(html).toContain('aria-label="Authentication"')
  })

  it('has centered layout by default', () => {
    const html = renderToString(
      React.createElement(AuthShell, null, 'test'),
    )
    expect(html).toContain('items-center')
    expect(html).toContain('justify-center')
    expect(html).toContain('min-h-screen')
  })

  it('has bg-muted background by default', () => {
    const html = renderToString(
      React.createElement(AuthShell, null, 'test'),
    )
    expect(html).toContain('bg-muted')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(AuthShell, { className: 'my-auth' }, 'test'),
    )
    expect(html).toContain('my-auth')
  })

  it('left position has justify-start', () => {
    const html = renderToString(
      React.createElement(
        AuthShell,
        { config: { position: 'left' } },
        'test',
      ),
    )
    expect(html).toContain('justify-start')
    expect(html).not.toContain('justify-center')
  })

  it('showBackground=false omits bg-muted', () => {
    const html = renderToString(
      React.createElement(
        AuthShell,
        { config: { showBackground: false } },
        'test',
      ),
    )
    expect(html).not.toContain('bg-muted')
  })
})

// ---------------------------------------------------------------------------
// AuthShell.Card
// ---------------------------------------------------------------------------

describe('AuthShell.Card (React SSR)', () => {
  it('renders a card div with data-auth-card attribute', () => {
    const html = renderToString(
      React.createElement(
        AuthShell,
        null,
        React.createElement(AuthShell.Card, null, 'Sign in'),
      ),
    )
    expect(html).toContain('data-auth-card')
    expect(html).toContain('Sign in')
  })

  it('has default max-w-sm', () => {
    const html = renderToString(
      React.createElement(
        AuthShell,
        null,
        React.createElement(AuthShell.Card, null, 'card'),
      ),
    )
    expect(html).toContain('max-w-sm')
  })

  it('uses max-w-xs for xs config', () => {
    const html = renderToString(
      React.createElement(
        AuthShell,
        { config: { maxWidth: 'xs' } },
        React.createElement(AuthShell.Card, null, 'card'),
      ),
    )
    expect(html).toContain('max-w-xs')
  })

  it('uses max-w-md for md config', () => {
    const html = renderToString(
      React.createElement(
        AuthShell,
        { config: { maxWidth: 'md' } },
        React.createElement(AuthShell.Card, null, 'card'),
      ),
    )
    expect(html).toContain('max-w-md')
  })

  it('has card styling classes', () => {
    const html = renderToString(
      React.createElement(
        AuthShell,
        null,
        React.createElement(AuthShell.Card, null, 'card'),
      ),
    )
    expect(html).toContain('rounded-lg')
    expect(html).toContain('border')
    expect(html).toContain('bg-card')
    expect(html).toContain('shadow-sm')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(
        AuthShell,
        null,
        React.createElement(AuthShell.Card, { className: 'my-card' }, 'card'),
      ),
    )
    expect(html).toContain('my-card')
  })
})

// ---------------------------------------------------------------------------
// Full composition
// ---------------------------------------------------------------------------

describe('AuthShell — full composition (React SSR)', () => {
  it('renders complete auth layout', () => {
    const html = renderToString(
      React.createElement(
        AuthShell,
        null,
        React.createElement(
          AuthShell.Card,
          null,
          React.createElement('h1', null, 'Sign in'),
          React.createElement('form', null,
            React.createElement('input', { type: 'email', placeholder: 'Email' }),
            React.createElement('button', { type: 'submit' }, 'Login'),
          ),
        ),
      ),
    )
    expect(html).toContain('Sign in')
    expect(html).toContain('Email')
    expect(html).toContain('Login')
    expect(html).toContain('role="main"')
    expect(html).toContain('data-auth-card')
    expect(html).toContain('max-w-sm')
  })
})
