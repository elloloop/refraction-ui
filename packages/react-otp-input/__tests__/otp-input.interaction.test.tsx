// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { OtpInput } from '../src/otp-input.js'

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

function inputs(): HTMLInputElement[] {
  return Array.from(container.querySelectorAll('input'))
}

function cellValues(): string[] {
  return inputs().map((i) => i.value)
}

const nativeValueSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'value',
)!.set!

/** Simulate typing: append a character and fire a bubbling input event. */
function typeInto(el: HTMLInputElement, ch: string) {
  act(() => {
    nativeValueSetter.call(el, el.value + ch)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function keyDown(el: HTMLElement, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function paste(el: HTMLInputElement, text: string): Event {
  const event = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'clipboardData', {
    value: {
      getData: (type: string) => (type === 'text' || type === 'text/plain' ? text : ''),
      setData: () => undefined,
    },
  })
  act(() => {
    el.dispatchEvent(event)
  })
  return event
}

function focus(el: HTMLElement) {
  act(() => {
    el.focus()
  })
}

describe('OtpInput (React) interaction - per-cell entry', () => {
  it('typing a digit fills the cell, reports the joined value and advances focus', () => {
    const onChange = vi.fn()
    render(<OtpInput length={6} onChange={onChange} />)
    typeInto(inputs()[0], '5')
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('5')
    expect(inputs()[0].value).toBe('5')
    expect(inputs()[0].hasAttribute('data-filled')).toBe(true)
    // Auto-advance to the next cell.
    expect(document.activeElement).toBe(inputs()[1])
    expect(inputs()[1].hasAttribute('data-focused')).toBe(true)
    expect(inputs()[0].hasAttribute('data-focused')).toBe(false)
  })

  it('sequential entry builds the full code across cells', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} onChange={onChange} />)
    typeInto(inputs()[0], '1')
    typeInto(inputs()[1], '2')
    typeInto(inputs()[2], '3')
    expect(onChange.mock.calls.map((c) => c[0])).toEqual(['1', '12', '123'])
    expect(cellValues()).toEqual(['1', '2', '3', ''])
  })

  it('typing on the last cell does not advance past the end', () => {
    render(<OtpInput length={2} />)
    focus(inputs()[1])
    typeInto(inputs()[1], '9')
    expect(inputs()[1].value).toBe('9')
    expect(document.activeElement).toBe(inputs()[1])
  })

  it('typing over a filled cell keeps only the last character', () => {
    const onChange = vi.fn()
    render(<OtpInput length={2} value="12" onChange={onChange} />)
    typeInto(inputs()[0], '9')
    expect(inputs()[0].value).toBe('9')
    expect(onChange).toHaveBeenCalledWith('92')
  })
})

describe('OtpInput (React) interaction - numeric masking', () => {
  it('number type rejects non-digit characters', () => {
    const onChange = vi.fn()
    render(<OtpInput length={3} type="number" onChange={onChange} />)
    focus(inputs()[0])
    typeInto(inputs()[0], 'a')
    expect(inputs()[0].value).toBe('')
    expect(onChange).toHaveBeenCalledWith('')
    // No auto-advance when nothing landed in the cell.
    expect(document.activeElement).not.toBe(inputs()[1])
  })

  it('text type accepts letters', () => {
    const onChange = vi.fn()
    render(<OtpInput length={2} type="text" onChange={onChange} />)
    typeInto(inputs()[0], 'a')
    expect(inputs()[0].value).toBe('a')
    expect(onChange).toHaveBeenCalledWith('a')
  })
})

describe('OtpInput (React) interaction - backspace navigation', () => {
  it('backspace on a filled cell clears it in place', () => {
    const onChange = vi.fn()
    render(<OtpInput length={3} value="12" onChange={onChange} />)
    focus(inputs()[1])
    const event = keyDown(inputs()[1], 'Backspace')
    expect(cellValues()).toEqual(['1', '', ''])
    expect(onChange).toHaveBeenCalledWith('1')
    expect(event.defaultPrevented).toBe(true)
    // Focus stays on the cell that was cleared.
    expect(document.activeElement).toBe(inputs()[1])
  })

  it('backspace on an empty cell clears the previous cell and moves focus back', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} value="123" onChange={onChange} />)
    focus(inputs()[3])
    keyDown(inputs()[3], 'Backspace')
    expect(cellValues()).toEqual(['1', '2', '', ''])
    expect(onChange).toHaveBeenCalledWith('12')
    expect(document.activeElement).toBe(inputs()[2])
    expect(inputs()[2].hasAttribute('data-focused')).toBe(true)
  })

  it('backspace on an empty first cell is a no-op', () => {
    const onChange = vi.fn()
    render(<OtpInput length={3} onChange={onChange} />)
    focus(inputs()[0])
    const event = keyDown(inputs()[0], 'Backspace')
    expect(onChange).not.toHaveBeenCalled()
    expect(cellValues()).toEqual(['', '', ''])
    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(inputs()[0])
  })
})

