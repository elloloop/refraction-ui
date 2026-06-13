import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { RadialGauge } from '../src/radial-gauge.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(RadialGauge as React.ComponentType<Record<string, unknown>>, props))

describe('RadialGauge (SSR)', () => {
  it('renders an svg element with role="meter"', () => {
    const html = render({ value: 75 })
    expect(html).toContain('<svg')
    expect(html).toContain('role="meter"')
  })

  it('sets aria-valuenow to the clamped value', () => {
    const html = render({ value: 75 })
    expect(html).toContain('aria-valuenow="75"')
  })

  it('sets aria-valuemin and aria-valuemax from min/max props', () => {
    const html = render({ value: 50, min: 10, max: 200 })
    expect(html).toContain('aria-valuemin="10"')
    expect(html).toContain('aria-valuemax="200"')
  })

  it('clamps value to max in aria-valuenow', () => {
    const html = render({ value: 150, min: 0, max: 100 })
    expect(html).toContain('aria-valuenow="100"')
  })

  it('shows the numeric value in the center by default', () => {
    const html = render({ value: 42 })
    expect(html).toContain('>42<')
  })

  it('shows a custom label instead of the numeric value', () => {
    const html = render({ value: 80, label: 'Lean Hire' })
    expect(html).toContain('Lean Hire')
    expect(html).not.toContain('>80<')
  })

  it('renders sublabel text when provided', () => {
    const html = render({ value: 60, sublabel: 'Score' })
    expect(html).toContain('Score')
  })

  it('does not show value text when showValue is false and no label', () => {
    const html = render({ value: 55, showValue: false })
    expect(html).not.toContain('>55<')
  })

  it('renders two circle elements (track + arc)', () => {
    const html = render({ value: 50 })
    expect((html.match(/<circle/g) ?? []).length).toBe(2)
  })

  it('emits data-size attribute', () => {
    const html = render({ value: 50, size: 'lg' })
    expect(html).toContain('data-size="lg"')
  })
})
