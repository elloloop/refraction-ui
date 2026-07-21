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

describe('Switch (React) - additional ARIA and data coverage', () => {
  it('does not render aria-disabled when enabled', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).not.toContain('aria-disabled')
  })

  it('renders data-disabled when disabled', () => {
    const html = renderToString(React.createElement(Switch, { disabled: true }))
    expect(html).toContain('data-disabled=""')
  })

  it('does not render data-disabled when enabled', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).not.toContain('data-disabled')
  })

  it('disabled checked switch keeps data-state checked', () => {
    const html = renderToString(React.createElement(Switch, { disabled: true, checked: true }))
    expect(html).toContain('data-state="checked"')
    expect(html).toContain('aria-checked="true"')
    expect(html).toContain('aria-disabled="true"')
  })

  it('passes through name and value attributes for form usage', () => {
    const html = renderToString(
      React.createElement(Switch, { name: 'notifications', value: 'on' }),
    )
    expect(html).toContain('name="notifications"')
    expect(html).toContain('value="on"')
  })

  it('passes through aria-label', () => {
    const html = renderToString(
      React.createElement(Switch, { 'aria-label': 'Enable notifications' }),
    )
    expect(html).toContain('aria-label="Enable notifications"')
  })

  it('applies default size when no size prop is given', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('h-5')
    expect(html).toContain('w-9')
  })

  it('thumb has sm size classes', () => {
    const html = renderToString(React.createElement(Switch, { size: 'sm' }))
    expect(html).toContain('h-3')
    expect(html).toContain('w-3')
  })

  it('thumb has default size classes', () => {
    const html = renderToString(React.createElement(Switch, { size: 'default' }))
    expect(html).toContain('h-4')
    expect(html).toContain('w-4')
  })

  it('thumb has lg size classes', () => {
    const html = renderToString(React.createElement(Switch, { size: 'lg' }))
    expect(html).toContain('h-5')
    expect(html).toContain('w-5')
  })

  it('base classes include focus-visible ring styles', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('focus-visible:ring-2')
    expect(html).toContain('focus-visible:ring-ring')
  })

  it('base classes include disabled cursor and opacity styles', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('disabled:cursor-not-allowed')
    expect(html).toContain('disabled:opacity-50')
  })

  it('thumb is pointer-events-none so clicks hit the button', () => {
    const html = renderToString(React.createElement(Switch))
    expect(html).toContain('pointer-events-none')
  })
})
