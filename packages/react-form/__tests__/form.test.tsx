// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
  useFormField,
} from '../src/index.js'

// React 19 expects this flag to be set when running tests outside a browser bundler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => {
    root.unmount()
  })
  container.remove()
})

function render(ui: React.ReactElement) {
  act(() => {
    root.render(ui)
  })
}

// A small Input stand-in that forwards refs and accepts the standard input props.
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return <input ref={ref} {...props} />
  },
)

interface BasicFormProps {
  onSubmit?: (values: { email: string }) => void
  defaultValues?: { email: string }
  validate?: (value: string) => string | true
  description?: string
}

function BasicForm({
  onSubmit = () => {},
  defaultValues = { email: '' },
  validate,
  description = 'Your work email',
}: BasicFormProps) {
  const form = useForm<{ email: string }>({ defaultValues, mode: 'onSubmit' })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          rules={{
            required: 'Email is required',
            ...(validate ? { validate } : {}),
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormDescription>{description}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  )
}

describe('react-form: basic rendering', () => {
  it('renders an input, label, and description', () => {
    render(<BasicForm />)
    const label = container.querySelector('label')
    const input = container.querySelector('input')
    const desc = container.querySelector('p')
    expect(label).not.toBeNull()
    expect(label!.textContent).toBe('Email')
    expect(input).not.toBeNull()
    expect(input!.getAttribute('type')).toBe('email')
    expect(desc).not.toBeNull()
    expect(desc!.textContent).toBe('Your work email')
  })

  it('does not render a FormMessage when there is no error', () => {
    render(<BasicForm />)
    // Only the description <p> exists.
    const ps = container.querySelectorAll('p')
    expect(ps.length).toBe(1)
  })
})

describe('react-form: id wiring', () => {
  it('FormLabel htmlFor matches FormControl id', () => {
    render(<BasicForm />)
    const label = container.querySelector('label')!
    const input = container.querySelector('input')!
    expect(label.getAttribute('for')).toBe(input.getAttribute('id'))
    expect(input.getAttribute('id')).toBeTruthy()
  })

  it('FormControl aria-describedby points at FormDescription id when no error', () => {
    render(<BasicForm />)
    const input = container.querySelector('input')!
    const desc = container.querySelector('p')!
    expect(input.getAttribute('aria-describedby')).toBe(desc.getAttribute('id'))
  })

  it('FormDescription gets a stable, FormItem-scoped id', () => {
    render(<BasicForm />)
    const desc = container.querySelector('p')!
    expect(desc.getAttribute('id')).toMatch(/-form-item-description$/)
  })
})

describe('react-form: validation lifecycle', () => {
  it('does not set aria-invalid before validation runs', () => {
    render(<BasicForm />)
    const input = container.querySelector('input')!
    expect(input.getAttribute('aria-invalid')).toBeNull()
  })

  it('renders a FormMessage and sets aria-invalid on submit failure', async () => {
    render(<BasicForm />)
    const button = container.querySelector('button[type="submit"]')!
    await act(async () => {
      ;(button as HTMLButtonElement).click()
    })
    // wait a microtask for RHF state propagation
    await act(async () => {
      await Promise.resolve()
    })
    const input = container.querySelector('input')!
    const messages = Array.from(container.querySelectorAll('p'))
    const message = messages.find((p) =>
      p.getAttribute('id')?.endsWith('-form-item-message'),
    )
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(message).toBeTruthy()
    expect(message!.textContent).toBe('Email is required')
  })

  it('aria-describedby includes both description and message ids when invalid', async () => {
    render(<BasicForm />)
    const button = container.querySelector('button[type="submit"]')!
    await act(async () => {
      ;(button as HTMLButtonElement).click()
    })
    await act(async () => {
      await Promise.resolve()
    })
    const input = container.querySelector('input')!
    const describedBy = input.getAttribute('aria-describedby') ?? ''
    const ids = describedBy.split(/\s+/)
    expect(ids.some((id) => id.endsWith('-form-item-description'))).toBe(true)
    expect(ids.some((id) => id.endsWith('-form-item-message'))).toBe(true)
  })

  it('clears the message after the field becomes valid', async () => {
    function ResetForm() {
      const form = useForm<{ email: string }>({
        defaultValues: { email: '' },
        mode: 'onSubmit',
      })
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => {})}>
            <FormField
              control={form.control}
              name="email"
              rules={{ required: 'Email is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button type="submit">Submit</button>
            <button
              type="button"
              data-testid="fill"
              onClick={() => {
                form.setValue('email', 'me@example.com', {
                  shouldValidate: true,
                })
              }}
            >
              Fill
            </button>
          </form>
        </Form>
      )
    }

    render(<ResetForm />)
    const submit = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement
    await act(async () => {
      submit.click()
    })
    await act(async () => {
      await Promise.resolve()
    })
    expect(
      Array.from(container.querySelectorAll('p')).find((p) =>
        p.getAttribute('id')?.endsWith('-form-item-message'),
      ),
    ).toBeTruthy()

    const fill = container.querySelector(
      '[data-testid="fill"]',
    ) as HTMLButtonElement
    await act(async () => {
      fill.click()
    })
    await act(async () => {
      await Promise.resolve()
    })
    const messageAfter = Array.from(container.querySelectorAll('p')).find((p) =>
      p.getAttribute('id')?.endsWith('-form-item-message'),
    )
    expect(messageAfter).toBeFalsy()
  })
})

