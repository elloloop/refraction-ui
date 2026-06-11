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