describe('OtpInput (React) interaction - arrow navigation', () => {
  it('ArrowLeft moves focus to the previous cell without changing values', () => {
    const onChange = vi.fn()
    render(<OtpInput length={3} value="12" onChange={onChange} />)
    focus(inputs()[1])
    const event = keyDown(inputs()[1], 'ArrowLeft')
    expect(document.activeElement).toBe(inputs()[0])
    expect(onChange).not.toHaveBeenCalled()
    expect(cellValues()).toEqual(['1', '2', ''])
    expect(event.defaultPrevented).toBe(true)
  })

  it('ArrowRight moves focus to the next cell without changing values', () => {
    const onChange = vi.fn()
    render(<OtpInput length={3} value="12" onChange={onChange} />)
    focus(inputs()[0])
    keyDown(inputs()[0], 'ArrowRight')
    expect(document.activeElement).toBe(inputs()[1])
    expect(onChange).not.toHaveBeenCalled()
    expect(cellValues()).toEqual(['1', '2', ''])
  })

  it('ArrowLeft on the first cell is a no-op and not prevented', () => {
    render(<OtpInput length={3} />)
    focus(inputs()[0])
    const event = keyDown(inputs()[0], 'ArrowLeft')
    expect(document.activeElement).toBe(inputs()[0])
    expect(event.defaultPrevented).toBe(false)
  })

  it('ArrowRight on the last cell is a no-op and not prevented', () => {
    render(<OtpInput length={3} />)
    focus(inputs()[2])
    const event = keyDown(inputs()[2], 'ArrowRight')
    expect(document.activeElement).toBe(inputs()[2])
    expect(event.defaultPrevented).toBe(false)
  })
})

describe('OtpInput (React) interaction - paste distribution', () => {
  it('paste distributes digits across cells and focuses the last cell when full', () => {
    const onChange = vi.fn()
    render(<OtpInput length={6} onChange={onChange} />)
    const event = paste(inputs()[0], '123456')
    expect(cellValues()).toEqual(['1', '2', '3', '4', '5', '6'])
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('123456')
    expect(event.defaultPrevented).toBe(true)
    // Full paste: focus lands on the last cell.
    expect(document.activeElement).toBe(inputs()[5])
    expect(inputs()[5].hasAttribute('data-focused')).toBe(true)
  })

  it('partial paste focuses the next empty cell', () => {
    const onChange = vi.fn()
    render(<OtpInput length={6} onChange={onChange} />)
    paste(inputs()[0], '123')
    expect(cellValues()).toEqual(['1', '2', '3', '', '', ''])
    expect(onChange).toHaveBeenCalledWith('123')
    expect(document.activeElement).toBe(inputs()[3])
  })

  it('paste in number mode strips non-digit characters before distributing', () => {
    const onChange = vi.fn()
    render(<OtpInput length={6} type="number" onChange={onChange} />)
    paste(inputs()[0], '12ab34')
    expect(cellValues()).toEqual(['1', '2', '3', '4', '', ''])
    expect(onChange).toHaveBeenCalledWith('1234')
    expect(document.activeElement).toBe(inputs()[4])
  })

  it('paste longer than length is truncated', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} onChange={onChange} />)
    paste(inputs()[0], '123456')
    expect(cellValues()).toEqual(['1', '2', '3', '4'])
    expect(onChange).toHaveBeenCalledWith('1234')
  })

  it('paste in text mode keeps letters', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} type="text" onChange={onChange} />)
    paste(inputs()[0], 'ab12')
    expect(cellValues()).toEqual(['a', 'b', '1', '2'])
    expect(onChange).toHaveBeenCalledWith('ab12')
  })

  it('paste with no usable characters clears the cells and focuses the first', () => {
    const onChange = vi.fn()
    render(<OtpInput length={3} value="12" onChange={onChange} />)
    paste(inputs()[0], 'abc')
    expect(cellValues()).toEqual(['', '', ''])
    expect(onChange).toHaveBeenCalledWith('')
    expect(document.activeElement).toBe(inputs()[0])
  })
})

describe('OtpInput (React) interaction - controlled value contract', () => {
  it('external value changes replace the cell values', () => {
    render(<OtpInput length={4} value="12" />)
    expect(cellValues()).toEqual(['1', '2', '', ''])
    act(() => {
      root.render(<OtpInput length={4} value="99" />)
    })
    expect(cellValues()).toEqual(['9', '9', '', ''])
  })

  it('external value overflow is masked to the cell count', () => {
    render(<OtpInput length={3} value="12345" />)
    expect(cellValues()).toEqual(['1', '2', '3'])
  })

  it('typed digits persist without a parent update (internal state)', () => {
    const onChange = vi.fn()
    render(<OtpInput length={4} value="" onChange={onChange} />)
    typeInto(inputs()[0], '7')
    expect(onChange).toHaveBeenCalledWith('7')
    // The parent never re-rendered with a new value, so the digit stays.
    expect(cellValues()).toEqual(['7', '', '', ''])
  })
})

describe('OtpInput (React) interaction - focus and disabled', () => {
  it('autoFocus focuses the first cell on mount', () => {
    render(<OtpInput length={3} autoFocus />)
    expect(document.activeElement).toBe(inputs()[0])
    expect(inputs()[0].hasAttribute('data-focused')).toBe(true)
  })

  it('moving focus between cells updates data-focused', () => {
    render(<OtpInput length={3} />)
    focus(inputs()[2])
    expect(inputs()[2].hasAttribute('data-focused')).toBe(true)
    focus(inputs()[0])
    expect(inputs()[0].hasAttribute('data-focused')).toBe(true)
    expect(inputs()[2].hasAttribute('data-focused')).toBe(false)
  })

  it('blurring all cells clears data-focused', () => {
    render(<OtpInput length={3} />)
    focus(inputs()[0])
    expect(inputs()[0].hasAttribute('data-focused')).toBe(true)
    act(() => {
      inputs()[0].blur()
    })
    expect(inputs()[0].hasAttribute('data-focused')).toBe(false)
    expect(document.activeElement).not.toBe(inputs()[0])
  })

  it('disabled renders every cell disabled', () => {
    render(<OtpInput length={3} disabled />)
    for (const input of inputs()) {
      expect(input.disabled).toBe(true)
    }
  })

  it('forwards the ref to the container div', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(<OtpInput ref={ref} length={2} />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current!.getAttribute('role')).toBe('group')
  })
})
