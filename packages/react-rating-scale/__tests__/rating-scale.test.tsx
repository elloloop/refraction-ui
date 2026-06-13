import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { RatingScale } from '../src/rating-scale.js'

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(RatingScale, props))

describe('RatingScale (SSR)', () => {
  it('renders a radiogroup with count points', () => {
    const html = render({ count: 5, 'aria-label': 'Confidence' })
    expect(html).toContain('role="radiogroup"')
    expect((html.match(/role="radio"/g) ?? []).length).toBe(5)
  })

  it('marks the controlled value as checked', () => {
    const html = render({ value: 3, count: 5 })
    expect(html).toContain('data-value="3"')
    expect((html.match(/aria-checked="true"/g) ?? []).length).toBe(1)
  })

  it('renders end labels when provided', () => {
    const html = render({ count: 5, minLabel: 'Never', maxLabel: 'Expert' })
    expect(html).toContain('Never')
    expect(html).toContain('Expert')
  })

  it('uses explicit point labels for accessible names', () => {
    const html = render({
      points: [
        { value: 1, label: 'Strongly disagree' },
        { value: 2, label: 'Agree' },
      ],
    })
    expect(html).toContain('aria-label="Strongly disagree"')
    expect((html.match(/role="radio"/g) ?? []).length).toBe(2)
  })
})
