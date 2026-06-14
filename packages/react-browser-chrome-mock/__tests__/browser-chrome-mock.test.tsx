import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { BrowserChromeMock } from '../src/browser-chrome-mock.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(BrowserChromeMock, props))

describe('BrowserChromeMock (SSR)', () => {
  it('renders 3 traffic-light dots', () => {
    const html = render({ url: 'loopwyse.com/demo' })
    // Each dot is a <span> with bg-red/yellow/green classes
    expect((html.match(/bg-red-400/g) ?? []).length).toBeGreaterThanOrEqual(1)
    expect((html.match(/bg-yellow-400/g) ?? []).length).toBeGreaterThanOrEqual(1)
    expect((html.match(/bg-green-400/g) ?? []).length).toBeGreaterThanOrEqual(1)
  })

  it('renders the url domain bold and the path separately', () => {
    const html = render({ url: 'loopwyse.com/r/7k2f' })
    expect(html).toContain('loopwyse.com')
    expect(html).toContain('/r/7k2f')
  })

  it('renders a status badge when status is set', () => {
    const html = render({ url: 'loopwyse.com', status: 'live' })
    expect(html).toContain('data-status="live"')
    expect(html).toContain('live')
  })

  it('does not render a status badge when status is unset', () => {
    const html = render({ url: 'loopwyse.com' })
    expect(html).not.toContain('data-status')
  })

  it('renders rec badge with a pulse dot', () => {
    const html = render({ url: 'loopwyse.com', status: 'rec' })
    expect(html).toContain('data-status="rec"')
    expect(html).toContain('animate-pulse')
    expect(html).toContain('rec')
  })

  it('renders children inside the content area', () => {
    const html = renderToString(
      React.createElement(
        BrowserChromeMock,
        { url: 'loopwyse.com' },
        React.createElement('p', null, 'Hello world'),
      ),
    )
    expect(html).toContain('Hello world')
  })

  it('exposes role=group and aria-label', () => {
    const html = render({ url: 'loopwyse.com' })
    expect(html).toContain('role="group"')
    expect(html).toContain('aria-label="Browser preview"')
  })
})
