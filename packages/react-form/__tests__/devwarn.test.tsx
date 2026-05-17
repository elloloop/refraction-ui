// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import { resetDevFeedback } from '@refraction-ui/shared'
import { Form, FormField, FormItem, FormLabel, useForm } from '../src/index.js'

// Verifies the footgun devWarn (epic #254 / batch 1C) augments — never
// replaces — the existing useFormField context throws, fires once in dev, and
// is fully silent in production. Uses the REAL @refraction-ui/shared primitive.

// React 19 expects this flag to be set when running tests outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const originalEnv = process.env.NODE_ENV
let container: HTMLDivElement
let root: Root
let warnSpy: ReturnType<typeof vi.spyOn>
let errorSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  resetDevFeedback()
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  // React logs the thrown render error to console.error; silence the noise.
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  process.env.NODE_ENV = originalEnv
  act(() => {
    root.unmount()
  })
  container.remove()
  warnSpy.mockRestore()
  errorSpy.mockRestore()
  resetDevFeedback()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

// FormLabel calls useFormField(). Rendered inside a <Form> (so the RHF
// useFormState/useFormContext wiring resolves) but OUTSIDE any <FormField>,
// so the missing FormFieldContext is what trips the guard.
function OutsideFormField() {
  const form = useForm<{ email: string }>({ defaultValues: { email: '' } })
  return (
    <Form {...form}>
      <FormLabel>Email</FormLabel>
    </Form>
  )
}

// Inside a FormField (provides FormFieldContext) but with no FormItem, so the
// "outside <FormItem>" guard fires.
function OutsideFormItem() {
  const form = useForm<{ email: string }>({ defaultValues: { email: '' } })
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="email"
        render={() => <FormLabel>Email</FormLabel>}
      />
    </Form>
  )
}

describe('react-form devWarn (footgun: useFormField outside its context)', () => {
  it('warns once + throws when used outside <FormField>', () => {
    process.env.NODE_ENV = 'development'
    expect(() => render(<OutsideFormField />)).toThrow(
      'useFormField must be used within a <FormField>',
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-form/use-form-field-outside-form-field',
    )
  })

  it('warns once + throws when used outside <FormItem>', () => {
    process.env.NODE_ENV = 'development'
    expect(() => render(<OutsideFormItem />)).toThrow(
      'useFormField must be used within a <FormItem>',
    )
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0]?.[0]).toContain(
      'react-form/use-form-field-outside-form-item',
    )
  })

  it('is silent in production but the throw is preserved', () => {
    process.env.NODE_ENV = 'production'
    expect(() => render(<OutsideFormField />)).toThrow(
      'useFormField must be used within a <FormField>',
    )
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('warns only once across repeated misuse (warn-once dedupe)', () => {
    process.env.NODE_ENV = 'development'
    for (let i = 0; i < 3; i++) {
      expect(() => render(<OutsideFormField />)).toThrow()
    }
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })
})
