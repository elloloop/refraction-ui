import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Switch } from '../src/switch.js'

describe('Switch (React)', () => {
  it('renders a button element', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
  })

  it('has role switch', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('role="switch"')
  })

  it('aria-checked is false by default', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('aria-checked="false"')
  })

  it('aria-checked is true when checked', () => {
    const html = renderToString(React.createElement(Switch, { checked: true }))
    expect(html).toContain('aria-checked="true"')
  })

  it('data-state is unchecked by default', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('data-state="unchecked"')
  })

  it('data-state is checked when checked', () => {
    const html = renderToString(React.createElement(Switch, { checked: true }))
    expect(html).toContain('data-state="checked"')
  })

  it('disabled sets disabled attribute', () => {
    const html = renderToString(React.createElement(Switch, { disabled: true }))
    expect(html).toContain('disabled')
    expect(html).toContain('aria-disabled="true"')
  })

  it('applies bg-primary when checked', () => {
    const html = renderToString(React.createElement(Switch, { checked: true }))
    expect(html).toContain('bg-primary')
  })

  it('applies bg-input when unchecked', () => {
    const html = renderToString(React.createElement(Switch, { checked: false }))
    expect(html).toContain('bg-input')
  })

  it('renders thumb span inside', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('<span')
    expect(html).toContain('rounded-full')
    expect(html).toContain('bg-background')
  })

  it('thumb has translate-x-4 when checked default size', () => {
    const html = renderToString(React.createElement(Switch, { checked: true }))
    expect(html).toContain('translate-x-4')
  })

  it('thumb has translate-x-0 when unchecked', () => {
    const html = renderToString(React.createElement(Switch, { checked: false }))
    expect(html).toContain('translate-x-0')
  })

  it('applies sm size classes', () => {
    const html = renderToString(React.createElement(Switch, { size: 'sm' }))
    expect(html).toContain('h-4')
    expect(html).toContain('w-7')
  })

  it('applies default size classes', () => {
    const html = renderToString(React.createElement(Switch, { size: 'default' }))
    expect(html).toContain('h-5')
    expect(html).toContain('w-9')
  })

  it('applies lg size classes', () => {
    const html = renderToString(React.createElement(Switch, { size: 'lg' }))
    expect(html).toContain('h-6')
    expect(html).toContain('w-11')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(Switch, { className: 'my-switch' }))
    expect(html).toContain('my-switch')
  })

  it('default classes include inline-flex', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('inline-flex')
  })

  it('default classes include cursor-pointer', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('cursor-pointer')
  })

  it('checked sm has translate-x-3 on thumb', () => {
    const html = renderToString(React.createElement(Switch, { checked: true, size: 'sm' }))
    expect(html).toContain('translate-x-3')
  })

  it('checked lg has translate-x-5 on thumb', () => {
    const html = renderToString(React.createElement(Switch, { checked: true, size: 'lg' }))
    expect(html).toContain('translate-x-5')
  })
})
