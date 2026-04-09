import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { RadioGroup, RadioItem } from '../src/radio.js'

describe('RadioGroup (SSR)', () => {
  it('renders radio group with items', () => {
    const html = renderToString(
      React.createElement(RadioGroup, { defaultValue: 'a' },
        React.createElement(RadioItem, { value: 'a' }, 'Option A'),
        React.createElement(RadioItem, { value: 'b' }, 'Option B'),
      ),
    )
    expect(html).toContain('role="radiogroup"')
    expect(html).toContain('Option A')
    expect(html).toContain('Option B')
  })

  it('marks selected item as checked', () => {
    const html = renderToString(
      React.createElement(RadioGroup, { defaultValue: 'b' },
        React.createElement(RadioItem, { value: 'a' }, 'A'),
        React.createElement(RadioItem, { value: 'b' }, 'B'),
      ),
    )
    expect(html).toContain('aria-checked="true"')
    expect(html).toContain('data-state="checked"')
  })

  it('renders vertical orientation by default', () => {
    const html = renderToString(
      React.createElement(RadioGroup, null,
        React.createElement(RadioItem, { value: 'a' }, 'A'),
      ),
    )
    expect(html).toContain('flex-col')
  })

  it('renders horizontal orientation', () => {
    const html = renderToString(
      React.createElement(RadioGroup, { orientation: 'horizontal' },
        React.createElement(RadioItem, { value: 'a' }, 'A'),
      ),
    )
    expect(html).toContain('flex-row')
  })

  it('disabled group disables items', () => {
    const html = renderToString(
      React.createElement(RadioGroup, { disabled: true },
        React.createElement(RadioItem, { value: 'a' }, 'A'),
      ),
    )
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('disabled')
  })

  it('renders inner dot for checked item', () => {
    const html = renderToString(
      React.createElement(RadioGroup, { defaultValue: 'a' },
        React.createElement(RadioItem, { value: 'a' }, 'A'),
      ),
    )
    expect(html).toContain('bg-primary-foreground')
  })

  it('applies custom className', () => {
    const html = renderToString(
      React.createElement(RadioGroup, { className: 'my-radio' },
        React.createElement(RadioItem, { value: 'a' }, 'A'),
      ),
    )
    expect(html).toContain('my-radio')
  })
})
