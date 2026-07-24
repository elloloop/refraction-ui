// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Textarea } from '../src/textarea.js'

// React 19 expects this flag when running outside a browser bundler.
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

function textarea(): HTMLTextAreaElement {
  const el = container.querySelector('textarea')
  if (!el) throw new Error('textarea not rendered')
  return el
}

const nativeValueSetter = Object.getOwnPropertyDescriptor(
  HTMLTextAreaElement.prototype,
  'value',
)!.set!

/** Simulate a user edit: native value + a bubbling input event. */
function typeInto(el: HTMLTextAreaElement, text: string) {
  act(() => {
    nativeValueSetter.call(el, el.value + text)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

describe('Textarea (React) interaction - uncontrolled editing', () => {
  it('typing updates the DOM value and fires onChange per keystroke', () => {
    const onChange = vi.fn()
    render(<Textarea onChange={onChange} />)
    typeInto(textarea(), 'a')
    typeInto(textarea(), 'b')
    typeInto(textarea(), 'c')
    expect(onChange).toHaveBeenCalledTimes(3)
    expect(textarea().value).toBe('abc')
  })

  it('onChange receives the current value at event time', () => {
    const seen: string[] = []
    render(
      <Textarea
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => seen.push(e.target.value)}
      />,
    )
    typeInto(textarea(), 'hello')
    expect(seen).toEqual(['hello'])
  })

  it('defaultValue seeds the initial value and typing appends', () => {
    render(<Textarea defaultValue="ab" />)
    typeInto(textarea(), 'c')
    expect(textarea().value).toBe('abc')
  })

  it('multi-line input with newlines is preserved', () => {
    render(<Textarea />)
    typeInto(textarea(), 'line one\nline two')
    expect(textarea().value).toBe('line one\nline two')
  })
})

describe('Textarea (React) interaction - controlled editing', () => {
  it('controlled value snaps back when the parent does not update', () => {
    const seen: string[] = []
    render(
      <Textarea
        value="ab"
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => seen.push(e.target.value)}
      />,
    )
    typeInto(textarea(), 'c')
    // onChange saw the attempted edit at event time…
    expect(seen).toEqual(['abc'])
    // …but the controlled value wins without a parent re-render.
    expect(textarea().value).toBe('ab')
  })

  it('controlled value updates when the parent re-renders', () => {
    render(<Textarea value="one" onChange={() => {}} />)
    expect(textarea().value).toBe('one')
    act(() => {
      root.render(<Textarea value="two" onChange={() => {}} />)
    })
    expect(textarea().value).toBe('two')
  })

  it('a stateful controlled parent accepts typed input', () => {
    function Controlled() {
      const [value, setValue] = React.useState('')
      return (
        <Textarea
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
        />
      )
    }
    render(<Controlled />)
    typeInto(textarea(), 'typed')
    expect(textarea().value).toBe('typed')
  })
})

describe('Textarea (React) interaction - DOM contract', () => {
  it('rows is reflected on the element', () => {
    render(<Textarea rows={7} />)
    expect(textarea().rows).toBe(7)
  })

  it('maxLength is reflected on the element', () => {
    render(<Textarea maxLength={280} />)
    expect(textarea().maxLength).toBe(280)
  })

  it('maxRows does not appear as a DOM attribute', () => {
    render(<Textarea rows={2} maxRows={6} />)
    expect(textarea().hasAttribute('maxrows')).toBe(false)
    expect(textarea().getAttribute('rows')).toBe('2')
  })

  it('disabled textarea exposes disabled, aria-disabled and data-disabled', () => {
    render(<Textarea disabled defaultValue="fixed" />)
    expect(textarea().disabled).toBe(true)
    expect(textarea().getAttribute('aria-disabled')).toBe('true')
    expect(textarea().hasAttribute('data-disabled')).toBe(true)
  })

  it('readOnly textarea exposes readonly and data-readonly', () => {
    render(<Textarea readOnly defaultValue="fixed" />)
    expect(textarea().readOnly).toBe(true)
    expect(textarea().hasAttribute('data-readonly')).toBe(true)
  })

  it('required textarea exposes required and aria-required', () => {
    render(<Textarea required />)
    expect(textarea().required).toBe(true)
    expect(textarea().getAttribute('aria-required')).toBe('true')
  })

  it('forwards the ref to the textarea element', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    expect(ref.current).toBe(textarea())
  })

  it('focus can be driven through the forwarded ref', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} />)
    act(() => {
      ref.current!.focus()
    })
    expect(document.activeElement).toBe(textarea())
  })
})
