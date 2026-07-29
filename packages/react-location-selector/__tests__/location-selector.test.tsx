import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { LocationSelector } from '../src/location-selector.js'

describe('LocationSelector (React SSR)', () => {
  it('renders country and language selects with visible labels', () => {
    const html = renderToString(React.createElement(LocationSelector, {}))
    expect(html).toContain('name="country"')
    expect(html).toContain('name="language"')
    expect(html).toContain('>Country</label>')
    expect(html).toContain('>Language</label>')
  })

  it('associates each label with its select via matching for/id', () => {
    const html = renderToString(React.createElement(LocationSelector, {}))
    const countryFor = html.match(/for="(location-sel-country-[^"]+)"/)
    const languageFor = html.match(/for="(location-sel-language-[^"]+)"/)
    expect(countryFor).not.toBeNull()
    expect(languageFor).not.toBeNull()
    expect(html).toContain(`id="${countryFor![1]}"`)
    expect(html).toContain(`id="${languageFor![1]}"`)
  })

  it('renders i18n country options', () => {
    const html = renderToString(React.createElement(LocationSelector, {}))
    // Non-default options render plain; the default (US) carries selected.
    expect(html).toContain('<option value="GB">United Kingdom</option>')
    expect(html).toContain('<option value="IN">India</option>')
    expect(html).toContain('<option value="US" selected="">United States</option>')
  })

  it('renders i18n language options', () => {
    const html = renderToString(React.createElement(LocationSelector, {}))
    expect(html).toContain('<option value="hi">Hindi</option>')
    expect(html).toContain('<option value="fr">French</option>')
  })

  it('marks the default country and language options as selected', () => {
    // React SSR injects `selected` after `value` on the option matching the
    // controlled select's value.
    const html = renderToString(
      React.createElement(LocationSelector, { defaultCountry: 'GB', defaultLanguage: 'hi' }),
    )
    expect(html).toContain('<option value="GB" selected="">')
    expect(html).toContain('<option value="hi" selected="">')
  })

  it('lays out the two selects in a responsive flex wrapper', () => {
    const html = renderToString(React.createElement(LocationSelector, {}))
    expect(html).toContain('flex flex-col gap-4 sm:flex-row')
  })

  it('appends a custom className to the wrapper', () => {
    const html = renderToString(React.createElement(LocationSelector, { className: 'my-selector' }))
    expect(html).toContain('my-selector')
    expect(html).toContain('flex flex-col gap-4 sm:flex-row')
  })
})
