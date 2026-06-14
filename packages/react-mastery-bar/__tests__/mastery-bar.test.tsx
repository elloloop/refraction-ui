import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { MasteryBar } from '../src/mastery-bar.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(MasteryBar, props as never))

describe('MasteryBar (SSR)', () => {
  it('renders role=progressbar', () => {
    const html = render({ value: 60 })
    expect(html).toContain('role="progressbar"')
  })

  it('sets aria-valuenow to the given value', () => {
    const html = render({ value: 42 })
    expect(html).toContain('aria-valuenow="42"')
  })

  it('clamps out-of-range values in aria-valuenow', () => {
    expect(render({ value: -10 })).toContain('aria-valuenow="0"')
    expect(render({ value: 150 })).toContain('aria-valuenow="100"')
  })

  it('sets fill width style to the clamped percent', () => {
    const html = render({ value: 75 })
    expect(html).toContain('width:75%')
  })

  it('renders label on the right when provided', () => {
    const html = render({ value: 50, label: '50%' })
    expect(html).toContain('50%')
  })

  it('renders leadingLabel on the left when provided', () => {
    const html = render({ value: 50, leadingLabel: 'JavaScript' })
    expect(html).toContain('JavaScript')
  })

  it('renders both leadingLabel and label in a header row', () => {
    const html = render({ value: 80, leadingLabel: 'React', label: '80%' })
    expect(html).toContain('React')
    expect(html).toContain('80%')
    expect(html).toContain('justify-between')
  })

  it('applies the size variant to the track', () => {
    const sm = render({ value: 50, size: 'sm' })
    const lg = render({ value: 50, size: 'lg' })
    expect(sm).toContain('h-1.5')
    expect(lg).toContain('h-3')
  })

  it('does not render a header row when neither label prop is given', () => {
    const html = render({ value: 40 })
    expect(html).not.toContain('justify-between')
  })
})
