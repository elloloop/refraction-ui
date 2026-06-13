import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { NumberedSteps } from '../src/numbered-steps.js'
import type { NumberedStepItem } from '../src/numbered-steps.js'

const ITEMS_4: NumberedStepItem[] = [
  { title: 'Create an account', body: 'Sign up with your email address.' },
  { title: 'Configure settings', body: 'Choose your preferences.' },
  { title: 'Invite your team', body: 'Add teammates to your workspace.' },
  { title: 'Start building', body: 'Use the API to build your first feature.' },
]

const ITEMS_3: NumberedStepItem[] = [
  { title: 'Step one', body: 'First description.' },
  { title: 'Step two', body: 'Second description.' },
  { title: 'Step three', body: 'Third description.' },
]

const render = (props: React.ComponentProps<typeof NumberedSteps>) =>
  renderToString(React.createElement(NumberedSteps, props))

describe('NumberedSteps (SSR)', () => {
  it('renders the correct number of step cards', () => {
    const html = render({ items: ITEMS_4 })
    expect((html.match(/role="listitem"/g) ?? []).length).toBe(4)
  })

  it('renders role="list" on the container', () => {
    const html = render({ items: ITEMS_3 })
    expect(html).toContain('role="list"')
  })

  it('shows zero-padded ordinals for each step', () => {
    const html = render({ items: ITEMS_4 })
    expect(html).toContain('01')
    expect(html).toContain('02')
    expect(html).toContain('03')
    expect(html).toContain('04')
  })

  it('renders step titles', () => {
    const html = render({ items: ITEMS_3 })
    expect(html).toContain('Step one')
    expect(html).toContain('Step two')
    expect(html).toContain('Step three')
  })

  it('renders step bodies', () => {
    const html = render({ items: ITEMS_3 })
    expect(html).toContain('First description.')
    expect(html).toContain('Second description.')
    expect(html).toContain('Third description.')
  })

  it('applies explicit columns via inline style', () => {
    const html = render({ items: ITEMS_3, columns: 2 })
    expect(html).toContain('grid-template-columns:repeat(2')
  })
})
