import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { CookieConsent, useCookieConsent } from '../src/index.js'
import type { CookieConsentConfig, CookieStorage } from '@refraction-ui/cookie-consent'
import type { CookieConsentProps } from '../src/cookie-consent.js'

// SSR suite — structure and ARIA only. Accept/Reject/Save, the Customize
// settings view (category toggles with role="switch"), and persistence are
// client interactions (button clicks, store updates) not covered here.
//
// `CookieConsent` takes the result of `useCookieConsent()`, so tests render
// through a small harness component that calls the hook. On the server there
// is no localStorage, so nothing is persisted and the banner starts open.

function Harness({ config, ...props }: { config?: CookieConsentConfig } & Partial<CookieConsentProps>) {
  const consent = useCookieConsent(config)
  return React.createElement(CookieConsent, { consent, ...props } as CookieConsentProps)
}

/** Storage adapter holding a prior consent choice (version matches config). */
function consentedStorage(): CookieStorage {
  return {
    get: () => JSON.stringify({ preferences: { necessary: true, analytics: true } }),
    set: () => {},
    remove: () => {},
  }
}

describe('CookieConsent (React)', () => {
  it('renders a non-modal dialog with an accessible label when no consent is stored', () => {
    const html = renderToString(React.createElement(Harness, null))
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-label="Cookie consent"')
    expect(html).toContain('aria-modal="false"')
  })

  it('renders the default title, description, and actions', () => {
    const html = renderToString(React.createElement(Harness, null))
    expect(html).toContain('We use cookies')
    expect(html).toContain('Customize')
    expect(html).toContain('Reject all')
    expect(html).toContain('Accept all')
  })

  it('anchors to the bottom by default', () => {
    const html = renderToString(React.createElement(Harness, null))
    expect(html).toContain('bottom-0')
    expect(html).not.toContain('top-0')
  })

  it('anchors to the top when position is top', () => {
    const html = renderToString(React.createElement(Harness, { position: 'top' }))
    expect(html).toContain('top-0')
    expect(html).not.toContain('bottom-0')
  })

  it('renders custom title and description', () => {
    const html = renderToString(
      React.createElement(Harness, { title: 'Cookie choices', description: 'Pick your categories.' }),
    )
    expect(html).toContain('Cookie choices')
    expect(html).toContain('Pick your categories.')
  })

  it('renders the policy link when policyUrl is given', () => {
    const html = renderToString(React.createElement(Harness, { policyUrl: '/privacy' }))
    expect(html).toContain('href="/privacy"')
    expect(html).toContain('Cookie policy')
  })

  it('omits the policy link when no policyUrl is given', () => {
    const html = renderToString(React.createElement(Harness, null))
    expect(html).not.toContain('Cookie policy')
  })

  it('appends a custom className to the wrapper', () => {
    const html = renderToString(React.createElement(Harness, { className: 'my-consent' }))
    expect(html).toContain('my-consent')
  })

  it('shows the prompt view, not the settings view, initially', () => {
    const html = renderToString(React.createElement(Harness, null))
    // Category toggles live in the settings view behind the Customize click.
    expect(html).not.toContain('role="switch"')
    expect(html).not.toContain('Cookie preferences')
  })

  it('renders nothing once consent is persisted', () => {
    const html = renderToString(React.createElement(Harness, { config: { storage: consentedStorage() } }))
    expect(html).toBe('')
  })
})
