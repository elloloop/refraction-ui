import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Textarea } from '../src/textarea.js'

describe('Textarea (React)', () => {
  it('renders a textarea element', () => {
    const html = renderToString(React.createElement(Textarea))
    expect(html).toContain('<textarea')
  })

  it('applies default size classes', () => {
    const html = renderToString(React.createElement(Textarea))
    expect(html).toContain('min-h-[60px]')
  })

  it('applies sm size classes', () => {
    const html = renderToString(React.createElement(Textarea, { size: 'sm' }))
    expect(html).toContain('min-h-[40px]')
  })

  it('applies lg size classes', () => {
    const html = renderToString(React.createElement(Textarea, { size: 'lg' }))
    expect(html).toContain('min-h-[80px]')
  })

  it('sets disabled state', () => {
    const html = renderToString(React.createElement(Textarea, { disabled: true }))
    expect(html).toContain('disabled')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('data-disabled')
  })

  it('sets readOnly state', () => {
    const html = renderToString(React.createElement(Textarea, { readOnly: true }))
    expect(html).toContain('readonly')
    expect(html).toContain('data-readonly')
  })

  it('sets required state', () => {
    const html = renderToString(React.createElement(Textarea, { required: true }))
    expect(html).toContain('required')
    expect(html).toContain('aria-required="true"')
  })

  it('sets aria-invalid state', () => {
    const html = renderToString(React.createElement(Textarea, { 'aria-invalid': true }))
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('data-invalid')
  })

  it('applies custom className', () => {
    const html = renderToString(React.createElement(Textarea, { className: 'my-textarea' }))
    expect(html).toContain('my-textarea')
  })

  it('renders with rows attribute', () => {
    const html = renderToString(React.createElement(Textarea, { rows: 5 }))
    expect(html).toContain('rows="5"')
  })

  it('renders with placeholder', () => {
    const html = renderToString(React.createElement(Textarea, { placeholder: 'Enter text...' }))
    expect(html).toContain('placeholder="Enter text..."')
  })
})

describe('Textarea (React) - element type', () => {
  it('renders a textarea element, not an input', () => {
    const html = renderToString(React.createElement(Textarea))
    expect(html).toContain('<textarea')
    expect(html).not.toMatch(/<input[\s/>]/)
  })
})

describe('Textarea (React) - placeholder', () => {
  it('placeholder text is rendered as attribute', () => {
    const html = renderToString(React.createElement(Textarea, { placeholder: 'Write something...' }))
    expect(html).toContain('placeholder="Write something..."')
  })
})

describe('Textarea (React) - rows attribute', () => {
  it('rows=3 passes through to the textarea element', () => {
    const html = renderToString(React.createElement(Textarea, { rows: 3 }))
    expect(html).toContain('rows="3"')
  })

  it('rows=10 passes through to the textarea element', () => {
    const html = renderToString(React.createElement(Textarea, { rows: 10 }))
    expect(html).toContain('rows="10"')
  })
})

describe('Textarea (React) - size variants', () => {
  it('sm size renders min-h-[40px]', () => {
    const html = renderToString(React.createElement(Textarea, { size: 'sm' }))
    expect(html).toContain('min-h-[40px]')
  })

  it('default size renders min-h-[60px]', () => {
    const html = renderToString(React.createElement(Textarea, { size: 'default' }))
    expect(html).toContain('min-h-[60px]')
  })

  it('lg size renders min-h-[80px]', () => {
    const html = renderToString(React.createElement(Textarea, { size: 'lg' }))
    expect(html).toContain('min-h-[80px]')
  })

  it('all three size variants produce different min-heights', () => {
    const smHtml = renderToString(React.createElement(Textarea, { size: 'sm' }))
    const defaultHtml = renderToString(React.createElement(Textarea, { size: 'default' }))
    const lgHtml = renderToString(React.createElement(Textarea, { size: 'lg' }))
    expect(smHtml).toContain('min-h-[40px]')
    expect(defaultHtml).toContain('min-h-[60px]')
    expect(lgHtml).toContain('min-h-[80px]')
  })
})

describe('Textarea (React) - disabled + readOnly attributes', () => {
  it('disabled renders the disabled attribute', () => {
    const html = renderToString(React.createElement(Textarea, { disabled: true }))
    expect(html).toContain('disabled')
  })

  it('readOnly renders the readonly attribute', () => {
    const html = renderToString(React.createElement(Textarea, { readOnly: true }))
    expect(html).toContain('readonly')
  })

  it('disabled + readOnly both render on the same element', () => {
    const html = renderToString(React.createElement(Textarea, { disabled: true, readOnly: true }))
    expect(html).toContain('disabled')
    expect(html).toContain('readonly')
    expect(html).toContain('data-disabled')
    expect(html).toContain('data-readonly')
  })
})
