import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { VersionSelector } from '../src/version-selector.js'
import { resetIdCounter } from '@refraction-ui/shared'

const versions = [
  { value: '3.0.0', label: 'v3.0.0', isLatest: true },
  { value: '2.1.0', label: 'v2.1.0' },
  { value: '2.0.0', label: 'v2.0.0' },
  { value: '1.0.0', label: 'v1.0.0' },
]

beforeEach(() => {
  resetIdCounter()
})

describe('VersionSelector (React)', () => {
  it('renders trigger button with combobox role', () => {
    const html = renderToString(
      React.createElement(VersionSelector, { versions }),
    )
    expect(html).toContain('role="combobox"')
    expect(html).toContain('<button')
  })

  it('renders placeholder when no value selected', () => {
    const html = renderToString(
      React.createElement(VersionSelector, { versions, placeholder: 'Pick version' }),
    )
    expect(html).toContain('Pick version')
  })

  it('renders selected version label', () => {
    const html = renderToString(
      React.createElement(VersionSelector, { value: '2.1.0', versions }),
    )
    expect(html).toContain('v2.1.0')
  })

  it('renders Latest badge when latest version is selected', () => {
    const html = renderToString(
      React.createElement(VersionSelector, { value: '3.0.0', versions }),
    )
    expect(html).toContain('Latest')
    expect(html).toContain('v3.0.0')
  })

  it('does not render Latest badge for non-latest version', () => {
    const html = renderToString(
      React.createElement(VersionSelector, { value: '2.1.0', versions }),
    )
    // The trigger should not contain Latest badge
    // (dropdown is closed so no option badges rendered either)
    expect(html).not.toContain('Latest')
  })

  it('trigger has aria-expanded false when closed', () => {
    const html = renderToString(
      React.createElement(VersionSelector, { versions }),
    )
    expect(html).toContain('aria-expanded="false"')
  })

  it('trigger has aria-haspopup listbox', () => {
    const html = renderToString(
      React.createElement(VersionSelector, { versions }),
    )
    expect(html).toContain('aria-haspopup="listbox"')
  })

  it('does not render dropdown when closed', () => {
    const html = renderToString(
      React.createElement(VersionSelector, { versions }),
    )
    expect(html).not.toContain('role="listbox"')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(VersionSelector, { versions, className: 'my-ver' }),
    )
    expect(html).toContain('my-ver')
  })

  it('renders version selector variant classes on trigger', () => {
    const html = renderToString(
      React.createElement(VersionSelector, { versions }),
    )
    expect(html).toContain('inline-flex')
    expect(html).toContain('rounded-md')
  })
})
