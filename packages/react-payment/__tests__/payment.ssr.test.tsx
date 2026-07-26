import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Payment } from '../src/index.js'

describe('Payment (SSR)', () => {
  it('renders the root with data-slot, composed className, and children', () => {
    const html = renderToString(
      React.createElement(Payment, { className: 'custom-class' }, 'Pay now'),
    )
    expect(html).toContain('<div')
    expect(html).toContain('data-slot="payment"')
    expect(html).toContain('custom-class')
    expect(html).toContain('Pay now')
  })

  it('applies disabled styling when disabled', () => {
    const html = renderToString(React.createElement(Payment, { disabled: true }))
    expect(html).toContain('opacity-50')
    expect(html).toContain('pointer-events-none')
  })
})
