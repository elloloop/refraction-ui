import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { OtpInput } from '../src/otp-input.js'

describe('OtpInput (React)', () => {
  it('renders a container div with role group', () => {
    const html = renderToString(React.createElement(OtpInput))
    expect(html).toContain('<div')
    expect(html).toContain('role="group"')
  })

  it('has aria-label for OTP', () => {
    const html = renderToString(React.createElement(OtpInput))
    expect(html).toContain('aria-label="One-time password input"')
  })

  it('renders 6 input elements by default', () => {
    const html = renderToString(React.createElement(OtpInput))
    const inputCount = (html.match(/<input/g) || []).length
    expect(inputCount).toBe(6)
  })

  it('renders custom length inputs', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 4 }))
    const inputCount = (html.match(/<input/g) || []).length
    expect(inputCount).toBe(4)
  })

  it('each input has maxLength 1', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 2 }))
    const maxLengthCount = (html.match(/maxLength="1"/g) || []).length
    expect(maxLengthCount).toBe(2)
  })

  it('number type sets inputMode numeric', () => {
    const html = renderToString(React.createElement(OtpInput, { type: 'number', length: 1 }))
    expect(html).toContain('inputMode="numeric"')
  })

  it('text type sets inputMode text', () => {
    const html = renderToString(React.createElement(OtpInput, { type: 'text', length: 1 }))
    expect(html).toContain('inputMode="text"')
  })

  it('number type sets pattern', () => {
    const html = renderToString(React.createElement(OtpInput, { type: 'number', length: 1 }))
    expect(html).toContain('pattern="[0-9]*"')
  })

  it('text type does not set pattern', () => {
    const html = renderToString(React.createElement(OtpInput, { type: 'text', length: 1 }))
    expect(html).not.toContain('pattern=')
  })

  it('first input has autoComplete one-time-code', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 2 }))
    expect(html).toContain('autoComplete="one-time-code"')
  })

  it('subsequent inputs have autoComplete off', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 2 }))
    expect(html).toContain('autoComplete="off"')
  })

  it('disabled sets disabled on all inputs', () => {
    const html = renderToString(React.createElement(OtpInput, { disabled: true, length: 2 }))
    const disabledCount = (html.match(/disabled=""/g) || []).length
    expect(disabledCount).toBe(2)
  })

  it('inputs have data-slot otp-slot', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 1 }))
    expect(html).toContain('data-slot="otp-slot"')
  })

  it('inputs have aria-label with position', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 3 }))
    expect(html).toContain('aria-label="Digit 1 of 3"')
    expect(html).toContain('aria-label="Digit 2 of 3"')
    expect(html).toContain('aria-label="Digit 3 of 3"')
  })

  it('displays pre-filled values', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 4, value: '1234' }))
    expect(html).toContain('value="1"')
    expect(html).toContain('value="2"')
    expect(html).toContain('value="3"')
    expect(html).toContain('value="4"')
  })

  it('applies custom className to container', () => {
    const html = renderToString(React.createElement(OtpInput, { className: 'my-otp' }))
    expect(html).toContain('my-otp')
  })

  it('container has flex and items-center', () => {
    const html = renderToString(React.createElement(OtpInput))
    expect(html).toContain('flex')
    expect(html).toContain('items-center')
  })

  it('sm size applies gap-1.5', () => {
    const html = renderToString(React.createElement(OtpInput, { size: 'sm' }))
    expect(html).toContain('gap-1.5')
  })

  it('default size applies gap-2', () => {
    const html = renderToString(React.createElement(OtpInput, { size: 'default' }))
    expect(html).toContain('gap-2')
  })

  it('lg size applies gap-3', () => {
    const html = renderToString(React.createElement(OtpInput, { size: 'lg' }))
    expect(html).toContain('gap-3')
  })

  it('slots have rounded-md and border classes', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 1 }))
    expect(html).toContain('rounded-md')
    expect(html).toContain('border')
    expect(html).toContain('text-center')
  })

  it('default slot size has h-10 w-10', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 1, size: 'default' }))
    expect(html).toContain('h-10')
    expect(html).toContain('w-10')
  })

  it('sm slot size has h-8 w-8', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 1, size: 'sm' }))
    expect(html).toContain('h-8')
    expect(html).toContain('w-8')
  })

  it('lg slot size has h-12 w-12', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 1, size: 'lg' }))
    expect(html).toContain('h-12')
    expect(html).toContain('w-12')
  })

  it('empty inputs do not have data-filled', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 1 }))
    expect(html).not.toContain('data-filled')
  })

  it('filled inputs have data-filled', () => {
    const html = renderToString(React.createElement(OtpInput, { length: 1, value: '5' }))
    expect(html).toContain('data-filled=""')
  })
})