describe('react-form: ref forwarding', () => {
  it('FormControl forwards a ref to the inner input', () => {
    function App() {
      const form = useForm<{ email: string }>({ defaultValues: { email: '' } })
      const ref = React.useRef<HTMLInputElement | null>(null)
      React.useEffect(() => {
        // expose for the test to inspect
        ;(window as unknown as { __ref: HTMLInputElement | null }).__ref =
          ref.current
      })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    ref={(node) => {
                      ref.current = node
                      // RHF also passes a ref via {...field}; both should land.
                      field.ref(node)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      )
    }
    render(<App />)
    const exposed = (window as unknown as { __ref: HTMLInputElement | null })
      .__ref
    const input = container.querySelector('input')
    expect(exposed).toBe(input)
  })
})

describe('react-form: multiple fields', () => {
  function TwoFieldForm() {
    const form = useForm<{ email: string; name: string }>({
      defaultValues: { email: '', name: '' },
      mode: 'onSubmit',
    })
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => {})}>
          <FormField
            control={form.control}
            name="email"
            rules={{ required: 'Email is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input data-testid="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input data-testid="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button type="submit">Submit</button>
        </form>
      </Form>
    )
  }

  it('each FormItem gets its own id', () => {
    render(<TwoFieldForm />)
    const labels = Array.from(container.querySelectorAll('label'))
    expect(labels).toHaveLength(2)
    expect(labels[0].getAttribute('for')).not.toBe(labels[1].getAttribute('for'))
  })

  it('error state on one field does not affect the other', async () => {
    render(<TwoFieldForm />)
    const button = container.querySelector('button[type="submit"]')!
    await act(async () => {
      ;(button as HTMLButtonElement).click()
    })
    await act(async () => {
      await Promise.resolve()
    })
    const emailInput = container.querySelector(
      '[data-testid="email"]',
    ) as HTMLInputElement
    const nameInput = container.querySelector(
      '[data-testid="name"]',
    ) as HTMLInputElement
    expect(emailInput.getAttribute('aria-invalid')).toBe('true')
    expect(nameInput.getAttribute('aria-invalid')).toBeNull()
  })
})

describe('react-form: useFormField hook', () => {
  it('returns ids and error info for the active field', () => {
    let captured: ReturnType<typeof useFormField> | null = null

    function Probe() {
      captured = useFormField()
      return null
    }

    function App() {
      const form = useForm<{ email: string }>({ defaultValues: { email: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={() => (
              <FormItem>
                <Probe />
              </FormItem>
            )}
          />
        </Form>
      )
    }

    render(<App />)
    expect(captured).not.toBeNull()
    expect(captured!.name).toBe('email')
    expect(captured!.formItemId).toMatch(/-form-item$/)
    expect(captured!.formDescriptionId).toMatch(/-form-item-description$/)
    expect(captured!.formMessageId).toMatch(/-form-item-message$/)
    expect(captured!.invalid).toBe(false)
    expect(captured!.error).toBeUndefined()
  })

  it('throws when used outside a FormField', () => {
    function Probe() {
      useFormField()
      return null
    }
    // Suppress React's error logging for this test.
    const originalError = console.error
    console.error = () => {}
    try {
      expect(() => render(<Probe />)).toThrow()
    } finally {
      console.error = originalError
    }
  })
})

describe('react-form: FormMessage children fallback', () => {
  it('uses children when no error is present', () => {
    function App() {
      const form = useForm<{ email: string }>({ defaultValues: { email: '' } })
      return (
        <Form {...form}>
          <FormField
            control={form.control}
            name="email"
            render={() => (
              <FormItem>
                <FormMessage>Inline note</FormMessage>
              </FormItem>
            )}
          />
        </Form>
      )
    }
    render(<App />)
    const p = container.querySelector('p')
    expect(p).not.toBeNull()
    expect(p!.textContent).toBe('Inline note')
  })
})
