import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Checkbox } from '../src/checkbox.js'

describe('Checkbox (React)', () => {
  it('renders a button element', () => {
    const html = renderToString(React.createElement(Checkbox))
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
  })

  it('has role checkbox', () => {
    const html = renderToString(React.createElement(Checkbox))
    expect(html).toContain('role="checkbox"')
  })

  it('aria-checked is false by default', () => {
    const html = renderToString(React.createElement(Checkbox))
    expect(html).toContain('aria-checked="false"')
  })

  it('aria-checked is true when checked', () => {
    const html = renderToString(React.createElement(Checkbox, { checked: true }))
    expect(html).toContain('aria-checked="true"')
  })

  it('aria-checked is mixed when indeterminate', () => {
    const html = renderToString(React.createElement(Checkbox, { checked: 'indeterminate' }))
    expect(html).toContain('aria-checked="mixed"')
  })

  it('data-state is unchecked by default', () => {
    const html = renderToString(React.createElement(Checkbox))
    expect(html).toContain('data-state="unchecked"')
  })

  it('data-state is checked when checked', () => {
    const html = renderToString(React.createElement(Checkbox, { checked: true }))
    expect(html).toContain('data-state="checked"')
  })

  it('data-state is indeterminate when indeterminate', () => {
    const html = renderToString(React.createElement(Checkbox, { checked: 'indeterminate' }))
    expect(html).toContain('data-state="indeterminate"')
  })

  it('disabled sets disabled attribute', () => {
    const html = renderToString(React.createElement(Checkbox, { disabled: true }))
    expect(html).toContain('disabled')
    expect(html).toContain('aria-disabled="true"')
  })

  it('renders checkmark SVG when checked', () => {
    const html = renderToString(React.createElement(Checkbox, { checked: true }))
    expect(html).toContain('<svg')
    expect(html).toContain('M20 6L9 17l-5-5')
  })

  it('does not render SVG when unchecked', () => {
    const html = renderToString(React.createElement(Checkbox, { checked: false }))
    expect(html).not.toContain('<svg')
  })

  it('renders dash SVG when indeterminate', () => {
    const html = renderToString(React.createElement(Checkbox, { checked: 'indeterminate' }))
    expect(html).toContain('<svg')
    expect(html).toContain('M5 12h14')
  })

  it('applies bg-primary when checked', () => {
    const html = renderToString(React.createElement(Checkbox, { checked: true }))
    expect(html).toContain('bg-primary')
  })

  it('applies bg-background when unchecked', () => {
    const html = renderToString(React.createElement(Checkbox, { checked: false }))
    expect(html).toContain('bg-background')
  })

  it('applies bg-primary when indeterminate', () => {
    const html = renderToString(React.createElement(Checkbox, { checked: 'indeterminate' }))
    expect(html).toContain('bg-primary')
  })

  it('default size has h-4 w-4', () => {
    const html = renderToString(React.createElement(Checkbox, { size: 'default' }))
    expect(html).toContain('h-4')
    expect(html).toContain('w-4')
  })

  it('sm size has h-3.5 w-3.5', () => {
    const html = renderToString(React.createElement(Checkbox, { size: 'sm' }))
    expect(html).toContain('h-3.5')
    expect(html).toContain('w-3.5')
  })

  it('lg size has h-5 w-5', () => {
    const html = renderToString(React.createElement(Checkbox, { size: 'lg' }))
    expect(html).toContain('h-5')
    expect(html).toContain('w-5')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(Checkbox, { className: 'my-check' }))
    expect(html).toContain('my-check')
  })

  it('base classes include rounded-sm', () => {
    const html = renderToString(React.createElement(Checkbox))
    expect(html).toContain('rounded-sm')
  })

  it('base classes include border-primary', () => {
    const html = renderToString(React.createElement(Checkbox))
    expect(html).toContain('border-primary')
  })
})
