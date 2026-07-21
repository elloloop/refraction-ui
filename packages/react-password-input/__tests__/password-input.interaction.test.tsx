// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { PasswordInput } from '../src/password-input.js'

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

function input(): HTMLInputElement {
  const el = container.querySelector('input')
  if (!el) throw new Error('input not rendered')
  return el
}

function toggle(): HTMLButtonElement {
  const el = container.querySelector('button')
  if (!el) throw new Error('toggle button not rendered')
  return el
}

function click(el: HTMLElement) {
  act(() => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
}

const nativeValueSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'value',
)!.set!

/** Simulate typing: append text and fire a bubbling input event. */
function typeInto(el: HTMLInputElement, text: string) {
  act(() => {
    nativeValueSetter.call(el, el.value + text)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

const EYE_PATH = 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'
const EYE_OFF_PATH = 'M9.88 9.88a3 3 0 1 0 4.24 4.24'

describe('PasswordInput (React) interaction - reveal toggle', () => {
  it('starts masked as type password with an unpressed Show toggle', () => {
    render(<PasswordInput />)
    expect(input().type).toBe('password')
    expect(toggle().getAttribute('aria-label')).toBe('Show password')
    expect(toggle().getAttribute('aria-pressed')).toBe('false')
    expect(container.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true')
  })

  it('click reveals the password and flips label, pressed state and icon', () => {
    render(<PasswordInput />)
    click(toggle())
    expect(input().type).toBe('text')
    expect(toggle().getAttribute('aria-label')).toBe('Hide password')
    expect(toggle().getAttribute('aria-pressed')).toBe('true')
    expect(container.innerHTML).toContain(EYE_OFF_PATH)
    expect(container.innerHTML).not.toContain(EYE_PATH)
  })

  it('a second click hides the password again', () => {
    render(<PasswordInput />)
    click(toggle())
    click(toggle())
    expect(input().type).toBe('password')
    expect(toggle().getAttribute('aria-label')).toBe('Show password')
    expect(toggle().getAttribute('aria-pressed')).toBe('false')
    expect(container.innerHTML).toContain(EYE_PATH)
  })

  it('reveal toggle survives repeated toggling', () => {
    render(<PasswordInput />)
    for (let i = 0; i < 3; i++) {
      click(toggle())
      expect(input().type).toBe('text')
      click(toggle())
      expect(input().type).toBe('password')
    }
  })

  it('uses custom reveal and hide labels', () => {
    render(<PasswordInput revealLabel="Reveal secret" hideLabel="Conceal secret" />)
    expect(toggle().getAttribute('aria-label')).toBe('Reveal secret')
    click(toggle())
    expect(toggle().getAttribute('aria-label')).toBe('Conceal secret')
    click(toggle())
    expect(toggle().getAttribute('aria-label')).toBe('Reveal secret')
  })

  it('revealing keeps the typed value intact', () => {
    render(<PasswordInput defaultValue="s3cret" />)
    click(toggle())
    expect(input().type).toBe('text')
    expect(input().value).toBe('s3cret')
  })
})

describe('PasswordInput (React) interaction - value handling', () => {
  it('uncontrolled typing updates the input and fires onChange', () => {
    const onChange = vi.fn()
    render(<PasswordInput onChange={onChange} />)
    typeInto(input(), 'a')
    typeInto(input(), 'b')
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(input().value).toBe('ab')
  })

  it('controlled value snaps back when the parent does not update', () => {
    const seen: string[] = []
    render(
      <PasswordInput
        value="secret"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => seen.push(e.target.value)}
      />,
    )
    typeInto(input(), 'x')
    // onChange saw the attempted edit at event time…
    expect(seen).toEqual(['secretx'])
    // …but the controlled value wins without a parent re-render.
    expect(input().value).toBe('secret')
  })

  it('controlled value updates when the parent re-renders', () => {
    render(<PasswordInput value="one" onChange={() => {}} />)
    expect(input().value).toBe('one')
    act(() => {
      root.render(<PasswordInput value="two" onChange={() => {}} />)
    })
    expect(input().value).toBe('two')
  })

  it('typed value stays masked while hidden and readable once revealed', () => {
    render(<PasswordInput />)
    typeInto(input(), 'hunter2')
    expect(input().type).toBe('password')
    expect(input().value).toBe('hunter2')
    click(toggle())
    expect(input().type).toBe('text')
    expect(input().value).toBe('hunter2')
  })
})

describe('PasswordInput (React) interaction - disabled and refs', () => {
  it('disabled input does not accept typing and exposes aria-disabled', () => {
    render(<PasswordInput disabled defaultValue="fixed" />)
    expect(input().disabled).toBe(true)
    expect(input().getAttribute('aria-disabled')).toBe('true')
    expect(input().hasAttribute('data-disabled')).toBe(true)
  })

  it('reveal toggle stays operable when the input is disabled', () => {
    // The toggle is intentionally not wired to the input's disabled state:
    // revealing a disabled (e.g. read-only form) password remains possible.
    render(<PasswordInput disabled defaultValue="fixed" />)
    click(toggle())
    expect(input().type).toBe('text')
    expect(input().disabled).toBe(true)
  })

  it('forwards the ref to the underlying input element', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<PasswordInput ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toBe(input())
  })

  it('focus can be driven through the forwarded ref', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<PasswordInput ref={ref} />)
    act(() => {
      ref.current!.focus()
    })
    expect(document.activeElement).toBe(input())
  })
})
