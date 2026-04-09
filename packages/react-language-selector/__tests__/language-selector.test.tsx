import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { LanguageSelector } from '../src/language-selector.js'
import { resetIdCounter } from '@elloloop/shared'

const options = [
  { value: 'en', label: 'English', group: 'Popular' },
  { value: 'es', label: 'Spanish', group: 'Popular' },
  { value: 'fr', label: 'French', group: 'European' },
  { value: 'ja', label: 'Japanese' },
]

beforeEach(() => {
  resetIdCounter()
})

describe('LanguageSelector (React)', () => {
  it('renders trigger button with combobox role', () => {
    const html = renderToString(
      React.createElement(LanguageSelector, { options }),
    )
    expect(html).toContain('role="combobox"')
    expect(html).toContain('<button')
  })

  it('renders placeholder when no value selected', () => {
    const html = renderToString(
      React.createElement(LanguageSelector, { options, placeholder: 'Pick a language' }),
    )
    expect(html).toContain('Pick a language')
  })

  it('renders selected value label', () => {
    const html = renderToString(
      React.createElement(LanguageSelector, { value: 'en', options }),
    )
    expect(html).toContain('English')
  })

  it('renders multiple selected labels', () => {
    const html = renderToString(
      React.createElement(LanguageSelector, { value: ['en', 'fr'], options, multiple: true }),
    )
    expect(html).toContain('English')
    expect(html).toContain('French')
  })

  it('trigger has aria-expanded false when closed', () => {
    const html = renderToString(
      React.createElement(LanguageSelector, { options }),
    )
    expect(html).toContain('aria-expanded="false"')
  })

  it('trigger has aria-haspopup listbox', () => {
    const html = renderToString(
      React.createElement(LanguageSelector, { options }),
    )
    expect(html).toContain('aria-haspopup="listbox"')
  })

  it('does not render dropdown when closed', () => {
    const html = renderToString(
      React.createElement(LanguageSelector, { options }),
    )
    expect(html).not.toContain('role="listbox"')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(LanguageSelector, { options, className: 'my-lang' }),
    )
    expect(html).toContain('my-lang')
  })

  it('renders selector variant classes on trigger', () => {
    const html = renderToString(
      React.createElement(LanguageSelector, { options }),
    )
    expect(html).toContain('inline-flex')
    expect(html).toContain('rounded-md')
  })
})
