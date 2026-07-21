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

describe('PasswordInput (React) - additional SSR coverage', () => {
  it('renders a relative wrapper around input and toggle', () => {
    const html = renderToString(React.createElement(PasswordInput))
    expect(html).toContain('<div class="relative">')
  })

  it('toggle button carries the positioning classes', () => {
    const html = renderToString(React.createElement(PasswordInput))
    expect(html).toContain('absolute')
    expect(html).toContain('right-2')
    expect(html).toContain('top-1/2')
  })

  it('toggle button is type="button" so it does not submit forms', () => {
    const html = renderToString(React.createElement(PasswordInput))
    expect(html).toContain('<button type="button"')
  })

  it('renders the eye icon with aria-hidden by default', () => {
    const html = renderToString(React.createElement(PasswordInput))
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z')
  })

  it('does not render the hide label while hidden', () => {
    const html = renderToString(React.createElement(PasswordInput))
    expect(html).not.toContain('aria-label="Hide password"')
  })

  it('passes name and autoComplete through to the input', () => {
    const html = renderToString(
      React.createElement(PasswordInput, {
        name: 'password',
        autoComplete: 'current-password',
      }),
    )
    expect(html).toContain('name="password"')
    expect(html).toContain('autoComplete="current-password"')
  })

  it('passes id and placeholder through to the input', () => {
    const html = renderToString(
      React.createElement(PasswordInput, { id: 'pw', placeholder: 'Enter password' }),
    )
    expect(html).toContain('id="pw"')
    expect(html).toContain('placeholder="Enter password"')
  })

  it('passes minLength and maxLength through to the input', () => {
    const html = renderToString(
      React.createElement(PasswordInput, { minLength: 8, maxLength: 64 }),
    )
    expect(html).toContain('minLength="8"')
    expect(html).toContain('maxLength="64"')
  })

  it('disabled disables the input and marks aria/data state', () => {
    const html = renderToString(React.createElement(PasswordInput, { disabled: true }))
    expect(html).toContain('disabled')
    expect(html).toContain('aria-disabled="true"')
    expect(html).toContain('data-disabled')
  })

  it('required marks the input required and aria-required', () => {
    const html = renderToString(React.createElement(PasswordInput, { required: true }))
    expect(html).toContain('required')
    expect(html).toContain('aria-required="true"')
  })

  it('readOnly marks the input with data-readonly', () => {
    const html = renderToString(React.createElement(PasswordInput, { readOnly: true }))
    expect(html).toContain('readonly')
    expect(html).toContain('data-readonly')
  })

  it('applies the size prop to the underlying input', () => {
    const html = renderToString(React.createElement(PasswordInput, { size: 'sm' }))
    expect(html).toContain('h-8')
  })
})
