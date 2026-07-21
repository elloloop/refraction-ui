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

describe('Textarea (React) - rows contract', () => {
  it('renders no rows attribute when rows is not provided', () => {
    const html = renderToString(React.createElement(Textarea))
    expect(html).not.toContain('rows=')
  })

  it('maxRows is consumed by the component and not leaked as a DOM attribute', () => {
    const html = renderToString(React.createElement(Textarea, { rows: 3, maxRows: 8 }))
    expect(html).toContain('rows="3"')
    expect(html.toLowerCase()).not.toContain('maxrows')
  })

  it('no fixed height or max-height clamp is imposed (element can grow)', () => {
    for (const size of ['sm', 'default', 'lg'] as const) {
      const html = renderToString(React.createElement(Textarea, { size }))
      // Sizing is expressed purely via min-h-*; nothing caps the height.
      expect(html).toContain('min-h-')
      expect(html).not.toContain('max-h')
      expect(html).not.toMatch(/\sh-\d/)
    }
  })
})

describe('Textarea (React) - resize behavior', () => {
  it('does not impose a resize utility (native resize handle preserved)', () => {
    const html = renderToString(React.createElement(Textarea))
    expect(html).not.toContain('resize-')
  })

  it('a resize utility can be opted into via className', () => {
    const html = renderToString(React.createElement(Textarea, { className: 'resize-y' }))
    expect(html).toContain('resize-y')
  })

  it('resize can be disabled via className', () => {
    const html = renderToString(React.createElement(Textarea, { className: 'resize-none' }))
    expect(html).toContain('resize-none')
  })
})

describe('Textarea (React) - form attributes', () => {
  it('renders maxLength as a native attribute', () => {
    const html = renderToString(React.createElement(Textarea, { maxLength: 280 }))
    expect(html).toContain('maxLength="280"')
  })

  it('passes name and id through for form submission and labelling', () => {
    const html = renderToString(
      React.createElement(Textarea, { name: 'bio', id: 'user-bio' }),
    )
    expect(html).toContain('name="bio"')
    expect(html).toContain('id="user-bio"')
  })

  it('defaultValue renders as the textarea text content', () => {
    const html = renderToString(React.createElement(Textarea, { defaultValue: 'hello world' }))
    expect(html).toContain('>hello world</textarea>')
  })

  it('aria-invalid={false} does not render aria-invalid or data-invalid', () => {
    const html = renderToString(React.createElement(Textarea, { 'aria-invalid': false }))
    expect(html).not.toContain('aria-invalid')
    expect(html).not.toContain('data-invalid')
  })

  it('aria-label passes through', () => {
    const html = renderToString(
      React.createElement(Textarea, { 'aria-label': 'Message body' }),
    )
    expect(html).toContain('aria-label="Message body"')
  })
})

describe('Textarea (React) - base styling', () => {
  it('base classes include w-full rounded-md border-input', () => {
    const html = renderToString(React.createElement(Textarea))
    expect(html).toContain('w-full')
    expect(html).toContain('rounded-md')
    expect(html).toContain('border-input')
  })

  it('base classes include padding, text size and shadow', () => {
    const html = renderToString(React.createElement(Textarea))
    expect(html).toContain('px-3')
    expect(html).toContain('py-2')
    expect(html).toContain('text-sm')
    expect(html).toContain('shadow-sm')
  })

  it('base classes include placeholder and focus ring styles', () => {
    const html = renderToString(React.createElement(Textarea))
    expect(html).toContain('placeholder:text-muted-foreground')
    expect(html).toContain('focus-visible:ring-1')
    expect(html).toContain('focus-visible:ring-ring')
  })

  it('base classes include disabled cursor and opacity styles', () => {
    const html = renderToString(React.createElement(Textarea))
    expect(html).toContain('disabled:cursor-not-allowed')
    expect(html).toContain('disabled:opacity-50')
  })

  it('sm size adds text-xs, lg size adds text-base', () => {
    const sm = renderToString(React.createElement(Textarea, { size: 'sm' }))
    const lg = renderToString(React.createElement(Textarea, { size: 'lg' }))
    expect(sm).toContain('text-xs')
    expect(lg).toContain('text-base')
  })
})
