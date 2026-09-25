import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { NativeSelect } from '../src/native-select.js'

const h = React.createElement

describe('NativeSelect (SSR)', () => {
  it('renders a native select with options and a decorative chevron', () => {
    const html = renderToString(
      h(NativeSelect, { 'aria-label': 'Status', name: 'status', defaultValue: 'open' },
        h('option', { value: 'open' }, 'Open'),
        h('option', { value: 'closed' }, 'Closed'),
      ),
    )
    expect(html).toContain('data-slot="native-select"')
    expect(html).toMatch(/<select[^>]*aria-label="Status"[^>]*name="status"/)
    expect(html).toContain('<option value="open" selected="">Open</option>')
    expect(html).toContain('aria-hidden="true"')
  })

  it('applies size to the select and classes to the right element', () => {
    const html = renderToString(
      h(NativeSelect, { size: 'sm', className: 'sel', containerClassName: 'wrap' }, h('option', null, 'A')),
    )
    expect(html).toMatch(/<span class="[^"]*wrap"/)
    expect(html).toMatch(/<select class="[^"]*h-8[^"]*sel"/)
    expect(html).not.toContain(' size=')
  })
})
