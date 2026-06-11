import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Input } from '../src/input.js'

describe('Input (React)', () => {
  it('renders an input element', () => {
    const html = renderToString(React.createElement(Input))
    expect(html).toContain('<input')
    expect(html).toContain('type="text"')
  })

  it('applies default size classes', () => {
    const html = renderToString(React.createElement(Input))
    expect(html).toContain('h-9')
  })

  it('applies sm size classes', () => {
    const html = renderToString(React.createElement(Input, { size: 'sm' }))
    expect(html).toContain('h-8')
  })

  it('applies lg size classes', () => {
    const html = renderToString(React.createElement(Input, { size: 'lg' }))
    expect(html).toContain('h-10')
  })

  it('sets disabled state', () => {
    const html = renderToString(React.createElement(Input, { disabled: true }))
    expect(html).toContain('disabled')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('data-disabled')
  })

  it('sets readOnly state', () => {
    const html = renderToString(React.createElement(Input, { readOnly: true }))
    expect(html).toContain('readonly')
    expect(html).toContain('data-readonly')
  })

  it('sets required state', () => {
    const html = renderToString(React.createElement(Input, { required: true }))
    expect(html).toContain('required')
    expect(html).toContain('aria-required="true"')
  })

  it('sets aria-invalid state', () => {
    const html = renderToString(React.createElement(Input, { 'aria-invalid': true }))
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('data-invalid')
  })

  it('renders with password type', () => {
    const html = renderToString(React.createElement(Input, { type: 'password' }))
    expect(html).toContain('type="password"')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(Input, { className: 'my-input' }))
    expect(html).toContain('my-input')
  })

  it('renders with placeholder', () => {
    const html = renderToString(React.createElement(Input, { placeholder: 'Enter text...' }))
    expect(html).toContain('placeholder="Enter text..."')
  })
})

describe('Input (React) - type coverage', () => {
  it('renders type="password"', () => {
    const html = renderToString(React.createElement(Input, { type: 'password' }))
    expect(html).toContain('type="password"')
  })

  it('renders type="email"', () => {
    const html = renderToString(React.createElement(Input, { type: 'email' }))
    expect(html).toContain('type="email"')
  })

  it('renders type="number"', () => {
    const html = renderToString(React.createElement(Input, { type: 'number' }))
    expect(html).toContain('type="number"')
  })

  it('renders type="tel"', () => {
    const html = renderToString(React.createElement(Input, { type: 'tel' }))
    expect(html).toContain('type="tel"')
  })

  it('renders type="url"', () => {
    const html = renderToString(React.createElement(Input, { type: 'url' }))
    expect(html).toContain('type="url"')
  })

  it('renders type="search"', () => {
    const html = renderToString(React.createElement(Input, { type: 'search' }))
    expect(html).toContain('type="search"')
  })
})

describe('Input (React) - placeholder', () => {
  it('renders with a custom placeholder', () => {
    const html = renderToString(React.createElement(Input, { placeholder: 'Type here...' }))
    expect(html).toContain('placeholder="Type here..."')
  })
})

describe('Input (React) - disabled attribute', () => {
  it('disabled renders disabled attribute on the element', () => {
    const html = renderToString(React.createElement(Input, { disabled: true }))
    expect(html).toContain('disabled')
  })
})

describe('Input (React) - readOnly attribute', () => {
  it('readOnly renders readonly attribute on the element', () => {
    const html = renderToString(React.createElement(Input, { readOnly: true }))
    expect(html).toContain('readonly')
  })
})

describe('Input (React) - custom className', () => {
  it('custom className is appended, not replaced', () => {
    const html = renderToString(React.createElement(Input, { className: 'my-special' }))
    // Should contain both base classes and custom class
    expect(html).toContain('rounded-md')
    expect(html).toContain('my-special')
  })
})

describe('Input (React) - validationState', () => {
  it('valid → green border and aria-invalid="false"', () => {
    const html = renderToString(React.createElement(Input, { validationState: 'valid' }))
    expect(html).toContain('border-green-500')
    expect(html).toContain('aria-invalid="false"')
  })

  it('valid renders a trailing check icon inside a wrapper', () => {
    const html = renderToString(React.createElement(Input, { validationState: 'valid' }))
    expect(html).toContain('<svg')
    expect(html).toContain('text-green-500')
  })

  it('invalid → destructive border and aria-invalid="true"', () => {
    const html = renderToString(React.createElement(Input, { validationState: 'invalid' }))
    expect(html).toContain('border-destructive')
    expect(html).toContain('aria-invalid="true"')
  })

  it('explicit aria-invalid takes precedence over validationState', () => {
    const html = renderToString(
      React.createElement(Input, { validationState: 'valid', 'aria-invalid': true }),
    )
    expect(html).toContain('aria-invalid="true"')
  })
})

describe('Input (React) - leadingIcon', () => {
  it('renders the leading icon and applies pl-9', () => {
    const icon = React.createElement('svg', { 'data-testid': 'lead-icon' })
    const html = renderToString(React.createElement(Input, { leadingIcon: icon }))
    expect(html).toContain('data-testid="lead-icon"')
    expect(html).toContain('pl-9')
  })

  it('wraps the input in a relative div when leadingIcon is set', () => {
    const icon = React.createElement('svg')
    const html = renderToString(React.createElement(Input, { leadingIcon: icon }))
    expect(html).toContain('class="relative"')
  })
})

describe('Input (React) - default path unchanged', () => {
  it('renders a bare input with no wrapper when no extra props', () => {
    const html = renderToString(React.createElement(Input))
    expect(html.trim().startsWith('<input')).toBe(true)
    expect(html).not.toContain('class="relative"')
  })

  it('does not emit aria-invalid by default', () => {
    const html = renderToString(React.createElement(Input))
    expect(html).not.toContain('aria-invalid')
  })
})

describe('Input (React) - size variant heights', () => {
  it('sm size renders h-8', () => {
    const html = renderToString(React.createElement(Input, { size: 'sm' }))
    expect(html).toContain('h-8')
  })

  it('default size renders h-9', () => {
    const html = renderToString(React.createElement(Input, { size: 'default' }))
    expect(html).toContain('h-9')
  })

  it('lg size renders h-10', () => {
    const html = renderToString(React.createElement(Input, { size: 'lg' }))
    expect(html).toContain('h-10')
  })

  it('all three sizes produce different heights', () => {
    const smHtml = renderToString(React.createElement(Input, { size: 'sm' }))
    const defaultHtml = renderToString(React.createElement(Input, { size: 'default' }))
    const lgHtml = renderToString(React.createElement(Input, { size: 'lg' }))
    // Each should have its own unique height class
    expect(smHtml).toContain('h-8')
    expect(defaultHtml).toContain('h-9')
    expect(lgHtml).toContain('h-10')
  })
})
