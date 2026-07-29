import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  Steps,
  Step,
  StepIndicator,
  StepContent,
  StepTitle,
  StepDescription,
} from '../src/steps.js'

describe('Steps (React SSR)', () => {
  it('renders a div with the steps data-slot', () => {
    const html = renderToString(React.createElement(Steps, {}))
    expect(html).toContain('<div')
    expect(html).toContain('data-slot="steps"')
  })

  it('defaults to vertical orientation', () => {
    const html = renderToString(React.createElement(Steps, {}))
    expect(html).toContain('flex-col')
  })

  it('applies horizontal orientation classes', () => {
    const html = renderToString(React.createElement(Steps, { orientation: 'horizontal' }))
    expect(html).toContain('flex-row')
  })

  it('renders children and passes through HTML attributes', () => {
    const html = renderToString(
      React.createElement(Steps, { 'aria-label': 'Onboarding steps' }, 'step list'),
    )
    expect(html).toContain('aria-label="Onboarding steps"')
    expect(html).toContain('step list')
  })

  it('appends a custom className without dropping variant classes', () => {
    const html = renderToString(React.createElement(Steps, { className: 'my-steps' }))
    expect(html).toContain('my-steps')
    expect(html).toContain('flex-col')
  })
})

describe('Step (React SSR)', () => {
  it('renders a div with the step data-slot', () => {
    const html = renderToString(React.createElement(Step, {}))
    expect(html).toContain('data-slot="step"')
  })

  it('defaults to the upcoming (muted) status', () => {
    const html = renderToString(React.createElement(Step, {}))
    expect(html).toContain('text-muted-foreground')
  })

  it('applies the active status classes', () => {
    const html = renderToString(React.createElement(Step, { status: 'active' }))
    expect(html).toContain('text-foreground')
  })

  it('applies the completed status classes', () => {
    const html = renderToString(React.createElement(Step, { status: 'completed' }))
    expect(html).toContain('text-foreground')
  })
})

describe('StepIndicator (React SSR)', () => {
  it('renders a div with the step-indicator data-slot', () => {
    const html = renderToString(React.createElement(StepIndicator, {}))
    expect(html).toContain('data-slot="step-indicator"')
    expect(html).toContain('rounded-full')
  })

  it('defaults to the upcoming status ring', () => {
    const html = renderToString(React.createElement(StepIndicator, {}))
    expect(html).toContain('border-muted')
  })

  it('renders the completed status as a filled primary disc', () => {
    const html = renderToString(React.createElement(StepIndicator, { status: 'completed' }))
    expect(html).toContain('border-primary')
    expect(html).toContain('bg-primary')
  })

  it('renders the active status as a primary outline', () => {
    const html = renderToString(React.createElement(StepIndicator, { status: 'active' }))
    expect(html).toContain('border-primary')
    expect(html).toContain('bg-background')
    expect(html).toContain('text-primary')
  })
})

describe('StepContent / StepTitle / StepDescription (React SSR)', () => {
  it('StepContent renders a div with the step-content data-slot', () => {
    const html = renderToString(React.createElement(StepContent, {}, 'content'))
    expect(html).toContain('data-slot="step-content"')
    expect(html).toContain('content')
  })

  it('StepTitle renders an h4 heading with the step-title data-slot', () => {
    const html = renderToString(React.createElement(StepTitle, {}, 'Account'))
    expect(html).toContain('<h4')
    expect(html).toContain('data-slot="step-title"')
    expect(html).toContain('Account')
  })

  it('StepDescription renders a paragraph with the step-description data-slot', () => {
    const html = renderToString(React.createElement(StepDescription, {}, 'Tell us about you'))
    expect(html).toContain('<p')
    expect(html).toContain('data-slot="step-description"')
    expect(html).toContain('Tell us about you')
  })

  it('composes a full step without crashing', () => {
    const html = renderToString(
      React.createElement(
        Steps,
        {},
        React.createElement(
          Step,
          { status: 'active' },
          React.createElement(StepIndicator, { status: 'active' }, '1'),
          React.createElement(
            StepContent,
            {},
            React.createElement(StepTitle, {}, 'Account'),
            React.createElement(StepDescription, {}, 'Create your account'),
          ),
        ),
      ),
    )
    expect(html).toContain('data-slot="steps"')
    expect(html).toContain('data-slot="step"')
    expect(html).toContain('data-slot="step-indicator"')
    expect(html).toContain('data-slot="step-content"')
    expect(html).toContain('data-slot="step-title"')
    expect(html).toContain('data-slot="step-description"')
  })
})
