import { describe, it, expect, beforeEach } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { SearchBar, SearchResults, SearchResultItem } from '../src/search-bar.js'
import { resetIdCounter } from '@refraction-ui/shared'

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

// ---------------------------------------------------------------
// Expanded SSR coverage
// ---------------------------------------------------------------

describe('SearchBar – input ARIA (React)', () => {
  it('aria-expanded is false when the value is empty', () => {
    const html = renderToString(
      React.createElement(SearchBar, { value: '' }),
    )
    expect(html).toContain('aria-expanded="false"')
  })

  it('aria-expanded is true when a value is present', () => {
    const html = renderToString(
      React.createElement(SearchBar, { value: 'query' }),
    )
    expect(html).toContain('aria-expanded="true"')
  })

  it('input aria-controls matches the results list id', () => {
    const html = renderToString(
      React.createElement(
        SearchBar,
        { value: 'test' },
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, null, 'Result'),
        ),
      ),
    )
    const controlsMatch = html.match(/aria-controls="([^"]+)"/)
    const idMatch = html.match(/id="([^"]+)"/)
    expect(controlsMatch).toBeTruthy()
    expect(idMatch).toBeTruthy()
    expect(controlsMatch![1]).toBe(idMatch![1])
  })

  it('search icon is hidden from assistive technology', () => {
    const html = renderToString(React.createElement(SearchBar, null))
    expect(html).toContain('aria-hidden="true"')
  })

  it('input carries the rfr-search-input class', () => {
    const html = renderToString(React.createElement(SearchBar, null))
    expect(html).toContain('rfr-search-input')
  })

  it('applies the md size classes by default', () => {
    const html = renderToString(React.createElement(SearchBar, null))
    expect(html).toContain('h-10')
  })

  it('wrapper includes border and rounded-md classes', () => {
    const html = renderToString(React.createElement(SearchBar, null))
    expect(html).toContain('rounded-md')
    expect(html).toContain('border')
    expect(html).toContain('bg-background')
  })

  it('passes through native input attributes', () => {
    const html = renderToString(
      React.createElement(SearchBar, { disabled: true, name: 'q' }),
    )
    expect(html).toContain('disabled=""')
    expect(html).toContain('name="q"')
  })

  it('does not render the spinner by default', () => {
    const html = renderToString(React.createElement(SearchBar, null))
    expect(html).not.toContain('aria-label="Loading"')
  })
})

describe('SearchBar – clear button (React)', () => {
  it('clear button is type="button"', () => {
    const html = renderToString(
      React.createElement(SearchBar, { value: 'test' }),
    )
    expect(html).toContain('type="button"')
  })

  it('does not render a clear button while loading', () => {
    const html = renderToString(
      React.createElement(SearchBar, { value: 'test', loading: true }),
    )
    expect(html).toContain('aria-label="Loading"')
    expect(html).not.toContain('aria-label="Clear search"')
  })
})

describe('SearchResults – list (React)', () => {
  it('applies dropdown positioning classes', () => {
    const html = renderToString(
      React.createElement(
        SearchBar,
        { value: 'test' },
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, null, 'Result'),
        ),
      ),
    )
    expect(html).toContain('absolute')
    expect(html).toContain('z-50')
  })

  it('renders a ul element', () => {
    const html = renderToString(
      React.createElement(
        SearchBar,
        { value: 'test' },
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, null, 'Result'),
        ),
      ),
    )
    expect(html).toContain('<ul')
  })

  it('spreads extra props onto the list', () => {
    const html = renderToString(
      React.createElement(
        SearchBar,
        { value: 'test' },
        React.createElement(
          SearchResults,
          { 'aria-label': 'Suggestions' },
          React.createElement(SearchResultItem, null, 'Result'),
        ),
      ),
    )
    expect(html).toContain('aria-label="Suggestions"')
  })

  it('renders multiple result items', () => {
    const html = renderToString(
      React.createElement(
        SearchBar,
        { value: 'test' },
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, null, 'One'),
          React.createElement(SearchResultItem, null, 'Two'),
          React.createElement(SearchResultItem, null, 'Three'),
        ),
      ),
    )
    expect(html).toContain('One')
    expect(html).toContain('Two')
    expect(html).toContain('Three')
    expect(html.match(/role="option"/g)).toHaveLength(3)
  })
})

describe('SearchResultItem – structure (React)', () => {
  it('applies base item classes', () => {
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
    expect(html).toContain('px-3')
    expect(html).toContain('py-2')
    expect(html).toContain('cursor-pointer')
    expect(html).toContain('hover:bg-accent')
  })

  it('renders as an li element', () => {
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
    expect(html).toContain('<li')
  })

  it('spreads extra props onto the item', () => {
    const html = renderToString(
      React.createElement(
        SearchBar,
        { value: 'test' },
        React.createElement(
          SearchResults,
          null,
          React.createElement(SearchResultItem, { id: 'first-result' }, 'Item'),
        ),
      ),
    )
    expect(html).toContain('id="first-result"')
  })
})
