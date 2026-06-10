import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { PasswordInput } from '../src/password-input.js'

describe('PasswordInput (React)', () => {
  it('renders an input of type password by default', () => {
    const html = renderToString(React.createElement(PasswordInput))
    expect(html).toContain('<input')
    expect(html).toContain('type="password"')
  })

  it('renders a toggle button with an accessible label', () => {
    const html = renderToString(React.createElement(PasswordInput))
    expect(html).toContain('<button')
    expect(html).toContain('aria-label="Show password"')
    expect(html).toContain('aria-pressed="false"')
  })

  it('uses a custom reveal label', () => {
    const html = renderToString(
      React.createElement(PasswordInput, { revealLabel: 'Reveal' }),
    )
    expect(html).toContain('aria-label="Reveal"')
  })

  it('passes validationState through to the input (valid → green border)', () => {
    const html = renderToString(
      React.createElement(PasswordInput, { validationState: 'valid' }),
    )
    expect(html).toContain('border-green-500')
    expect(html).toContain('aria-invalid="false"')
  })

  it('passes validationState through (invalid → aria-invalid true)', () => {
    const html = renderToString(
      React.createElement(PasswordInput, { validationState: 'invalid' }),
    )
    expect(html).toContain('aria-invalid="true"')
    expect(html).toContain('border-destructive')
  })

  it('applies a custom className to the input', () => {
    const html = renderToString(
      React.createElement(PasswordInput, { className: 'my-pw' }),
    )
    expect(html).toContain('my-pw')
  })

  it('applies right padding to make room for the toggle', () => {
    const html = renderToString(React.createElement(PasswordInput))
    expect(html).toContain('pr-10')
  })
})
