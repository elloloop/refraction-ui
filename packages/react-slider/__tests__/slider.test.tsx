import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Slider } from '../src/slider.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(Slider, props))

describe('Slider (SSR)', () => {
  it('renders a range input with slider ARIA and normalized value', () => {
    const html = render({ value: 40, min: 0, max: 100 })
    expect(html).toContain('type="range"')
    expect(html).toContain('role="slider"')
    expect(html).toContain('aria-valuemin="0"')
    expect(html).toContain('aria-valuemax="100"')
    expect(html).toContain('aria-valuenow="40"')
    expect(html).toContain('value="40"')
  })

  it('applies min/max/step attributes and clamps the value', () => {
    const html = render({ value: 137, min: 0, max: 100, step: 5 })
    expect(html).toContain('min="0"')
    expect(html).toContain('max="100"')
    expect(html).toContain('step="5"')
    expect(html).toContain('value="100"')
  })

  it('rounds an uncontrolled defaultValue to the step', () => {
    const html = render({ defaultValue: 37, step: 5 })
    expect(html).toContain('value="35"')
  })

  it('marks a disabled slider', () => {
    const html = render({ value: 10, disabled: true })
    expect(html).toContain('disabled=""')
    expect(html).toContain('aria-disabled="true"')
  })

  it('forwards className and aria-label', () => {
    const html = render({ value: 10, className: 'my-slider', 'aria-label': 'Volume' })
    expect(html).toContain('my-slider')
    expect(html).toContain('aria-label="Volume"')
  })
})
