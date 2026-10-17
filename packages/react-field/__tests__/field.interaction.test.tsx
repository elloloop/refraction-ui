// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Field } from '../src/index.js'

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

function label(): HTMLLabelElement {
  const el = container.querySelector('label')
  if (!el) throw new Error('label not rendered')
  return el
}

describe('Field (DOM)', () => {
  it('labels the control: the browser resolves the label to it', () => {
    render(
      <Field label="Email" hint="We never share it.">
        <input />
      </Field>,
    )
    const input = container.querySelector('input')
    expect(label().control).toBe(input)
    expect(input?.labels?.[0]?.textContent).toBe('Email')
    const hint = document.getElementById(input?.getAttribute('aria-describedby') ?? '')
    expect(hint?.textContent).toBe('We never share it.')
  })

  it('resolves a nested control named by htmlFor, not its wrapper', () => {
    render(
      <Field label="Password" htmlFor="pw">
        <span>
          <input id="pw" type="password" />
          <button type="button">Show</button>
        </span>
      </Field>,
    )
    expect(label().control).toBe(container.querySelector('input'))
  })

  it('clicking an inline label toggles its checkbox', () => {
    render(
      <Field label="Show archived" layout="inline">
        <input type="checkbox" />
      </Field>,
    )
    const box = container.querySelector('input') as HTMLInputElement
    expect(box.checked).toBe(false)
    act(() => {
      label().click()
    })
    expect(box.checked).toBe(true)
  })

  it('gives each field its own control id', () => {
    render(
      <>
        <Field label="First">
          <input />
        </Field>
        <Field label="Second">
          <input />
        </Field>
      </>,
    )
    const [a, b] = Array.from(container.querySelectorAll('input'))
    expect(a?.id).toBeTruthy()
    expect(a?.id).not.toBe(b?.id)
    const labels = Array.from(container.querySelectorAll('label'))
    expect(labels.map((l) => l.control)).toEqual([a, b])
  })

  it('forwards the ref to the root element', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <Field ref={ref} className="extra" label="L">
        <input />
      </Field>,
    )
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current?.className).toContain('extra')
    expect(ref.current?.getAttribute('data-slot')).toBe('field')
  })
})
