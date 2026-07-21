import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  SocialAuthButton,
  SocialAuthRow,
  type SocialProvider,
} from '../src/index.js'

const PROVIDERS: SocialProvider[] = ['google', 'github', 'microsoft', 'apple']

describe('SocialAuthButton (React)', () => {
  it.each(PROVIDERS)('renders a button for %s', (provider) => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider }),
    )
    expect(html).toContain('<button')
    expect(html).toContain(`data-provider="${provider}"`)
  })

  it.each([
    ['google', 'Continue with Google'],
    ['github', 'Continue with GitHub'],
    ['microsoft', 'Continue with Microsoft'],
    ['apple', 'Continue with Apple'],
  ] as const)('renders the %s label', (provider, label) => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider }),
    )
    expect(html).toContain(label)
  })

  it('uses the outline variant', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'google' }),
    )
    expect(html).toContain('border border-input')
  })

  it('renders the "Last used" badge when lastUsed is set', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'google', lastUsed: true }),
    )
    expect(html).toContain('Last used')
    expect(html).toContain('-top-2')
    expect(html).toContain('bg-primary')
  })

  it('does not render the badge by default', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'google' }),
    )
    expect(html).not.toContain('Last used')
  })

  it('disables the button when loading', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'github', loading: true }),
    )
    expect(html).toContain('disabled')
    expect(html).toContain('animate-spin')
  })

  it('disables the button when disabled', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'apple', disabled: true }),
    )
    expect(html).toContain('disabled')
  })

  it('applies a custom className to the button', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'google', className: 'my-auth' }),
    )
    expect(html).toContain('my-auth')
  })
})

describe('SocialAuthRow (React)', () => {
  it('renders responsive grid classes', () => {
    const html = renderToString(
      React.createElement(SocialAuthRow, null, 'child'),
    )
    expect(html).toContain('grid-cols-1')
    expect(html).toContain('sm:grid-cols-2')
    expect(html).toContain('gap-3')
  })

  it('renders children', () => {
    const html = renderToString(
      React.createElement(
        SocialAuthRow,
        null,
        React.createElement(SocialAuthButton, { provider: 'google' }),
        React.createElement(SocialAuthButton, { provider: 'github' }),
      ),
    )
    expect(html).toContain('Continue with Google')
    expect(html).toContain('Continue with GitHub')
  })

  it('applies a custom className', () => {
    const html = renderToString(
      React.createElement(SocialAuthRow, { className: 'my-row' }, 'x'),
    )
    expect(html).toContain('my-row')
  })
})

// ---------------------------------------------------------------
// Additional SSR coverage (brand icons, button semantics)
// ---------------------------------------------------------------

describe('SocialAuthButton – brand icons (React)', () => {
  it('renders the Google mark in brand color (not mono)', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'google' }),
    )
    expect(html).toContain('fill="#4285F4"')
    expect(html).toContain('fill="#FBBC05"')
  })

  it('renders the GitHub mark monochrome', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'github' }),
    )
    expect(html).toContain('fill="currentColor"')
    // Octocat path
    expect(html).toContain('M12 2a10 10 0 0 0-3.16 19.49')
  })

  it('renders the Microsoft mark in its four brand colors', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'microsoft' }),
    )
    expect(html).toContain('fill="#F25022"')
    expect(html).toContain('fill="#7FBA00"')
    expect(html).toContain('fill="#00A4EF"')
    expect(html).toContain('fill="#FFB900"')
  })

  it('renders the Apple mark monochrome', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'apple' }),
    )
    expect(html).toContain('fill="currentColor"')
    expect(html).not.toContain('fill="#')
  })

  it('icons are decorative and sized 18px', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'google' }),
    )
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('width="18"')
    expect(html).toContain('height="18"')
  })
})

describe('SocialAuthButton – button semantics (React)', () => {
  it('renders type="button" by default', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'google' }),
    )
    expect(html).toContain('type="button"')
  })

  it('puts data-provider on the button element', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'github' }),
    )
    expect(html).toMatch(/<button[^>]*data-provider="github"/)
  })

  it('wraps the button in a relative container for the badge', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'google' }),
    )
    expect(html).toContain('relative')
  })

  it('loading swaps the brand icon for a spinner', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'google', loading: true }),
    )
    expect(html).toContain('animate-spin')
    // Brand mark is not rendered while loading.
    expect(html).not.toContain('fill="#4285F4"')
  })

  it('"Last used" badge carries positioning classes', () => {
    const html = renderToString(
      React.createElement(SocialAuthButton, { provider: 'apple', lastUsed: true }),
    )
    expect(html).toContain('absolute')
    expect(html).toContain('-right-2')
    expect(html).toContain('rounded-full')
    expect(html).toContain('text-[10px]')
  })
})
