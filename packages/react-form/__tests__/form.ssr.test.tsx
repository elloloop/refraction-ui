import { describe, it, expect } from 'vitest'
import * as React from 'react'
import { renderToString } from 'react-dom/server'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '../src/index.js'

function EmailForm({ message }: { message?: string }) {
  const form = useForm({ defaultValues: { email: '' } })
  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <input {...field} />
              </FormControl>
              <FormDescription>We never share your email.</FormDescription>
              <FormMessage>{message}</FormMessage>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

describe('Form primitives (SSR)', () => {
  it('renders the FormItem/FormLabel/FormControl/FormDescription structure with ARIA wiring', () => {
    const html = renderToString(<EmailForm />)
    // FormItem wrapper div
    expect(html).toContain('class="space-y-2"')
    // Label and control share the generated -form-item id
    expect(html).toMatch(/<label[^>]*for="[^"]+-form-item"/)
    expect(html).toMatch(/<input[^>]*id="[^"]+-form-item"/)
    // Valid field: control points at the description, no aria-invalid
    expect(html).toMatch(/aria-describedby="[^"]+-form-item-description"/)
    expect(html).not.toContain('aria-invalid')
    // Description text rendered
    expect(html).toContain('We never share your email.')
  })

  it('binds the label htmlFor and control id to the same field id', () => {
    const html = renderToString(<EmailForm />)
    const forMatch = html.match(/<label[^>]*for="([^"]+)"/)
    const idMatch = html.match(/<input[^>]*id="([^"]+)"/)
    expect(forMatch?.[1]).toBeTruthy()
    expect(forMatch?.[1]).toBe(idMatch?.[1])
  })

  it('FormMessage renders children under the message id, and nothing when empty', () => {
    const withMessage = renderToString(<EmailForm message="Required" />)
    expect(withMessage).toMatch(/<p[^>]*id="[^"]+-form-item-message"[^>]*>Required/)

    const withoutMessage = renderToString(<EmailForm />)
    expect(withoutMessage).not.toContain('-form-item-message')
  })
})
