import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { SearchBar, SearchResults, SearchResultItem } from '../src/search-bar.js'
import { resetIdCounter } from '@elloloop/shared'

beforeEach(() => {
  resetIdCounter()
})

describe('SearchBar (React)', () => {
  it('renders an input with combobox role', () => {
    const html = renderToString(
      React.createElement(SearchBar, { placeholder: 'Search...' }),
    )
    expect(html).toContain('role="combobox"')
    expect(html).toContain('placeholder="Search..."')
  })

  it('renders search icon', () => {
    const html = renderToString(
      React.createElement(SearchBar, null),
    )
    expect(html).toContain('rfr-search-icon')
  })

  it('renders with default value', () => {
    const html = renderToString(
      React.createElement(SearchBar, { defaultValue: 'hello' }),
    )
    expect(html).toContain('value="hello"')
  })

  it('renders with controlled value', () => {
    const html = renderToString(
      React.createElement(SearchBar, { value: 'controlled' }),
    )
    expect(html).toContain('value="controlled"')
  })

  it('renders clear button when value is present', () => {
    const html = renderToString(
      React.createElement(SearchBar, { value: 'test' }),
    )
    expect(html).toContain('aria-label="Clear search"')
  })

  it('does not render clear button when value is empty', () => {
    const html = renderToString(
      React.createElement(SearchBar, { value: '' }),
    )
    expect(html).not.toContain('aria-label="Clear search"')
  })

  it('renders loading spinner when loading', () => {
    const html = renderToString(
      React.createElement(SearchBar, { loading: true }),
    )
    expect(html).toContain('aria-label="Loading"')
  })

  it('input has aria-autocomplete list', () => {
    const html = renderToString(
      React.createElement(SearchBar, null),
    )
    expect(html).toContain('aria-autocomplete="list"')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(SearchBar, { className: 'my-search' }),
    )
    expect(html).toContain('my-search')
  })
})

describe('SearchResults (React)', () => {
  it('renders results list with listbox role when value is present', () => {
    const html = renderToString(
      React.createElement(
        SearchBar,
        { value: 'test' },
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, null, 'Result 1'),
        ),
      ),
    )
    expect(html).toContain('role="listbox"')
    expect(html).toContain('Result 1')
  })

  it('does not render results when value is empty', () => {
    const html = renderToString(
      React.createElement(
        SearchBar,
        { value: '' },
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, null, 'Result 1'),
        ),
      ),
    )
    expect(html).not.toContain('role="listbox"')
  })
})

describe('SearchResultItem (React)', () => {
  it('renders as li with option role', () => {
    const html = renderToString(
      React.createElement(
        SearchBar,
        { value: 'test' },
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, null, 'Item'),
        ),
      ),
    )
    expect(html).toContain('role="option"')
    expect(html).toContain('Item')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(
        SearchBar,
        { value: 'test' },
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, { className: 'my-item' }, 'Item'),
        ),
      ),
    )
    expect(html).toContain('my-item')
  })
})
