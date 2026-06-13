import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Wizard } from '../src/wizard.js'
import type { WizardStep } from '../src/wizard.js'

const steps: WizardStep[] = [
  { id: 'goal', label: 'Goal' },
  { id: 'region', label: 'Region' },
  { id: 'expectations', label: 'Expectations' },
  { id: 'placement', label: 'Placement', optional: true },
  { id: 'account', label: 'Account' },
]

const render = (props: Record<string, unknown>) =>
  renderToString(React.createElement(Wizard, props as React.ComponentProps<typeof Wizard>))

describe('Wizard (SSR)', () => {
  it('renders a rail with the correct number of step labels', () => {
    const html = render({ steps, defaultStep: 0 })
    // Every step label should appear exactly once
    for (const step of steps) {
      expect(html).toContain(step.label)
    }
  })

  it('marks the current step with aria-current="step"', () => {
    const html = render({ steps, defaultStep: 1 })
    // Only one step indicator should be aria-current=step
    expect((html.match(/aria-current="step"/g) ?? []).length).toBe(1)
  })

  it('renders Back and Next footer buttons', () => {
    const html = render({ steps, defaultStep: 1 })
    expect(html).toContain('Next')
    expect(html).toContain('Back')
  })

  it('renders Complete label on the last step', () => {
    const html = render({ steps, defaultStep: steps.length - 1 })
    expect(html).toContain('Complete')
  })

  it('shows Skip button on optional steps', () => {
    const html = render({ steps, defaultStep: 3 })
    expect(html).toContain('Skip')
  })

  it('does not show Skip button on non-optional steps', () => {
    const html = render({ steps, defaultStep: 0 })
    expect(html).not.toContain('Skip')
  })

  it('accepts custom next/back/complete labels', () => {
    const html = render({
      steps,
      defaultStep: 0,
      nextLabel: 'Continue',
      backLabel: 'Go Back',
      completeLabel: 'Finish',
    })
    expect(html).toContain('Continue')
    expect(html).toContain('Go Back')
  })

  it('renders children content', () => {
    const html = renderToString(
      React.createElement(Wizard, { steps, defaultStep: 0 },
        React.createElement('p', null, 'Step content here'),
      ),
    )
    expect(html).toContain('Step content here')
  })

  it('renders children render-prop with current index', () => {
    const html = renderToString(
      React.createElement(Wizard, { steps, defaultStep: 2 }, (index: number) =>
        React.createElement('span', null, `Active step: ${index}`),
      ),
    )
    expect(html).toContain('Active step: 2')
  })

  it('sets data-orientation attribute', () => {
    const html = render({ steps, defaultStep: 0, orientation: 'horizontal' })
    expect(html).toContain('data-orientation="horizontal"')
  })

  it('sets role=group on the root element', () => {
    const html = render({ steps, defaultStep: 0 })
    expect(html).toContain('role="group"')
  })
})
